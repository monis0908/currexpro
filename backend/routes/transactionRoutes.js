import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listTransactions);
router.post(
  "/",
  body("type").isIn(["buy", "sell"]),
  body("currencyCode").isString().notEmpty(),
  body("amount").isFloat({ gt: 0 }),
  body("rate").isFloat({ gt: 0 }),
  validate,
  createTransaction
);
router.put("/:id", param("id").isString(), validate, updateTransaction);
router.delete("/:id", requireRole("admin", "manager"), param("id").isString(), validate, deleteTransaction);

export default router;
