const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);

    socket.on("join-admin", () => {
      socket.join("admin");
      console.log("Admin joined:", socket.id);
    });
    socket.on("join-partner", (partnerId) => {
      socket.join(`partner-${partnerId}`);
      console.log("partner joined:", socket.id);
    });

    socket.on("disconnect", () => {
    //   console.log("User disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getIO };