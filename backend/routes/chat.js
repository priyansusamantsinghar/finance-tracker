import express from "express";
import authMiddleware from "../middleware/auth.js";
import { chat } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat — Send a message to the AI chatbot (requires auth)
router.post("/", authMiddleware, chat);

export default router;
