const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    exp_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experience",
      required: true
    },

    project_name: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false,
    collection: "projects"
  }
);

module.exports = mongoose.model("Project", projectSchema);
