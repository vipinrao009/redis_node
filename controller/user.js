import axios from "axios";
import client from "../config/redis.js";

// Lesson 3: Fail-Soft & Namespacing
const USERS_CACHE_KEY = "api:v1:users";

export const getUser = async (req, res) => {
    try {
        let cachedData = null;

        // Try to get data from Redis
        // We wrap this in a sub-try-catch so that Redis failure doesn't crash the whole request
        try {
            if (client.isOpen) {
                const cached = await client.get(USERS_CACHE_KEY);
                if (cached) {
                    console.log("🚀 [REDIS] Serving from cache");
                    return res.json(JSON.parse(cached));
                }
            }
        } catch (redisError) {
            console.error("⚠️ [REDIS] Cache read failed:", redisError.message);
            // Don't return here! We want to fall back to the API.
        }

        console.log("🌐 [API] Cache miss/unavailable! Fetching from external API...");
        const response = await axios.get("https://jsonplaceholder.typicode.com/users");
        
        // Save to Redis (Background task)
        // We don't await this if we want maximum speed, but for now we'll keep it simple
        try {
            if (client.isOpen) {
                await client.set(USERS_CACHE_KEY, JSON.stringify(response.data), {
                    EX: 60 * 10 // 10 minutes
                });
                console.log("💾 [REDIS] Data cached successfully");
            }
        } catch (cacheError) {
            console.error("⚠️ [REDIS] Failed to save to cache:", cacheError.message);
        }

        return res.json(response.data);
    } catch (error) {
        console.error("❌ [CRITICAL] Error in getUser:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};