import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:10000";
const socket = io(backendUrl, {
  autoConnect: true,
  transports: ["websocket"],
});

socket.on("connect", async () => {
  
  console.log("Socket connected:", socket.id);
  // we do add the cline id
});

socket.on("disconnect", async () => {
  console.log("Socket disconnected:", socket.id);

});

export default socket;
