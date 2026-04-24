// server.js - This is the main entry point of our backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import our route files
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import budgetRoutes from "./routes/budgets.js";
import chatRoutes from "./routes/chat.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---- MIDDLEWARE ----
// cors: allows our React frontend (on port 5173) to talk to this backend
app.use(cors({ origin: "http://localhost:5173" }));

// express.json(): lets us read req.body as JSON
app.use(express.json());

// ---- ROUTES ----
// All auth routes: /api/auth/register, /api/auth/login
app.use("/api/auth", authRoutes);

// All transaction routes: /api/transactions
app.use("/api/transactions", transactionRoutes);

// All budget routes: /api/budgets
app.use("/api/budgets", budgetRoutes);

// Chat route: /api/chat
app.use("/api/chat", chatRoutes);

// Health check - useful to test if server is running
app.get("/", (req, res) => {
  res.json({ message: "Finance Tracker API is running!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
