const addMemberToGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIdToAdd } = req.body; // ID of the user being added
  const currentUserId = req.user.id;

  // Check if current user is an admin of the group
  const isAdmin = await GroupMembers.findOne({
    where: { groupId, userId: currentUserId, role: "admin" },
  });

  if (!isAdmin) return res.status(403).json({ message: "Access denied" });

  // Add the user as a member in GroupMembers table
  await GroupMembers.create({
    groupId,
    userId: userIdToAdd,
    role: "member",
  });

  res.status(201).json({ message: "User added to group" });
};

const makeMemberAdmin = async (req, res) => {
  const { groupId } = req.params;
  const { userIdToPromote } = req.body;
  const currentUserId = req.user.id;

  // Check if current user is an admin of the group
  const isAdmin = await GroupMembers.findOne({
    where: { groupId, userId: currentUserId, role: "admin" },
  });
  if (!isAdmin) return res.status(403).json({ message: "Access denied" });

  // Update the role of the user to 'admin'
  await GroupMembers.update(
    { role: "admin" },
    {
      where: { groupId, userId: userIdToPromote },
    }
  );

  res.status(200).json({ message: "User promoted to admin" });
};

const removeMemberFromGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userIdToRemove } = req.body;
  const currentUserId = req.user.id;

  // Check if current user is an admin of the group
  const isAdmin = await GroupMembers.findOne({
    where: { groupId, userId: currentUserId, role: "admin" },
  });
  if (!isAdmin) return res.status(403).json({ message: "Access denied" });

  // Remove the user from the group
  await GroupMembers.destroy({
    where: { groupId, userId: userIdToRemove },
  });

  res.status(200).json({ message: "User removed from group" });
};
