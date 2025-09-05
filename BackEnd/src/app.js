import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import aiRouter from "./routes/ai.js";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 8080; // <- 端口写死，改这里即可

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// Swagger 文档
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "FishingMan API", version: "0.1.0" },
    servers: [{ url: `http://localhost:${PORT}` }]
  },
  apis: ["./src/routes/*.js"] // 注意这里加了 src
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 健康检查
app.get("/api/ping", (req, res) => res.json({ ok: true, ts: Date.now() }));

// 业务路由
app.use("/api/ai", aiRouter);

// ---- 静态站点（Home 页）----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));
app.get(["/", "/home"], (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// 统一错误处理
app.use((err, req, res, next) => {
  console.error("ERR:", err);
  res.status(500).json({ error: err?.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server:  http://localhost:${PORT}`);
  console.log(`📚 Swagger: http://localhost:${PORT}/docs`);
});
