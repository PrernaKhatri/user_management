// const db = require("../config/db");
const UserEducation = require("../models/User_Education");
const User = require("../models/User");
const response = require("../common/response");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");
const { deleteDegreePictureFile } =
  require("../common/deleteDegree.helper");
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");


//Get education
exports.getUserEducation = async(req,res) =>{
  try{

    const user_id = req.params.user_id;

    // if(!user_id||isNaN(user_id)){
    //   return response.error(res,400,"Invalid user ID");
    // }
    const user = await User.findOne({
      where: { user_id }
    });

    if(!user){
      return response.error(res,404,"User not found");
    }

    const education = await UserEducation.findAll({
      where: { user_id }
    });

    // const query = "select * from user_education where user_id = ?";

    // const [education] = await db.execute(query,[user_id]);

    if(!education ||education.length === 0){
      return response.success(res,"No education details found for the user",[]);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const result = education.map(item =>({
      ...item.toJSON(),
      degree_picture: buildImageUrl(baseUrl,upload.degree,item.degree_picture)
    }));

    return response.success(res,"Education details fetched successfully!",result);
  }
  catch(err){
    console.error(err);
    return response.error(res,500,"Internal server error")
  }
}

//Add education
exports.addEducation = async(req,res) =>{
  try{
    const {user_id} = req.params;

    // if (!req.body) {
    //   return response.error(res, 400, "Request body is missing");
    // }

    const user = await User.findOne({
      where: { user_id }
    });

    if(!user){
      return response.error(res,404,"User not found.");
    }

    const{education_level, institution_name, passing_year, percentage} = req.body;

    const degree_picture = req.file ? req.file.filename : null;

    const education = await UserEducation.create({user_id,
    education_level,institution_name,passing_year,percentage,degree_picture});

    return response.created(res,"Education added sucessfully",{education_id: education.education_id});
  }
  catch(err){
    console.error(err);
    return response.error(res,500,"Internal server error");
  }
}

//Update education
exports.updateEducation = async (req, res) => {
  try {
    const { education_id } = req.params;
    const updateData = req.body;

    const education = await UserEducation.findOne({
      where: { education_id }
    });

    if (!education) {
      return response.error(res, 404, "Education record not found");
    }

    await UserEducation.update(updateData, {
      where: { education_id }
    });

    return response.success(res, "Education updated successfully");

  } catch (err) {
    console.error(err);
    return response.error(res, 500, "Internal server error");
  }
};

//Delete education 
exports.deleteEducation = async (req, res) => {
  try {
    const { education_id } = req.params;

    const education = await UserEducation.findOne({
      where: { education_id }
    });

    if (!education) {
      return response.error(res, 404, "Education record not found");
    }

    deleteDegreePictureFile(education.degree_picture);

    await UserEducation.destroy({
      where: { education_id }
    });

    return response.success(res, "Education deleted successfully");

  } catch (err) {
    console.error(err);
    return response.error(res, 500, "Internal server error");
  }
};

//Uploads degree :
exports.uploadDegreePicture = async (req, res) => {
  try {
    const {education_id } = req.params;

    if (!req.file) {
      return response.error(res, 400, "Degree picture is required");
    }

    const education = await UserEducation.findOne({
      where: { education_id }
    });

    if (!education) {
      return response.error(res, 404, "Education record not found");
    }

    const oldDegreePicture = education.degree_picture;

    deleteDegreePictureFile(oldDegreePicture);

    await UserEducation.update(
      { degree_picture: req.file.filename },
      { where: { education_id } }
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const degreePictureUrl = buildImageUrl(
      baseUrl,upload.degree,req.file.filename
    );

    // const newDegreePath = `uploads/degree_pictures/${req.file.filename}`;

    // await db.execute(`UPDATE user_education SET degree_picture = ?
    //    WHERE education_id = ?`,[newDegreePath, education_id]);

    return response.success(
      res,oldDegreePicture? "Degree picture updated successfully"
        : "Degree picture uploaded successfully",{ degree_picture: degreePictureUrl }
    );
  } catch (error) {
    // console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Delete degree
exports.deleteDegreePicture = async (req, res) => {
  try {
    const { user_id, education_id } = req.params;

    const education = await UserEducation.findOne({
      where: {
        education_id,
        user_id
      }
    });

    if (!education) {
      return response.error(res, 404, "Education record not found");
    }
    
    if (!education.degree_picture) {
      return response.error(res, 400, "Degree picture does not exist");
    }

    // if (rows.length === 0) {
    //   return response.error(res, 404, "Education record not found");
    // }

    deleteDegreePictureFile(education.degree_picture);

    await UserEducation.update(
      { degree_picture: null },
      {
        where: {
          education_id,user_id
        }
      }
    );

    return response.success(res, "Degree picture deleted successfully");
  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};
