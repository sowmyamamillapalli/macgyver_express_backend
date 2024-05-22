const User = require("../models/userModel");
var jwt = require("jsonwebtoken");
const { sendToken } = require("./JWTHandler");

///////////////////////////////////////////////

exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use. Please use a different email.",
      });
    }
    if (!email || !password) {
      return res.status(400).json({
        message: "the email or password is missing",
      });
    }
    if (password < 6) {
      return res.status(400).json({
        message: "password must be at least 6 characters long",
      });
    }

    const user = new User({
      name,
      email,
      password,
    });

    const newUser = await user.save();

    // Generate and send JWT token
    sendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if either email or userName is provided
    if (!email && !password) {
      res.status(400).json({
        message: "Invalid email/username or password",
      });
      throw new Error("Please provide email or username");
    }

    let user;

    if (email) {
      user = await User.findOne({ email }).select("+password");
    }

    if (!user || !(await user.comparePassword(password, user.password))) {
      res.status(400).json({
        message: "Invalid email/username or password",
      });
    }
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
    });
    res.status(200).json({ status: "success", message: "You are logged out" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: "Error in logout" });
  }
};
