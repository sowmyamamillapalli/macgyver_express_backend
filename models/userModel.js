// models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "technician", "operator", "dealer"],
    default: "user",
  },
  inspection_reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "inspectionReport",
    },
  ],

  machines: [
    {
      name: {
        type: String,
      },
    },
  ],
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next(); // If the password hasn't changed, no need to hash it again
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
