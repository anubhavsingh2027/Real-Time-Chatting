import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSettingsStore from "../store/useSettingsStore";

export default function MessageNotification() {
  const [notification, setNotification] = useState(null);
  const { notificationSound } = useSettingsStore();

  useEffect(() => {
    const handleNotification = (data) => {
      const { senderInfo, message } = data;
      const preview = message.image ? "📷 Image" : message.text?.substring(0, 40) + (message.text?.length > 40 ? "..." : "");

      // Play notification sound if enabled
      if (notificationSound) {
        const notificationAudio = new Audio("/sounds/notification.mp3");
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(() => {
        });
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-in' : 'animate-out'} flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-blue-200 dark:border-blue-700 p-4 pointer-events-auto`}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <img src={senderInfo.profilePic || "/avatar.png"} alt={senderInfo.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              📩 New message from @{senderInfo.username}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{preview}</p>
          </div>
        </div>
      ), {
        duration: 4000,
        position: "top-right",
      });
    };

    // This will be called from useChatStore via a global handler
    window._handleMessageNotification = handleNotification;

    return () => {
      delete window._handleMessageNotification;
    };
  }, [notificationSound]);

  return null;
}
