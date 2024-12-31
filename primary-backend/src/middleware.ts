import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { JWT_PASSOWRD } from "./config";

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = req.headers.authorization as unknown as string;
	try {
		const payload = jwt.verify(token, JWT_PASSOWRD);
		// @ts-ignore
		req.id = payload.id;
		next();
	} catch (error) {
		res.status(401).json({
			message: "You are not logged in",
		});
	}
}
