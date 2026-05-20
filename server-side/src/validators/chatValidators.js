const validateMessageBody = (req) => {
  const errors = [];
  const { chatId, text } = req.body || {};

  if (!chatId || typeof chatId !== "string") {
    errors.push("chatId is required");
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    errors.push("text is required");
  }

  return errors;
};

const validateChatParams = (req) => {
  const errors = [];
  const { chatId } = req.params || {};
  if (!chatId) {
    errors.push("chatId is required");
  }
  return errors;
};

module.exports = {
  validateMessageBody,
  validateChatParams
};
