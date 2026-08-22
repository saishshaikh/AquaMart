import { Server } from "socket.io";

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    socket.on("update-location", (data) => {
      console.log("📍 Live Location Update:", data);
      io.emit(`location:${data.orderId}`, { lat: data.lat, lng: data.lng });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  return io;
};

// ✅ Yeh import karna hoga - DEFAULT EXPORT
export default initializeSocket;