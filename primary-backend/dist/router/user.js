"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const db_1 = require("../db");
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const SALT_ROUNDS = 10;
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SignupSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid data",
            data: parsedData.error.errors,
        });
    }
    const userExists = yield db_1.prisma.user.findFirst({
        where: {
            email: body.email,
        },
    });
    if (userExists) {
        return res.status(409).json({
            message: "User already exists",
        });
    }
    else {
        const hashed_password = yield bcrypt_1.default.hash(parsedData.data.password, SALT_ROUNDS);
        yield db_1.prisma.user.create({
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
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const parsedData = types_1.SigninSchema.safeParse(body);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Invalid data",
            data: parsedData.error.errors,
        });
    }
    const user = yield db_1.prisma.user.findFirst({
        where: {
            email: parsedData.data.email,
        },
    });
    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials",
        });
    }
    const isValidPassword = yield bcrypt_1.default.compare(parsedData.data.password, user.password);
    if (!isValidPassword) {
        return res.json({
            message: "Invalid Credentials",
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_PASSOWRD);
    res.status(200).json({
        token: token,
    });
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const id = req.id;
    const user = yield db_1.prisma.user.findFirst({
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
}));
exports.userRouter = router;
