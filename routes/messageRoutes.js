const express = require("express");
const messageController = require("../controllers/messageController");
const userAuthentication = require("../middleware/auth");

const router = express.Router();

// Route to send a message to a specific group
router.post(
  "/:groupId/sendMessage",
  userAuthentication,
  messageController.sendMessage
);

// Route to get new messages for a specific group
router.get(
  "/:groupId/getNewMessages",
  userAuthentication,
  messageController.getNewMessages
);

// Route to get all messages for a specific group
router.get(
  "/:groupId/messages",
  userAuthentication,
  messageController.getAllMessages
);

module.exports = router;
