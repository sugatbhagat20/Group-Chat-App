const User = require("../models/userModel");
const Group = require("../models/groupModel");
const UserGroup = require("../models/userGroup");
const { Op } = require("sequelize");

// Create a new group and set the creator as admin
exports.createGroup = async (req, res, next) => {
  try {
    const { groupName } = req.body;
    const adminName = req.user.name; // Assuming req.user is populated with the logged-in user's data

    // Create the group with the creator as admin
    const group = await Group.create({ name: groupName, admin: adminName });
    console.log(group);

    // Add the creator to the UserGroup table with admin privileges
    await UserGroup.create({
      isadmin: true,
      userId: req.user.id,
      groupId: group.dataValues.id,
    });

    res.status(201).json({
      message: `${groupName} created successfully!`,
      group: group.name,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Add members to an existing group (only accessible by admins)
exports.addToGroup = async (req, res, next) => {
  try {
    const { groupName, members } = req.body; // members is an array containing a single email

    // Check if the group exists
    const group = await Group.findOne({ where: { name: groupName } });
    if (!group) {
      return res.status(404).json({ message: "Group does not exist!" });
    }

    // Check if the requester is an admin of the group
    const isAdmin = await UserGroup.findOne({
      where: {
        userId: req.user.id,
        groupId: group.id,
        isadmin: true,
      },
    });
    if (!isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can add new members" });
    }

    // Find the user by email (expecting only one email in the `members` array)
    const invitedMember = await User.findOne({
      where: {
        email: members[0], // single email expected
      },
    });

    // If the user is not found, return an error
    if (!invitedMember) {
      return res.status(404).json({ message: "User does not exist!" });
    }

    // Check if the user is already a member of the group
    const alreadyMember = await UserGroup.findOne({
      where: {
        userId: invitedMember.id,
        groupId: group.id,
      },
    });
    if (alreadyMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Add the user to the group as a non-admin
    await UserGroup.create({
      isadmin: false,
      userId: invitedMember.id,
      groupId: group.id,
    });

    res.status(201).json({ message: "Member added successfully!" });
  } catch (error) {
    console.error("Error adding member to group:", error);
    res.status(500).json({ error: "Failed to add member to group" });
  }
};
// Get groups that the user is a part of
exports.getGroups = async (req, res, next) => {
  try {
    const groups = await Group.findAll({
      attributes: ["id", "name", "admin"], // Ensure 'id' is included
      include: [
        {
          model: UserGroup,
          where: { userId: req.user.id },
          attributes: [], // Don't include UserGroup attributes in the response
        },
      ],
    });

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error retrieving groups:", error);
    res.status(500).json({ error: "Failed to retrieve groups" });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find the members of the group
    const members = await User.findAll({
      include: [
        {
          model: UserGroup,
          where: { groupId },
          attributes: ["isAdmin"], // Assuming `isAdmin` field in UserGroup model
        },
      ],
      attributes: ["id", "name", "email"], // Only fetch necessary fields
    });

    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ error: "Failed to fetch group members" });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;

    // Find the UserGroup entry and update the role
    const userGroup = await UserGroup.findOne({
      where: { groupId, userId: memberId },
    });

    if (!userGroup) {
      return res
        .status(404)
        .json({ message: "Member not found in this group" });
    }

    userGroup.isAdmin = true; // Assuming `isAdmin` is a boolean field in UserGroup
    await userGroup.save();

    res.status(200).json({ message: "Member made an admin successfully" });
  } catch (error) {
    console.error("Error making member an admin:", error);
    res.status(500).json({ error: "Failed to make member an admin" });
  }
};

// Controller to delete a member from a group
exports.deleteMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;

    // Check if the user is part of the group
    const userGroup = await UserGroup.findOne({
      where: { groupId, userId: memberId },
    });

    if (!userGroup) {
      return res
        .status(404)
        .json({ message: "Member not found in this group" });
    }

    await userGroup.destroy(); // Remove the member from the group
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ error: "Failed to delete member" });
  }
};
