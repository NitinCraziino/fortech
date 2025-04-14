const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    partNo: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    unit: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    image: String,
    active: Boolean,
    isDeleted: {type: Boolean, default: false},
  },
  {timestamps: true}
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
