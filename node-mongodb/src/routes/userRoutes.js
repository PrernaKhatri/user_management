const express = require("express");
const router = express.Router();
const createUploader = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");
const userController = require("../controllers/userController");
const {createUserSchema,updateUserSchema,
  userIdParamSchema} = require("../common/validations/user.validation");

const uploadProfilePicture = createUploader({
    folder: "profile_pictures",
    fieldName : "profile_picture"
});

//Get all users
router.get("/users", userController.getAllUsers);

//Get user by id
router.get("/users/:user_id", validate(userIdParamSchema, "params"),userController.getUserById);

//Add user
router.post("/users", uploadProfilePicture, validate(createUserSchema),userController.addUser);

//Update user
router.put("/users/:user_id", validate(userIdParamSchema, "params"),
  validate(updateUserSchema),userController.updateUser);

//Delete user
router.delete("/users/:user_id", validate(userIdParamSchema, "params"),userController.deleteUser);

//Update profile
router.put("/users/:user_id/profile_picture",uploadProfilePicture,userController.updateProfilePicture);

//Delete Profile
router.delete("/users/:user_id/profile_picture",validate(userIdParamSchema, "params"),userController.deleteProfilePicture);

module.exports = router;


module.exports = router;