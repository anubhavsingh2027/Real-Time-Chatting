import { ArrowLeft, Copy, Trash2, Download, X, AlertTriangle, ChevronDown } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "./ConfirmDialog";
import MessageViewerModal from "./MessageViewerModal";
import ProfileModal from "./ProfileModal";

function ChatHeader({ onBack }) {
  const { selectedUser, setSelectedUser, selectedMessage, setSelectedMessage, deleteMessage } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { authUser } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const reactions = ['❤️', '👍', '😊', '😂', '😮', '😢'];

  const isLongMessage = (selectedMessage?.text?.length || 0) > 300;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (selectedMessage) {
          setSelectedMessage(null);
        } else {
          setSelectedUser(null);
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, selectedMessage, setSelectedMessage]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(selectedMessage.text || '');
      toast.success('Copied to clipboard');
      setShowEmojiPicker(false);
      setSelectedMessage(null);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadImage = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      const ext = (blob.type || 'image/jpeg').split('/')[1] || 'jpg';
      link.download = `image-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
      setShowEmojiPicker(false);
      setSelectedMessage(null);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDeleteMessage = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMessage = () => {
    deleteMessage(selectedMessage._id);
    setShowEmojiPicker(false);
    setSelectedMessage(null);
    setShowDeleteConfirm(false);
    toast.success('Message deleted');
  };

  const handleAddReaction = async (emoji) => {
    try {
      const { addReaction } = useChatStore.getState();
      await addReaction(selectedMessage._id, emoji);
      toast.success('Reaction added');
      setShowEmojiPicker(false);
      setSelectedMessage(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add reaction');
    }
  };

  return (
    <>
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b border-emerald-200 dark:border-slate-600 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Selected Message:</p>
                <div className="flex items-start gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate whitespace-pre-wrap break-words line-clamp-2">
                    {isLongMessage ? `${selectedMessage.text?.substring(0, 150)}...` : (selectedMessage.text || '(Image only)')}
                  </p>
                  {isLongMessage && (
                    <button
                      onClick={() => setShowFullMessage(true)}
                      className="flex-shrink-0 px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
                      title="View full message"
                    >
                      Read More
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyMessage}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {selectedMessage.image && (
                  <button
                    onClick={() => handleDownloadImage(selectedMessage.image)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-colors"
                    title="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Add reaction"
                  >
                    <span className="text-lg">😊</span>
                  </button>

                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 flex gap-1 z-50"
                    >
                      {reactions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(emoji)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {authUser._id === selectedMessage.senderId && (
                  <button
                    onClick={handleDeleteMessage}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center bg-white dark:bg-slate-800 h-16 border-b border-gray-200 dark:border-slate-700/50">
        <div className="flex-1 flex items-center gap-4 px-4">
          <button
            onClick={onBack}
            className="lg:hidden text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => setShowProfile(true)}>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="text-black dark:text-white font-medium leading-tight">@{selectedUser.username}</h3>
              <p className="text-gray-500 dark:text-slate-300 text-sm leading-tight">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <MessageViewerModal
        isOpen={showFullMessage}
        onClose={() => setShowFullMessage(false)}
        message={selectedMessage}
        isOwnMessage={authUser._id === selectedMessage?.senderId}
        onCopy={handleCopyMessage}
        onDownload={() => handleDownloadImage(selectedMessage.image)}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={selectedUser}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteMessage}
        title="Delete Message?"
        message={`Are you sure you want to delete this message? This action cannot be undone.\n\n"${selectedMessage?.text?.substring(0, 50)}${(selectedMessage?.text?.length || 0) > 50 ? '...' : ''}"`}
        confirmText="Delete"
        cancelText="Cancel"
        icon="🗑️"
        intent="danger"
      />
    </>
  );
}
export default ChatHeader;
