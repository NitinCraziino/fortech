const mongoose = require("mongoose");
const crypto = require("crypto");
const generateOrderNumber = () => {
  return crypto.randomBytes(6).toString("hex").toUpperCase(); // Generates a 12-character string
};
const OrderSchema = new mongoose.Schema(
  {
    orderNo: {type: String, required: true, unique: true, default: generateOrderNumber},
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to Product schema
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        taxEnabled: {
          type: Boolean,
          required: true,
          default: false
        },
      }
    ],
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    pickupLocation: {
      type: String,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    comments: String,
    poNumber: {
      type: String,
      required: false,
    },
    deliveryDate: String,
    isDeleted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: "Processing"
    }
  },
  {timestamps: true}
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
