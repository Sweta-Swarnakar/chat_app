
const userSockets = new Map();
const socketUsers = new Map();

const setUserOnlineState = async (userId, isOnline) => {
  const User = require("../models/User");
  await User.findByIdAndUpdate(userId, { isOnline });
};

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    socket.on("join", async (userId) => {
      if (!userId) return;

      socketUsers.set(socket.id, userId);

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }

      userSockets.get(userId).add(socket.id);

      try {
        await setUserOnlineState(userId, true);
      } catch (error) {
        console.log("Failed to mark user online:", error.message);
      }

      io.emit("online_users", Array.from(userSockets.keys()));
    });

    socket.on("typing", (data) => {
      const receiverSockets = userSockets.get(data.receiverId);
      if (!receiverSockets) return;

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("typing", data);
      });
    });

    socket.on("send_message", (data) => {
      const receiverSockets = userSockets.get(data.receiverId);
      if (!receiverSockets) return;

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("receive_message", data);
      });
    });

    socket.on("disconnect", async () => {
      const userId = socketUsers.get(socket.id);

      if (!userId) return;

      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSockets.delete(userId);
          try {
            await setUserOnlineState(userId, false);
          } catch (error) {
            console.log("Failed to mark user offline:", error.message);
          }
        }
      }

      socketUsers.delete(socket.id);
      io.emit("online_users", Array.from(userSockets.keys()));
    });
  });
};

module.exports = socketHandler;
