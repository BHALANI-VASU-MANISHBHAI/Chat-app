// hooks/useSendMessage.js
import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useSendMessage = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, content, image }) => {
      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again."
        );
      }

    
      const { data } = await axios.post(
        `${backendUrl}/api/messages/sendmessage`,
        { receiverId, content, image },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["messages", variables.receiverId]);
    },
  });
};
