import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

function AutoLoginPage() {
  const navigate = useNavigate();
  const { setAuthUser, connectSocket, authUser } = useAuthStore();

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
          toast.success("Auto-logged in successfully!");
          navigate("/");
        } else {
          toast.error("Auto-login failed: User verification failed");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        toast.error("Auto-login failed");
        navigate("/login");
      }
    };

    handleAutoLogin();
  }, [authUser, setAuthUser, connectSocket, navigate]);

  return <PageLoader />;
}

export default AutoLoginPage;
