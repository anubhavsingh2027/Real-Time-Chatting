import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Clock, Loader, CheckCircle2 } from "lucide-react";

function AutoLoginPage() {
  const navigate = useNavigate();
  const { setAuthUser, connectSocket, authUser } = useAuthStore();
  const [timer, setTimer] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loginProgress, setLoginProgress] = useState("Initializing...");

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
        setLoginProgress("Sending credentials...");
        const response = await axiosInstance.post("/auth/login", {
          email: "2k23.csai2313910@gmail.com",
          password: "123456",
        });

        setLoginProgress("Verifying user...");

        if (response.data && response.data.fullName === "Alok Sharma") {
          setLoginProgress("User verified!");
          setAuthUser(response.data);
          setLoginProgress("Connecting to socket...");
          connectSocket();
          setIsLoading(false);
          setLoginProgress("Login successful!");
          toast.success("Auto-logged in successfully!");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setIsLoading(false);
          setLoginProgress("User verification failed");
          toast.error("Auto-login failed: User verification failed");
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        setIsLoading(false);
        setLoginProgress("Login failed");
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
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center gap-8">

        {/* Main Card */}
        <div className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text mb-2">
              Welcome
            </h1>
            <p className="text-slate-400 text-sm">Alok Sharma</p>
          </div>

          {/* Please Wait Section */}
          <div className="mb-8 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700/30 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-pink-500 animate-spin" />
              </div>
              <span className="text-xl font-bold text-slate-200 animate-pulse">
                Please Wait...
              </span>
            </div>
            <p className="text-center text-slate-300 text-sm font-medium">
              Authenticating your account
            </p>
          </div>

          {/* Loader Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-700/30" />
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 border-r-pink-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-400 border-l-pink-500 animate-spin" style={{ animationDirection: "reverse" }} />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
            </div>
          </div>

          {/* Timer Display */}
          <div className="mb-8 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">
              Time Elapsed
            </p>
            <p className="text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text font-mono">
              {String(timer).padStart(2, "0")}s
            </p>
          </div>

          {/* Progress Status */}
          <div className="mb-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
            <p className="text-center text-slate-300 text-sm font-medium">
              {loginProgress}
            </p>
          </div>

          {/* Clock Section */}
          <div className="flex items-center justify-center gap-2 p-4 bg-slate-700/20 rounded-xl border border-slate-600/30">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">
              Current Time
            </span>
            <span className="text-slate-200 font-mono font-semibold">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>

        {/* Info Text */}
        <p className="text-slate-400 text-center text-xs max-w-xs">
          🔐 Your credentials are being securely verified. This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}

export default AutoLoginPage;
