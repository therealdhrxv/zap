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
Object.defineProperty(exports, "__esModule", { value: true });
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({
            groupId: "main-worker",
        });
        yield consumer.connect();
        console.log(`Kafka consumer connected successfully`);
        yield consumer.subscribe({
            topic: TOPIC_NAME,
            fromBeginning: true,
        });
        console.log(`Subscribed to topic '${TOPIC_NAME}'`);
        yield consumer.run({
            autoCommit: false,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ topic, partition, message }) {
                console.log(`Received message from topic '${topic}', partition '${partition}':`);
                console.log({
                    offset: message.offset,
                    value: message.value.toString(),
                });
                // do something with the message. eg: send email / send SOL
                // simulate processing the message
                console.log("Processing message...");
                yield new Promise((r) => setTimeout(r, 1000));
                console.log("Message processed successfully");
                // manual offset management is useful when you want to ensure that an offset is 
                // committed only after a message has been successfully processed.
                yield consumer.commitOffsets([{
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString()
                    }]);
                console.log(`Offset ${parseInt(message.offset) + 1} committed successfully`);
            }),
        });
    });
}
main();
