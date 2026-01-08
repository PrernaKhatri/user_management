const db = require("../config/db");
const response = require("../common/response");
const Joi = require("joi");
const path = require("path");
const fs = require("fs");

//Get education
exports.getUserEducation = async(req,res) =>{
  try{

    const user_id = req.params.user_id;

    if(!user_id||isNaN(user_id)){
      return response.error(res,400,"Invalid user ID");
    }
    const[user] = await db.execute("Select user_id from users where user_id = ?",[user_id]);

    if(user.length === 0){
      return response.error(res,404,"User not found");
    }

    const query = "select * from user_education where user_id = ?";

    const [education] = await db.execute(query,[user_id]);

    if(education.length === 0){
      return response.success(res,"No education details found for the user",[]);
    }

    return response.success(res,"Education details fetched successfully!",education);
  }
  catch(err){
    console.error(err);
    return response.error(res,500,"Internal server error")
  }
}

//Add education
const educationSchema = Joi.object({
  education_level : Joi.string().trim().min(2).required(),
  institution_name : Joi.string().trim().min(2).required(),
  passing_year : Joi.number().integer().max(new Date().getFullYear()).required(),
  percentage : Joi.number().min(0).max(100).required()
})

exports.addEducation = async(req,res) =>{
  try{
    const user_id = req.params.user_id;

    if(!user_id || isNaN(user_id)){
      return response.error(res,400,"Invalid user id");
    }

    const [user] = await db.execute("select user_id from users where user_id = ?",[user_id]);

    if(user.length === 0){
      return response.error(res,404,"User not found.");
    }

    const {error,value} = educationSchema.validate(req.body,{
      abortEarly:false
    });

    if(error){
      const messages = error.details.map(d => d.message);
      return response.error(res,400,messages);
    }

    const{education_level,institution_name,passing_year,percentage} = value;

    const insertQuery = `Insert into user_education(user_id,education_level, institution_name, passing_year, percentage) values(?,?,?,?,?)`;

    const [result] = await db.execute(insertQuery,[user_id,
    education_level,institution_name,passing_year,percentage ||null]);

    return response.created(res,"Education added sucessfully",{education_id: result.insertId});
  }
  catch(err){
    console.error(err);
    return response.error(res,500,"Internal server error");
  }
}

//Update education
const allowedFields = ["education_level", "institution_name", "passing_year","percentage"];

const updateEducationSchema = Joi.object({
  education_level: Joi.string().trim().min(2).optional(),
  institution_name: Joi.string().trim().min(2).optional(),
  passing_year: Joi.number().integer().max(new Date().getFullYear()).optional(),
  percentage: Joi.number().min(0).max(100).optional()
}).unknown(false);

exports.updateEducation = async (req, res) => {
  try {
    const { education_id } = req.params;

    if (!education_id || isNaN(education_id)) {
      return response.error(res, 400, "Invalid education id");
    }

    const [existing] = await db.execute("SELECT education_id FROM user_education WHERE education_id = ?",[education_id]);

    if (existing.length === 0) {
      return response.error(res, 404, "Education record not found");
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return response.error(res, 400, "No fields provided to update");
    }

    const invalidFields = Object.keys(req.body).filter(
      key => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {return response.error(res,400,
    invalidFields.map(f => `Invalid field: ${f}`));
    }

    const { error, value } = updateEducationSchema.validate(req.body, {
      abortEarly: true
    });

    if (error) {const messages = error.details.map(d =>d.message);
    return response.error(res, 400, messages);
    }

    const fields = [];
    const values = [];

    Object.keys(value).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(value[key]);
    });

    const updateQuery = `UPDATE user_education SET ${fields.join(", ")} WHERE education_id = ?`;

    await db.execute(updateQuery, [...values, education_id]);

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

    if (!education_id || isNaN(education_id)) {
      return response.error(res, 400, "Invalid education id");
    }

    const [result] = await db.execute(
      "DELETE FROM user_education WHERE education_id = ?",
      [education_id]
    );

    if (result.affectedRows === 0) {
      return response.error(res, 404, "Education record not found");
    }

    return response.success(res, "Education deleted successfully");

  } catch (err) {
    console.error(err);
    return response.error(res, 500, "Internal server error");
  }
};

//Uploads degree :
exports.uploadDegreePicture = async (req, res) => {
  try {
    const { user_id, education_id } = req.params;

    if (!user_id || isNaN(user_id)) {
      return response.error(res, 400, "Invalid user id");
    }

    if (!education_id || isNaN(education_id)) {
      return response.error(res, 400, "Invalid education id");
    }

    if (!req.file) {
      return response.error(res, 400, "Degree picture is required");
    }

    const [rows] = await db.execute(
      "SELECT degree_picture FROM user_education WHERE education_id = ? AND user_id = ?",[education_id, user_id]
    );

    if (rows.length === 0) {
      return response.error(res, 404, "Education record not found");
    }

    const oldDegreePicture = rows[0].degree_picture;

    if (oldDegreePicture) {
      const oldPath = path.join(__dirname, "..", oldDegreePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, err => {
          if (err) console.error("Old degree delete error:", err.message);
        });
      }
    }

    const newDegreePath = `uploads/degree_pictures/${req.file.filename}`;

    await db.execute(`UPDATE user_education SET degree_picture = ?
       WHERE education_id = ? AND user_id = ?`,[newDegreePath, education_id, user_id]);

    return response.success(
      res,oldDegreePicture? "Degree picture updated successfully"
        : "Degree picture uploaded successfully",{ degree_picture: newDegreePath }
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

    if (!user_id || isNaN(user_id)) {
      return response.error(res, 400, "Invalid user id");
    }

    if (!education_id || isNaN(education_id)) {
      return response.error(res, 400, "Invalid education id");
    }

    const [rows] = await db.execute(
      `SELECT degree_picture
       FROM user_education
       WHERE education_id = ? AND user_id = ?`,
      [education_id, user_id]
    );

    if (rows.length === 0) {
      return response.error(res, 404, "Education record not found");
    }

    const degreePicture = rows[0].degree_picture;

    if (!degreePicture) {
      return response.error(res, 400, "Degree picture does not exist");
    }

    const filePath = path.join(__dirname, "..", "upload","degree_pictures",path.basename(degreePicture));

    if (fs.existsSync(filePath)) {
      // fs.unlink(filePath, (err) => {
      //   if (err) {
      //     console.error("Degree picture delete error:", err.message);
      //   }
      // });
      fs.unlinkSync(filePath);
    }

    await db.execute(
      `UPDATE user_education
       SET degree_picture = NULL
       WHERE education_id = ? AND user_id = ?`,
      [education_id, user_id]
    );

    return response.success(res, "Degree picture deleted successfully");
  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};
