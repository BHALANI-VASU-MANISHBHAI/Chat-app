import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  deleteMessage,
  editMessage
} from "../controllers/MessageController.js";
import express from "express";
import { userAuth } from "../middleware/userAuth.js";

const messageRouter = express.Router();

// Message routes
messageRouter.get("/:friendId", userAuth, getMessages);
messageRouter.post("/sendmessage", userAuth, sendMessage);
messageRouter.delete("/deletemessage", userAuth, deleteMessage);
messageRouter.put("/editmessage", userAuth, editMessage);
messageRouter.put("/markasread", userAuth, markMessagesAsRead);


export default messageRouter;
