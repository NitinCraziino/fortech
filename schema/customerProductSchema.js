const mongoose = require("mongoose");
const CustomerProductSchema = new mongoose.Schema(
    {
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
      },
      products: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
          price: { type: Number, required: true }, // Customer-specific price
        }
      ]
    },
    { timestamps: true }
  );

  const CustomerPrice = mongoose.model("CustomerProducts", CustomerProductSchema);

  module.exports = CustomerPrice;
  