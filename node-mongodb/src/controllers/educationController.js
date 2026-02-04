const UserEducation = require("../models/UserEducation.model");
const User = require("../models/User.model");
const response = require("../common/response");
const { deleteFile } = require("../common/deleteImage.helper");
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");
const Subjects = require("../models/Subjects.model");
const buildQueryFeatures = require("../common/queryFeatures");


//Add education
exports.addEducation = async(req,res) => {
    try{
        const {user_id} = req.params;

        const user = await User.findById(user_id);

        if(!user){
            return response.error(res,404,"User not found.");
        }

        const {education_level,institution_name,passing_year,percentage} = req.body;

        const degree_picture = req.file ? req.file.filename : null;

        const education = await UserEducation.create({
            user_id, education_level, institution_name, passing_year, percentage, degree_picture
        });

        return response.created(res,"Education added successfully",{education_id : education.id});
    }
    catch(error){
        console.error(error);
        return response.error(res,500,"Internal server error");
    }
};

//Get education
exports.getUserEducation = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
      return response.error(res, 404, "User not found");
    }

    const { query, pagination } = buildQueryFeatures({
      model: UserEducation,queryParams: req.query,baseFilter: { user_id },searchFields: ["education_level", "institution_name"],
      populate: ["subjects"]
    });

    const educations = await query;

    if (!educations || educations.length === 0) {
      return response.success(res, "No education details found for the user", {education: [],pagination});
    }

    const result = educations.map(item => ({
      ...item.toObject(),degree_picture: buildImageUrl(req.baseUrlFull,
        upload.degree,item.degree_picture)
    }));

    return response.success(res, "Education details fetched successfully!", {education: result,pagination});

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Update education
  exports.updateEducation = async (req, res) => {
    try {
      const { education_id } = req.params;
      const updateData = req.body || {};
 
      if (Object.keys(updateData).length === 0) {
        return response.error(res, 400, "No data provided to update");
      }

      const education = await UserEducation.findById(education_id);
  
      if (!education) {
        return response.error(res, 404, "Education record not found");
      }

      await UserEducation.findByIdAndUpdate(
        education_id,
        { $set: updateData },
        { runValidators: true }
      );
  
      return response.success(res, "Education updated successfully");
  
    } catch (err) {
      console.error(err);
      return response.error(res, 500, "Internal server error");
    }
  };
  
  //Delete education + degree
  exports.deleteEducation = async (req, res) => {
    try {
      const { education_id } = req.params;
  
      const education = await UserEducation.findById(education_id);
  
      if (!education) {
        return response.error(res, 404, "Education record not found");
      }
  
      if (education.degree_picture) {
        deleteFile(upload.degree, education.degree_picture);
      }

      await UserEducation.findByIdAndDelete(education_id);
  
      return response.success(res, "Education deleted successfully");
  
    } catch (err) {
      console.error(err);
      return response.error(res, 500, "Internal server error");
    }
};

//Upload or update degree
exports.uploadDegreePicture = async (req, res) => {
    try {
      const { education_id } = req.params;
 
      if (!req.file) {
        return response.error(res, 400, "Degree picture is required");
      }

      const education = await UserEducation.findById(education_id);
  
      if (!education) {
        deleteFile(upload.degree, req.file.filename);
        return response.error(res, 404, "Education record not found");
      }

      const oldDegree = education.degree_picture;
      if (oldDegree) {
        deleteFile(upload.degree, oldDegree);
      }

      const degreePath = req.file.filename;
  
      await UserEducation.findByIdAndUpdate(
        education_id,
        { $set: { degree_picture: degreePath } },
        { runValidators: true }
      );

      const degreePictureUrl = buildImageUrl(req.baseUrlFull,upload.degree,degreePath);
  
      return response.success(
        res, oldDegree ? "Degree picture updated successfully" : "Degree picture uploaded successfully",{ degree_picture: degreePictureUrl }
      );
  
    } catch (error) {
      console.error(error);
      return response.error(res, 500, "Internal server error");
    }
  };

//Delete degree
  exports.deleteDegreePicture = async (req, res) => {
    try {
      const { education_id } = req.params;
 
      const education = await UserEducation.findById(education_id);
  
      if (!education) {
        return response.error(res, 404, "Education record not found");
      }
  
      if (!education.degree_picture) {
        return response.error(res, 400, "Degree picture does not exist");
      }
  
      deleteFile(upload.degree, education.degree_picture);
  
      await UserEducation.findByIdAndUpdate(
        education_id,
        { $set: { degree_picture: null } },
        { runValidators: true }
      );
  
      return response.success(res, "Degree picture deleted successfully");
  
    } catch (error) {
      console.error(error);
      return response.error(res, 500, "Internal server error");
    }
  };