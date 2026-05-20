const Message = require("../models/Message");
const ApiError = require("../errors/ApiError");
const { parsePagination, buildPageResponse } = require("../utils/pagination");

const sendMessage = async ({ senderId, chatId, text }) => {
  const trimmedText = typeof text === "string" ? text.trim() : "";
  if (!chatId || !trimmedText) {
    throw new ApiError(400, "chatId and text are required");
  }

  const message = await Message.create({
    sender: senderId,
    chatId,
    text: trimmedText
  });

  await message.populate("sender", "name email avatarUrl");
  return message;
};

const listMessages = async ({ chatId, page, limit }) => {
  if (!chatId) {
    throw new ApiError(400, "chatId is required");
  }

  const { page: safePage, limit: safeLimit, skip } = parsePagination({ page, limit });
  const query = { chatId };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate("sender", "name email avatarUrl")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(safeLimit),
    Message.countDocuments(query)
  ]);

  return buildPageResponse(messages, total, safePage, safeLimit);
};

module.exports = {
  sendMessage,
  listMessages
};
