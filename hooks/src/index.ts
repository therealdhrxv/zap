import express from "express";

import { PrismaClient } from "@prisma/client";

// eg: https://hooks.zapier.com/hooks/catch/17038168/285ebaj/

const app = express();
app.use(express.json());

const client = new PrismaClient();

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {

	const { userId, zapId } = req.params;

	const body = req.body;

	// outbox pattern for microservices architectures
	await client.$transaction(async tx => {
		const run = await tx.zapRun.create({
			data: {
				zapId: zapId,
				metadata: body,
			}
		})
		await tx.zapRunOutbox.create({
			data: {
				zapRunId: run.id,
			}
		})
	})
 
	res.json({
		message: "Webhook successfully hit",
	})

});

app.listen(3000);
