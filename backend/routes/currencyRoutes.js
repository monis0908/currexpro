import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listRates, createRate, updateRate, deleteRate } from "../controllers/currencyController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listRates);
router.post(
  "/",
  body("code").isString().notEmpty(),
  body("name").isString().notEmpty(),
  body("buyRate").isFloat({ gt: 0 }),
  body("sellRate").isFloat({ gt: 0 }),
  validate,
  createRate
);
router.put("/:id", param("id").isString(), validate, updateRate);
router.delete("/:id", param("id").isString(), validate, deleteRate);

export default router;
