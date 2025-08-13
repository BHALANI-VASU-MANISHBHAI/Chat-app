import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
// sign up
const SignUp = async (req, res) => {
  const { name, email, password, status } = req.body;
  console.log("SignUp request received:", req.body);
  try {
    const existingUser = await userModel.findOne({ email });
    console.log("Checking for existing user:", existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const newUser = new userModel({
      name,
      email,
      password,
      status: status || "Hey there! I am using ChatApp",
      isOnline: true,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
      token, // send token back to client
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// login
const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request received:", req.body);
  try {
    const user = await userModel
      .findOne({ email, password })
      .select("-password"); // Exclude password from response
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    await userModel.updateOne(
      { _id: user._id },
      { isOnline: true, lastSeen: Date.now() }
    );

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token, // send token back to client
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getFriends = async (req, res) => {
  const userId = req.user._id; // Get user ID from authenticated request

  console.log("Get friends request received for user:", userId);
  try {
    const user = await userModel
      .findById(userId)
      .populate("friends", "-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const AddFriend = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to add a friend",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const friend = await userModel.findOne({ email });
    if (!friend) {
      return res.status(404).json({
        success: false,
        message: "Friend not found",
      });
    }

    // Prevent users from adding themselves
    if (friend._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself as a friend",
      });
    }

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({
        success: false,
        message: "Friend already added",
      });
    }

    user.friends.push(friend._id);
    await user.save();

    // Add user to friend's friends list
    // This ensures that the friend also has the user in their friends list
    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
      await friend.save();
    }

    res.status(200).json({
      success: true,
      message: "Friend added successfully",
      friend: {
        _id: friend._id,
        name: friend.name,
        email: friend.email,
      },
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserData = async (req, res) => {
  const userId = req.user._id; // Get user ID from authenticated request

  try {
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changeOnlineStatus = async (req, res) => {
  const io = req.app.get("io");
  const userId = req.user._id; // Get user ID from authenticated request
  const { isOnline } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isOnline = isOnline ? "yes" : "no";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
    io.emit("statusChanged", {
      userId: user._id,
      status: user.status,
    }); // Emit status change to all connected clients
  } catch (error) {
    console.error("Error changing status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// delete friend
const deleteFriend = async (req, res) => {
  const userId = req.user._id;
  const io = req.app.get("io");
  try {
    console.log("Delete friend request received for user:", userId);
    console.log("req.body:", req.body);
    const { friendId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.friends.includes(friendId)) {
      return res.status(400).json({
        success: false,
        message: "Friend not found in your friend list",
      });
    }

    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    await user.save();
    console.log("Friend removed from user's friend list:", friendId);
    console.log("Emitting friendDeleted event to user:", userId);
    io.to(userId.toString()).emit("friendDeleted", {
      friendId,
    }); // Notify the user that a friend has been deleted
    res.status(200).json({
      success: true,
      message: "Friend removed from your list",
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Get user ID from authenticated request
    const { name, email, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name;
    user.email = email;
    user.status = status || user.status; // Update status if provided

    // Handle avatar upload if file is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
        folder: "profilePhotos",
      });
      user.avatar = result.secure_url; // Save the avatar URL
      console.log("Avatar uploaded to Cloudinary:", result.secure_url);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export {
  SignUp,
  Login,
  getFriends,
  AddFriend,
  getUserData,
  changeOnlineStatus,
  deleteFriend,
  UpdateProfile,
};
