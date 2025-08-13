import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { toast } from "react-toastify";
import { GlobalContext } from "../contexts/GlobalContext";

const Profile = () => {
  const { userData } = useContext(UserContext);
  const { navigate } = useContext(GlobalContext);
  const { updateProfile, isLoading } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Auto-fill form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        status: userData.status || "",
      });
      setAvatarPreview(userData.avatar || "");
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await updateProfile(formData, avatar);
    if (result.success) {
      setIsEditing(false);
      setAvatar(null);
      navigate("/dashboard");
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        status: userData.status || "",
      });
      setAvatarPreview(userData.avatar || "");
      setAvatar(null);
    }
    setIsEditing(false);
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-gray-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-4xl">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m9 12 2 2 4-4"
                  />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          ) : (
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {formData.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
            />
          ) : (
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              {formData.email}
            </div>
          )}
        </div>

        {/* Status Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Status Message
          </label>
          {isEditing ? (
            <textarea
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
              placeholder="Hey there! I am using ChatApp"
            />
          ) : (
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
              {formData.status || "No status message"}
            </div>
          )}
        </div>

        {/* Account Info */}
        {/* <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Account Information
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">User ID:</span> {userData._id}
            </div>
            <div>
              <span className="font-medium">Member Since:</span>{" "}
              {new Date(userData.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(userData.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  userData.isOnline
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {userData.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Profile;
