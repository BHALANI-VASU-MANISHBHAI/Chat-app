import { useContext } from "react";
import { GlobalContext } from "../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getFriends, getMessages } from "../api/friendApi";

export const useFriends = () => {
  const { backendUrl, token } = useContext(GlobalContext);

  return useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(backendUrl, token),
    enabled: !!backendUrl && !!token,
  });
};
export const useMessages = (friendId) => {
  const { backendUrl, token } = useContext(GlobalContext);

  return useQuery({
    queryKey: ["messages", friendId],
    queryFn: () => getMessages(backendUrl, token, friendId),
    enabled: !!backendUrl && !!token && !!friendId,
  });
};
