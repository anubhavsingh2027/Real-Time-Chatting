import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSettingsStore = create(
  persist(
    (set) => ({
      // Sound & Notifications
      soundEffects: true,
      toggleSoundEffects: () =>
        set((state) => ({ soundEffects: !state.soundEffects })),
      notifications: true,
      toggleNotifications: () =>
        set((state) => ({ notifications: !state.notifications })),
      keyboardSound: "keystroke1",
      setKeyboardSound: (sound) => set({ keyboardSound: sound }),
      messageSound: true,
      toggleMessageSound: () =>
        set((state) => ({ messageSound: !state.messageSound })),
      notificationSound: true,
      toggleNotificationSound: () =>
        set((state) => ({ notificationSound: !state.notificationSound })),
      desktopNotifications: true,
      toggleDesktopNotifications: () =>
        set((state) => ({ desktopNotifications: !state.desktopNotifications })),
      notificationPreview: true,
      toggleNotificationPreview: () =>
        set((state) => ({ notificationPreview: !state.notificationPreview })),

      // Appearance
      theme: "light",
      setTheme: (theme) => set((state) => ({ theme })),
      fontSize: "medium",
      setFontSize: (size) => set((state) => ({ fontSize: size })),
      messageDensity: "comfortable",
      setMessageDensity: (density) =>
        set((state) => ({ messageDensity: density })),
      animations: true,
      toggleAnimations: () =>
        set((state) => ({ animations: !state.animations })),
      chatBackground: "default",
      setChatBackground: (background) =>
        set((state) => ({ chatBackground: background })),
      bubbleStyle: "rounded",
      setBubbleStyle: (style) => set((state) => ({ bubbleStyle: style })),

      // Privacy
      onlineStatus: true,
      toggleOnlineStatus: () =>
        set((state) => ({ onlineStatus: !state.onlineStatus })),
      readReceipts: true,
      toggleReadReceipts: () =>
        set((state) => ({ readReceipts: !state.readReceipts })),
      typingIndicator: true,
      toggleTypingIndicator: () =>
        set((state) => ({ typingIndicator: !state.typingIndicator })),
      lastSeenStatus: true,
      toggleLastSeenStatus: () =>
        set((state) => ({ lastSeenStatus: !state.lastSeenStatus })),
      profilePhotoVisibility: "everyone",
      setProfilePhotoVisibility: (visibility) =>
        set({ profilePhotoVisibility: visibility }),

      // Accessibility
      highContrast: false,
      toggleHighContrast: () =>
        set((state) => ({ highContrast: !state.highContrast })),
      reduceMotion: false,
      toggleReduceMotion: () =>
        set((state) => ({ reduceMotion: !state.reduceMotion })),
      screenReaderOptimized: false,
      toggleScreenReaderOptimized: () =>
        set((state) => ({
          screenReaderOptimized: !state.screenReaderOptimized,
        })),
      keyboardShortcuts: true,
      toggleKeyboardShortcuts: () =>
        set((state) => ({ keyboardShortcuts: !state.keyboardShortcuts })),

      // Language & Region
      language: "english",
      setLanguage: (lang) => set({ language: lang }),
      timeFormat: "12h",
      setTimeFormat: (format) => set({ timeFormat: format }),
      dateFormat: "MM/DD/YYYY",
      setDateFormat: (format) => set({ dateFormat: format }),

      // Advanced
      developerMode: false,
      toggleDeveloperMode: () =>
        set((state) => ({ developerMode: !state.developerMode })),
      debugMode: false,
      toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),
      experimentalFeatures: false,
      toggleExperimentalFeatures: () =>
        set((state) => ({
          experimentalFeatures: !state.experimentalFeatures,
        })),

      // Reset all settings
      resetSettings: () =>
        set({
          soundEffects: true,
          notifications: true,
          keyboardSound: "keystroke1",
          messageSound: true,
          notificationSound: true,
          desktopNotifications: true,
          notificationPreview: true,
          theme: "dark",
          fontSize: "medium",
          messageDensity: "comfortable",
          animations: true,
          chatBackground: "default",
          bubbleStyle: "rounded",
          onlineStatus: true,
          readReceipts: true,
          typingIndicator: true,
          lastSeenStatus: true,
          profilePhotoVisibility: "everyone",

          highContrast: false,
          reduceMotion: false,
          screenReaderOptimized: false,
          keyboardShortcuts: true,
          language: "english",
          timeFormat: "12h",
          dateFormat: "MM/DD/YYYY",
          developerMode: false,
          debugMode: false,
          experimentalFeatures: false,
        }),
    }),
    {
      name: "chat-settings-storage",
    },
  ),
);

export default useSettingsStore;
