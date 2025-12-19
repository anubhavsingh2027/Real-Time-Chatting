import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Copy,
  Check,
  Download,
  Trash2,
  X,
  Reply,
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

function MessageBubble({ message, isOwnMessage, messageStatus = 'sent', onDelete, onReply }) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimer = useRef(null);
  const bubbleRef = useRef(null);
  const imageRef = useRef(null);
  const { addReaction, setSelectedMessage } = useChatStore();
  const { authUser } = useAuthStore();

  const reactions = ['❤️', '👍', '😊', '😂', '😮', '😢','😡','🎊'];
  const isLongMessage = (message.text?.length || 0) > 150;

  // Helper to safely get sender name from replyTo
  const getReplySenderName = () => {
    if (!message.replyTo?.senderId) return 'Unknown';
    if (typeof message.replyTo.senderId === 'object') {
      return message.replyTo.senderId.fullName || 'Unknown';
    }
    return 'Unknown';
  };

  // Helper to render text with clickable links
  const renderTextWithLinks = (text) => {
    if (!text) return text;

    // URL regex pattern to detect http, https, www, and other common links
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|ftp:\/\/[^\s]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // It's a link
        const url = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-400 hover:text-blue-300 underline hover:underline-offset-2 transition-colors break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
        setShowActions(false);
        setShowReactionPopup(false);
        setShowMenuButton(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    if (!showActions && !showReactionPopup) return;

    const onDocClick = (e) => {
      const el = bubbleRef.current;
      if (!el) return;
      if (!el.contains(e.target)) {
        setShowActions(false);
        setShowReactionPopup(false);
        setShowMenuButton(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, [showActions, showReactionPopup]);

  useEffect(() => {
    const onOtherOpen = (e) => {
      const otherId = e.detail?.id;
      if (!otherId) return;
      if (otherId !== message._id) {
        setShowActions(false);
        setShowReactionPopup(false);
        setShowMenuButton(false);
      }
    };
    window.addEventListener('message-dropdown-open', onOtherOpen);
    return () => window.removeEventListener('message-dropdown-open', onOtherOpen);
  }, [message._id]);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text || '');
      toast.success('Copied to clipboard');
      setShowActions(false);
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
    } catch {
      toast.error('Download failed');
    }
  };

  const handleReaction = async (emoji) => {
    try {
      await addReaction(message._id, emoji);
      toast.success('Emoji Reaction added', {
        duration: 2000,
      });
      setShowReactionPopup(false);
      setShowMenuButton(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add reaction');
    }
  };

  const handleReply = () => {
    if (!onReply) return;
    onReply(message);
    setShowActions(false);
    setShowMenuButton(false);
    toast.success('Ready to reply', { duration: 1500 });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setShowDeleteConfirm(true);
    setShowActions(false);
  };

  const handleConfirmDelete = () => {
    setShowMenuButton(false);
    onDelete(message._id);
    setShowDeleteConfirm(false);
  };

  const getStatusIcon = () => {
    switch (messageStatus) {
      case 'sending':
        return <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />;
      case 'sent':
        return <Check className="w-4 h-4 text-white" strokeWidth={2} />;
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-white/90" strokeWidth={2} />
            <Check className="w-4 h-4 text-white/90" strokeWidth={2} />
          </div>
        );
      case 'seen':
        return (
          <div className="flex -space-x-1">
            <Check className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
            <Check className="w-4 h-4 text-sky-400" strokeWidth={2.5} />
          </div>
        );
      default:
        return null;
    }
  };

  const handleMouseEnter = () => setShowMenuButton(true);
  const handleMouseLeave = () => {
    if (!showActions && !showReactionPopup) setShowMenuButton(false);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPopup(true);
      setShowMenuButton(true);
      window.dispatchEvent(new CustomEvent('message-dropdown-open', { detail: { id: message._id } }));
    }, 600);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const containerAlign = isOwnMessage ? 'justify-end' : 'justify-start';

  return (
    <>
      <motion.div
        className={`w-full flex ${containerAlign} mb-2 px-3 relative`}
        ref={bubbleRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { duration: 0.25, ease: "easeOut" }
        }}
        exit={{
          opacity: 0,
          scale: 0.6,
          y: -10,
          filter: "blur(4px)",
          transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }
        }}
        layout
      >
        <motion.div
          className={`relative max-w-[85%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
          layout
        >
          {showReactionPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-[100] transform origin-bottom ${
                isOwnMessage ? 'popup-right' : 'popup-left'
              }`}
              style={{
                top: 'calc(100% + 6px)',
                left: isOwnMessage ? 'auto' : '0',
                right: isOwnMessage ? '0' : 'auto'
              }}
            >
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-1.5 flex items-center gap-0.5 ring-1 ring-black/5 dark:ring-white/10 scale-100 hover:scale-[1.02] transition-transform min-w-max">
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="text-2xl p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-700/70 transition-colors active:scale-90"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            layout
            className={`message-bubble group relative inline-flex flex-col items-start gap-2 p-2.5 sm:p-3 rounded-2xl shadow-sm ${
              isOwnMessage
                ? 'bg-emerald-500 text-white rounded-tr-[4px]'
                : 'bg-slate-700 text-slate-100 rounded-tl-[4px]'
            }`}
          >
            {/* Reply Preview */}
            {message.replyTo && (
              <div className={`w-full px-3 py-2 rounded-lg border-l-4 mb-2 ${
                isOwnMessage
                  ? 'bg-white/20 border-white/60 text-white'
                  : 'bg-slate-800/40 border-slate-400/60 text-slate-100'
              }`}>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg">↪️</span>
                  <p className="text-xs font-bold opacity-90">
                    Replying to {getReplySenderName()}
                  </p>
                </div>
                <p className="text-xs line-clamp-2 opacity-85 pl-5">
                  {message.replyTo.text || (message.replyTo.image && '📷 Image message')}
                </p>
              </div>
            )}

            {message.image && (
              <div
                className="inline-block w-[280px] aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-black/5 dark:bg-white/5"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    ref={imageRef}
                    src={message.image}
                    alt={message.text ? 'attachment' : 'image'}
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="max-w-full max-h-full w-auto h-auto object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
                  />
                </div>
              </div>
            )}

            {message.text && (
              <div className="space-y-2 max-w-sm">
                <div className="text-sm leading-relaxed break-words whitespace-pre-wrap font-normal overflow-hidden">
                  {isLongMessage && !isExpanded
                    ? renderTextWithLinks(message.text.substring(0, 200) + '...')
                    : renderTextWithLinks(message.text)}
                </div>
                {isLongMessage && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`text-xs font-semibold px-3 py-1 rounded-md transition-colors ${
                      isOwnMessage
                        ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-600/30 hover:bg-slate-600/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isExpanded ? '▲ Show Less' : '▼ Read More'}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 self-end mt-0.5">
              <time className={`text-[11px] opacity-80 ${isOwnMessage ? 'text-white/80' : 'text-slate-300'}`}>
                {message.createdAt
                  ? new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </time>
              {isOwnMessage && <div className="flex items-center">{getStatusIcon()}</div>}
            </div>
          </motion.div>

          <motion.div
            className={`absolute ${!isOwnMessage ? 'right-[-48px]' : 'left-[-48px]'} transition-all duration-200 ${
              showMenuButton ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-75'
            }`}
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            layout
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
                setShowReactionPopup(false);
                setShowMenuButton(true);
                window.dispatchEvent(new CustomEvent('message-dropdown-open', { detail: { id: message._id } }));
              }}
              className={`p-2.5 rounded-full transition-all duration-150 focus:outline-none shadow-lg cursor-pointer ring-1 ${
                isOwnMessage ? 'bg-emerald-500 hover:bg-emerald-600 ring-emerald-400/30 hover:shadow-emerald-500/30' : 'bg-slate-600 hover:bg-slate-700 ring-slate-500/30 hover:shadow-slate-500/30'
              }`}
              aria-label="message actions"
              title="More options"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        </motion.div>

        {/* Menu - positioned fixed to viewport */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -15 }}
              transition={{ duration: 0.15 }}
              className={`fixed z-[50] ${
                isOwnMessage ? 'menu-right' : 'menu-left'
              }`}
              ref={(el) => {
                if (el && bubbleRef.current) {
                  const bubbleRect = bubbleRef.current.getBoundingClientRect();
                  const menuHeight = el.offsetHeight;
                  const viewportHeight = window.innerHeight;

                  // Position below the message, but flip if too close to bottom
                  let topPos = bubbleRect.bottom + 8;
                  if (topPos + menuHeight > viewportHeight - 10) {
                    topPos = bubbleRect.top - menuHeight - 8;
                  }

                  el.style.top = `${topPos}px`;

                  if (isOwnMessage) {
                    el.style.right = `${window.innerWidth - bubbleRect.right}px`;
                    el.style.left = 'auto';
                  } else {
                    el.style.left = `${bubbleRect.left}px`;
                    el.style.right = 'auto';
                  }
                }
              }}
            >
              <div className="rounded-2xl shadow-2xl py-1 w-56 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white ring-1 ring-black/10 dark:ring-white/20 overflow-hidden">
                  <div className="px-1.5">
                    <button
                      onClick={handleCopyMessage}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center gap-3 transition-colors font-medium"
                    >
                      <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="px-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReactionPopup(true);
                        setShowActions(false);
                        setShowMenuButton(true);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-3 transition-colors font-medium"
                    >
                      <span className="text-xl">😊</span>
                      <span>React</span>
                    </button>
                  </div>

                  <div className="px-1.5">
                    <button
                      onClick={handleReply}
                      className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-3 transition-colors font-medium"
                    >
                      <Reply className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Reply</span>
                    </button>
                  </div>

                  {message.image && (
                    <div className="px-1.5">
                      <button
                        onClick={() => handleDownloadImage(message.image)}
                        className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center gap-3 transition-colors font-medium"
                      >
                        <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Download</span>
                      </button>
                    </div>
                  )}

                  {isOwnMessage && (
                    <>
                      <div className="my-1.5 border-t border-gray-200 dark:border-slate-700/50" />
                      <div className="px-1.5">
                        <button
                          onClick={handleDelete}
                          className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        {message.reactions && message.reactions.length > 0 && (
            <motion.div
              layout
              className={`absolute -bottom-2 ${isOwnMessage ? 'right-2' : 'left-2'} bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-md border border-gray-200 dark:border-slate-700 flex items-center gap-1 text-sm z-10`}
            >
              {message.reactions.slice(0, 3).map((r, i) => (
                <span key={i}>{r.emoji || r}</span>
              ))}
              {message.reactions.length > 3 && (
                <span className="text-xs text-gray-500">+{message.reactions.length - 3}</span>
              )}
            </motion.div>
          )}
        </motion.div>

      {showImageModal && message.image && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-[95%] max-h-[95%]">
            <img
              src={message.image}
              alt="preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
              aria-label="close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadImage(message.image);
              }}
              className="absolute bottom-3 right-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-3 py-2 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="🗑️ Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        intent="danger"
      />
    </>
  );
}

export default MessageBubble;
