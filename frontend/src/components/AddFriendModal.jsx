import React, { useState } from "react";
import { useAddFriend } from "../hooks/useAddFriend.js";
import { toast } from "react-toastify";

const AddFriendModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const addFriendMutation = useAddFriend();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail) || newEmail === "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      toast.error("Please enter a valid email address");
      return;
    }

    addFriendMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: (data) => {
          toast.success(`${data.friend.name} added as friend successfully!`);
          setEmail("");
          onClose();
        },
        onError: (error) => {
          console.error("Add friend error:", error);
          let errorMessage = "Failed to add friend. Please try again.";

          if (error.response?.data?.message) {
            const backendMessage = error.response.data.message;
            // Customize error messages for better UX
            switch (backendMessage) {
              case "Friend not found":
                errorMessage =
                  "No user found with this email address. Please check and try again.";
                break;
              case "Friend already added":
                errorMessage = "This user is already in your friend list!";
                break;
              case "You cannot add yourself as a friend":
                errorMessage = "You cannot add yourself as a friend 😊";
                break;
              case "Email is required to add a friend":
                errorMessage = "Please enter an email address.";
                break;
              default:
                errorMessage = backendMessage;
            }
          }

          toast.error(errorMessage);
        },
      }
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add New Friend</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="modal-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Friend's Email Address
            </label>
            <input
              id="modal-email"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              disabled={addFriendMutation.isLoading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                !isValidEmail
                  ? "border-red-300 text-red-900 placeholder-red-300"
                  : "border-gray-300"
              }`}
              placeholder="friend@example.com"
              autoFocus
            />
            {!isValidEmail && email && (
              <p className="mt-1 text-sm text-red-600">
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={addFriendMutation.isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                addFriendMutation.isLoading || !email.trim() || !isValidEmail
              }
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {addFriendMutation.isLoading ? (
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
                  Adding...
                </>
              ) : (
                "Add Friend"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal;
