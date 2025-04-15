const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: String,
    active: Boolean,
    admin: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {timestamps: true}
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
