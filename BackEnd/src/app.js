// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routers
import aiRouter from "./routes/ai.js";


dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    exposedHeaders: ["ETag"],
  })
);

// Ensure ETag header is exposed to the client
app.use((req, res, next) => {
  res.set("Access-Control-Expose-Headers", "ETag");
  next();
});

// Parse JSON bodies
app.use(express.json());

/**
 * Health check endpoint
 */
app.get("/api/v1/health", async (_, res) => {
  try {
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Mount routers
app.use("/api/ai", aiRouter);              // e.g. /api/ai/chat, /api/ai/stream

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "internal_error",
      message: process.env.NODE_ENV === "production" ? "Server error" : String(err?.message || err),
      stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    },
  });
});

export default app;

// Start server unless running in test mode
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}
