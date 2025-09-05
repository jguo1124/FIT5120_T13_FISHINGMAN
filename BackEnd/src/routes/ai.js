import { Router } from "express";
import OpenAI from "openai";
import multer from "multer";
import {
    ensureSession, upsertMessage, resetSession
} from "../services/memory.js";

const router = Router();

// ---- DashScope OpenAI 兼容端点（写死 Key）----
const DASH_SCOPE_API_KEY = "sk-0103ece78f5740c3b35882dff89bc7b5";
const openai = new OpenAI({
    apiKey: DASH_SCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// 上传（内存）用于 chat-upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 7 * 1024 * 1024 } });

// ====== 1) Echo：测试 ======
/**
 * @openapi
 * /api/ai/echo:
 *   post:
 *     summary: Echo 测试（验证路由/Swagger）
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

// ====== 2) 重置会话 ======
/**
 * @openapi
 * /api/ai/session/reset:
 *   post:
 *     summary: 重置指定会话
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

// ====== 3) 文本/图片（URL）对话：带会话记忆（非流式）======
/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     summary: 文本/图片URL对话（非流式，带会话记忆）
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt: { type: string, example: "我在你们网站哪里看受保护物种？" }
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

        // 组装本轮 user 内容
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

// ====== 4) 本地图片上传 + 文本（带会话记忆）======
/**
 * @openapi
 * /api/ai/chat-upload:
 *   post:
 *     summary: 表单上传图片 + 文本（非流式，带会话记忆）
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string }
 *               prompt: { type: string, example: "请描述图片并判断是否涉及受保护物种" }
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

// ====== 5) 文本/图片 对话（流式，SSE，带会话记忆）======
/**
 * @openapi
 * /api/ai/stream:
 *   post:
 *     summary: 文本/图片对话（流式输出，带会话记忆）
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId: { type: string, example: "web-123" }
 *               prompt: { type: string, example: "请介绍一下你们网站的Dashboard功能" }
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

        // SSE 头
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
