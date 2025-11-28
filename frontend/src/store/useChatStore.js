import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import useSettingsStore from "./useSettingsStore";
import ChatNotificationToast from "../components/ChatNotificationToast";
import React from "react";

const filterMessagesForStorage = (messages) => {
  return messages.map((msg) => ({
    ...msg,
    image: msg.image ? true : false,
  }));
};

// ✅ KEEP HERE
const uniqueById = (messages) => {
  const map = new Map();
  messages.forEach((msg) => map.set(msg._id || msg.tempId, msg));
  return [...map.values()];
};

const normalizeMessage = (msg) => ({
  ...msg,
  senderId: typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId,
  receiverId:
    typeof msg.receiverId === "object" ? msg.receiverId._id : msg.receiverId,
});

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
          messages: [...messages, normalizeMessage(optimisticMessage)],

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
            messages: uniqueById(
            state.messages
              .filter((m) => m._id !== tempId && m.tempId !== actualMessage._id)
              .concat(normalizeMessage(actualMessage))

          )

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

      subscribeToGlobalMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // remove previous listeners to avoid duplication
        socket.off("chat_list_update");
        socket.off("notification_alert");

        socket.on("chat_list_update", (data) => {
          const {
            senderId,
            senderInfo,
            lastMessage,
            lastMessagePreview,
            timestamp,
          } = data;

            const { authUser } = useAuthStore.getState();
        const { isSoundEnabled } = get(); // from store
        if (isSoundEnabled && senderId !== authUser._id) {
          new Audio("/sounds/notification.mp3")
            .play()
            .catch(() => {});
        }

          set((state) => {
            const idx = state.chats.findIndex((chat) => chat._id === senderId);

            if (idx > -1) {
              const updatedChats = [...state.chats];
              updatedChats[idx] = {
                ...updatedChats[idx],
                lastMessage,
                lastMessagePreview,
                updatedAt: timestamp,
              };

              // move updated chat to top
              const updated = updatedChats.splice(idx, 1);
              return { chats: [...updated, ...updatedChats] };
            }

            // add new chat if not exist
            return {
              chats: [
                {
                  _id: senderId,
                  ...senderInfo,
                  lastMessage,
                  lastMessagePreview,
                  updatedAt: timestamp,
                },
                ...state.chats,
              ],
            };
          });
        });

        socket.on(
  "notification_alert",
  ({ senderId, messagePreview, senderInfo }) => {
    const { selectedUser } = get();
    const { isSoundEnabled } = get();
    const { authUser } = useAuthStore.getState();

    if (selectedUser?._id !== senderId) {

      if (isSoundEnabled && senderId !== authUser._id) {
        new Audio("/sounds/notification.mp3").play().catch(() => {});
      }

     toast.custom((t) => {
  return React.createElement(ChatNotificationToast, {
    senderInfo,
    messagePreview,
    onClick: () => {
      toast.dismiss(t.id);
      get().setSelectedUser({ _id: senderId, ...senderInfo });
    }
  });
});


    }
  }
);

      },

      // Global subscription for messageReceived (chat list updates + notifications)
      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        const { selectedUser } = get();
        const { soundEffects } = useSettingsStore.getState();

        if (!socket || !selectedUser?._id) return;

        // ❗ Always remove old listeners before adding new ones
        socket.off("newMessage");
        socket.off("messageStatus");
        socket.off("messageDeleted");
        socket.off("messageReaction");
        socket.off("messageReactionRemoved");

        // NEW MESSAGE LISTENER
        const handleNewMessage = (data) => {
          const newMessage = data.message || data;
          const { authUser } = useAuthStore.getState();

          const sender = newMessage.senderId?._id || newMessage.senderId;
          const receiver = newMessage.receiverId?._id || newMessage.receiverId;

          const isRelevant =
            (sender === selectedUser._id && receiver === authUser._id) ||
            (sender === authUser._id && receiver === selectedUser._id);

          if (!isRelevant) return;

          set((state) => {
            // 🔥 FIX: STRONGER duplicate logic
            const isDuplicate = state.messages.some(
              (m) =>
                m._id === newMessage._id ||
                m.tempId === newMessage._id ||
                m._id === newMessage.tempId
            );

            if (isDuplicate) return state;

            return { messages: uniqueById([...state.messages, normalizeMessage(newMessage)]) };

          });
        };

        socket.on("newMessage", handleNewMessage);

        // Others remain the same:
        socket.on("messageStatus", ({ messageId, status }) => {
          get().updateMessageStatus(messageId, status);
        });

        socket.on("messageDeleted", (messageId) => {
          set((state) => ({
            messages: state.messages.filter((msg) => msg._id !== messageId),
          }));
        });

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
