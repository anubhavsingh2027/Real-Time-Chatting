import Queue from "bull";
import Message from "../models/Message.js";
import { getRedisClient, publishEvent } from "./redis.js";

const messageQueue = new Queue("messages", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

const deliveryQueue = new Queue("delivery", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process message saving
messageQueue.process(async (job) => {
  try {
    const { senderId, receiverId, text, image, replyTo, forwardedFrom } =
      job.data;

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image,
      replyTo: replyTo || null,
      forwardedFrom: forwardedFrom || null,
    });

    await message.populate(["senderId", "receiverId"]);

    // Publish to subscribers
    await publishEvent("message:new", {
      messageId: message._id,
      senderId,
      receiverId,
      text,
      image,
      timestamp: message.createdAt,
    });

    return { success: true, message };
  } catch (error) {
    console.error("Message queue processing error:", error);
    throw error;
  }
});

// Process deliveries
deliveryQueue.process(async (job) => {
  try {
    const { messageId, receiverId } = job.data;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { deliveredAt: new Date() },
      { new: true },
    );

    await publishEvent("message:delivered", {
      messageId,
      receiverId,
      timestamp: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Delivery queue processing error:", error);
    throw error;
  }
});

// Event listeners
messageQueue.on("completed", (job) => {
  console.log(`Message job ${job.id} completed`);
});

messageQueue.on("failed", (job, err) => {
  console.error(`Message job ${job.id} failed:`, err.message);
});

deliveryQueue.on("completed", (job) => {
  console.log(`Delivery job ${job.id} completed`);
});

deliveryQueue.on("failed", (job, err) => {
  console.error(`Delivery job ${job.id} failed:`, err.message);
});

export async function addMessageToQueue(messageData) {
  try {
    const job = await messageQueue.add(messageData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
    });
    return job;
  } catch (error) {
    console.error("Add message to queue error:", error);
    throw error;
  }
}

export async function addDeliveryToQueue(deliveryData) {
  try {
    const job = await deliveryQueue.add(deliveryData, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      delay: 1000, // Delay 1 second before processing
    });
    return job;
  } catch (error) {
    console.error("Add delivery to queue error:", error);
    throw error;
  }
}

export async function getQueueStats() {
  try {
    const messageStats = await messageQueue.getJobCounts();
    const deliveryStats = await deliveryQueue.getJobCounts();

    return {
      messages: messageStats,
      delivery: deliveryStats,
    };
  } catch (error) {
    console.error("Get queue stats error:", error);
    return null;
  }
}

export async function closeQueues() {
  await messageQueue.close();
  await deliveryQueue.close();
}

export { messageQueue, deliveryQueue };
