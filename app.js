const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
    methods: "GET,POST,DELETE",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
); // Use CORS middleware

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database and sync the User model
sequelize.sync().then(() => console.log("Database synced"));

// Use the user routes
app.use("/user", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
