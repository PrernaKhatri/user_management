const db = require("../config/db");
const response = require("../common/response");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");

//Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const query = "SELECT * FROM users";
    const [rows] = await db.execute(query);
    if (rows.length === 0) {
      return response.error(res, 404, "No users found");
    }
    return response.success(res,"Users fetched successfully",rows);
  } 
  catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//Get user by id
exports.getUserById = async(req, res) => {
  try{
    const user_id = req.params.user_id; //Url me se user_id extract krna
    if(!user_id || isNaN(user_id)){
      return response.error(res,400,"Invalid user id");
    }
    const query = "select * from users where user_id = ?";
    const [rows] = await db.execute(query,[user_id]);

    if(rows.length == 0){
      return response.error(res,404,`No user with ID ${user_id} is available.`)
    }
    return response.success(res,`Data fetched for user ${user_id}.`,rows[0]); //Here, we have used users[0] because if we use 'users' only, then it will return output in the form of array with one object but for single entry frontend does not expect an array.
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
    const [existingUser] = await db.execute("SELECT user_id FROM users WHERE email = ?",[email]);
    if (existingUser.length > 0) {
    return response.error(res, 409, "Email already exists");
    }
    const insertQuery = `INSERT INTO users (name, email, phone, role, joining_date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(insertQuery, [name,email,phone,role,joining_date]);
    return response.created(res, "User created successfully", {user_id: result.insertId});
    } catch (err) {
      console.error(err);
      return response.error(res, 500, "Internal server error");
    }
};
  
//Update Users
exports.updateUser = async (req,res) =>{
  try{

    const { user_id }= req.params;
    const updateData = req.body;

    const fields = [];
    const values = [];

     Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    const updateQuery = `UPDATE users set ${fields.join(", ")} where user_id = ?`;

    const [result] = await db.execute(updateQuery,[...values,user_id]);

    if(result.affectedRows === 0){
      return response.error(res,404,"User not found");
    }
    return response.success(res,"User updated successfully");
  }
  catch(err){
      console.error(err);
      return response.error(res,500,"Internal server error")
  }
};

//To delete the user
const { deleteProfilePictureFile } = require("../common/deleteProfile.helper");
exports.deleteUser = async (req, res) => {
  try {
    const {user_id} = req.params;

    const [users] = await db.execute("select profile_picture FROM users WHERE user_id = ?",[user_id]);

    if (users.length === 0) {
      return response.error(res, 404, "User not found");
    }

    deleteProfilePictureFile(users[0].profile_picture);

    await db.execute(
      "DELETE FROM users WHERE user_id = ?",
      [user_id]
    );
    return response.success(res, "User deleted successfully");

  } catch (error) {
    console.error(error);
    return response.error(res, 500, "Internal server error");
  }
};

//To update a profile picture
exports.updateProfilePicture = async(req,res) => {
  try{
  
    const{user_id} = req.params;
    if (!user_id || isNaN(user_id)) {
    return response.error(res, 400, "Invalid user id");
    }    

    if (!req.file) {
      return response.error(res,400,"Profile picture is required");
    }

     const [users] = await db.execute(
      "SELECT profile_picture FROM users WHERE user_id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return response.error(res,404,"User not found");
    }

    const oldProfile = users[0].profile_picture;

       if (oldProfile) {
      const oldPath = path.join(__dirname, "..", oldProfile);

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) {
            console.error("Error deleting old profile:", err.message);
          }
        });
      }
    }
    const newProfilePath = `uploads/profile_pictures/${req.file.filename}`;
    await db.execute("UPDATE users SET profile_picture = ? WHERE user_id= ?",[newProfilePath, user_id]);

    return response.success(res,oldProfile? "Profile picture updated successfully": "Profile picture uploaded successfully",{
        profile_picture: newProfilePath}
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

    const [users] = await db.execute("SELECT profile_picture FROM users WHERE user_id = ?",[user_id]);

     if (users.length === 0) {
      return response.error(res, 404, "User not found");
    }
    
    if (!users[0].profile_picture) {
      return response.error(res, 400, "Profile picture does not exist");
    }

    deleteProfilePictureFile(users[0].profile_picture);

    await db.execute("UPDATE users SET profile_picture = NULL WHERE user_id = ?",[user_id]);

     return response.success(res,"Profile picture deleted successfully");
  }
  catch(error){
    console.error(error);
    return response.error(res,500,"Internal server error");
  }
};