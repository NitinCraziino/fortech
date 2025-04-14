const passport = require("passport");

const jwtAuthMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Server error", error: err });
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized", info });
    }

    req.user = user; // Attach user to request
    next(); // Proceed to the next middleware/route
  })(req, res, next);
};

module.exports = jwtAuthMiddleware;
