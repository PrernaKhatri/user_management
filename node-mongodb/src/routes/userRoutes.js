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

//Add user
router.post("/users", uploadProfilePicture, validate(createUserSchema),userController.addUser);


module.exports = router;