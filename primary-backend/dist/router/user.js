"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
router.post("/signup", (req, res) => {
    console.log(`signup handler`);
});
router.post("/signin", (req, res) => {
    console.log(`signin handler`);
});
router.get("/user", middleware_1.authMiddleware, (req, res) => {
    console.log(`hello user`);
});
exports.userRouter = router;
