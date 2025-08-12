import { createContext, useContext, useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useFriends } from "../hooks/useFriends.js";
import socket from "../services/socket.js";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [friendData, setFriendData] = useState([]);
  const { backendUrl, token } = useContext(GlobalContext);

  // Fetch user data
  const getUserData = async () => {
    try {
      const response = await axios(`${backendUrl}/api/user/getUserData`, {
        headers: { token },
      });
      console.log("User data response:", response.data);
      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        toast.error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error("Failed to fetch user data");
    }
  };

  // Use React Query hook at the top level:
  const { data: friendsFromQuery, error, isLoading } = useFriends();

  // Sync friends data from React Query to local state
  useEffect(() => {
    if (friendsFromQuery) {
      console.log("Friends data from query:", friendsFromQuery);
      setFriendData(friendsFromQuery);
      console.log("Friends data fetched successfully:", friendsFromQuery);
    }
  }, [friendsFromQuery]);

  useEffect(() => {
    if (token) {
      getUserData();
    }
  }, [token, backendUrl]);

  useEffect(() => {
    if (userData) {
      console.log("User data updated:", userData);
      socket.emit("joinRoom", userData._id);
    }
  }, [userData]);
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch friends data");
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    socket.on("statusChanged", (data) => {
      console.log("Status changed event received:", data);
      setFriendData((prevFriends) =>
        prevFriends.map((friend) =>
          friend._id === data.user._id
            ? { ...friend, status: data.user.status }
            : friend
        )
      );
    });
    return () => {
      socket.off("statusChanged");
    };
  }, []);

  const value = {
    userData,
    setUserData,
    friendData,
    setFriendData,
    isLoadingFriends: isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
