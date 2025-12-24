import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Clock, Loader } from "lucide-react";

function AutoLoginPage() {
  const navigate = useNavigate();
  const { setAuthUser, connectSocket, authUser } = useAuthStore();
  const [timer, setTimer] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Update clock every second
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Timer for waiting
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const handleAutoLogin = async () => {
      if (authUser) {
        navigate("/");
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/login", {
          email: "2k23.csai2313910@gmail.com",
          password: "123456",
        });

        if (response.data && response.data.fullName === "Alok Sharma") {
          setAuthUser(response.data);
          connectSocket();
          setIsLoading(false);
          toast.success("Auto-logged in successfully!");
          setTimeout(() => {
            navigate("/");
          }, 500);
        } else {
          setIsLoading(false);
          toast.error("Auto-login failed: User verification failed");
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        setIsLoading(false);
        toast.error("Auto-login failed");
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    };

    handleAutoLogin();
  }, [authUser, setAuthUser, connectSocket, navigate]);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorators */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Clock Display */}
        <div className="flex flex-col items-center gap-4 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-300">Current Time</span>
          </div>
          <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text font-mono">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700/30" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-pink-500 animate-spin" />
            <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-slate-200">Auto-logging in...</p>
            <p className="text-sm text-slate-400 mt-1">Verifying credentials</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          <p className="text-center text-slate-400 text-sm mb-2">Time Elapsed</p>
          <p className="text-3xl font-bold text-gradient-to-r from-cyan-400 to-pink-500 text-center font-mono">
            {timer}s
          </p>
        </div>

        {/* Status Text */}
        <p className="text-slate-400 text-center text-sm">
          Please wait while we authenticate your account...
        </p>
      </div>
    </div>
  );
}

export default AutoLoginPage;
