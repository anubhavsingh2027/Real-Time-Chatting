import { createClient } from "redis";
import { ENV } from "./env.js";

let redisClient = null;
let redisPubClient = null;
let redisSubClient = null;

export async function connectRedis() {
  try {
    const redisUrl = ENV.REDIS_URL || "redis://localhost:6379";
    console.log("Connecting to Redis...");

    redisClient = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisPubClient = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });

    redisSubClient = createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false,
      },
    });

    redisClient.on("error", (err) =>
      console.log("⚠ Redis error:", err.message),
    );
    redisClient.on("connect", () => console.log("✓ Connected to Redis"));

    try {
      await Promise.all([
        redisClient.connect(),
        redisPubClient.connect(),
        redisSubClient.connect(),
      ]);
      console.log("✓ Redis all connections established");
      return redisClient;
    } catch (connectError) {
      console.warn("⚠ Redis unavailable - continuing in memory-only mode");
      redisClient = null;
      redisPubClient = null;
      redisSubClient = null;
      return null;
    }
  } catch (error) {
    console.warn("⚠ Redis initialization skipped");
    return null;
  }
}

export function getRedisClient() {
  return redisClient;
}

export function getRedisPubClient() {
  return redisPubClient;
}

export function getRedisSubClient() {
  return redisSubClient;
}

export async function disconnectRedis() {
  if (redisClient) await redisClient.quit();
  if (redisPubClient) await redisPubClient.quit();
  if (redisSubClient) await redisSubClient.quit();
}

// Cache operations
export async function setCacheData(key, value, ttl = 3600) {
  try {
    const client = getRedisClient();
    if (!client) {
      console.warn("Redis unavailable, skipping cache set");
      return;
    }
    const serialized = JSON.stringify(value);
    if (ttl) {
      await client.setEx(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function getCacheData(key) {
  try {
    const client = getRedisClient();
    if (!client) {
      return null;
    }
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

export async function deleteCacheData(key) {
  try {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    await client.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function invalidatePattern(pattern) {
  try {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error("Pattern invalidation error:", error);
  }
}

// Pub/Sub functions
export async function publishEvent(channel, data) {
  try {
    const pubClient = getRedisPubClient();
    if (!pubClient) {
      // Redis unavailable, skip publish
      return;
    }
    await pubClient.publish(channel, JSON.stringify(data));
  } catch (error) {
    console.error("Publish error:", error);
  }
}

export async function subscribeToChannel(channel, callback) {
  try {
    const subClient = getRedisSubClient();
    if (!subClient) {
      console.warn("Redis unavailable, subscription skipped");
      return;
    }
    await subClient.subscribe(channel, (message) => {
      try {
        const data = JSON.parse(message);
        callback(data);
      } catch (error) {
        console.error("Subscription parse error:", error);
      }
    });
  } catch (error) {
    console.error("Subscribe error:", error);
  }
}
