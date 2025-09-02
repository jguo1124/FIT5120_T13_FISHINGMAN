import OpenAI from "openai";

// ⚠️ 注意：这里只是测试，API Key 直接写死在代码里
// 替换成你自己的阿里云百炼 Key
const client = new OpenAI({
    apiKey: "sk-0103ece78f5740c3b35882dff89bc7b5",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// 非流式聊天
export async function chat(messages, model = "qwen-plus") {
    const resp = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024
    });
    return resp?.choices?.[0]?.message?.content ?? "";
}
