const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const Authentication = require("../middleware/auth");
router.post("/createGroup", Authentication, groupController.createGroup);
router.post("/addToGroup", Authentication, groupController.addToGroup);
router.get("/getGroups", Authentication, groupController.getGroups);
router.get(
  "/:groupId/members",
  Authentication,
  groupController.getGroupMembers
);
router.post("/:groupId/makeAdmin", Authentication, groupController.makeAdmin);
router.delete(
  "/:groupId/member/:memberId",
  Authentication,
  groupController.deleteMember
);

module.exports = router;
