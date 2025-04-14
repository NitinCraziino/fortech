const mongoose = require("mongoose");
const CustomerPriceSchema = new mongoose.Schema(
    {
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      price: {
        type: Number,
        required: true, // Customer-specific price for this product
      },
    },
    { timestamps: true }
  );

  const CustomerPrice = mongoose.model("CustomerPrice", CustomerPriceSchema);

  module.exports = CustomerPrice;
  