import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server, setupRedisAdapter } from "./lib/socket.js";
import { connectRedis } from "./lib/redis.js";
import { setupMetricsMiddleware } from "./lib/metrics.js";

//====Extra Router add for my Portfolio =====
import portfolio from "./routes/portfolioIp.route.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// Health check state
let dbConnected = false;
let redisConnected = false;

app.use(express.json({ limit: "50mb" })); // req.body
app.use(
  cors({
    origin: [ENV.CLIENT_URL, "https://anubhav.nav-code.com"],
    credentials: true,
  }),
);

app.use(cookieParser());

// Setup metrics
setupMetricsMiddleware(app);

//==Server Starting

app.get("/", (req, res, next) => {
  res.send("Server Running");
});

// Health check endpoint for load balancers
app.get("/health", (req, res) => {
  const healthStatus = {
    status: dbConnected ? "up" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbConnected ? "connected" : "disconnected",
    redis: redisConnected ? "connected" : "disconnected",
  };

  const statusCode = dbConnected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Readiness check - returns 200 only if fully ready
app.get("/ready", (req, res) => {
  if (dbConnected) {
    res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ ready: false, reason: "database_not_connected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//===Extra ====
app.use("/detector", portfolio);

server.listen(PORT, async () => {
  console.log("Server running on port: " + PORT);

  await connectDB();
  dbConnected = true;

  try {
    await connectRedis();
    redisConnected = true;
    setupRedisAdapter(); // Setup Redis adapter after connection
  } catch (error) {
    console.warn("⚠ Redis not available - running in memory-only mode");
    redisConnected = false;
  }
});

// Handle unhandled errors from Redis adapter gracefully
process.on("uncaughtException", (error) => {
  if (
    error.code === "ECONNREFUSED" &&
    error.address === "127.0.0.1" &&
    error.port === 6379
  ) {
    console.warn(
      "⚠ Redis adapter connection attempt failed - continuing with in-memory adapter",
    );
    // Don't crash, just continue
  } else {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to notify monitoring service here
  process.exit(1);
});
