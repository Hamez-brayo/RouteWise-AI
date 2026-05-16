import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getRouteSurvivalAdvice } from "./server/ai.ts";
import dotenv from "dotenv";

// Support the local secrets file documented in the README, then fall back to .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/predict", async (req, res) => {
    const { origin, destination, mode, reports } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination required" });
    }

    try {
      const advice = await getRouteSurvivalAdvice(origin, destination, mode, reports || []);
      res.json(advice);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get advice" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RouteWise AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
