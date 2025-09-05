// 简单内存会话存储：Map<sessionId, {messages: Array, updatedAt: number}>
const store = new Map();

const MAX_TURNS = 15;  // 保存最近 15 轮（user+assistant 视作2条）
const SYSTEM_PROMPT = `
You are GoFish Assistant, a friendly helper for a website about recreational fishing in Victoria, Australia.
Your job:
- Help users understand fishing regulations, size/bag limits, seasons, protected species, and licensing basics.
- If asked about the website itself (navigation, features, pages), clearly explain where to click and what they will find.
- If unsure or outside scope, say so briefly and suggest checking official references.
- Keep answers concise, structured, and beginner-friendly.
- When users upload an image, first describe it, then relate to possible fishing rules if relevant.
Return Chinese answers when the user speaks Chinese; otherwise reply in English.
`;

export function getSession(sessionId) {
    if (!sessionId) return null;
    return store.get(sessionId) || null;
}

export function initSession(sessionId) {
    const s = {
        messages: [{ role: "system", content: [{ type: "text", text: SYSTEM_PROMPT }] }],
        updatedAt: Date.now()
    };
    store.set(sessionId, s);
    return s;
}

export function upsertMessage(sessionId, msg) {
    let s = getSession(sessionId);
    if (!s) s = initSession(sessionId);
    s.messages.push(msg);
    s.updatedAt = Date.now();
    // 截断到最近 MAX_TURNS（保留开头的 system）
    const sys = s.messages[0];
    const tail = s.messages.slice(1).slice(-MAX_TURNS * 2);
    s.messages = [sys, ...tail];
    return s;
}

export function resetSession(sessionId) {
    if (store.has(sessionId)) store.delete(sessionId);
}

export function ensureSession(sessionId) {
    return getSession(sessionId) || initSession(sessionId);
}
