const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../schema/userSchema"); // Adjust path to your User model
const bcrypt = require("bcrypt");

// Local strategy for email/password login
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);
