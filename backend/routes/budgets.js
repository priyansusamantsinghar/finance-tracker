import express from "express";
import { getBudgets, upsertBudget, deleteBudget } from "../controllers/budgetController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, upsertBudget);
router.delete("/:id", authMiddleware, deleteBudget);

export default router;
