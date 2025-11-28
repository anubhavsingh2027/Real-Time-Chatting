import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import SearchInput from "./SearchInput";
import { smartNameSearch } from "../lib/searchUtils";
import ProfileModal from "./ProfileModal";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return allContacts;

    return allContacts
      .filter((contact) => smartNameSearch(contact.username, searchQuery))
      .sort((a, b) => {
        // Sort exact matches first
        const aStartsExact = a.username.toLowerCase().startsWith(searchQuery.toLowerCase());
        const bStartsExact = b.username.toLowerCase().startsWith(searchQuery.toLowerCase());

        if (aStartsExact && !bStartsExact) return -1;
        if (!aStartsExact && bStartsExact) return 1;

        // Then sort alphabetically
        return a.username.localeCompare(b.username);
      });
  }, [allContacts, searchQuery]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search contacts..." />
      {filteredContacts.length === 0 ? (
        <div className="px-4">
          <p className="text-gray-500 dark:text-slate-400 text-center">No contacts found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-gray-100 dark:bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-cyan-500/20 transition-colors"
              onClick={() => setSelectedUser(contact)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"} cursor-pointer hover:opacity-75 transition-opacity`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(contact);
                  }}
                >
                  <div className="size-12 rounded-full">
                    <img src={contact.profilePic || "/avatar.png"} />
                  </div>
                </div>
                <h4 className="text-black dark:text-slate-200 font-medium">@{contact.username}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
      <ProfileModal
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        user={selectedProfile}
      />
    </>
  );
}
export default ContactList;
