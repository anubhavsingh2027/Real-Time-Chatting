import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

const ALLOWED_DETAILS_EMAIL = "anubhavsingh2106@gmail.com";

function ActivityDetailsPage() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canView =
    authUser?.email?.toLowerCase() === ALLOWED_DETAILS_EMAIL.toLowerCase();

  useEffect(() => {
    if (!authUser || !canView) {
      setLoading(false);
      return;
    }

    const loadActivity = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/auth/details");
        setActivity(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load activity details",
        );
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [authUser, canView]);

  if (!authUser) {
    return null;
  }

  if (!canView) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/40 dark:bg-slate-800">
        <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Access denied
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This page is only available for the authorized account.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to chat
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Private Details
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Last 5 days activity
          </h1>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          Loading your latest activity...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : activity.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          No activity found in the last 5 days.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/70">
              <tr>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Name
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Date
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Time
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Message
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Sender
                </th>
                <th className="px-3 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                  Receiver
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activity.map((item, index) => (
                <tr
                  key={`${item.date}-${item.time}-${index}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/40"
                >
                  <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {item.date}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {item.time}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {item.message}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {item.sender}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {item.receiver}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActivityDetailsPage;
