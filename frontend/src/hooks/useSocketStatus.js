import { useEffect, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:10000";

function useSocketStatus() {
  const { userData } = useContext(UserContext);

  useEffect(() => {
    if (!userData) return;

    const socket = io(backendUrl, {
      autoConnect: true,
      transports: ["websocket"],
    });

    const changeStatus = async (userId, status) => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/user/updateStatus`,
          { isOnline: status },
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );

        if (response.data.success) {
          console.log("Status updated successfully:", response.data.user);
        } else {
          console.error("Failed to update status:", response.data.message);
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      changeStatus(userData._id, true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      changeStatus(userData._id, false);
    });

    return () => {
      socket.disconnect();
    };
  }, [userData]);
}

export default useSocketStatus;
