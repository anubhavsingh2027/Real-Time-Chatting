import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import {
  messageCounter,
  cacheHitRate,
  cacheMissRate,
  errorCounter,
} from "../lib/metrics.js";
import {
  setCacheData,
  getCacheData,
  invalidatePattern,
  publishEvent,
} from "../lib/redis.js";
import { addMessageToQueue, addDeliveryToQueue } from "../lib/queue.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Return only necessary fields: _id, fullName, username, profilePic, email, createdAt
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("_id fullName username profilePic email createdAt");

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    })
      .select("_id text image createdAt status reactions replyTo senderId")
      .populate({
        path: "replyTo",
        select: "text image senderId",
        populate: {
          path: "senderId",
          select: "fullName username profilePic",
        },
      });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text?.trim() && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
    });

    await newMessage.save();

    // Populate replyTo with full sender details
    await newMessage.populate([
      {
        path: "replyTo",
        select: "text image senderId",
        populate: {
          path: "senderId",
          select: "fullName username profilePic",
        },
      },
    ]);

    // Populate sender info for the frontend
    await newMessage.populate("senderId", "fullName username profilePic");

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    // Prepare chat list update data for receiver
    const chatListUpdateData = {
      senderId: senderId.toString(),
      senderInfo: {
        _id: senderId,
        fullName: req.user.fullName,
        username: req.user.username,
        profilePic: req.user.profilePic,
      },
      lastMessage: newMessage,
      lastMessagePreview: newMessage.image
        ? "📷 Image"
        : newMessage.text?.substring(0, 50),
      timestamp: newMessage.createdAt,
      unreadCount: 1, // Frontend will handle incrementing this
    };

    // Emit to receiver
    if (receiverSocketId) {
      // Emit message to the chat (if receiver has opened the chat)
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // Emit chat list update event (sidebar update)
      io.to(receiverSocketId).emit("chat_list_update", chatListUpdateData);

      // Emit notification alert event (only if chat is not currently active)
      io.to(receiverSocketId).emit("notification_alert", {
        type: "message",
        senderInfo: chatListUpdateData.senderInfo,
        messagePreview: chatListUpdateData.lastMessagePreview,
        senderId: senderId.toString(),
      });
    }

    // Also emit to sender (so their message updates with actual data from DB)
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    // Return only necessary fields: _id, text, image, createdAt, status, reactions, replyTo, senderId
    const responseMessage = {
      _id: newMessage._id,
      text: newMessage.text,
      image: newMessage.image,
      createdAt: newMessage.createdAt,
      status: newMessage.status,
      reactions: newMessage.reactions,
      replyTo: newMessage.replyTo,
      senderId: newMessage.senderId,
    };

    res.status(201).json(responseMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    // Return only necessary fields: _id, fullName, username, profilePic
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("_id fullName username profilePic");

    res.status(200).json(chatPartners);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const loggedInUserId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (message.senderId.toString() !== loggedInUserId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // Delete image from cloudinary if exists
    if (message.image) {
      try {
        const publicId = message.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from cloudinary:", error);
      }
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Notify the receiver via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", messageId);
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const loggedInUserId = req.user._id;

    if (!emoji) {
      return res.status(400).json({ error: "Emoji is required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user already reacted
    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === loggedInUserId.toString(),
    );

    if (existingReaction) {
      // Update existing reaction
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    } else {
      // Add new reaction
      message.reactions.push({
        userId: loggedInUserId,
        emoji,
        createdAt: new Date(),
      });
    }

    await message.save();

    // Notify both sender and receiver via socket
    const senderSocketId = getReceiverSocketId(message.senderId);
    const receiverSocketId = getReceiverSocketId(message.receiverId);

    const reactionData = { messageId, userId: loggedInUserId, emoji };

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReaction", reactionData);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", reactionData);
    }

    // Return only necessary fields
    res.status(200).json({
      _id: message._id,
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("Error in addReaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const loggedInUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Remove user's reaction
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== loggedInUserId.toString(),
    );

    await message.save();

    // Notify both sender and receiver via socket
    const senderSocketId = getReceiverSocketId(message.senderId);
    const receiverSocketId = getReceiverSocketId(message.receiverId);

    const reactionData = { messageId, userId: loggedInUserId };

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReactionRemoved", reactionData);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReactionRemoved", reactionData);
    }

    // Return only necessary fields
    res.status(200).json({
      _id: message._id,
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("Error in removeReaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark message as delivered
export const markMessageAsDelivered = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const loggedInUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only receiver can mark as delivered
    if (message.receiverId.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update status only if not already delivered or read
    if (message.status === "sent") {
      message.status = "delivered";
      message.deliveredAt = new Date();
      await message.save();
    }

    // Notify sender
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDelivered", {
        messageId: message._id,
        deliveredAt: message.deliveredAt,
        status: "delivered",
      });
    }

    messageCounter.labels("delivered").inc();
    res.status(200).json({
      _id: message._id,
      status: message.status,
      deliveredAt: message.deliveredAt,
    });
  } catch (error) {
    console.error("Error in markMessageAsDelivered:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const loggedInUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only receiver can mark as read
    if (message.receiverId.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update status only if not already read
    if (message.status !== "read") {
      message.status = "read";
      message.readAt = new Date();
      await message.save();
    }

    // Notify sender
    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", {
        messageId: message._id,
        readAt: message.readAt,
        status: "read",
      });
    }

    messageCounter.labels("read").inc();
    res.status(200).json({
      _id: message._id,
      status: message.status,
      readAt: message.readAt,
    });
  } catch (error) {
    console.error("Error in markMessageAsRead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
