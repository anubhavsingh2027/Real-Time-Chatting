import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="flex gap-2 p-3 m-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
      <button
        onClick={() => setActiveTab("chats")}
        className={`flex-1 py-2 px-3 rounded-md font-medium transition-all duration-200 active:scale-95 ${
          activeTab === "chats"
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
            : "text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`flex-1 py-2 px-3 rounded-md font-medium transition-all duration-200 active:scale-95 ${
          activeTab === "contacts"
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
            : "text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
