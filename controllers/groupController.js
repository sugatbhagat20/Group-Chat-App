const Group = require("../models/group");
const GroupMember = require("../models/groupMemberModel");
const Message = require("../models/messageModel");

exports.createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    const userId = req.user.id;

    const newGroup = await Group.create({ groupName, createdBy: userId });
    await GroupMember.create({ userId, groupId: newGroup.id });

    res
      .status(201)
      .json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    await GroupMember.create({ userId, groupId });
    res.status(200).json({ message: "Member added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add member" });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.findAll({
      include: [{ model: GroupMember, where: { userId } }],
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user groups" });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.findAll({ where: { groupId } });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { message } = req.body;

    const newMessage = await Message.create({ userId, groupId, message });
    res.status(201).json({ message: "Message sent", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};
