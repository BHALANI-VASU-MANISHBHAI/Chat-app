import React from "react";

const ProfilePreview = ({ userData, isPreview = false }) => {
  if (!userData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {isPreview && (
        <div className="text-center mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Profile Preview
          </h3>
          <p className="text-sm text-gray-600">How your profile will look</p>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300 flex-shrink-0">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-blue-100 to-purple-100">
              <span className="text-2xl font-bold text-gray-700">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-lg font-semibold text-gray-800 truncate">
              {userData.name || "Unknown User"}
            </h4>
            {userData.isOnline && (
              <span className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></span>
            )}
          </div>

          <p className="text-sm text-gray-600 truncate mb-1">
            {userData.email || "No email"}
          </p>

          <p className="text-xs text-gray-500 italic">
            {userData.status || "No status message"}
          </p>
        </div>
      </div>

      {userData.createdAt && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Member since {new Date(userData.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePreview;
