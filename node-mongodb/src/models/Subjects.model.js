const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    education_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserEducation",
      required: true
    },

    subject_name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false,
    collection: "subjects"
  }
);

module.exports = mongoose.model("Subject", subjectSchema);
