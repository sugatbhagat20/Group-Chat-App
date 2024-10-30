const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// POST /signup - User Signup Route
router.post("/signup", userController.signup);

module.exports = router;
