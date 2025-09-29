import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
import { RotatingLines } from "react-loader-spinner";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, setCurrentUser } = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const response = await api.get<ApiResponse<User>>("/api/auth/login/persist", {
          withCredentials: true,
        });
        setCurrentUser(response.data.data); // Lấy user từ data.data vì response có cấu trúc ApiResponse
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (!currentUser?.accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="h-[calc(100svh)] grid place-items-center">
          <div className="border border-neutral-300 rounded-xl p-4 w-fit h-fit flex flex-col gap-2 items-center">
            <p className="text-black text-lg">
              Please wait for the server to load.
            </p>
            <RotatingLines strokeColor="gray" width="24" />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
