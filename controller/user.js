import axios from "axios";
import client from "../config/redis.js";

export const getUser = async (req, res) => {
    try {
        // Use consistent key name "users"
        const cached = await client.get("users");
        
        if (cached) {
            console.log("🚀 Serving from Redis cache");
            return res.json(JSON.parse(cached));
        }

        console.log("🌐 Cache miss! Fetching from external API...");
        const response = await axios.get("https://jsonplaceholder.typicode.com/users");
        
        // Save to Redis and set expiration in one go for efficiency
        await client.set("users", JSON.stringify(response.data), {
            EX: 60 * 10 // 10 minutes
        });

        return res.json(response.data);
    } catch (error) {
        console.error("Error in getUser:", error.message);
        res.status(500).send(error.message);
    }
};