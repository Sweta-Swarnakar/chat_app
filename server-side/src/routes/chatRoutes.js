
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages
} = require("../controllers/chatController");

router.post("/message", authMiddleware, sendMessage);

router.get("/:chatId", authMiddleware, getMessages);

module.exports = router;
