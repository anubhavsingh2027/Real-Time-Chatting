import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Settings } from "lucide-react";

import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const navigate = useNavigate();
  const {
    activeTab,
    selectedUser,
    setSelectedUser,
    subscribeToGlobalMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    subscribeToGlobalMessages();
  }, []);

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleNavigateSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-0 overflow-hidden " style={{width
    :"100%"}}>
      {/* Full Screen Chat Application */}
      <div className="relative h-full w-full flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 flex-col border-r border-gray-300 dark:border-slate-700 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 px-4 py-4 flex items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white dark:ring-slate-700">
                <img
                  src="/icon.png"
                  alt="Website logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-white">Real Time Chat</h1>
            </div>
            <button
              onClick={handleNavigateSettings}
              className="text-white p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* Desktop Chat Area */}
        <div className="hidden lg:flex flex-1 flex-col bg-white dark:bg-slate-800">
          {selectedUser ? (
            <ChatContainer onBack={handleBack} />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden h-full w-full flex flex-col">
          {/* Chat List View */}
          <div
            className={`fixed inset-0 bg-white dark:bg-slate-800 z-10 transition-all duration-300 ${
              selectedUser ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 px-4 py-4 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white">
                    <img
                      src="/icon.png"
                      alt="Website logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-xl font-bold text-white">
                    Real Time Chat
                  </h1>
                </div>
                <button
                  onClick={handleNavigateSettings}
                  className="text-white p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-95"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <ActiveTabSwitch />
              <div className="flex-1 overflow-y-auto">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>
          </div>

          {/* Chat Container View */}
          <div
            className={`fixed inset-0 bg-white dark:bg-slate-800 z-20 transition-all duration-300 ${
              selectedUser ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {selectedUser && (
              <div className="h-full flex flex-col">
                <ChatContainer onBack={handleBack} />
              </div>
            )}
          </div>

          {/* Sliding Menu */}
          <div
            className={`fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 transform transition-all duration-300 z-50 shadow-xl ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-700 dark:via-blue-600 dark:to-cyan-600 px-4 py-4 flex items-center gap-4 shadow-lg">
                <button
                  onClick={handleToggleSidebar}
                  className="text-white p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-all duration-200 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white">Profile</h2>
              </div>
              <ProfileHeader onOpenSettings={handleNavigateSettings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
