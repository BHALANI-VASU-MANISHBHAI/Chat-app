import React, { useState } from "react";
import { useAddFriend } from "../hooks/useAddFriend.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddFriend = () => {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const addFriendMutation = useAddFriend();
  const navigate = useNavigate();

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
          // Optionally navigate back to dashboard
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
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
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Add New Friend
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your friend's email address to connect
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Friend's Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  disabled={addFriendMutation.isLoading}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                    !isValidEmail
                      ? "border-red-300 text-red-900 placeholder-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="friend@example.com"
                />
                {!isValidEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {!isValidEmail && email && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={
                  addFriendMutation.isLoading || !email.trim() || !isValidEmail
                }
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {addFriendMutation.isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Adding Friend...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Friend
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your friend will be automatically added to both of your friend
              lists
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFriend;
