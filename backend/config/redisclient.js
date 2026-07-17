import { createClient } from "redis";

// Start with a no-op shim so other modules can safely call redisclient methods
let redisclient = {
    get: async () => null,
    set: async () => {},
    expire: async () => {},
};

let internalClient = null;

export const connectRedis = async () => {
    const REDIS_URL = process.env.REDIS_URL;
    const REDIS_HOST = process.env.REDIS_HOST;
    const REDIS_PORT = process.env.REDIS_PORT;
    const REDIS_USERNAME = process.env.REDIS_USERNAME;
    const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
    const REDIS_TLS = (process.env.REDIS_TLS || "false").toLowerCase() === "true";

    if (!REDIS_URL && !REDIS_HOST) {
        console.log("Redis not configured; skipping connect");
        return;
    }

    try {
        if (REDIS_URL) {
            internalClient = createClient({ url: REDIS_URL });
        } else if (REDIS_TLS) {
            const url = `rediss://${REDIS_USERNAME ? `${REDIS_USERNAME}@` : ""}:${encodeURIComponent(
                REDIS_PASSWORD || ""
            )}@${REDIS_HOST}:${REDIS_PORT || 6379}`;
            internalClient = createClient({ url });
        } else {
            internalClient = createClient({
                username: REDIS_USERNAME,
                password: REDIS_PASSWORD,
                socket: {
                    host: REDIS_HOST,
                    port: REDIS_PORT ? Number(REDIS_PORT) : 6379,
                },
            });
        }

        internalClient.on("error", (err) => console.warn("Redis Client Error:", err.message));
        internalClient.on("ready", () => console.log("Redis client ready"));

        await internalClient.connect();
        console.log("Redis connected");

        // Replace shim with real client methods
        redisclient = internalClient;
    } catch (err) {
        console.warn("Redis connection failed:", err.message || err);
    }
};

export { redisclient };