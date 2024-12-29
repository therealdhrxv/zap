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
const client_1 = require("@prisma/client");
const client = new client_1.PrismaClient();
const TOPIC_NAME = "zap-events";
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const producer = kafka.producer();
        yield producer.connect();
        console.log(`Kafka producer connected successfully`);
        while (1) {
            // pickup each pending rows from the db
            const pendingRows = yield client.zapRunOutbox.findMany({
                where: {},
                take: 10,
            });
            console.log(`Fetched ${pendingRows.length} rows from the database`);
            if (pendingRows.length === 0) {
                console.log("No pending rows found, waiting for new data...");
                yield new Promise((resolve) => setTimeout(resolve, 10000));
                continue;
            }
            // publish it on kafka
            producer.send({
                topic: TOPIC_NAME,
                messages: pendingRows.map(r => {
                    return {
                        value: r.zapRunId
                    };
                })
            });
            console.log(`>> ${pendingRows.length} messages sent to Kafka topic '${TOPIC_NAME}'`);
            // delete it from the db
            yield client.zapRunOutbox.deleteMany({
                where: {
                    id: {
                        in: pendingRows.map(r => r.id)
                    }
                }
            });
            console.log(`>> ${pendingRows.length} rows deleted from the database`);
        }
    });
}
main();
