import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listCustomers);
router.get("/:id", param("id").isString(), validate, getCustomer);
router.post(
  "/",
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email"),
  validate,
  createCustomer
);
router.put("/:id", param("id").isString(), validate, updateCustomer);
router.delete("/:id", param("id").isString(), validate, deleteCustomer);

export default router;
