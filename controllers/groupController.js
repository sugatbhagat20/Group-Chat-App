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
