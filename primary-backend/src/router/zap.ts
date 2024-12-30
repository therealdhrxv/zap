import { Router } from "express";
import { authMiddleware } from "../middleware";

const router = Router();

router.post("/", authMiddleware, (req, res) => {
	console.log(`create a zap`);
});

router.get("/", authMiddleware, (req, res) => {
	console.log(`list of zaps that you have...`);
});

router.get("/:zapId", authMiddleware, (req, res) => {
	console.log(`here is the specific zap info`);
});

export const zapRouter = router;
