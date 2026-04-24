import express from "express";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transactionController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.post("/", authMiddleware, addTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);
router.get("/summary", authMiddleware, getSummary);

export default router;
