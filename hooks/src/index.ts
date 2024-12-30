import { PrismaClient } from "@prisma/client";
import express, { Request, Response, RequestHandler } from "express";

const app = express();
app.use(express.json());

const client = new PrismaClient();

interface WebhookParams {
	userId: string;
	zapId: string;
}

const webhookHandler: RequestHandler<WebhookParams> = async (req, res) => {

	const { userId, zapId } = req.params;
	const body = req.body;

	try {
		await client.$transaction(
			async (tx) => {
				const run = await tx.zapRun.create({
					data: {
						zapId: zapId,
						metadata: body,
					},
				});
				await tx.zapRunOutbox.create({
					data: {
						zapRunId: run.id,
					},
				});
				console.log(`Webhook successfully hit for zapId: ${zapId}`);
			}, 
			{ timeout: 5000 }
		);
		res.status(200).json({
			message: "Webhook successfully hit",
			zapId,
		});
	} catch (error: unknown) {
		console.error("Error processing webhook:", error);
		res.status(500).json({
			message: "Error processing webhook",
			error:
				error instanceof Error
					? error.message
					: "Unknown error occurred",
		});
	} finally {
		await client.$disconnect();
	}
};

app.post("/hooks/catch/:userId/:zapId", webhookHandler);

process.on("unhandledRejection", (error: unknown) => {
	console.error("Unhandled rejection:", error);
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Hooks server is running on port ${PORT}`);
});
