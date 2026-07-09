import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listAccounts, createAccount, getHistory, adjustBalance } from "../controllers/bankController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listAccounts);
router.post(
  "/",
  body("name").isString().notEmpty(),
  body("type").isIn(["cash", "transfer"]),
  validate,
  createAccount
);
router.get("/:id/history", param("id").isString(), validate, getHistory);
router.post(
  "/:id/adjust",
  param("id").isString(),
  body("amount").isFloat({ gt: 0 }),
  body("type").isIn(["deposit", "withdraw"]),
  validate,
  adjustBalance
);

export default router;
