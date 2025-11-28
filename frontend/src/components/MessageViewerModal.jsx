import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Download, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

export default function MessageViewerModal({
  isOpen,
  onClose,
  message,
  isOwnMessage,
  onCopy,
  onDownload,
  onDelete,
}) {
  if (!isOpen || !message) return null;

  const handleCopy = () => {
    onCopy();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Full Message</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Message Text */}
              {message.text && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Message:</p>
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed max-h-96 overflow-y-auto">
                    {message.text}
                  </div>
                </div>
              )}

              {/* Image */}
              {message.image && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Image:</p>
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={message.image}
                      alt="Message image"
                      className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Message Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Message length:</span> {message.text?.length || 0} characters
                </p>
                {message.createdAt && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Sent:</span>{" "}
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                )}
                {message.reactions && message.reactions.length > 0 && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Reactions:</span> {message.reactions.map((r) => r.emoji).join(" ")}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-medium text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>

              {message.image && (
                <button
                  onClick={() => {
                    onDownload();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}

              {isOwnMessage && (
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}

              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
