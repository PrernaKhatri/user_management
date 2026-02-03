const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    phone: {
      type: String,
      required: true
    },

    role: {
      type: String,
      required: true
    },

    joining_date: {
      type: Date,
      required: true
    },

    profile_picture: {
      type: String,
      default: null
    },

  },
  {
    timestamps: false,
    versionKey : false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id : false
  }
);

userSchema.virtual("educations", {
  ref: "UserEducation",        
  localField: "_id",           
  foreignField: "user_id"      
});

userSchema.virtual("experiences", {
  ref: "Experience",
  localField: "_id",
  foreignField: "user_id"
});


module.exports = mongoose.model("User", userSchema);
