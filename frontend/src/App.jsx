import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import AutoLoginPage from "./pages/AutoLoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useState } from "react";
import PageLoader from "./components/PageLoader";
import useSettingsStore from "./store/useSettingsStore";
import MessageNotification from "./components/MessageNotification";
import SplashScreen from "./components/SplashScreen";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
  const { theme } = useSettingsStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // sync theme class with settings
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATED BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(209,213,219,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(209,213,219,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-400 dark:bg-pink-500 opacity-15 dark:opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-400 dark:bg-cyan-500 opacity-15 dark:opacity-20 blur-[100px]" />

      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
        />
        <Route path="/mash" element={<AutoLoginPage />} />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <MessageNotification />
      <Toaster />
    </div>
  );
}
export default App;
