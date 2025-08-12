import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const useEditMessage = (messageId, initialText) => {
  const { backendUrl, token } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newContent) => {
      const { data } = await axios.put(
        `${backendUrl}/api/messages/editmessage`,
        { messageId, content: newContent },
        { headers: { token } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages"]);
    },
  });

  return {
    ...mutation,
    initialText,
  };
};
export { useEditMessage };
