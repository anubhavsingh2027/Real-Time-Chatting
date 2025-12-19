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

  // Helper to format date
  const formatDateDivider = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to check if date changed
  const shouldShowDateDivider = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

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
      <div className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-4 bg-gray-100 dark:bg-slate-800" style={{ overflow: 'auto', overflowX: 'hidden' }}>
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <div key={msg._id || msg.tempId}>
                  {/* Date Divider */}
                  {shouldShowDateDivider(msg, messages[index - 1]) && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 px-2 py-1 bg-gray-100 dark:bg-slate-700/50 rounded-full whitespace-nowrap">
                        {formatDateDivider(msg.createdAt)}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                    </div>
                  )}

                  <MessageBubble
                    message={msg}
                    isOwnMessage={(typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) === authUser._id}
                    messageStatus={
                      msg.isOptimistic
                        ? 'sending'
                        : messageStatuses[msg._id] || 'sent'
                    }
                    onDelete={deleteMessage}
                    onReply={setReplyToMessage}
                    onForward={setForwardMessage}
                  />
                </div>
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
