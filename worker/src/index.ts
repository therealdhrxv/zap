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

	await consumer.subscribe({
		topic: TOPIC_NAME,
		fromBeginning: true,
	});

	await consumer.run({

		autoCommit: false,

		eachMessage: async ({ topic, partition, message }) => {

			console.log({
				value: message.value.toString(),
			});

			// do something with the message. eg: send email / send SOL
			await new Promise(r => setTimeout(r, 1000))
		
			// manual offset management is useful when you want to ensure that an offset is 
			// committed only after a message has been successfully processed.
			await consumer.commitOffsets([{
				topic: TOPIC_NAME,
				partition: partition,
				offset: (parseInt(message.offset) + 1).toString()
			}])

		},
	});


}

main();





// we also need to acknowledge the picked messages from kafka
