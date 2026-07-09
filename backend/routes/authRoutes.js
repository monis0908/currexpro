import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// The frontend authenticates directly against Firebase Auth (client SDK).
// This endpoint simply lets an already-authenticated client fetch its own profile.
router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
}));

export default router;
