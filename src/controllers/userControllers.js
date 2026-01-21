// const db = require("../config/db");
// // const User = require("../models/User");
// const Joi = require("joi");
// const fs = require("fs");
// const path = require("path");
// const sequelize = require("../config/sequelize");

const response = require("../common/response");
const { deleteFile } = require("../common/deleteImage.helper"); 
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");
const {Op} = require("sequelize");
const sequelize = require("../config/sequelize");
// const UserEducation = require("../models/User_Education");
const { User, UserEducation,Experience, Project} = sequelize.models;


//Get all users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const rows = await User.findAll({
      
//       include:[{
//         model : UserEducation,
//         as: "educations",
//         attributes : {exclude : ["user_id"]},
//         separate: true,
//         required: false, 
//       },
//       {
//         model: Experience,
//         as: "experiences",
//         separate: true,
//         required: false,
//         attributes:{exclude:["user_id"]},    
//         include:{
//           model: Project,
//           as: "projects",
//           separate: true, 
//           required:false, 
//           attributes:{exclude:["exp_id","project_id"]}         
//         }
//       }],
//       logging : console.log
//     });

//     if (!rows || rows.length === 0) {
//       return response.error(res, 404, "No users found");
//     }

//     const users = rows.map(user => ({
//       ...user.toJSON(), // convert Sequelize object to plain JS
//       profile_picture: buildImageUrl(req.baseUrlFull, upload.profile,user.profile_picture)
//     }));

//     return response.success(res, "Users fetched successfully", users);
//   }
//   catch (error) {
//     console.error(error);
//     return response.error(res, 500, "Internal server error");
//   }
// };


exports.getAllUsers = async (req, res) => {
  try {

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const isPagination = !isNaN(page) && !isNaN(limit);

    const search = req.query.search?.trim();

    const sortBy = req.query.sortBy || "user_id";
    const order = req.query.order === "ASC" ? "ASC" : "DESC";

    const sortableFields = ["user_id", "name", "email", "role", "joining_date"];
    const safeSortBy = sortableFields.includes(sortBy) ? sortBy : "user_id";

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("User.name")),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("User.email")),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("User.role")),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
        ],
      };
    }

    const queryOptions = {
      distinct: true,
      where: whereCondition,
      order: [[safeSortBy, order]], 

      include: [
        {
          model: UserEducation,
          as: "educations",
          attributes: { exclude: ["user_id"] },
          separate: true,
          required: false,
        },
        {
          model: Experience,
          as: "experiences",
          attributes: { exclude: ["user_id"] },
          separate: true,
          required: false,
          include: [
            {
              model: Project,
              as: "projects",
              attributes: { exclude: ["exp_id", "project_id"] },
              separate: true,
              required: false,
            },
          ],
        },
      ],
    };

    if (isPagination) {
      queryOptions.limit = limit;
      queryOptions.offset = (page - 1) * limit;
    }

    const { count, rows } = await User.findAndCountAll(queryOptions);

    if (!rows || rows.length === 0) {
      return response.error(res, 404, "No users found");
    }

    const users = rows.map(user => ({
      ...user.toJSON(),
      profile_picture: buildImageUrl(
        req.baseUrlFull,
        upload.profile,
        user.profile_picture
      ),
    }));

    if (isPagination) {
      return response.success(res, "Users fetched successfully", {
        users,
        pagination: {
          totalUsers: count,
          currentPage: page,
          pageSize: limit,
          totalPages: Math.ceil(count / limit),
          hasNextPage: page * limit < count,
          hasPrevPage: page > 1,
        },
      });
    }

    return response.success(res, "Users fetched successfully", users);

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};


//Get user by id
exports.getUserById = async(req, res) => {
  try{
    const {user_id} = req.params;   //Url me se user_id extract krna
    const user = await User.findOne({
      where: { user_id },
      include:[{
        model : UserEducation,
        as: "educations",
        attributes : {exclude : ["user_id"]},
        separate: true,
        required: false, 
      },
      {
        model: Experience,
        as: "experiences",
        separate: true,
        required: false,
        attributes:{exclude:["user_id"]},    
        include:[{
          model: Project,
          as: "projects",
          separate: true, 
          required:false, 
          attributes:{exclude:["exp_id","project_id"]}         
        }]
      }],
    });   
    if(!user){
      return response.error(res,404,`No user with ID ${user_id} is available.`)
    }

    const userData = {
      ...user.toJSON(),
      profile_picture: buildImageUrl(req.baseUrlFull,upload.profile, user.profile_picture)
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
    deleteFile(upload.profile, profile_picture);
    return response.error(res, 409, "Email already exists");
    }

    const newUser = await User.create({name,email,phone,role,
    joining_date,profile_picture});

    return response.created(res, "User created successfully", {user_id: newUser.user_id});

    } catch (err) {
      console.error(err);
      return response.error(res, 500, "Internal server error");
    }
}; 
  
//Update Users
exports.updateUser = async (req,res) =>{
  try{

    const { user_id }= req.params;
    const updateData = req.body || {};

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

    deleteFile(upload.profile,user.profile_picture);

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

    deleteFile(upload.profile,oldProfile);

    const ProfilePath = req.file.filename;

    await User.update(
      { profile_picture: ProfilePath},
      { where: { user_id } }
    );

    const profilePictureUrl = buildImageUrl(req.baseUrlFull, upload.profile, ProfilePath);

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

    deleteFile(upload.profile, user.profile_picture);

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