
require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const socketHandler = require("./sockets/socketHandler");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.set("trust proxy", 1);

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.originalUrl.startsWith("/api/auth")
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin
  }
});

socketHandler(io);

app.get("/", (req, res) => {
  res.send("Production Chat Backend Running");
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server Started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup aborted.");
    process.exit(1);
  }
})();
