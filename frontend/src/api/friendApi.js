import axios from "axios";

export const getFriends = async (backendUrl, token) => {
  const res = await axios.get(`${backendUrl}/api/user/getFriends`, {
    headers: {
      token: token,
    },
  });

  return res.data.friends || [];
};

export const addFriend = async (backendUrl, email) => {
  const res = await axios.post(
    `${backendUrl}/api/friends/add`,
    {
      email: email,
    },
    {
      headers: {
        token,
      },
    }
  );
  return res.data.friends || [];
};

export const getMessages = async (backendUrl, token, friendId) => {
  
  const res = await axios.get(`${backendUrl}/api/messages/${friendId}`, {
    headers: {
      token: token,
    },
  });
    
  return res.data.messages || [];
};

export const sendMessage = async (backendUrl, token, friendId, message) => {
  const res = await axios.post(
    `${backendUrl}/api/messages/sendmessage`,
    {
      receiverId: friendId,
      content: message.content,
      image: message.image,
    },
    {
      headers: {
        token: token,
      },
    }
  );

  return res.data.message || null;
};
