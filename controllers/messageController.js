const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {
  try {
    // Store the message in the database
    const newMessage = await Message.create({
      userId: req.user.id,
      message: req.body.message,
      name: req.user.name,
    });

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
