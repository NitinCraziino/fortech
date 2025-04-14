const express = require("express");
const passport = require("passport");
const router = express.Router();
const { loginUser, forgotPassword, resetPassword } = require("../controllers/authController");
const { setPassword } = require("../controllers/userController");
const { createEmailTemplate } = require("../controllers/emailController");

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ message: "Server error", error: err });
    if (!user) return res.status(401).json({ message: info.message }); // Message from Local Strategy

    req.login(user, { session: false }, (loginErr) => {
      if (loginErr) return res.status(500).json({ message: "Login error", error: loginErr });
      return loginUser(req, res); // Call the Login controller
    });
  })(req, res, next);
});

router.post("/setPassword", setPassword);

router.post("/createEmailTemplate", createEmailTemplate);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
