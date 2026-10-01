import { Server } from "socket.io";

let ioInstance = null;

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    socket.on("join-order", (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on("join-user", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on("update-location", (data) => {
      if (data?.orderId) {
        io.emit(`location:${data.orderId}`, { lat: data.lat, lng: data.lng });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => ioInstance;

export { initializeSocket, getIO };
export default initializeSocket;