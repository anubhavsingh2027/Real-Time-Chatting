import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Copy,
  Check,
  Download,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

function MessageBubble({ message, isOwnMessage, messageStatus = 'sent', onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(false);
  const longPressTimer = useRef(null);
  const bubbleRef = useRef(null);
  const imageRef = useRef(null);
  const { addReaction } = useChatStore();
  const { authUser } = useAuthStore();

  const reactions = ['❤️', '👍', '😊', '😂', '😮', '😢'];

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
      toast.error('Failed to add reaction');
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (confirm('Delete this message?')) {
      // Hide menus before delete animation starts
      setShowActions(false);
      setShowMenuButton(false);
      onDelete(message._id);
    }
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
    <AnimatePresence mode="popLayout">
      <motion.div
        key={message._id}
        className={`w-full flex ${containerAlign} mb-2 px-3`}
        ref={bubbleRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.8,
          height: 0,
          marginBottom: 0,
          transition: {
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            height: { duration: 0.2, delay: 0.1 }
          }
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
              className="absolute z-[100] transform origin-bottom"
              style={{
                bottom: '100%',
                left: isOwnMessage ? 'auto' : '0',
                right: isOwnMessage ? '0' : 'auto',
                marginBottom: '8px'
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
            {message.image && (
              <div className="w-auto max-w-[60vw] sm:max-w-[40vw] md:max-w-[320px] rounded-lg overflow-hidden shadow-sm">
                <img
                  ref={imageRef}
                  src={message.image}
                  alt={message.text ? 'attachment' : 'image'}
                  onClick={() => setShowImageModal(true)}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  className="w-auto h-auto max-w-full max-h-[60vh] object-contain cursor-pointer block"
                />
              </div>
            )}

            {message.text && (
              <div className="text-sm leading-5 break-words whitespace-pre-wrap">
                <span className="block">{message.text}</span>
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
            className={`absolute ${!isOwnMessage ? 'right-[-40px]' : 'left-[-40px]'} transition-all duration-200 ${
              showMenuButton ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
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
                const next = !showActions;
                setShowActions(next);
                setShowReactionPopup(false);
                setShowMenuButton(true);
                if (next) {
                  window.dispatchEvent(new CustomEvent('message-dropdown-open', { detail: { id: message._id } }));
                }
              }}
              className={`p-2 rounded-full transition-all duration-150 focus:outline-none shadow-md cursor-pointer ${
                isOwnMessage ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'
              }`}
              aria-label="message actions"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </motion.div>

          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-[100]"
              style={{
                [isOwnMessage ? 'right' : 'left']: '-40px',
                top: '0',
                transform: 'translateY(-100%)'
              }}
            >
              <div className="rounded-xl shadow-xl py-2 w-52 backdrop-blur-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-black/5 dark:ring-white/10">
                <div className="px-2">
                  <button
                    onClick={handleCopyMessage}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Copy
                  </button>
                </div>

                <div className="px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPopup(true);
                      setShowActions(false);
                      setShowMenuButton(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <span className="text-lg">😊</span>
                    React
                  </button>
                </div>

                {message.image && (
                  <div className="px-2">
                    <button
                      onClick={() => handleDownloadImage(message.image)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Download
                    </button>
                  </div>
                )}

                {isOwnMessage && (
                  <>
                    <div className="my-1 border-t border-gray-100 dark:border-slate-700" />
                    <div className="px-2">
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

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
      </motion.div>
    </AnimatePresence>
  );
}

export default MessageBubble;