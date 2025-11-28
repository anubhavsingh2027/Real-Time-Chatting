import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Calendar, User as UserIcon, Copy, Check } from "lucide-react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
}) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyUsername = async () => {
    try {
      await navigator.clipboard.writeText(user.username || '');
      setCopiedField('username');
      toast.success('Username copied');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email || '');
      setCopiedField('email');
      toast.success('Email copied');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-lg"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="relative w-full max-w-md bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors z-10 bg-white dark:bg-slate-700"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Profile Header with Premium Gradient */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                className="absolute inset-0 bg-white"
              />
              <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white via-transparent to-transparent" />
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-8 pt-2">
              {/* Profile Picture */}
              <div className="flex justify-center -mt-20 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                  className="relative"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-6 border-white dark:border-slate-800 shadow-2xl ring-4 ring-blue-300 dark:ring-blue-500/50">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.div
                    animate={{ boxShadow: ["0 0 20px rgba(59, 130, 246, 0)", "0 0 30px rgba(59, 130, 246, 0.3)", "0 0 20px rgba(59, 130, 246, 0)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                  />
                </motion.div>
              </div>

              {/* User Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  {user.fullName}
                </h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-mono text-xs">
                    @{user.username}
                  </span>
                </p>
              </motion.div>

              {/* Info Cards */}
              <div className="space-y-3 mb-8">
                {/* Username */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50 cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg group-hover:scale-110 transition-transform">
                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Username</p>
                        <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100">
                          {user.username}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopyUsername}
                      className="p-2 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
                      title="Copy username"
                    >
                      {copiedField === 'username' ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/50 cursor-pointer group hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCopyEmail}
                      className="p-2 hover:bg-emerald-200 dark:hover:bg-emerald-700 rounded-lg transition-colors flex-shrink-0"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Account Created */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Member Since</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Close Profile
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
