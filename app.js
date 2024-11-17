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
const server = http.createServer(app);
const { Server } = require("socket.io");

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Replace with your frontend URL
    methods: ["GET", "POST", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers)
  },
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
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

// Socket.IO handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join the user to a specific group
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group ${groupId}`);
  });

  // Listen for messages from clients
  socket.on("sendMessage", (messageData) => {
    // Emit the message to all connected users in the specified group
    io.to(messageData.groupId).emit("receiveMessage", messageData);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
