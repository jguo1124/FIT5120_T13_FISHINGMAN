import { Router } from "express";
import { chat } from "../services/aiService.js";

const router = Router();

// POST /api/ai/chat
// body: { messages:[{role:'user'|'system'|'assistant', content:string}] }
router.post("/chat", async (req, res, next) => {
    try {
        const { messages, model } = req.body || {};
        const text = await chat(messages || [], model || "qwen-plus");
        res.json({ code: 0, data: { text } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { code: "internal_error", message: err.message } });
    }
});

export default router;
