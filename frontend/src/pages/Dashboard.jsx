import React, { useContext, useState, useEffect, use } from "react";
import { UserContext } from "../contexts/UserContext.jsx";
import { useMessages } from "../hooks/useFriends.js"; // ideally rename to useMessages.js
import { useSendMessage } from "../hooks/useSendMessage.js"; // mutation hook for sending messages
import { useMarkAsRead } from "../hooks/useMarkAsRead.js"; // mutation hook for marking messages as read
import { useDeleteMessage } from "../hooks/useDeleteMessage.js"; // mutation hook for deleting messages
import { useEditMessage } from "../hooks/useEditMessage.js"; // mutation hook for editing messages
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket.js";
import { toast } from "react-toastify";
import assets from "../assets/assets.js";
import AddFriendModal from "../components/AddFriendModal.jsx";
import ForwardModal from "../components/ForwardModal.jsx";
import { MessageContext } from "../contexts/messageContext.jsx";
import { useDeleteFriendMutation } from "../hooks/useDeleteFriend.js";
import { GlobalContext } from "../contexts/GlobalContext.jsx";

const Dashboard = () => {
  const { friendData, userData, token } = useContext(UserContext);
  const { backendUrl } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [isFriendMenuOpen, setIsFriendMenuOpen] = useState(false);
  // Forwarding states
  const [isForwardingMode, setIsForwardingMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const {
    data: messages = [],
    isLoading,
    error,
  } = useMessages(selectedFriend?._id);

  const { ForwardingMessage, setForwardingMessage } =
    useContext(MessageContext);
  const [messageidDropdown, setMessageidDropdown] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [messageid, setMessageid] = useState(null);
  const [isAddOptionOpen, setIsAddOptionOpen] = useState(false);

  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const deleteMessageMutation = useDeleteMessage();
  const editMessageMutation = useEditMessage();
  const deleteFriendMutation = useDeleteFriendMutation();
  const options = ["delete", "edit", "forward", "reply", "copy"];

  const [searchTerm, setSearchTerm] = useState("");

  // const filteredFriends = friendData.filter((friend) =>
  //   friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const handleSendMessage = () => {
    if (message.trim() && selectedFriend) {
      const trimmedMessage = message.trim();

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
  const toggleFriendMenu = () => {
    setIsFriendMenuOpen((prev) => !prev);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Forwarding functions
  const toggleForwardingMode = () => {
    setIsForwardingMode(!isForwardingMode);
    setSelectedMessages([]);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleForwardMessages = () => {
    if (selectedMessages.length > 0) {
      setShowForwardModal(true);
    } else {
      toast.error("Please select messages to forward");
    }
  };

  const cancelForwarding = () => {
    setIsForwardingMode(false);
    setSelectedMessages([]);
    setShowForwardModal(false);
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

  //copy the message to clipboard
  const handleCopyMessage = (messageContent) => {
    navigator.clipboard.writeText(messageContent).then(
      () => {
        toast.success("Message copied to clipboard");
      },
      () => {
        toast.error("Failed to copy message");
      }
    );
  };

  const handleDeleteFriend = (friendId) => {
    deleteFriendMutation.mutate(friendId, {
      onSuccess: () => {
        setSelectedFriend(null);
        navigate("/dashboard");
      },
      onError: (error) => {
        console.error("Delete friend error:", error);
        toast.error("Failed to delete friend");
      },
    });
  };

  useEffect(() => {
    if (selectedFriend) {
      markAsReadMutation.mutate(selectedFriend._id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    // New message event
    socket.on("newMessage", (message) => {
      console.log("New message received:", message);
      // Invalidate queries to refresh messages
      queryClient.invalidateQueries(["messages", selectedFriend?._id]);
      queryClient.invalidateQueries(["messages", message.sender]);
      toast.success("New message received");
    });

    // Messages read event
    socket.on("messagesRead", ({ friendId, userId }) => {
      console.log(`Messages from ${friendId} read by ${userId}`);
      // Invalidate queries to update read status
      queryClient.invalidateQueries(["messages", friendId]);
    });
    socket.on("messageDeleted", (data) => {
      console.log("Message deleted:", data);
      queryClient.invalidateQueries(["messages", selectedFriend?._id]);
      queryClient.invalidateQueries(["messages", data.sender]);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messagesRead");
    };
  }, []); // Only depend on the ID, not the whole object

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

  useEffect(() => {
    console.log("Friend data before update:", friendData);
  }, [friendData]);

  const ForwardingMessageDesign = () => {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg shadow-sm">
        <img
          src={ForwardingMessage.profilePicture || "default-avatar.png"}
          alt={ForwardingMessage.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            Forwarding: {ForwardingMessage.name}
          </p>
          <p className="text-xs text-gray-500">
            {ForwardingMessage.content || ForwardingMessage.text}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Friends List */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
          <img
            src={assets.add_icon}
            alt="Add Friend"
            className="w-6 h-6 inline-block ml-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setShowAddFriendModal(true)}
            title="Add new friend"
          />
          <div className="relative">
            {/* Button to toggle menu */}
            <button
              onClick={() => setIsAddOptionOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ⋮ {/* 3 dots */}
            </button>

            {/* Dropdown menu */}
            {isAddOptionOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    setShowAddFriendModal(true);
                    setIsAddOptionOpen(false);
                  }}
                >
                  Add Friend
                </button>
                <button
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    navigate("/create-group");
                    setIsAddOptionOpen(false);
                  }}
                >
                  Create Group
                </button>
              </div>
            )}
          </div>
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
          {friendData.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No friends found
            </div>
          ) : (
            friendData.map((friend) => (
              <div
                key={friend._id}
                className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedFriend?._id === friend._id
                    ? "bg-green-50 border-l-green-500 shadow-sm scale-[1.02] animate-pulse-subtle"
                    : "border-l-transparent hover:bg-gray-50 hover:border-l-gray-300 hover:scale-[1.01]"
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="relative">
                  <img
                    src={friend.profilePicture || "default-avatar.png"}
                    alt={friend.name}
                    className={`w-12 h-12 rounded-full object-cover transition-all duration-200 ${
                      selectedFriend?._id === friend._id
                        ? "ring-2 ring-green-400 ring-offset-2"
                        : ""
                    }`}
                  />
                  {/* Online status indicator */}
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedFriend?._id === friend._id
                        ? "bg-green-400"
                        : "bg-green-400"
                    }`}
                  ></div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <h3
                    className={`text-sm font-medium truncate ${
                      selectedFriend?._id === friend._id
                        ? "text-green-700 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {friend.name}
                  </h3>
                  <p
                    className={`text-xs truncate mt-1 ${
                      selectedFriend?._id === friend._id
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    Hey! How are you?
                  </p>
                </div>

                {/* Unread message badge - placeholder */}
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs text-gray-400">2:30 PM</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      selectedFriend?._id === friend._id
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    2
                  </div>
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
            <div
              className={`px-6 py-4 border-b border-gray-200 flex items-center transition-colors duration-200 ${
                isForwardingMode ? "bg-green-50" : "bg-white"
              }`}
            >
              {isForwardingMode ? (
                /* Forwarding Header */
                <>
                  <button
                    onClick={cancelForwarding}
                    className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedMessages.length} message
                      {selectedMessages.length !== 1 ? "s" : ""} selected
                    </h3>
                    <p className="text-sm text-green-600">
                      Select messages to forward
                    </p>
                  </div>
                  <button
                    onClick={handleForwardMessages}
                    disabled={selectedMessages.length === 0}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Forward
                  </button>
                </>
              ) : (
                /* Normal Header */
                <>
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
                  <div className="ml-auto flex items-center space-x-3">
                    <button
                      onClick={toggleForwardingMode}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      title="Forward messages"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                    <div className="relative">
                      <img
                        src={assets.threedot_icon}
                        alt="More Options"
                        className="w-6 h-6 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={toggleFriendMenu}
                        title="More Options"
                      />
                      {isFriendMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                          <button
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              handleDeleteFriend(selectedFriend._id);
                            }}
                          >
                            delete Friend
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-0">
              {isLoading && <p>Loading messages...</p>}
              {error && <p>Error loading messages</p>}
              {!isLoading &&
                messages.map((msg) => (
                  <div
                    key={msg._id || msg.id}
                    className={`flex group items-start ${
                      msg.sender === userData._id
                        ? "justify-end "
                        : "justify-start"
                    } ${
                      isForwardingMode &&
                      selectedMessages.includes(msg._id || msg.id)
                        ? "bg-green-100 rounded-lg p-2 -mx-2"
                        : ""
                    }`}
                  >
                    {/* Checkbox for forwarding mode */}
                    {isForwardingMode && (
                      <div
                        className={`flex-shrink-0 ${
                          msg.sender === userData._id ? "ml-3" : "mr-3"
                        } mt-2`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMessages.includes(msg._id || msg.id)}
                          onChange={() =>
                            toggleMessageSelection(msg._id || msg.id)
                          }
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                        />
                      </div>
                    )}

                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative transition-all duration-200 ${
                        msg.sender === userData._id
                          ? "bg-green-500 text-white rounded-br-none"
                          : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                      } ${
                        isForwardingMode &&
                        selectedMessages.includes(msg._id || msg.id)
                          ? "ring-2 ring-green-400"
                          : ""
                      }`}
                      onClick={() =>
                        isForwardingMode &&
                        toggleMessageSelection(msg._id || msg.id)
                      }
                      style={{
                        cursor: isForwardingMode ? "pointer" : "default",
                      }}
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
                                  } else if (option === "copy") {
                                    handleCopyMessage(msg.content || msg.text);
                                  } else if (option === "forward") {
                                    // Handle forward logic here
                                    console.log("Forwarding message:", msg);
                                    // You can implement a modal or another UI to select recipient
                                    setForwardingMessage(msg);
                                  }
                                  setMessageidDropdown(null);
                                  setMessageid(msg._id);
                                  setSelectedOption(option);
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
                  disabled={sendMessageMutation.isLoading}
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

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
      />

      {/* Forward Modal */}
      <ForwardModal
        isOpen={showForwardModal}
        onClose={() => {
          setShowForwardModal(false);
          cancelForwarding();
        }}
        selectedMessages={selectedMessages}
        messages={messages}
      />
    </div>
  );
};

export default Dashboard;
