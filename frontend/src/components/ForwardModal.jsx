import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext.jsx";
import { useSendMessage } from "../hooks/useSendMessage.js";
import { toast } from "react-toastify";

const ForwardModal = ({ isOpen, onClose, selectedMessages, messages }) => {
  const { friendData, userData } = useContext(UserContext);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const sendMessageMutation = useSendMessage();

  const filteredFriends = friendData.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleForward = async () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend to forward to");
      return;
    }

    try {
      // Get the actual message objects to forward
      const messagesToForward = messages.filter((msg) =>
        selectedMessages.includes(msg._id || msg.id)
      );

      // Forward each message to each selected friend
      for (const friendId of selectedFriends) {
        for (const message of messagesToForward) {
          await sendMessageMutation.mutateAsync({
            receiverId: friendId,
            content: `Forwarded: ${message.content || message.text}`,
            image: message.image || "",
          });
        }
      }

      toast.success(
        `Messages forwarded to ${selectedFriends.length} friend${
          selectedFriends.length !== 1 ? "s" : ""
        }`
      );
      onClose();
      setSelectedFriends([]);
    } catch (error) {
      toast.error("Failed to forward messages");
      console.error("Forward error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Forward to ({selectedMessages.length} message
            {selectedMessages.length !== 1 ? "s" : ""})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredFriends.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No friends found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <div
                  key={friend._id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.includes(friend._id)
                      ? "bg-green-50 border border-green-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleFriendSelection(friend._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend._id)}
                    onChange={() => toggleFriendSelection(friend._id)}
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mr-3"
                  />

                  <img
                    src={friend.avatar || "default-avatar.png"}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {friend.name}
                    </h4>
                    <p className="text-xs text-gray-500">{friend.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedFriends.length} friend
            {selectedFriends.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
            <button
              onClick={handleForward}
              disabled={
                selectedFriends.length === 0 || sendMessageMutation.isLoading
              }
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sendMessageMutation.isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Forwarding...
                </>
              ) : (
                `Forward to ${selectedFriends.length} friend${
                  selectedFriends.length !== 1 ? "s" : ""
                }`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;
