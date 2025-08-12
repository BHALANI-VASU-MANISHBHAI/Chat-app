import messageModel from "../models/messageModel.js";

const getMessages = async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  try {
    const messages = await messageModel
      .find({
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId },
        ],
      })
      .sort({ createdAt: 1 });
    if (!messages) {
      return res
        .status(404)
        .json({ success: false, message: "No messages found" });
    }
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
};

const sendMessage = async (req, res) => {
  const io = req.app.get("io");
  const { receiverId, content, image } = req.body;
  const senderId = req.user._id;
  console.log("Sending message:", { senderId, receiverId, content, image });
  console.log("senderId:", senderId, "NAME:", req.user.name);
  if (!receiverId || (!content && !image)) {
    return res.status(400).json({
      success: false,
      message: "Receiver ID and content or image are required",
    });
  }

  try {
    const newMessage = await messageModel.create({
      sender: senderId,
      receiver: receiverId,
      content,
      image,
    });
    console.log("New message created:", newMessage);
    console.log("receiverId:", receiverId, "senderId:", senderId);
    io.to(receiverId).emit("newMessage", {
      sender: senderId,
      receiver: receiverId,
      content,
      image,
      time: newMessage.createdAt,
      isRead: false,
    });
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};
const markMessagesAsRead = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;

    await messageModel.updateMany(
      { sender: friendId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark messages as read" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    const deletedMessage = await messageModel.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

const editMessage = async (req, res) => {
  const { messageId, content } = req.body;
  try {
    const updatedMessage = await messageModel.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};
export {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
};
