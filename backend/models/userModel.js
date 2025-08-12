import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId, // store reference to another user
        ref: "User",
      },
    ],
    avatar: {
      type: String, // URL for profile photo
      default: "",
    },
    status: {
      type: String, // "Hey there! I am using ChatApp"
      default: "",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false, // true if user is online
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
