import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageBubble from "./MessageBubble";

function ChatContainer({ onBack }) {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    messageStatuses,
    deleteMessage,
    setReplyToMessage,
    setForwardMessage,
    clearUnreadCount,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

 useEffect(() => {
  if (!selectedUser?._id) return;

  getMessagesByUserId(selectedUser._id);
  clearUnreadCount(selectedUser._id);

  // prevent duplicate socket listeners
  let unsubscribed = false;
  subscribeToMessages();

  return () => {
    if (!unsubscribed) {
      unsubscribeFromMessages();
      unsubscribed = true;
    }
  };
}, [selectedUser?._id]);



  // Scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0 && !isMessagesLoading) {
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [isMessagesLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!messageEndRef.current || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage && (
      // Check if it's a fresh message (created in the last second)
      new Date(lastMessage.createdAt).getTime() > Date.now() - 1000 ||
      // Or if it's an optimistic message (being sent)
      lastMessage.isOptimistic
    );

    if (isNewMessage) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      <ChatHeader onBack={onBack} />
      <div className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-4 bg-gray-100 dark:bg-slate-800">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg._id || msg.tempId}

                  message={msg}
                  isOwnMessage={msg.senderId === authUser._id}
                  messageStatus={
                    msg.isOptimistic
                      ? 'sending'
                      : messageStatuses[msg._id] || 'sent'
                  }
                  onDelete={deleteMessage}
                  onReply={setReplyToMessage}
                  onForward={setForwardMessage}
                />
              ))}
            </AnimatePresence>
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
