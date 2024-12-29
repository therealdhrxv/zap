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
	console.log(`Kafka producer connected successfully`);

	while(1) {

		// pickup each pending rows from the db
		const pendingRows = await client.zapRunOutbox.findMany({
			where: {},
			take: 10,
		});
		console.log(`Fetched ${pendingRows.length} rows from the database`);


		if (pendingRows.length === 0) {
			console.log("No pending rows found, waiting for new data...");
			await new Promise((resolve) => setTimeout(resolve, 10000));
			continue;
		}

		// publish it on kafka
		producer.send({
			topic: TOPIC_NAME,
			messages: pendingRows.map(r => {
				return {
					value: r.zapRunId
				}
			})
		})
		console.log(`>> ${pendingRows.length} messages sent to Kafka topic '${TOPIC_NAME}'`);

		// delete it from the db
		await client.zapRunOutbox.deleteMany({
			where: {
				id: {
					in: pendingRows.map(r => r.id)
				}
			}
		})
		console.log(`>> ${pendingRows.length} rows deleted from the database`);


	}
}

main();
