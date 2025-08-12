// socketManager.js
export default function socketManager(io) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    //handle join user joining a room
    socket.on("joinRoom", (userId) => {
      console.log(`User ${userId} joined room`);
      socket.join(userId);
    });
    
      
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
