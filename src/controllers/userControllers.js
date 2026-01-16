// const db = require("../config/db");
const User = require("../models/User");
const response = require("../common/response");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");
const { deleteProfilePictureFile } = require("../common/deleteProfile.helper");
const { buildImageUrl } = require("../common/fileUrl.helper");
const sequelize = require("../config/sequelize");
console.log("USER MODEL:", User);
const upload = require("../common/uploadConstants");

//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const rows = await User.findAll();

    if (!rows || rows.length === 0) {
      return response.error(res, 404, "No users found");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const users = rows.map(user => ({
      ...user.toJSON(), // convert Sequelize object to plain JS
      profile_picture: buildImageUrl(baseUrl, upload.profile,user.profile_picture)
    }));

    return response.success(res, "Users fetched successfully", users);
  } 
  catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Get user by id
// const baseUrl = `${req.protocol}://${req.get("host")}`;
exports.getUserById = async(req, res) => {
  try{
    const user_id = req.params.user_id; //Url me se user_id extract krna
    // if(!user_id || isNaN(user_id)){
    //   return response.error(res,400,"Invalid user id");
    // }
    // const query = "select * from users where user_id = ?";
    // const [rows] = await db.execute(query,[user_id]);

    const user = await User.findOne({
      where: { user_id }
    });
    if(!user){
      return response.error(res,404,`No user with ID ${user_id} is available.`)
    }

    // const user = rows[0];
    
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // user.profile_picture = buildImageUrl(baseUrl,user.profile_picture);
    const userData = {
      ...user.toJSON(),
      profile_picture: buildImageUrl(baseUrl,upload.profile, user.profile_picture)
    };

    return response.success(res,`Data fetched for user ${user_id}.`,userData); 
  } 
  catch(error){
    console.log(error);
    return response.error(res,500,"Internal server error.");
  }
};

//Add user
exports.addUser = async(req,res) =>{
  try{
    
    const{name,email,phone,role,joining_date} = req.body;

    const profile_picture = req.file ? req.file.filename : null;

    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
    deleteProfilePictureFile(profile_picture);
    return response.error(res, 409, "Email already exists");
    }

    const newUser = await User.create({name,email,phone,role,
    joining_date,profile_picture});

    // const insertQuery = `INSERT INTO users (name, email, phone, role, joining_date, profile_picture) VALUES (?, ?, ?, ?, ?, ?)`;

    // const [result] = await db.execute(insertQuery, [name,email,phone,role,joining_date, profile_picture]);

    return response.created(res, "User created successfully", {user_id: newUser.user_id});

    } catch (err) {
      deleteProfilePictureFile(req.file?.filename);
      console.error(err);
      return response.error(res, 500, "Internal server error");
    }
};
  
//Update Users
exports.updateUser = async (req,res) =>{
  try{

    const { user_id }= req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return response.error(res, 400, "No data provided to update");
    }

    const user = await User.findOne({
      where: { user_id }
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    await User.update(updateData, {
      where: { user_id }
    });

    return response.success(res,"User updated successfully");
    
  }
  catch(err){
      console.error(err);
      return response.error(res,500,"Internal server error")
  }
};

//To delete the user
exports.deleteUser = async (req, res) => {
  try {
    const {user_id} = req.params;

    const user = await User.findOne({
      where: { user_id }
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    deleteProfilePictureFile(user.profile_picture);

    await User.destroy({
      where: { user_id }
    });

    return response.success(res, "User deleted successfully");
  } 
  catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//To update a profile picture
exports.updateProfilePicture = async(req,res) => {
  try{
  
    const{user_id} = req.params;
    // if (!user_id || isNaN(user_id)) {
    // return response.error(res, 400, "Invalid user id");
    // }    

    if (!req.file) {
      return response.error(res,400,"Profile picture is required");
    }

    const user = await User.findOne({
      where: { user_id }
    });

    if (!user) {
      return response.error(res,404,"User not found");
    }

    const oldProfile = user.profile_picture;

    deleteProfilePictureFile(oldProfile);

    const ProfilePath = req.file.filename;

    await User.update(
      { profile_picture: ProfilePath},
      { where: { user_id } }
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profilePictureUrl = buildImageUrl(baseUrl, upload.profile, ProfilePath);

    // const profilePictureUrl = getFileUrl(req,newProfilePath);
    return response.success(res,oldProfile? "Profile picture updated successfully": "Profile picture uploaded successfully",{
        profile_picture: profilePictureUrl}
    );
  }
  catch(error){
    return response.error(res,500,"Internal server error");
  }
}

//Delete profile picture
exports.deleteProfilePicture = async(req,res) => {
  try{
    const{user_id} = req.params;

    const user = await User.findOne({
      where: { user_id }
    });

     if (!user) {
      return response.error(res, 404, "User not found");
    }
    
    if (!user.profile_picture) {
      return response.error(res, 400, "Profile picture does not exist");
    }

    deleteProfilePictureFile(user.profile_picture);

    await User.update(
      { profile_picture: null },
      { where: { user_id } }
    );

     return response.success(res,"Profile picture deleted successfully");
  }
  catch(error){
    console.error(error);
    return response.error(res,500,"Internal server error");
  }
};