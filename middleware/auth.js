const jwt = require("jsonwebtoken");
const users = require("../models/userModel");
require("dotenv").config();
const authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    //console.log(req.headers);
    const user = jwt.verify(token, process.env.TOKEN);
    users
      .findByPk(user.userId)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authenticate;
