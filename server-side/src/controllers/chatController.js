const asyncHandler = require("../utils/asyncHandler");
const { sendMessage, listMessages } = require("../services/chatService");

const sendChatMessage = asyncHandler(async (req, res) => {
  const result = await sendMessage({
    senderId: req.user.id,
    chatId: req.body.chatId,
    text: req.body.text
  });
  res.status(201).json(result);
});

const getMessages = asyncHandler(async (req, res) => {
  const result = await listMessages({
    chatId: req.params.chatId,
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(result);
});

module.exports = {
  sendMessage: sendChatMessage,
  getMessages
};
