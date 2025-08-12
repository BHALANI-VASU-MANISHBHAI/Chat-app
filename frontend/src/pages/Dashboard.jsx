import React, { useContext, useState, useEffect, use } from "react";
import { UserContext } from "../contexts/UserContext.jsx";
import { useMessages } from "../hooks/useFriends.js"; // ideally rename to useMessages.js
import { useSendMessage } from "../hooks/useSendMessage.js"; // mutation hook for sending messages
import { useMarkAsRead } from "../hooks/useMarkAsRead.js"; // mutation hook for marking messages as read
import { useDeleteMessage } from "../hooks/useDeleteMessage.js"; // mutation hook for deleting messages
import { useEditMessage } from "../hooks/useEditMessage.js"; // mutation hook for editing messages
import socket from "../services/socket.js";
import { toast } from "react-toastify";
import assets from "../assets/assets.js";

const Dashboard = () => {
  const { friendData, userData } = useContext(UserContext);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const {
    data: messages = [],
    isLoading,
    error,
  } = useMessages(selectedFriend?._id);
  const [messageidDropdown, setMessageidDropdown] = useState(null);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const deleteMessageMutation = useDeleteMessage();
  const editMessageMutation = useEditMessage();
  const options = ["delete", "edit", "forward", "reply"];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFriends = friendData.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() && selectedFriend) {
      const trimmedMessage = message.trim();
      console.log("Sending message:", selectedFriend._id, trimmedMessage);
      sendMessageMutation.mutate(
        {
          receiverId: selectedFriend._id,
          content: message,
          image: "",
        },
        {
          onSuccess: () => setMessage(""),
          onError: () => alert("Failed to send message"),
        }
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId) => {
    deleteMessageMutation.mutate(messageId, {
      onSuccess: () => {
        toast.success("Message deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete message");
      },
    });
  };
  const handleEditMessage = (messageId, newContent) => {
    editMessageMutation.mutate(
      {
        messageId,
        content: newContent,
      },
      {
        onSuccess: () => {
          toast.success("Message edited successfully");
        },
        onError: () => {
          toast.error("Failed to edit message");
        },
      }
    );
  };

  useEffect(() => {
    if (selectedFriend) {
      markAsReadMutation.mutate(selectedFriend._id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);

      console.log("Message belongs to current user, updating messages");
      // Update messages state to include the new message

      // now only push if the message is from the selected friend or the current user
      toast.success("New message received");
      messages.push(newMessage);
    });
    return () => {
      socket.off("newMessage");
    };
  }, [messages, selectedFriend]);

  const SingleTick = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
  const DoubleTick = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      stroke="#4FC3F7" /* WhatsApp blue color for read ticks */
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M1 13l4 4L14 8" />
      <path d="M10 13l4 4 9-12" />
    </svg>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Friends List */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <img
            src={assets.add_icon}
            alt="Add Icon"
            className="w-6 h-6 inline-block ml-2 cursor-pointer hover:opacity-70 transition-opacity"
          />
        </div>
        <div className="p-3">
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredFriends.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No friends found
            </div>
          ) : (
            filteredFriends.map((friend) => (
              <div
                key={friend._id}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedFriend?._id === friend._id
                    ? "bg-gray-100 border-r-4 border-green-500"
                    : ""
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <img
                  src={friend.profilePicture || "default-avatar.png"}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {friend.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    Hey! How are you?
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center">
              <img
                src={
                  selectedFriend.profilePicture ||
                  "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
                }
                alt={selectedFriend.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedFriend.name}
                </h3>
                <p className="text-sm text-green-500">
                  {selectedFriend.isOnline
                    ? "Online"
                    : `Last seen: ${new Date(
                        selectedFriend.lastSeen
                      ).toLocaleTimeString()}`}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-0">
              {isLoading && <p>Loading messages...</p>}
              {error && <p>Error loading messages</p>}
              {!isLoading &&
                messages.map((msg) => (
                  // console.log("Message:", msg),
                  <div
                    key={msg._id || msg.id}
                    className={`flex group ${
                      msg.sender === userData._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                        msg.sender === userData._id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm flex items-center space-x-1">
                          <span>{msg.content || msg.text}</span>
                          {msg.sender === userData._id && (
                            <span className="ml-1">
                              {msg.isRead ? <DoubleTick /> : <SingleTick />}
                            </span>
                          )}
                        </p>

                        {/* Dropdown icon - shows on hover */}
                        <img
                          src={assets.dropdown_icon}
                          alt="Dropdown Icon"
                          className={`w-5 h-5 cursor-pointer ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                            msg.sender === userData._id ? "filter invert" : ""
                          }`}
                          onClick={() => {
                            // Handle dropdown click
                            console.log(
                              "Dropdown clicked for message:",
                              msg._id
                            );
                            setMessageidDropdown((prevId) =>
                              prevId === msg._id ? null : msg._id
                            );
                          }}
                        />
                        {messageidDropdown === msg._id && (
                          <div className="absolute top-5 right-[-35px] mt-2 mr-2 bg-gray-500 text-white rounded-lg shadow-lg p-2 z-1000 ">
                            {options.map((option) => (
                              <button
                                key={option}
                                className="block px-4 py-2 text-sm hover:bg-gray-600 rounded"
                                onClick={() => {
                                  if (option === "delete") {
                                    handleDeleteMessage(msg._id);
                                  } else if (option === "edit") {
                                    const newContent = prompt(
                                      "Edit your message:",
                                      msg.content
                                    );
                                    if (newContent) {
                                      handleEditMessage(msg._id, newContent);
                                    }
                                  }
                                }}
                                disabled={deleteMessageMutation.isLoading}
                                title={
                                  option.charAt(0).toUpperCase() +
                                  option.slice(1)
                                }
                              >
                                {option.charAt(0).toUpperCase() +
                                  option.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === userData._id
                            ? "text-green-100"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.time || ""}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="bg-white px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isLoading}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">
                Welcome to Chat App
              </h2>
              <p className="text-gray-500">
                Select a friend from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
