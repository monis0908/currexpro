import { Router } from "express";
import { z } from "zod";
import { chat } from "../services/aiService.js";

const router = Router();

// ── Input schema ──────────────────────────────────────────────────────────
const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  // history is optional; frontend passes it to maintain conversation context
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string() })),
      })
    )
    .optional()
    .default([]),
});

// POST /api/chat
router.post("/", async (req, res) => {
  // 1. Validate input — reject garbage before it hits the AI
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body.",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { message, history } = parsed.data;

  // 2. Call the AI service
  const aiResponse = await chat(message, history);

  // 3. Return the response
  return res.status(200).json({
    success: true,
    reply: aiResponse,
  });
});

export default router;

