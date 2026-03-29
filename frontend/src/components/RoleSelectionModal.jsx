import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Briefcase, Users } from "lucide-react";

export default function RoleSelectionModal() {
  const navigate = useNavigate();
  const { recruiterGuest, isLoggingIn } = useAuthStore();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const handleStudentClick = () => {
    setIsOpen(false);
    navigate("/login");
  };

  const handleRecruiterClick = async () => {
    await recruiterGuest();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Who are you?</p>
        </div>

        <div className="space-y-4">
          {/* Student Button */}
          <button
            onClick={handleStudentClick}
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Users className="w-5 h-5" />
            <span>Student</span>
          </button>

          {/* Recruiter Button */}
          <button
            onClick={handleRecruiterClick}
            disabled={isLoggingIn}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Briefcase className="w-5 h-5" />
            <span>{isLoggingIn ? "Loading..." : "Recruiter (Demo)"}</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Recruiter access is a demo account with limited functionality.
        </p>
      </div>
    </div>
  );
}
