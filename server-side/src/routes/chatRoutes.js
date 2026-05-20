
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { validateMessageBody, validateChatParams } = require("../validators/chatValidators");

const {
  sendMessage,
  getMessages
} = require("../controllers/chatController");

router.post("/message", authMiddleware, validateRequest(validateMessageBody), sendMessage);

router.get("/:chatId", authMiddleware, validateRequest(validateChatParams), getMessages);

module.exports = router;
