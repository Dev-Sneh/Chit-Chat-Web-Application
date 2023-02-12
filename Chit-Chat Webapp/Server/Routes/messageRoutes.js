import express from "express";
import { allMessages, sendMessage } from "../Controllers/messageControllers.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, sendMessage);
router.route("/:chatId").get(protect, allMessages);

export default router;
