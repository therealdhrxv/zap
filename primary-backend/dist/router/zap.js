"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, (req, res) => {
    console.log(`create a zap`);
});
router.get("/", middleware_1.authMiddleware, (req, res) => {
    console.log(`list of zaps that you have...`);
});
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => {
    console.log(`here is the specific zap info`);
});
exports.zapRouter = router;
