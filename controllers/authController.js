const EmailTemplate = require("../schema/emailtemplateSchema");
const User = require("../schema/userSchema");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./emailController");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};
const loginUser = async (req, res) => {
  try {
    const { _id, name, email, admin, active, taxEnabled } = req.user;
    const token = jwt.sign(
      {
        _id,
        email,
        name,
        admin,
        active,
        taxEnabled
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      user: { _id, name, email, admin, active, taxEnabled },
      token: `Bearer ${token}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      res.status(400).json({ error: "User with this email does not exist." });
    }
    const resetToken = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const resetLink = `https://www.naisorders.com/reset-password/${resetToken}`;
    const emailTemplate = await EmailTemplate.findOne({ type: "Forgot Password" });
    sendEmail({
      to: normalizedEmail,
      from: "brian@naisupply.com",
      subject: emailTemplate.subject,
      html: emailTemplate.body.replace('[username]', existingUser.name).replace('[resetpasswordlink]', resetLink),
    });
    return res.status(200).json({ message: "Password reset email sent successfully." });
  }  catch (error) {
    console.log("🚀 ~ forgotPassword ~ error:", error)
    return res.status(500).json({ message: "Internal server error." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });

  }
}

module.exports = { loginUser, forgotPassword, resetPassword };
