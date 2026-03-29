import { Check } from "lucide-react";

function MessageStatusIcon({ status }) {
  if (status === "sending") {
    return (
      <div
        className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        title="Sending..."
      />
    );
  }

  if (status === "sent") {
    return (
      <Check className="w-4 h-4 text-white/70" strokeWidth={2.5} title="Sent" />
    );
  }

  if (status === "delivered") {
    return (
      <div className="flex -space-x-1" title="Delivered">
        <Check className="w-4 h-4 text-white/70" strokeWidth={2.5} />
        <Check className="w-4 h-4 text-white/70" strokeWidth={2.5} />
      </div>
    );
  }

  if (status === "read") {
    return (
      <div className="flex -space-x-1" title="Read">
        <Check className="w-4 h-4 text-cyan-300" strokeWidth={2.8} />
        <Check className="w-4 h-4 text-cyan-300" strokeWidth={2.8} />
      </div>
    );
  }

  return null;
}

export default MessageStatusIcon;
