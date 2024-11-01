const express = require("express");
const messageController = require("../controllers/messageController");

const router = express.Router();

const userAuthentication = require("../middleware/auth");
router.post("/sendMessage", userAuthentication, messageController.sendMessage);
module.exports = router;
