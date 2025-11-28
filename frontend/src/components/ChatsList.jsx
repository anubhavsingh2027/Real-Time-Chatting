import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import SearchInput from "./SearchInput";
import { smartNameSearch } from "../lib/searchUtils";
import { ChevronDown } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState(null);

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    return chats
      .filter((chat) => smartNameSearch(chat.fullName, searchQuery))
      .sort((a, b) => {
        // Sort exact matches first
        const aStartsExact = a.fullName.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsExact = b.fullName.toLowerCase().startsWith(searchQuery.toLowerCase());

        if (aStartsExact && !bStartsExact) return -1;
        if (!aStartsExact && bStartsExact) return 1;

        // Then sort alphabetically
        return a.fullName.localeCompare(b.fullName);
      });
  }, [chats, searchQuery]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search chats..." />
      {filteredChats.length === 0 ? (
        <div className="px-4">
          <p className="text-gray-500 dark:text-slate-400 text-center">No chats found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          {filteredChats.map((chat) => {
            const lastMessage = chat.lastMessage?.text || "";
            const isLongMessage = lastMessage.length > 100;
            const displayMessage = isLongMessage && expandedMessageId !== chat._id
              ? `${lastMessage.substring(0, 100)}...`
              : lastMessage;

            return (
              <div
                key={chat._id}
                className="bg-gray-100 dark:bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-cyan-500/20 transition-colors"
                onClick={() => setSelectedUser(chat)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                    <div className="size-12 rounded-full">
                      <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-black dark:text-slate-200 font-medium truncate">{chat.fullName}</h4>
                  </div>
                </div>

                {lastMessage && (
                  <div className="ml-15 flex items-start gap-2">
                    <p className="text-sm text-gray-600 dark:text-slate-400 break-words line-clamp-2 flex-1">
                      {displayMessage}
                    </p>
                    {isLongMessage && expandedMessageId !== chat._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMessageId(chat._id);
                        }}
                        className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-0.5 whitespace-nowrap"
                      >
                        Read More
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}
                    {expandedMessageId === chat._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMessageId(null);
                        }}
                        className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
export default ChatsList;
