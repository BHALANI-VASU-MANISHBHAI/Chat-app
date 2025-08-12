import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useDeleteMessage = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId) => {
      const { data } = await axios.delete(
        `${backendUrl}/api/messages/deletemessage`,
        {
          headers: { token },
          data: { messageId },
        }
      );
      return data;
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries(["messages"]);
    },
  });
};
