import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";

const FriendList = () => {
  const { friendData } = useContext(UserContext);

  return (
    <aside className="w-80 h-screen border-r border-gray-300 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Chats</h2>
        {/* Optional: add a new chat button here */}
      </div>

      {/* Search bar */}
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search or start new chat"
          className="w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Friend list */}
      <ul className="flex-1 overflow-y-auto">
        {friendData.length === 0 && (
          <li className="p-4 text-center text-gray-500">No friends found</li>
        )}

        {friendData.map((friend) => (
          <li
            key={friend._id}
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
          >
            <img
              src={
                friend.profilePicture ||
                "https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
              }
              alt={friend.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div className="flex-1 border-b border-gray-200 pb-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                {/* Optionally last message time */}
                {/* <span className="text-xs text-gray-400">12:45 PM</span> */}
              </div>
              <p className="text-sm text-gray-600 truncate">{friend.email}</p>
              {/* Optionally last message snippet */}
              {/* <p className="text-xs text-gray-500 truncate">Last message snippet here...</p> */}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default FriendList;
