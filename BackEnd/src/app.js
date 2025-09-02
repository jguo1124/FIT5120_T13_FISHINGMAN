import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import speciesRouter from "./routes/species.js";
import zoneRouter from "./routes/zone.js";
import aiRouter from "./routes/ai.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors({
  origin: true,
  exposedHeaders: ["ETag"],
}));

app.use((req, res, next) => {
  res.set("Access-Control-Expose-Headers", "ETag");
  next();
});

app.use(express.json());

app.get("/api/v1/health", (_, res) => res.json({ ok: true }));
app.use("/api/v1/species", speciesRouter);
app.use("/api/v1", zoneRouter); // /zone/:zoneCode/rules

//AI
app.use("/api/ai", aiRouter);

export default app;

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`API on http://localhost:${port}`));
}
