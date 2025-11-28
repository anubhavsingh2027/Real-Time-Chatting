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
          if (socket) {
            socket.emit("newMessage", {
              message: actualMessage,
              receiverId: selectedUser._id,
            });
          }
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

      subscribeToMessages: () => {
        const { selectedUser } = get();
        const { soundEffects } = useSettingsStore.getState();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // Remove any existing listeners
        socket.off("newMessage");
        socket.off("messageDeleted");

        // Add new message listener
        // Listen for message status updates
        socket.on("messageStatus", ({ messageId, status }) => {
          get().updateMessageStatus(messageId, status);
        });

        // Listen for new messages
        socket.on("newMessage", (data) => {
          const newMessage = data.message || data;
          const { authUser } = useAuthStore.getState();

          // Only process messages relevant to the current chat
          const isRelevantMessage =
            (newMessage.senderId === selectedUser._id &&
              newMessage.receiverId === authUser._id) ||
            (newMessage.senderId === authUser._id &&
              newMessage.receiverId === selectedUser._id);

          if (!isRelevantMessage) return;

          set((state) => {
            // Check for duplicates
            const messageExists = state.messages.some(
              (msg) =>
                msg._id === newMessage._id ||
                (msg.isOptimistic &&
                  msg.text === newMessage.text &&
                  msg.createdAt === newMessage.createdAt)
            );

            if (messageExists) return state;

            // Play sound for incoming messages from other users
            if (soundEffects && newMessage.senderId === selectedUser._id) {
              const notificationSound = new Audio("/sounds/notification.mp3");
              notificationSound.currentTime = 0;
              notificationSound.play().catch(() => {});
            }

            return {
              messages: [...state.messages, newMessage],
            };
          });
        });

        // Listen for deleted messages
        socket.on("messageDeleted", (messageId) => {
          set((state) => ({
            messages: state.messages.filter((msg) => msg._id !== messageId),
          }));
        });

        // Listen for reactions
        socket.on("messageReaction", ({ messageId, userId, emoji }) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg._id === messageId
                ? {
                    ...msg,
                    reactions: [
                      ...(msg.reactions || []).filter(
                        (r) => r.userId !== userId
                      ),
                      { userId, emoji, createdAt: new Date().toISOString() },
                    ],
                  }
                : msg
            ),
          }));
        });

        // Listen for reaction removals
        socket.on("messageReactionRemoved", ({ messageId, userId }) => {
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
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
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
