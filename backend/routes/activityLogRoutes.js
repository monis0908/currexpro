import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { listLogs } from "../controllers/activityLogController.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "manager"));

router.get("/", listLogs);

export default router;
