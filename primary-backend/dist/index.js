"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const zap_1 = require("./router/zap");
const user_1 = require("./router/user");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_1.userRouter);
app.use("/api/v1/zap", zap_1.zapRouter);
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Primary Backend is running on port ${PORT}`);
});
