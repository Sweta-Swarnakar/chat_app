
const Message = require("../models/Message");

const sendMessage = async (req, res) => {
  try {

    const { chatId, text } = req.body;

    if (!chatId || !text || !text.trim()) {
      return res.status(400).json({
        message: "chatId and text are required"
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      chatId,
      text
    });

    await message.populate("sender", "name email");

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getMessages = async (req, res) => {
  try {

    const messages = await Message.find({
      chatId: req.params.chatId
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  sendMessage,
  getMessages
};
