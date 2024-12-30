import express from "express";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";

const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Primary Backend is running on port ${PORT}`);
});
