const User = require("../models/User.model");
const response = require("../common/response");
const { deleteFile } = require("../common/deleteImage.helper"); 
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");


exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
  
      if (!users || users.length === 0) {
        return response.error(res, 404, "No users found");
      }
  
      return response.success(res, "Users fetched successfully", users);
  
    } catch (error) {
      console.error(error);
      return response.error(res, 500, "Internal server error");
    }
  };

// Add user
exports.addUser = async (req, res) => {
    try {
      const { name, email, phone, role, joining_date } = req.body;
  
      const profile_picture = req.file ? req.file.filename : null;

      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        if (profile_picture) {
          deleteFile(upload.profile, profile_picture);
        }
        return response.error(res, 409, "Email already exists");
      }
  
      const newUser = await User.create({name,email,phone,role,joining_date,profile_picture});

      return response.created(res, "User created successfully", {
        user_id: newUser._id
      });
  
    } catch (err) {
      console.error(err);

      if (err.code === 11000) {
        return response.error(res, 409, "Email already exists");
      }
  
      return response.error(res, 500, "Internal server error");
    }
  };
  
