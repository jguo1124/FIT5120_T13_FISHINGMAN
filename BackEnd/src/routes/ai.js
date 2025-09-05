import { Router } from "express";
import OpenAI from "openai";
import multer from "multer";
import {
    ensureSession, upsertMessage, resetSession
} from "../services/memory.js";

const router = Router();

// ---- DashScope OpenAI Compatible Endpoint (Hardcoded Key) ----
const DASH_SCOPE_API_KEY = "sk-0103ece78f5740c3b35882dff89bc7b5";
const openai = new OpenAI({
    apiKey: DASH_SCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// Upload (in-memory) for chat-upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024 } });

// ====== 1) Echo: Test ======
/**
 * @openapi
 * /api/ai/echo:
 *   post:
 *     summary: Echo test (verify routing/Swagger)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { message: { type: string, example: "hello swagger" } }
 *     responses: { 200: { description: OK } }
 */
router.post("/echo", (req, res) => {
    res.json({ message: req.body?.message ?? null });
});

// ====== 2) Reset Session ======
/**
 * @openapi
 * /api/ai/session/reset:
 *   post:
 *     summary: Reset specified session
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { sessionId: { type: string } }
 *             required: [sessionId]
 *     responses: { 200: { description: OK } }
 */
router.post("/session/reset", (req, res) => {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });
    resetSession(sessionId);
    res.json({ ok: true });
});

// ====== 3) Text/Image (URL) Chat: With Session Memory (Non-streaming) ======
/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: Text/Image URL chat (non-streaming, with session memory)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string, example: "Where can I find protected species information on your website?" }
 *               imageUrl: { type: string, example: "https://..." }
 *               sessionId: { type: string, example: "web-abc123" }
 *             required: [prompt, sessionId]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties: { answer: { type: string }, sessionId: { type: string } }
 */
router.post("/chat", async (req, res, next) => {
    try {
        const { prompt, imageUrl, sessionId } = req.body || {};
        if (!prompt || !sessionId) return res.status(400).json({ error: "prompt & sessionId required" });

        const session = ensureSession(sessionId);

        // Assemble current user content
        const userContent = [];
        if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
        userContent.push({ type: "text", text: prompt });

        upsertMessage(sessionId, { role: "user", content: userContent });

        const completion = await openai.chat.completions.create({
            model: "qwen-omni-turbo",
            messages: session.messages,
            stream: false,
            modalities: ["text"]
        });

        const answer = completion?.choices?.[0]?.message?.content ?? "";
        upsertMessage(sessionId, { role: "assistant", content: [{ type: "text", text: answer }] });

        res.json({ answer, sessionId });
    } catch (e) { next(e); }
});

// ====== 4) Local Image Upload + Text (With Session Memory) ======
/**
 * @openapi
 * /api/ai/chat-upload:
 *   post:
 *     summary: Form upload image + text (non-streaming, with session memory)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string }
 *               prompt: { type: string, example: "Please describe the image and determine if it involves protected species" }
 *               file: { type: string, format: binary }
 *             required: [sessionId, prompt, file]
 *     responses: { 200: { description: OK } }
 */
router.post("/chat-upload", upload.single("file"), async (req, res, next) => {
    try {
        const { sessionId, prompt } = req.body || {};
        const file = req.file;
        if (!sessionId || !prompt || !file) {
            return res.status(400).json({ error: "sessionId, prompt, file required" });
        }

        const session = ensureSession(sessionId);
        const mime = file.mimetype || "image/png";
        const b64 = file.buffer.toString("base64");
        const dataUrl = `data:${mime};base64,${b64}`;

        const userContent = [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: prompt }
        ];
        upsertMessage(sessionId, { role: "user", content: userContent });

        const completion = await openai.chat.completions.create({
            model: "qwen-omni-turbo",
            messages: session.messages,
            stream: false,
            modalities: ["text"]
        });

        const answer = completion?.choices?.[0]?.message?.content ?? "";
        upsertMessage(sessionId, { role: "assistant", content: [{ type: "text", text: answer }] });

        res.json({ answer, sessionId });
    } catch (e) { next(e); }
});

// ====== 5) Text/Image Chat (Streaming, SSE, With Session Memory) ======
/**
 * @openapi
 * /api/ai/stream:
 *   post:
 *     summary: Text/Image chat (streaming output, with session memory)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string, example: "web-123" }
 *               prompt: { type: string, example: "Please introduce the Dashboard features of your website" }
 *               imageUrl: { type: string, example: "" }
 *             required: [sessionId, prompt]
 *     responses:
 *       200:
 *         description: text/event-stream
 */
router.post("/stream", async (req, res) => {
    try {
        const { prompt, imageUrl, sessionId } = req.body || {};
        if (!prompt || !sessionId) {
            return res.status(400).json({ error: "sessionId & prompt required" });
        }

        const session = ensureSession(sessionId);

        const userContent = [];
        if (imageUrl) userContent.push({ type: "image_url", image_url: { url: imageUrl } });
        userContent.push({ type: "text", text: prompt });
        upsertMessage(sessionId, { role: "user", content: userContent });

        // SSE headers
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");

        const completion = await openai.chat.completions.create({
            model: "qwen-omni-turbo",
            messages: session.messages,
            stream: true,
            stream_options: { include_usage: true },
            modalities: ["text"]
        });

        let finalAnswer = "";

        for await (const chunk of completion) {
            if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
                const delta = chunk.choices[0]?.delta?.content ?? "";
                if (delta) {
                    finalAnswer += delta;
                    res.write(`data: ${JSON.stringify({ delta })}\n\n`);
                }
            } else if (chunk?.usage) {
                res.write(`data: ${JSON.stringify({ usage: chunk.usage })}\n\n`);
            }
        }

        upsertMessage(sessionId, { role: "assistant", content: [{ type: "text", text: finalAnswer }] });
        res.write("data: [DONE]\n\n");
        res.end();
    } catch (e) {
        try { res.write(`data: ${JSON.stringify({ error: e?.message || "stream error" })}\n\n`); } catch {}
        res.end();
    }
});

export default router;
