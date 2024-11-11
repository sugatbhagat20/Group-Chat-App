const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
//const userAuthentication = require("../middleware/auth");
const authenticate = require("../middleware/auth");

// POST /signup - User Signup Route
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/getUser", authenticate, userController.getUser);
module.exports = router;
