const mongoose = require("mongoose");
const EmailTemplateSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    subject: String,
    active: Boolean,
  },
  { timestamps: true }
);

const EmailTemplate = mongoose.model("EmailTemplate", EmailTemplateSchema);

module.exports = EmailTemplate;
