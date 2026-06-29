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
    // Customer-level tax. When taxEnabled is true, taxAmount (a percentage,
    // e.g. 6 = 6%) is applied to this customer's orders and overrides the
    // per-product tax. When false, the existing per-product tax is used.
    taxEnabled: {
      type: Boolean,
      default: false,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true}
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
