import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import useSettingsStore from "./useSettingsStore";

// Function to filter out image data from messages for storage
const filterMessagesForStorage = (messages) => {
  return messages.map((msg) => ({
    ...msg,
    image: msg.image ? true : false, // Only store boolean indicating presence of image
  }));
};

// Custom storage for persist middleware
const customStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const data = JSON.parse(str);
    return {
      ...data,
      state: {
        ...data.state,
        messages: [], // Don't load messages from storage to avoid size issues
      },
    };
  },
  setItem: (name, value) => {
    const storageValue = {
      ...value,
      state: {
        ...value.state,
        messages: filterMessagesForStorage(value.state.messages),
      },
    };
    localStorage.setItem(name, JSON.stringify(storageValue));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useChatStore = create(
  persist(
    (set, get) => ({
      allContacts: [],
      chats: [],
      messages: [],
      messageStatuses: {}, // tracks status of each message
      unreadCounts: {}, // tracks unread count per chat (userId -> count)
      activeTab: "chats",
      selectedUser: null,
      selectedMessage: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isSoundEnabled: useSettingsStore.getState().soundEffects,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedUser: (selectedUser) => set({ selectedUser }),
      setSelectedMessage: (message) => set({ selectedMessage: message }),

      getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/contacts");
          set({ allContacts: res.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },
      getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/chats");
          set({ chats: res.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessagesByUserId: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages, replyToMessage } = get();
        const { authUser, socket } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
          _id: tempId,
          senderId: authUser._id,
          receiverId: selectedUser._id,
          text: messageData.text,
          image: messageData.image ? true : null, // Just store boolean for optimistic update
          replyTo: replyToMessage
            ? {
                _id: replyToMessage._id,
                text: replyToMessage.text,
                image: replyToMessage.image,
                senderId: replyToMessage.senderId,
              }
            : null,
          createdAt: new Date().toISOString(),
          isOptimistic: true,
        };

        // Update messages without storing image data in state
        set({
          messages: [...messages, optimisticMessage],
        });

        try {
          // Compress image if necessary
          let payload = {
            text: messageData.text,
            replyTo: replyToMessage?._id || null,
          };

          // Only include image if it exists
          if (messageData.image) {
            // You might want to add image compression here
            payload.image = messageData.image;
          }

          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            payload
          );
          const actualMessage = res.data;

          // Clear reply after sending (only if handler exists)
          if (typeof get().clearReplyToMessage === "function") {
            get().clearReplyToMessage();
          }

          // Update messages, replacing optimistic with actual
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === tempId ? actualMessage : msg
            ),
          }));

          // Emit the message through socket for real-time update
          
        } catch (error) {
          // Remove optimistic message on failure
          set((state) => ({
            messages: state.messages.filter((msg) => msg._id !== tempId),
          }));

          const errorMsg =
            error.response?.data?.message ||
            "Error sending message. Please try again.";
          toast.error(errorMsg);

          if (errorMsg.includes("10 MB")) {
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          }
        }
      },

      updateMessageStatus: (messageId, status) => {
        set((state) => ({
          messageStatuses: {
            ...state.messageStatuses,
            [messageId]: status,
          },
        }));
      },

      deleteMessage: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}`);

          // Remove message from local state
          set((state) => ({
            messages: state.messages.filter((msg) => msg._id !== messageId),
          }));

          toast.success("Message deleted");
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to delete message";
          toast.error(errorMsg);
        }
      },

      addReaction: async (messageId, emoji) => {
        try {
          await axiosInstance.post(`/messages/${messageId}/reaction`, {
            emoji,
          });

          // Update local state
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    reactions: [
                      ...(msg.reactions || []).filter(
                        (r) => r.userId !== useAuthStore.getState().authUser._id
                      ),
                      {
                        userId: useAuthStore.getState().authUser._id,
                        emoji,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : msg
            ),
          }));
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to add reaction";
          toast.error(errorMsg);
        }
      },

      removeReaction: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}/reaction`);

          // Update local state
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    reactions: (msg.reactions || []).filter(
                      (r) => r.userId !== useAuthStore.getState().authUser._id
                    ),
                  }
                : msg
            ),
          }));
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Failed to remove reaction";
          toast.error(errorMsg);
        }
      },

      // Helper: Increment unread count for a chat
      incrementUnreadCount: (userId) => {
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [userId]: (state.unreadCounts[userId] || 0) + 1,
          },
        }));
      },

      // Helper: Clear unread count for a chat
      clearUnreadCount: (userId) => {
        set((state) => ({
          unreadCounts: {
            ...state.unreadCounts,
            [userId]: 0,
          },
        }));
      },

      // Global subscription for messageReceived (chat list updates + notifications)
      // This should ALWAYS be active, regardless of selectedUser
      subscribeToGlobalMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;



        // Remove any existing global listeners to prevent duplicates
        socket.off("chat_list_update");
        socket.off("notification_alert");
        socket.off("messageReceived"); // Keep for backwards compatibility

        // ============ MAIN EVENT: chat_list_update ============
        // This updates the sidebar in real-time whenever a new message arrives
        socket.on("chat_list_update", (data) => {
          const {
            senderId,
            senderInfo,
            lastMessage,
            lastMessagePreview,
            timestamp,
            unreadCount,
          } = data;
          const { selectedUser } = get();
          const { chats } = get();

          // Check if this conversation already exists in chat list
          const existingChatIndex = chats.findIndex(
            (chat) => chat._id === senderId
          );

          if (existingChatIndex > -1) {
            // Update existing chat - move to top and update last message
            set((state) => {
              const updatedChats = [...state.chats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                lastMessage: lastMessage,
                lastMessagePreview: lastMessagePreview,
                updatedAt: timestamp,
              };
              // Move to top
              const [chat] = updatedChats.splice(existingChatIndex, 1);
              return { chats: [chat, ...updatedChats] };
            });

            // If not currently viewing this chat, increment unread count
            if (selectedUser?._id !== senderId) {
              get().incrementUnreadCount(senderId);
            }
          } else {
            // Add new chat to the top
            set((state) => ({
              chats: [
                {
                  _id: senderId,
                  fullName: senderInfo.fullName,
                  username: senderInfo.username,
                  profilePic: senderInfo.profilePic,
                  lastMessage: lastMessage,
                  lastMessagePreview: lastMessagePreview,
                  updatedAt: timestamp,
                },
                ...state.chats,
              ],
            }));

            // Increment unread count for new chat
            get().incrementUnreadCount(senderId);
          }
        });

        // ============ SECONDARY EVENT: notification_alert ============
        // This triggers toast notifications for new messages
        socket.on("notification_alert", (data) => {
          const { type, senderInfo, messagePreview, senderId } = data;
          const { selectedUser } = get();

          // Only show notification if not currently chatting with this user
          if (selectedUser?._id !== senderId) {

            if (window._handleMessageNotification) {
              window._handleMessageNotification({
                senderInfo,
                message: { text: messagePreview },
              });
            }
          }
        });

        // ============ BACKWARDS COMPATIBILITY: messageReceived ============
        // Keep this for any old events that might still be sent
        socket.on("messageReceived", (data) => {
          const { senderId, senderInfo, message } = data;
          const { selectedUser } = get();
          const { chats } = get();

          const existingChatIndex = chats.findIndex(
            (chat) => chat._id === senderId
          );

          if (existingChatIndex > -1) {
            set((state) => {
              const updatedChats = [...state.chats];
              updatedChats[existingChatIndex] = {
                ...updatedChats[existingChatIndex],
                lastMessage: message,
              };
              const [chat] = updatedChats.splice(existingChatIndex, 1);
              return { chats: [chat, ...updatedChats] };
            });
          } else {
            set((state) => ({
              chats: [
                {
                  _id: senderId,
                  fullName: senderInfo.fullName,
                  username: senderInfo.username,
                  profilePic: senderInfo.profilePic,
                  lastMessage: message,
                },
                ...state.chats,
              ],
            }));
          }

          if (selectedUser?._id !== senderId) {
            if (window._handleMessageNotification) {
              window._handleMessageNotification({
                senderInfo,
                message,
              });
            }
          }
        });
      },

      // Chat-specific subscription (for active conversation messages)
      subscribeToMessages: () => {
  const { selectedUser } = get();
  const { soundEffects } = useSettingsStore.getState();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  if (!socket) return;

  // ---- REFERENCE CACHED LISTENERS TO PREVENT DUPLICATION ----
  if (!window._messageListeners) window._messageListeners = {};

  // ================== NEW MESSAGE HANDLER ==================
  if (!window._messageListeners.newMessage) {
    window._messageListeners.newMessage = (data) => {
      const newMessage = data.message || data;
      const { authUser } = useAuthStore.getState();
      const { selectedUser } = get();

      if (!selectedUser) return;

      const sender = newMessage.senderId?._id || newMessage.senderId;
      const receiver = newMessage.receiverId?._id || newMessage.receiverId;

      const isRelevant =
        (sender === selectedUser._id && receiver === authUser._id) ||
        (sender === authUser._id && receiver === selectedUser._id);

      if (!isRelevant) return;

      set((state) => {
        const exists = state.messages.some((msg) => msg._id === newMessage._id);
        if (exists) return state;

        if (soundEffects && sender === selectedUser._id) {
          const sound = new Audio("/sounds/notification.mp3");
          sound.play().catch(() => {});
        }

        return { messages: [...state.messages, newMessage] };
      });
    };

    socket.on("newMessage", window._messageListeners.newMessage);
  }

  // ================== MESSAGE STATUS ==================
  if (!window._messageListeners.messageStatus) {
    window._messageListeners.messageStatus = ({ messageId, status }) => {
      get().updateMessageStatus(messageId, status);
    };

    socket.on("messageStatus", window._messageListeners.messageStatus);
  }

  // ================== DELETE MESSAGE ==================
  if (!window._messageListeners.messageDeleted) {
    window._messageListeners.messageDeleted = (messageId) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    };

    socket.on("messageDeleted", window._messageListeners.messageDeleted);
  }

  // ================== REACTION ADDED ==================
  if (!window._messageListeners.reactionAdded) {
    window._messageListeners.reactionAdded = ({ messageId, userId, emoji }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                reactions: [
                  ...(msg.reactions || []).filter((r) => r.userId !== userId),
                  { userId, emoji, createdAt: new Date().toISOString() },
                ],
              }
            : msg
        ),
      }));
    };

    socket.on("messageReaction", window._messageListeners.reactionAdded);
  }

  // ================== REACTION REMOVED ==================
  if (!window._messageListeners.reactionRemoved) {
    window._messageListeners.reactionRemoved = ({ messageId, userId }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                reactions: (msg.reactions || []).filter(
                  (r) => r.userId !== userId
                ),
              }
            : msg
        ),
      }));
    };

    socket.on("messageReactionRemoved", window._messageListeners.reactionRemoved);
  }
},


      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        // Only unsubscribe from chat-specific listeners
        // Keep chat_list_update and notification_alert active for global chat list updates
        socket.off("newMessage");
        socket.off("messageStatus");
        socket.off("messageDeleted");
        socket.off("messageReaction");
        socket.off("messageReactionRemoved");
      },
    }),
    {
      name: "chat-store",
      storage: customStorage,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        messages: currentState.messages, // Always use current messages
      }),
    }
  )
);

useSettingsStore.subscribe((state) => {
  useChatStore.setState({ isSoundEnabled: state.soundEffects });
});
