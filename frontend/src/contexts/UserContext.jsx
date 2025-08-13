import { createContext, useContext, useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useFriends } from "../hooks/useFriends.js";
import socket from "../services/socket.js";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // ✅ Call hook first
  const { data: friendsFromQuery = [], error, isLoading } = useFriends();

  // ✅ Now use it in state
  const [friendData, setFriendData] = useState(friendsFromQuery);

  const { backendUrl, token } = useContext(GlobalContext);

  // Fetch user data
  const getUserData = async () => {
    try {
      const response = await axios(`${backendUrl}/api/user/getUserData`, {
        headers: { token },
      });
      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        toast.error(response.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      toast.error("Failed to fetch user data");
    }
  };

  // Keep friendData in sync with query
  useEffect(() => {
    setFriendData(friendsFromQuery || []);
  }, [friendsFromQuery]);

  // Get user data on token change
  useEffect(() => {
    if (token) getUserData();
  }, [token, backendUrl]);

  // Join socket room when user loaded
  useEffect(() => {
    if (userData) {
      socket.emit("joinRoom", userData._id);
    }
  }, [userData]);

  // Show error if friends query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch friends data");
      console.error(error);
    }
  }, [error]);

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
