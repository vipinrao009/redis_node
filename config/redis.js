import { createClient } from "redis";

const redisClient = createClient({
  url: 'redis://localhost:6500' // Using the port you specified
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// Connect to Redis
try {
  await redisClient.connect();
  console.log("✅ Connected to Redis successfully (from config)");
} catch (error) {
  console.error("❌ Could not connect to Redis:", error.message);
}

export default redisClient;
