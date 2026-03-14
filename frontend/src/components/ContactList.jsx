import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import SearchInput from "./SearchInput";
import { smartNameSearch } from "../lib/searchUtils";
import ProfileModal from "./ProfileModal";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } =
    useChatStore();
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
        const aStartsExact = a.username
          .toLowerCase()
          .startsWith(searchQuery.toLowerCase());
        const bStartsExact = b.username
          .toLowerCase()
          .startsWith(searchQuery.toLowerCase());

        if (aStartsExact && !bStartsExact) return -1;
        if (!aStartsExact && bStartsExact) return 1;

        // Then sort alphabetically
        return a.username.localeCompare(b.username);
      });
  }, [allContacts, searchQuery]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search contacts..."
      />
      {filteredContacts.length === 0 ? (
        <div className="px-4">
          <p className="text-gray-500 dark:text-slate-400 text-center">
            No contacts found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-4 animate-fade-in">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-800/50 p-4 rounded-lg cursor-pointer hover:from-gray-100 hover:to-gray-200 dark:hover:from-slate-700 dark:hover:to-slate-700 transition-all duration-200 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md"
              onClick={() => setSelectedUser(contact)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"} cursor-pointer hover:opacity-75 transition-all duration-200 ring-2 ring-gray-200 dark:ring-slate-600`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(contact);
                  }}
                >
                  <div className="size-12 rounded-full shadow-md">
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h4 className="text-gray-900 dark:text-slate-100 font-semibold">
                  @{contact.username}
                </h4>
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
