import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createAdapter } from "socket.io-redis";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import {
  setUserOnline,
  setUserOffline,
  getAllOnlineUsers,
  refreshUserPresence,
} from "./presence.js";
import { addMessageToQueue, addDeliveryToQueue } from "./queue.js";
import { publishEvent, getRedisPubClient, getRedisSubClient } from "./redis.js";
import {
  messageCounter,
  onlineUsersGauge,
  socketConnections,
  messageDeliveryHistogram,
} from "./metrics.js";
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// Setup function to configure Redis adapter after connection
// Note: Redis adapter is optional - in-memory adapter works fine for development
export function setupRedisAdapter() {
  // Skip Redis adapter setup in development without actual Redis server running
  // The in-memory adapter is sufficient for development
  if (ENV.NODE_ENV === "production") {
    try {
      const pubClient = getRedisPubClient();
      const subClient = getRedisSubClient();
      if (pubClient && subClient && pubClient.isOpen && subClient.isOpen) {
        try {
          io.adapter(createAdapter(pubClient, subClient));
          console.log("✓ Redis adapter configured for production");
          return true;
        } catch (adapterError) {
          console.warn("⚠ Redis adapter setup failed, using in-memory adapter");
          return false;
        }
      }
    } catch (error) {
      console.warn("⚠ Redis adapter not available");
    }
  } else {
    console.log("✓ Using in-memory adapter (development mode)");
  }
  return false;
}

// Authentication middleware
io.use(socketAuthMiddleware);

const userSocketMap = {};

io.on("connection", async (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Update presence in Redis
  await setUserOnline(userId, socket.id);

  // Update metrics
  socketConnections.inc();
  const onlineUsers = await getAllOnlineUsers();
  onlineUsersGauge.set(onlineUsers.length);

  // Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Message event with queue
  socket.on("sendMessage", async (data) => {
    try {
      const messageData = {
        senderId: userId,
        receiverId: data.receiverId,
        text: data.text,
        image: data.image,
        replyTo: data.replyTo,
        forwardedFrom: data.forwardedFrom,
      };

      // Queue message for processing
      const job = await addMessageToQueue(messageData);
      messageCounter.labels("sent").inc();

      // Emit to receiver if online
      const receiverSocketId = userSocketMap[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageReceived", {
          jobId: job.id,
          ...messageData,
        });
      }

      // Send to room for delivery tracking
      socket.emit("messageSent", { jobId: job.id });

      // Publish for pub/sub subscribers
      await publishEvent("message:sent", messageData);
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("messageError", { error: error.message });
      messageCounter.labels("failed").inc();
    }
  });

  // Mark as delivered
  socket.on("messageDelivered", async (data) => {
    try {
      const startTime = Date.now();
      const { messageId, senderId } = data;

      console.log(
        `📨 Marking message ${messageId} as delivered by user ${userId}`,
      );

      // Update message in database
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            status: "delivered",
            deliveredAt: new Date(),
          },
        },
        { new: true },
      );

      if (!message) {
        console.error("❌ Message not found for delivery update:", messageId);
        return;
      }

      console.log(`✅ Message ${messageId} updated to delivered status in DB`);

      const duration = (Date.now() - startTime) / 1000;
      messageDeliveryHistogram.observe(duration);

      // Notify sender
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        console.log(`📤 Sending delivery confirmation to sender ${senderId}`);
        io.to(senderSocketId).emit("messageDelivered", {
          messageId: message._id,
          status: "delivered",
          deliveredAt: message.deliveredAt,
        });
      } else {
        console.log(`⚠️  Sender ${senderId} is not online`);
      }

      // Publish for pub/sub subscribers
      await publishEvent("message:delivered", {
        messageId: message._id,
        deliveredAt: message.deliveredAt,
      });

      messageCounter.labels("delivered").inc();
    } catch (error) {
      console.error("❌ Message delivered error:", error);
    }
  });

  // Mark as read
  socket.on("messageRead", async (data) => {
    try {
      const { messageId, senderId } = data;

      console.log(`👁️  Marking message ${messageId} as read by user ${userId}`);

      // Update message in database
      const message = await Message.findByIdAndUpdate(
        messageId,
        {
          $set: {
            status: "read",
            readAt: new Date(),
          },
        },
        { new: true },
      );

      if (!message) {
        console.error("❌ Message not found for read update:", messageId);
        return;
      }

      console.log(`✅ Message ${messageId} updated to read status in DB`);

      // Notify sender
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        console.log(`📤 Sending read confirmation to sender ${senderId}`);
        io.to(senderSocketId).emit("messageRead", {
          messageId: message._id,
          status: "read",
          readAt: message.readAt,
        });
      } else {
        console.log(`⚠️  Sender ${senderId} is not online`);
      }

      // Publish for pub/sub subscribers
      await publishEvent("message:read", {
        messageId: message._id,
        readAt: message.readAt,
      });

      messageCounter.labels("read").inc();
    } catch (error) {
      console.error("❌ Message read error:", error);
    }
  });

  // Typing indicator
  socket.on("typingStart", async (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { senderId: userId });
    }
    await publishEvent("user:typing", { userId, receiverId: data.receiverId });
  });

  socket.on("typingStop", async (data) => {
    const receiverSocketId = userSocketMap[data.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
    }
  });

  // Presence refresh
  socket.on("heartbeat", async () => {
    await refreshUserPresence(userId);
  });

  // Disconnect handler
  socket.on("disconnect", async () => {
    delete userSocketMap[userId];
    await setUserOffline(userId);

    socketConnections.dec();
    const onlineUsers = await getAllOnlineUsers();
    onlineUsersGauge.set(onlineUsers.length);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };
