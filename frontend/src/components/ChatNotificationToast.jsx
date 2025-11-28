import React from "react";

export default function ChatNotificationToast({ senderInfo, messagePreview, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer p-3 bg-white shadow-lg rounded-xl border border-gray-200 w-[270px] hover:bg-gray-100 transition"
    >
      <img
        src={senderInfo.profilePic || "/default-avatar.png"}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover"
      />

      <div>
        <p className="font-semibold text-sm text-gray-900">
          New message from {senderInfo.fullName}
        </p>
        <p className="text-xs text-gray-600 truncate max-w-[180px]">
          {messagePreview}
        </p>
      </div>
    </div>
  );
}
