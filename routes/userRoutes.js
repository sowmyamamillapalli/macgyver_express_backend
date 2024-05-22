const express = require("express");
const router = express.Router();
const { signUp, login } = require("../controllers/userController");

router.route("/").get((req, res) => { //api/users/
  res.send("Hello World!");
});

router.route("/signup").post(signUp); //api/users/signup
router.route("/login").post(login); //api/users/login

module.exports = router;
