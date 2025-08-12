import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useMarkAsRead = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friendId) => {
      const { data } = await axios.put(
        `${backendUrl}/api/messages/markasread`,
        { friendId },
        { headers: { token } }
      );
      return data;
    },
    onSuccess: (_, friendId) => {
      // Invalidate both messages & friends list (so unread counts update)
      queryClient.invalidateQueries(["messages", friendId]);
      queryClient.invalidateQueries(["friends"]);
    },
  });
};
