import { createContext, useContext, useState, useEffect } from "react";
import { GlobalContext } from "./GlobalContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useFriends } from "../hooks/useFriends.js";
import socket from "../services/socket.js";
import { data } from "react-router-dom";

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  // ✅ Call hook first
  const { data: friendsFromQuery = [], error, isLoading } = useFriends();

  // ✅ Now use it in state
  const [friendData, setFriendData] = useState(friendsFromQuery);

  const { backendUrl, token ,navigate} = useContext(GlobalContext);

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
    if (token) {
      getUserData();
      navigate("/dashboard");
    } else {
      setUserData(null);
      setFriendData([]);
      navigate("/login");
    }
  }, [token, backendUrl]);

  // Join socket room when user loaded
  useEffect(() => {
    if (userData) {
      socket.emit("joinRoom", userData._id);
      console.log("Joined room for user:", userData._id);
    }
  }, [userData]);

  // Show error if friends query fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch friends data");
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    socket.on("friendDeleted", (data) => {
      const { friendId } = data;
      console.log("Friend deleted:", friendId);
      setFriendData((prevFriends) =>
        prevFriends.filter((friend) => friend._id !== friendId)
      );
      toast.success("Friend removed successfully");
    });

    return () => {
      socket.off("friendDeleted");
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
