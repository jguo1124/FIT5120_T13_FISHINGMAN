import OpenAI from "openai";

// 把你的 Key 原样放在引号里
const client = new OpenAI({
    apiKey: "sk-0103ece78f5740c3b35882dff89bc7b5",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

const r = await client.chat.completions.create({
    model: "qwen-plus",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Test,Test,who are you?" }
    ]
});
console.log(r.choices[0].message.content);
