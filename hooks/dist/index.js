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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const client = new client_1.PrismaClient();
const webhookHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, zapId } = req.params;
    const body = req.body;
    try {
        yield client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const run = yield tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body,
                },
            });
            yield tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id,
                },
            });
            console.log(`Webhook successfully hit for zapId: ${zapId}`);
        }), { timeout: 5000 });
        res.status(200).json({
            message: "Webhook successfully hit",
            zapId,
        });
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({
            message: "Error processing webhook",
            error: error instanceof Error
                ? error.message
                : "Unknown error occurred",
        });
    }
    finally {
        yield client.$disconnect();
    }
});
app.post("/hooks/catch/:userId/:zapId", webhookHandler);
process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
