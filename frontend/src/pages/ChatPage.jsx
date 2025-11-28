import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Menu, X, Settings } from "lucide-react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const navigate = useNavigate();
  const { activeTab, selectedUser, setSelectedUser, subscribeToGlobalMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Subscribe to global messages on mount
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
    <div className="relative h-screen lg:h-[800px] w-full max-w-6xl">
      {/* Mobile Layout */}
      <div className="lg:hidden h-full">
        {/* Chat List View */}
        <div
          className={`fixed inset-0 bg-white dark:bg-slate-900 z-10 transition-transform duration-300 ${
            selectedUser ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-emerald-600 dark:bg-slate-800 px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="/icon.png" alt="Website logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-medium text-white">Real Time Chating</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNavigateSettings}
                  className="text-white p-2 hover:bg-white/10 rounded-full"
                  aria-label="Settings"
                >
                  <Settings className="w-6 h-6" />
                </button>

              </div>
            </div>
            <ActiveTabSwitch />
            <div className="flex-1 overflow-y-auto">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-gray-100 dark:bg-slate-900 z-20 transition-transform duration-300 ${
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
          className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-800 transform transition-transform duration-300 z-50 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="bg-emerald-600 dark:bg-slate-800 px-4 py-4 flex items-center gap-4">
              <button onClick={handleToggleSidebar} className="text-white p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-medium text-white">Profile</h2>
            </div>
            <ProfileHeader onOpenSettings={handleNavigateSettings} />
          </div>
        </div>

        {/* Menu Backdrop */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={handleToggleSidebar} />}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block h-full">
        <BorderAnimatedContainer>
          <div className="w-80 bg-gray-100/50 dark:bg-slate-800/50 backdrop-blur-sm flex flex-col border-r border-white/10 dark:border-white/10">
            <div className="bg-emerald-600 dark:bg-slate-800 px-4 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src="/icon.png" alt="Website logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-lg font-medium text-white">Real Time Chating</h1>
              </div>
              <button
                onClick={handleNavigateSettings}
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
            <ActiveTabSwitch />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? <ChatsList /> : <ContactList />}
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-gray-200/50 dark:bg-slate-900/50 backdrop-blur-sm">
            {selectedUser ? <ChatContainer onBack={handleBack} /> : <NoConversationPlaceholder />}
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ChatPage;
