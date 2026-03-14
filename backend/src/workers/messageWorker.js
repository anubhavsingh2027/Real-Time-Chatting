import { messageQueue, deliveryQueue } from "../lib/queue.js";
import Message from "../models/Message.js";
import { publishEvent } from "../lib/redis.js";
import {
  messageCounter,
  messageDeliveryHistogram,
  errorCounter,
} from "../lib/metrics.js";

console.log("Starting message workers...");

// Process message saving
messageQueue.process(5, async (job) => {
  try {
    const startTime = Date.now();
    const { senderId, receiverId, text, image, replyTo, forwardedFrom } =
      job.data;

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image,
      replyTo: replyTo || null,
      forwardedFrom: forwardedFrom || null,
      status: "sent",
    });

    await message.populate([
      { path: "senderId", select: "fullName username profilePic" },
      { path: "receiverId", select: "fullName username profilePic" },
    ]);

    const duration = (Date.now() - startTime) / 1000;
    messageDeliveryHistogram.observe(duration);

    // Publish event
    await publishEvent("message:processed", {
      messageId: message._id,
      senderId,
      receiverId,
      status: "sent",
    });

    messageCounter.labels("processed").inc();
    console.log(`✓ Message ${message._id} processed`);

    return { success: true, message };
  } catch (error) {
    console.error("Message processing error:", error);
    errorCounter.labels("message_worker").inc();
    throw error;
  }
});

// Process deliveries
deliveryQueue.process(5, async (job) => {
  try {
    const { messageId, receiverId } = job.data;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        deliveredAt: new Date(),
        status: "delivered",
      },
      { new: true },
    );

    if (message) {
      await publishEvent("message:delivered", {
        messageId,
        receiverId,
        deliveredAt: message.deliveredAt,
      });

      messageCounter.labels("delivered").inc();
      console.log(`✓ Message ${messageId} delivered`);
    }

    return { success: true };
  } catch (error) {
    console.error("Delivery processing error:", error);
    errorCounter.labels("delivery_worker").inc();
    throw error;
  }
});

messageQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

messageQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

deliveryQueue.on("completed", (job) => {
  console.log(`Delivery job ${job.id} completed`);
});

deliveryQueue.on("failed", (job, err) => {
  console.error(`Delivery job ${job.id} failed:`, err.message);
});

console.log("✓ Message workers initialized");
console.log("✓ Listening for queue events...");
