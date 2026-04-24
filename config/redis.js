import { createClient } from "redis";
import "dotenv/config"; // Load environment variables

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const redisClient = createClient({
  url: REDIS_URL,
  password: REDIS_PASSWORD // Adding password for production security
});

// Production Best Practice: Detailed Event Listeners
redisClient.on("connect", () => console.log("⏳ Redis: Connecting..."));
redisClient.on("ready", () => console.log("✅ Redis: Ready and connected!"));
redisClient.on("error", (err) => console.error("❌ Redis: Error!", err.message));
redisClient.on("reconnecting", () => console.warn("🔄 Redis: Reconnecting..."));
redisClient.on("end", () => console.log("🔌 Redis: Connection closed."));

// Connect to Redis
// We use a self-invoking async function to handle the initial connection
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("🚫 Redis: Initial connection failed!", error.message);
  }
})();

export default redisClient;
