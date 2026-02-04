const response = require("../common/response");
const { deleteFile } = require("../common/deleteImage.helper"); 
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");
const User = require("../models/User.model");
const UserEducation = require("../models/UserEducation.model");
const Experience = require("../models/Experience.model");
const Subjects = require("../models/Subjects.model");
const buildQueryFeatures = require("../common/queryFeatures");

//Get all users 
exports.getAllUsers = async (req, res) => {
  try {

    const { query, pagination } = buildQueryFeatures({
      model: User,
      queryParams: req.query,
      searchFields: ["name", "email", "role"],
      populate: [
        {
          path: "educations",
          populate: { path: "subjects" }
        },
        { path: "experiences" }
      ]
    });

    const users = await query;

    if (!users || users.length === 0) {
      return response.error(res, 404, "No users found");
    }

    const result = users.map(user => ({...user.toObject(),
      profile_picture: buildImageUrl(req.baseUrlFull, upload.profile,
      user.profile_picture)
    }));

    return response.success(res, "Users fetched successfully", {
      users: result,pagination});

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Get user by id
exports.getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id)
    .populate({
      path: "educations",
      populate:{
        path : "subjects"
      }
    })
    .populate("experiences");
    

    if (!user) {
      return response.error(res,404,`No user with ID ${user_id} is available.`);
    }

    const result = {...user.toObject(),profile_picture: buildImageUrl(req.baseUrlFull,upload.profile,user.profile_picture)};

    return response.success(res,`Data fetched for user ${user_id}.`,result);

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error.");
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

//Update user
  exports.updateUser = async (req,res) => {
    try{
      const {user_id} = req.params;
      const updatedData = req.body || {};

      if(Object.keys(updatedData).length == 0){
        return response.error(res,400,"No data provided to update");
      }

      const user = await User.findById(user_id);

      if(!user){
        return response.error(res,404,"User not found")
      }

      await User.findByIdAndUpdate(user_id,{ $set: updatedData },{ runValidators: true });

      return response.success(res,"User updated successfully");
    }
    catch(err){
      console.error(err);
      return response.error(res,500,"Internal server error");
    }
  }

//delete user 
  exports.deleteUser = async(req,res) => {
    try{
      const {user_id} = req.params;
      
      const user = await User.findById(user_id);

      if(!user){
        return response.error(res,404,"User not found");
      }

      if(user.profile_picture){
        deleteFile(upload.profile,user.profile_picture);
      }

      await User.findByIdAndDelete(user_id);

      return response.success(res,"User deleted successfully");
    }
    catch(error){
      console.error(error);
      return response.error(res,500,"Internal server error");
    }
  }

//Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!req.file) {
      return response.error(res, 400, "Profile picture is required");
    }

    const user = await User.findById(user_id);

    if (!user) {
      deleteFile(upload.profile, req.file.filename);
      return response.error(res, 404, "User not found");
    }

    const oldProfile = user.profile_picture;
    if (oldProfile) {
      deleteFile(upload.profile, oldProfile);
    }

    const profilePath = req.file.filename;

    await User.findByIdAndUpdate(
      user_id,
      { $set: { profile_picture: profilePath } },
      { runValidators: true }
    );

    const profilePictureUrl = buildImageUrl(req.baseUrlFull, upload.profile, profilePath);

    return response.success(res,oldProfile ? "Profile picture updated successfully" : "Profile picture uploaded successfully",
      { profile_picture: profilePictureUrl }
    );

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    if (!user.profile_picture) {
      return response.error(res, 400, "Profile picture does not exist");
    }

    deleteFile(upload.profile, user.profile_picture);

    await User.findByIdAndUpdate(
      user_id,
      { $set: { profile_picture: null } },
      { runValidators: true }
    );

    return response.success(res, "Profile picture deleted successfully");

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

