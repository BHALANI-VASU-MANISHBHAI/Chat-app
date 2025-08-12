import axios from "axios";
import { useContext } from "react";
import { io } from "socket.io-client";
import { UserContext } from "../contexts/UserContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:10000";
const socket = io(backendUrl, {
  autoConnect: true,
  transports: ["websocket"],
});
const { userData } = useContext(UserContext);
const chnageStatus = async (userId, status) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/user/updateStatu s`,
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

socket.on("connect", async () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", async () => {
  console.log("Socket disconnected:", socket.id);
  if (userData) {
    await chnageStatus(userData._id, false);
  }
});

export default socket;
