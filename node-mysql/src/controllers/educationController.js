const UserEducation = require("../models/UserEducation");
const User = require("../models/User");
const response = require("../common/response");
const { deleteFile } = require("../common/deleteImage.helper");
const { buildImageUrl } = require("../common/fileUrl.helper");
const upload = require("../common/uploadConstants");
const {Op} = require("sequelize");
const sequelize = require("../config/sequelize");
const {models} = sequelize;

//Get education
exports.getUserEducation = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const search = req.query.search?.trim();
    const sortBy = req.query.sortBy || "passing_year";
    const order = req.query.order === "ASC" ? "ASC" : "DESC";

    const sortableFields = ["education_id","passing_year","percentage"];

    const safeSortBy = sortableFields.includes(sortBy)? sortBy : "passing_year";

    const user = await models.User.findOne({
      where: { user_id },
    });

    if (!user) {
      return response.error(res, 404, "User not found");
    }

    let whereCondition = {[Op.and]: [{ user_id }]};

    if (search) {
      whereCondition[Op.and].push({
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("education_level")),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("institution_name")),
            { [Op.like]: `%${search.toLowerCase()}%` }
          ),
        ],
      });
    }

    const education = await models.UserEducation.findAll({
      where: whereCondition,
      order: [[safeSortBy, order]],
      include: [
        {
          model: models.Subject,
          as: "subjects",
          attributes: { exclude: ["education_id"] },
          separate: true,
          required: false,
        },
      ],
    });

    if (!education || education.length === 0) {
      return response.success(res,"No education details found for the user",[]);
    }

    const result = education.map(item => ({
      ...item.toJSON(),
      degree_picture: buildImageUrl(
        req.baseUrlFull,
        upload.degree,
        item.degree_picture
      ),
    }));

    return response.success(res,"Education details fetched successfully!",result);

  } catch (err) {
    console.error(err);
    return response.error(res, 500, "Internal server error");
  }
};

//Add education
exports.addEducation = async(req,res) =>{
  try{
    const {user_id} = req.params;

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

    deleteFile(upload.degree,education.degree_picture);

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

    const oldDegree = education.degree_picture;

    deleteFile(upload.degree,oldDegree);

    const degreePath = req.file.filename;

    await UserEducation.update(
      { degree_picture: degreePath },
      { where: { education_id } }
    );


    const degreePictureUrl = buildImageUrl(
      req.baseUrlFull,upload.degree,degreePath
    );

    return response.success(
      res,oldDegree? "Degree picture updated successfully"
        : "Degree picture uploaded successfully",{ degree_picture: degreePictureUrl }
    );
  } catch (error) {
    return response.error(res, 500, "Internal server error");
  }
};

//Delete degree
exports.deleteDegreePicture = async (req, res) => {
  try {
    const { education_id } = req.params;

    const education = await UserEducation.findOne({
      where: {
        education_id
      }
    });

    if (!education) {
      return response.error(res, 404, "Education record not found");
    }
    
    if (!education.degree_picture) {
      return response.error(res, 400, "Degree picture does not exist");
    }

    deleteFile(upload.degree,education.degree_picture);

    await UserEducation.update(
      { degree_picture: null },
      {
        where: {
          education_id
        }
      }
    );

    return response.success(res, "Degree picture deleted successfully");
  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};
