import { Kafka } from "kafkajs";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
	clientId: "outbox-processor",
	brokers: ["localhost:9092"],
});

async function main() {

	const producer = kafka.producer();
	await producer.connect();

	while(1) {

		// pickup each pending rows from the db
		const pendingRows = await client.zapRunOutbox.findMany({
			where: {},
			take: 10,
		});

		// publish it on kafka
		producer.send({
			topic: TOPIC_NAME,
			messages: pendingRows.map(r => {
				return {
					value: r.zapRunId
				}
			})
		})

		// delete it from the db
		await client.zapRunOutbox.deleteMany({
			where: {
				id: {
					in: pendingRows.map(r => r.id)
				}
			}
		})


	}
}

main();
