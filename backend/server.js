import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js";
import userRouter from "./routes/userRoute.js";
import messageRouter from "./routes/messageRoute.js";
import { redisClient } from "./config/redisClient.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.set("io", io);
app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req, res) => {
  res.json({ message: "Chat App Backend API" });
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user joining a room
  socket.on("joinRoom", (userId) => {
    console.log(`User ${userId} joined room`);

    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
