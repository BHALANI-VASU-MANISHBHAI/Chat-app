// hooks/useAddFriend.js
import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAddFriend = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email }) => {
      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

      try {
        console.log(
          "Making add friend request with token:",
          token ? "Token present" : "No token"
        );
        const { data } = await axios.post(
          `${backendUrl}/api/user/addfriend`,
          { email },
          {
            headers: {
              token: token,
              "Content-Type": "application/json",
            },
          }
        );
        return data;
      } catch (error) {
        console.error(
          "Add friend API error:",
          error.response?.data || error.message
        );
        // Re-throw the error to be handled by onError
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch friends list
      queryClient.invalidateQueries(["friends"]);
      queryClient.invalidateQueries(["userData"]);
    },
    onError: (error) => {
      console.error("Error adding friend:", error);
      // Log the full error for debugging
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    },
  });
};
