const express = require("express");
const groupController = require("../controllers/groupController");
const authentication = require("../middleware/auth");

const router = express.Router();

router.post("/create", authentication, groupController.createGroup);
router.post("/:groupId/addMember", authentication, groupController.addMember);
router.get("/userGroups", authentication, groupController.getUserGroups);
router.get(
  "/:groupId/messages",
  authentication,
  groupController.getGroupMessages
);
router.post(
  "/:groupId/sendMessage",
  authentication,
  groupController.sendMessage
);

module.exports = router;
