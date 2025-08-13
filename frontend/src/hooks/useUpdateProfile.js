import { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { GlobalContext } from "../contexts/GlobalContext";
import axios from "axios";
import { toast } from "react-toastify";

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUserData } = useContext(UserContext);
  const { backendUrl, token } = useContext(GlobalContext);

  const updateProfile = async (profileData, avatarFile = null) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("email", profileData.email);
      formData.append("status", profileData.status);

      if (avatarFile) {
        formData.append("profileImage", avatarFile);
      }

      const response = await axios.put(
        `${backendUrl}/api/user/updateprofile`,
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setUserData(response.data.user);
          toast.success("Profile updated successfully!");
        return { success: true, user: response.data.user };
      } else {
        toast.error(response.data.message || "Failed to update profile");
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    isLoading,
  };
};
