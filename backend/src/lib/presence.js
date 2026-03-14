import { getRedisClient, publishEvent } from "./redis.js";

const PRESENCE_KEY_PREFIX = "user:presence:";
const PRESENCE_EXPIRE_TIME = 300; // 5 minutes

export async function setUserOnline(userId, socketId, metadata = {}) {
  try {
    const client = getRedisClient();
    if (!client) return;
    const key = `${PRESENCE_KEY_PREFIX}${userId}`;
    const userData = {
      userId,
      socketId,
      timestamp: Date.now(),
      ...metadata,
    };

    await client.setEx(key, PRESENCE_EXPIRE_TIME, JSON.stringify(userData));
    await publishEvent("presence:online", { userId, socketId });
  } catch (error) {
    console.error("Set user online error:", error);
  }
}

export async function setUserOffline(userId) {
  try {
    const client = getRedisClient();
    if (!client) return;
    const key = `${PRESENCE_KEY_PREFIX}${userId}`;
    await client.del(key);
    await publishEvent("presence:offline", { userId });
  } catch (error) {
    console.error("Set user offline error:", error);
  }
}

export async function getUserOnlineStatus(userId) {
  try {
    const client = getRedisClient();
    const key = `${PRESENCE_KEY_PREFIX}${userId}`;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Get user status error:", error);
    return null;
  }
}

export async function getAllOnlineUsers() {
  try {
    const client = getRedisClient();
    const keys = await client.keys(`${PRESENCE_KEY_PREFIX}*`);
    const onlineUsers = [];

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        onlineUsers.push(JSON.parse(data));
      }
    }

    return onlineUsers;
  } catch (error) {
    console.error("Get all online users error:", error);
    return [];
  }
}

export async function refreshUserPresence(userId) {
  try {
    if (!client) return;
    const client = getRedisClient();
    const key = `${PRESENCE_KEY_PREFIX}${userId}`;
    const data = await client.get(key);

    if (data) {
      const userData = JSON.parse(data);
      await client.setEx(key, PRESENCE_EXPIRE_TIME, JSON.stringify(userData));
    }
  } catch (error) {
    console.error("Refresh presence error:", error);
  }
}
