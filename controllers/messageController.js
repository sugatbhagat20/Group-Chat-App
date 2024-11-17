const Message = require("../models/messageModel");
const Sequelize = require("sequelize");
const Group = require("../models/groupModel");
const UserGroup = require("../models/userGroup"); // Ensure you have a model to represent the user-group relation

// Import io from your server setup if it's not globally accessible
const { io } = require("../app"); // Adjust the path if necessary

// Controller to send a message to a group
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { groupId } = req.params; // Get the groupId from the URL parameter

    // Find the group by ID (not name)
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = await UserGroup.findOne({
      where: {
        userId: req.user.id,
        groupId: group.id,
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Store the message in the database
    const newMessage = await Message.create({
      userId: req.user.id,
      message: message,
      name: req.user.name, // Ensure req.user.name is available
      groupId: group.id,
    });

    // Emit the new message to all members of the group using Socket.IO
    io.to(group.id).emit("receiveMessage", {
      userId: newMessage.userId,
      message: newMessage.message,
      name: newMessage.name,
      groupId: newMessage.groupId,
      createdAt: newMessage.createdAt,
    });

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Controller to get new messages for a specific group
exports.getNewMessages = async (req, res) => {
  const lastMessageId = parseInt(req.query.lastMessageId) || 0;
  const { groupId } = req.params; // Get the groupId from the URL parameter

  try {
    // Find the group by ID (not name)
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = await UserGroup.findOne({
      where: {
        userId: req.user.id,
        groupId: group.id,
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Fetch new messages for the group that were created after the last fetched message ID
    const newMessages = await Message.findAll({
      where: {
        id: { [Sequelize.Op.gt]: lastMessageId },
        groupId: group.id,
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(newMessages);
  } catch (error) {
    console.error("Error fetching new messages:", error);
    res.status(500).json({ message: "Failed to retrieve new messages" });
  }
};

// Controller to get all messages for a specific group
exports.getAllMessages = async (req, res) => {
  const { groupId } = req.params; // Get the groupId from the URL parameter

  try {
    // Find the group by ID (not name)
    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const isMember = await UserGroup.findOne({
      where: {
        userId: req.user.id,
        groupId: group.id,
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Fetch all messages for the group
    const messages = await Message.findAll({
      where: {
        groupId: group.id,
      },
      order: [["createdAt", "ASC"]], // Optionally order by creation date
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching all messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};
