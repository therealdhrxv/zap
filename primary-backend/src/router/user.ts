import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Router } from "express";

import { prisma } from "../db";
import { JWT_PASSOWRD } from "../config";
import { authMiddleware } from "../middleware";
import { SignupSchema, SigninSchema } from "../types";

const router = Router();

const SALT_ROUNDS = 10;

router.post("/signup", async (req, res): Promise<any> => {
	const body = req.body;
	const parsedData = SignupSchema.safeParse(body);
	if (!parsedData.success) {
		return res.status(411).json({
			message: "Invalid data",
			data: parsedData.error.errors,
		});
	}
	const userExists = await prisma.user.findFirst({
		where: {
			email: body.email,
		},
	});
	if (userExists) {
		return res.status(409).json({
			message: "User already exists",
		});
	} else {
		const hashed_password = await bcrypt.hash(parsedData.data.password, SALT_ROUNDS);
		await prisma.user.create({
			data: {
				email: parsedData.data.email,
				password: hashed_password,
				name: parsedData.data.name,
			},
		});
		return res.status(200).json({
			message: "User created",
		});
	}
});

router.post("/signin", async (req, res): Promise<any> => {
	const body = req.body;
	const parsedData = SigninSchema.safeParse(body);
	if (!parsedData.success) {
		return res.status(411).json({
			message: "Invalid data",
			data: parsedData.error.errors,
		});
	}
	const user = await prisma.user.findFirst({
		where: {
			email: parsedData.data.email,
		},
	});
	if (!user) {
		return res.status(401).json({
			message: "Invalid credentials",
		});
	}
	const isValidPassword = await bcrypt.compare(parsedData.data.password, user.password);
	if (!isValidPassword) {
		return res.json({
			message: "Invalid Credentials",
		});
	}
	const token = jwt.sign({ id: user.id }, JWT_PASSOWRD);
	res.status(200).json({
		token: token,
	});
});

router.get("/", authMiddleware, async (req, res): Promise<any> => {
	// @ts-ignore
	const id = req.id;
	const user = await prisma.user.findFirst({
		where: {
			id,
		},
		select: {
			name: true,
			email: true,
		},
	});
	if (!user) {
		return res.status(404).json({
			message: "User Not Found",
		});
	}
	return res.json({
		user,
	});
});

export const userRouter = router;
