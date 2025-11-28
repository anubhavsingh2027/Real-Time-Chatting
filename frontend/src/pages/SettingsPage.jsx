import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Bell,
  Palette,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Camera,
  User,
  Mail,
  Volume2,
} from "lucide-react";

import useSettingsStore from "../store/useSettingsStore";
import { useAuthStore } from "../store/useAuthStore";
import ThemeSwitcher from "../components/ThemeSwitcher";
import Select from "../components/Select";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const { logout, authUser, updateProfile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const fileInputRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notifications: false,
    appearance: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const keyboardSoundOptions = [
    { value: "keystroke1", label: "Keystroke 1" },
    { value: "keystroke2", label: "Keystroke 2" },
    { value: "keystroke3", label: "Keystroke 3" },
    { value: "keystroke4", label: "Keystroke 4" },
    { value: "mouse-click", label: "Mouse Click" },
  ];

  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "extra-large", label: "Extra Large" },
  ];

  const messageDensityOptions = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

  const chatBackgroundOptions = [
    { value: "default", label: "Default" },
    { value: "gradient", label: "Gradient" },
    { value: "pattern", label: "Pattern" },
    { value: "solid", label: "Solid Color" },
  ];

  const bubbleStyleOptions = [
    { value: "rounded", label: "Rounded" },
    { value: "square", label: "Square" },
    { value: "minimal", label: "Minimal" },
  ];

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      settings.resetSettings();
      toast.success("Settings reset to defaults");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUpdatingProfile(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ profilePic: reader.result });
      } catch (error) {
        console.error("Profile update error:", error);
        toast.error(error.response?.data?.message || "Failed to update profile picture");
      } finally {
        setIsUpdatingProfile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const filterSections = (sectionName) => {
    if (!searchQuery) return true;
    return sectionName.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Toggle Switch Component for Settings

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1 pr-4">
        <label className="text-sm font-medium cursor-pointer select-none">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          id={`toggle-${label}`}
        />
        <label
          htmlFor={`toggle-${label}`}
          className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
            checked ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <div
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              checked ? "transform translate-x-6" : ""
            }`}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <nav className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex-none">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center w-10 h-10 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 ml-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Settings</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {authUser?.fullName}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="py-4">
            <div className="relative max-w-3xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Settings Content */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 pb-32 relative z-20">
        <div className="w-full mx-auto max-w-6xl">
          {/* Profile Section - Full Width */}
          {filterSections("profile") && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => toggleSection('profile')}
                className="flex items-center justify-between w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg transition-colors duration-200 ${
                    expandedSections.profile
                      ? 'bg-cyan-500/15 text-cyan-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-cyan-500'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    expandedSections.profile
                      ? 'text-cyan-500'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}>Profile</h3>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${
                  expandedSections.profile ? 'rotate-180 text-cyan-500' : 'text-gray-500 dark:text-gray-400'
                }`} />
              </button>
              {expandedSections.profile && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-800">
                  {/* Profile Picture - Centered */}
                  <div className="flex flex-col items-center mb-8 pt-6">
                    <div className="relative group">
                      <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg ring-4 ring-white dark:ring-gray-800">
                        {authUser?.profilePic ? (
                          <img
                            src={authUser.profilePic}
                            alt={authUser.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-5xl font-bold">
                            {authUser?.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUpdatingProfile}
                        className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-4 ring-white dark:ring-gray-800"
                      >
                        {isUpdatingProfile ? (
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Click camera icon to change profile picture
                    </p>
                  </div>

                  {/* Profile Information - Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 md:border-b md:border-r md:pr-6 md:pb-0">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Full Name
                      </label>
                      <div className="flex items-center gap-3 mt-3">
                        <User className="w-5 h-5 text-cyan-500/70" />
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {authUser?.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 md:border-b-0 md:pb-0">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Email
                      </label>
                      <div className="flex items-center gap-3 mt-3">
                        <Mail className="w-5 h-5 text-cyan-500/70" />
                        <p className="text-base text-gray-900 dark:text-white break-all">
                          {authUser?.email}
                        </p>
                      </div>
                    </div>

                    <div className="pb-4 border-b border-gray-200 dark:border-gray-800 md:border-b md:border-r md:pr-6 md:pb-0">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Username
                      </label>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xl font-bold text-cyan-500/70">@</span>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {authUser?.username}
                        </p>
                      </div>
                    </div>

                    <div className="pb-4 md:pb-0">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Member Since
                      </label>
                      <p className="text-base text-gray-900 dark:text-white mt-3">
                        {new Date(authUser?.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications & Sounds */}
          {filterSections("notifications") && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => toggleSection('notifications')}
                className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg transition-colors duration-200 ${
                    expandedSections.notifications
                      ? 'bg-cyan-500/15 text-cyan-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-cyan-500'
                  }`}>
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    expandedSections.notifications
                      ? 'text-cyan-500'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}>Notifications & Sounds</h3>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${
                  expandedSections.notifications ? 'rotate-180 text-cyan-500' : 'text-gray-500 dark:text-gray-400'
                }`} />
              </button>
              {expandedSections.notifications && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                  <ToggleSwitch
                    checked={settings.notifications}
                    onChange={settings.toggleNotifications}
                    label="Enable Notifications"
                    description="Receive notifications for new messages"
                  />
                  <ToggleSwitch
                    checked={settings.desktopNotifications}
                    onChange={settings.toggleDesktopNotifications}
                    label="Desktop Notifications"
                    description="Show notifications on your desktop"
                  />
                  <ToggleSwitch
                    checked={settings.notificationSound}
                    onChange={settings.toggleNotificationSound}
                    label="Notification Sound"
                    description="Play sound when receiving notifications"
                  />
                  <ToggleSwitch
                    checked={settings.notificationPreview}
                    onChange={settings.toggleNotificationPreview}
                    label="Message Preview"
                    description="Show message content in notifications"
                  />
                </div>
              )}
            </div>
          )}

          {/* Appearance */}
          {filterSections("appearance") && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => toggleSection('appearance')}
                className="flex items-center justify-between w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg transition-colors duration-200 ${
                    expandedSections.appearance
                      ? 'bg-cyan-500/15 text-cyan-500'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-cyan-500'
                  }`}>
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    expandedSections.appearance
                      ? 'text-cyan-500'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}>Appearance</h3>
                </div>
                <ChevronDown className={`w-5 h-5 transform transition-transform duration-300 ${
                  expandedSections.appearance ? 'rotate-180 text-cyan-500' : 'text-gray-500 dark:text-gray-400'
                }`} />
              </button>
              {expandedSections.appearance && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  <div className="py-3 border-b border-gray-200 dark:border-gray-800">
                    <ThemeSwitcher />
                  </div>
                  <Select
                    label="Font Size"
                    value={settings.fontSize}
                    onChange={(e) => settings.setFontSize(e.target.value)}
                    options={fontSizeOptions}
                  />
                  <Select
                    label="Message Density"
                    value={settings.messageDensity}
                    onChange={(e) => settings.setMessageDensity(e.target.value)}
                    options={messageDensityOptions}
                  />
                  <Select
                    label="Chat Background"
                    value={settings.chatBackground}
                    onChange={(e) => settings.setChatBackground(e.target.value)}
                    options={chatBackgroundOptions}
                  />
                  <Select
                    label="Bubble Style"
                    value={settings.bubbleStyle}
                    onChange={(e) => settings.setBubbleStyle(e.target.value)}
                    options={bubbleStyleOptions}
                  />
                  <ToggleSwitch
                    checked={settings.animations}
                    onChange={settings.toggleAnimations}
                    label="Animations"
                    description="Enable smooth animations and transitions"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl z-30">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleResetSettings}
              className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              Reset to Defaults
            </button>
            <button
              onClick={logout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;