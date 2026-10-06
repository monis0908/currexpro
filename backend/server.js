import "./env.js"; // ← Must be first: loads .env before any other module reads process.env
import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import currencyRoutes from "./routes/currencyRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";



const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "CurrExPro API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/currency-rates", currencyRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bank-accounts", bankRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 CurrExPro API listening on http://localhost:${PORT}`);
});
