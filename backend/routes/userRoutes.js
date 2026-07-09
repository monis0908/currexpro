import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { userController } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/", asyncHandler(userController.list));
router.post("/", asyncHandler(userController.create));
router.put("/:uid/role", asyncHandler(userController.updateRole));
router.delete("/:uid", asyncHandler(userController.remove));

export default router;
