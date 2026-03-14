import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 animate-fade-in">
      <div className="size-24 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <MessageCircleIcon className="size-12 text-cyan-600 dark:text-cyan-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
        Select a conversation
      </h3>
      <p className="text-gray-600 dark:text-slate-400 max-w-md text-lg leading-relaxed">
        Choose a contact from the sidebar to start chatting or continue a
        previous conversation.
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
