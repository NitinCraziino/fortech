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
    // Soft delete. A deleted customer is hidden from the customer list and
    // cannot log in, but the record stays so their past orders still show
    // the customer's name and email.
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
