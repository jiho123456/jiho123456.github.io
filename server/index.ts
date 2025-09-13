import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleChat } from "./routes/chat";
import { submitEarlyAccess, submitFeedback } from "./routes/early-access";
import { getEvents, createEvent, updateEvent, deleteEvent } from "./routes/events";
import { getTasks, createTask, updateTask, deleteTask } from "./routes/tasks";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Simple request logger for debugging
  app.use((req, _res, next) => {
    // keep logs concise
    // eslint-disable-next-line no-console
    console.log(`[api] ${req.method} ${req.url}`);
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Global error handler to surface server errors
  app.use((err: any, _req: any, res: any, _next: any) => {
    // eslint-disable-next-line no-console
    console.error('[api] error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'server_error' });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/chat", handleChat);
  app.get("/api/events", getEvents);
  app.post("/api/events", createEvent);
  app.put("/api/events/:id", updateEvent);
  app.delete("/api/events/:id", deleteEvent);

  app.get("/api/tasks", getTasks);
  app.post("/api/tasks", createTask);
  app.put("/api/tasks/:id", updateTask);
  app.delete("/api/tasks/:id", deleteTask);

  app.post("/api/early-access", submitEarlyAccess);
  app.post("/api/feedback", submitFeedback);

  return app;
}
