import "dotenv/config"; // Must be at the very top
import express from "express";
import userRouter from "./router/user.js";
import redisClient from "./config/redis.js";

import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(rateLimiter); // Apply Rate Limiting globally

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Redis Node API" });
});

// Use the router
app.use("/api/v1/users", userRouter);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Production Best Practice: Graceful Shutdown
const shutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  
  // Close Redis connection
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log("🔌 Redis connection closed.");
  }

  // Close Express server
  server.close(() => {
    console.log("💻 Server closed.");
    process.exit(0);
  });
};

// Listen for termination signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
