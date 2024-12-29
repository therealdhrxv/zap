import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events";
const kafka = new Kafka({
	clientId: "outbox-processor",
	brokers: ["localhost:9092"],
});

async function main() {

	const consumer = kafka.consumer({
		groupId: "main-worker",
	});

	await consumer.connect();
	console.log(`Kafka consumer connected successfully`);

	await consumer.subscribe({
		topic: TOPIC_NAME,
		fromBeginning: true,
	});
	console.log(`Subscribed to topic '${TOPIC_NAME}'`);

	await consumer.run({

		autoCommit: false,

		eachMessage: async ({ topic, partition, message }) => {

			console.log(`Received message from topic '${topic}', partition '${partition}':`);
			console.log({
				offset: message.offset,
				value: message.value.toString(),
			});

			// do something with the message. eg: send email / send SOL

			// simulate processing the message
			console.log("Processing message...");
			await new Promise((r) => setTimeout(r, 1000));
			console.log("Message processed successfully");

		
			// manual offset management is useful when you want to ensure that an offset is 
			// committed only after a message has been successfully processed.
			await consumer.commitOffsets([{
				topic: TOPIC_NAME,
				partition: partition,
				offset: (parseInt(message.offset) + 1).toString()
			}])
			console.log(`Offset ${parseInt(message.offset) + 1} committed successfully`);

		},
	});


}

main();
