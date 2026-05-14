
const users = new Map();

const socketHandler = (io) => {

  io.on("connection", (socket) => {

    socket.on("join", (userId) => {
      users.set(userId, socket.id);

      io.emit("online_users", Array.from(users.keys()));
    });

    socket.on("typing", (data) => {
      io.to(users.get(data.receiverId)).emit("typing", data);
    });

    socket.on("send_message", (data) => {

      const receiverSocket = users.get(data.receiverId);

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", data);
      }
    });

    socket.on("disconnect", () => {

      for (const [key, value] of users.entries()) {
        if (value === socket.id) {
          users.delete(key);
        }
      }

      io.emit("online_users", Array.from(users.keys()));
    });
  });
};

module.exports = socketHandler;
