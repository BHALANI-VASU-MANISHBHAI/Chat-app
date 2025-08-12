import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// sign up
const SignUp = async (req, res) => {
  const { name, email, password } = req.body;
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
    const newUser = new userModel({ name, email, password, isOnline: true });

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

    if (user.friends.includes(friend._id)) {
      return res.status(400).json({
        success: false,
        message: "Friend already added",
      });
    }

    user.friends.push(friend._id);
    await user.save();

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

export {
  SignUp,
  Login,
  getFriends,
  AddFriend,
  getUserData,
  changeOnlineStatus,
};
