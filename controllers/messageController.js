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

exports.getAllMessages = async (req, res) => {
  try {
    const allMessages = await Message.findAll();
    res.status(200).json(allMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};
