const mongoose = require("mongoose");

const userEducationSchema = new mongoose.Schema(
  {
    
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    education_level: {
      type: String,
      required: true
    },

    institution_name: {
      type: String,
      required: true
    },

    passing_year: {
      type: Number,
      required: true
    },

    percentage: {
      type: Number,
      required: true
    },

    degree_picture: {
      type: String,
      default: null
    }
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id:false
  }
);

userEducationSchema.virtual("subjects", {
  ref: "Subject",
  localField: "_id",
  foreignField: "education_id"
});

module.exports = mongoose.model("UserEducation", userEducationSchema);
