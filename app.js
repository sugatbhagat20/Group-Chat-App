const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const User = require("./models/userModel");
const Message = require("./models/messageModel");
const Group = require("./models/groupModel");
const UserGroup = require("./models/userGroup");

const http = require("http");
//const { Server } = require("socket.io");
const server = http.createServer(app);
const io = require(socket.io)({
  cors: {
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
    methods: "GET,POST,DELETE",
    credentials: true, // Allow credentials (cookies, authorization headers)
  },
  // Use CORS middleware
});
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
// Connect to the database and sync the User model
sequelize.sync().then(() => console.log("Database synced"));

// Use the user routes
app.use("/user", userRoutes);
app.use("/message", messageRoutes);
app.use("/group", groupRoutes);

User.hasMany(Message);
Message.belongsTo(User);
Message.belongsTo(Group);
User.hasMany(UserGroup);
Group.hasMany(Message);
Group.hasMany(UserGroup);
UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
