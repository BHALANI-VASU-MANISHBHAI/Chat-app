import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { toast } from "react-toastify";
import { GlobalContext } from "../contexts/GlobalContext";

const useDeleteFriendMutation = () => {
  const { backendUrl, token } = useContext(GlobalContext);
  console.log("Using delete friend mutation with token:", token);

  return useMutation({
    mutationFn: async (friendId) => {
      const res = await axios.delete(`${backendUrl}/api/user/deleteFriend`, {
        headers: {
          token,
          "Content-Type": "application/json",
        },
        data: { friendId }, // body must be inside config
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to delete friend");
      }

      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
};

export { useDeleteFriendMutation };
