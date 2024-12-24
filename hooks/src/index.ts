import express from "express";

// eg: https://hooks.zapier.com/hooks/catch/17038168/285ebaj/

const app = express();

app.post("/hooks/catch/:userId/:zapId", (req, res) => {
	const { userId, zapId } = req.params;

	// store it in a db
	// push it on a queue (kafka / redis)
});
