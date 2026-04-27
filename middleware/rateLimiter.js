import client from "../config/redis.js";

// Lesson 6: Rate Limiting Middleware
export const rateLimiter = async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || "unknown"; // Identify client
    const key = `ratelimit:${ip}`;
    const LIMIT = 5; // Max requests allowed
    const WINDOW_SECONDS = 60; // Time frame

    try {
        // Fail-soft: If Redis is not connected, skip rate limiting
        if (!client.isOpen) {
            return next();
        }

        // Atomically increment the count for this IP
        const currentRequests = await client.incr(key);

        // If it's the first request in this window, set expiration
        if (currentRequests === 1) {
            await client.expire(key, WINDOW_SECONDS);
        }

        // Check if limit exceeded
        if (currentRequests > LIMIT) {
            const ttl = await client.ttl(key);
            console.warn(`🚫 [RATE-LIMIT] Blocked IP: ${ip} (Requests: ${currentRequests}, Reset in: ${ttl}s)`);
            
            return res.status(429).json({
                status: "error",
                message: "Too many requests. Please try again later.",
                retryAfter: `${ttl} seconds`
            });
        }

        console.log(`🛡️ [RATE-LIMIT] ${currentRequests}/${LIMIT} for IP: ${ip}`);
        next();
    } catch (error) {
        console.error("❌ [RATE-LIMIT] Error:", error.message);
        next(); // Don't block users if Redis has an internal error
    }
};
