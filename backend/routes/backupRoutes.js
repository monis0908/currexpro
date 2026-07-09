import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { backupController } from "../controllers/backupController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "manager"));

router.get("/export", asyncHandler(backupController.exportAll));

export default router;
