const bcrypt = require("bcryptjs");
const users = require("../models/userModel"); // Sequelize User model
const jwt = require("jsonwebtoken");

// Helper function to generate JWT
const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.TOKEN, { expiresIn: "1h" });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateAccessToken(user.id, user.email);

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Signup Controller
exports.signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await users.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// userController.js
exports.getUser = (req, res) => {
  try {
    // Ensure req.user is populated (usually done with authentication middleware)
    const user = { email: req.user.email }; // Assuming req.user contains user info after authentication
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};
