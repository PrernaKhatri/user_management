const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    company_name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model("Experience", experienceSchema);
