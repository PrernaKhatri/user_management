const express = require("express");
const router = express.Router();
const createUploader = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");
const userController = require("../controllers/userControllers");
const {createUserSchema,updateUserSchema,
  userIdParamSchema} = require("../common/validations/user.validation");

const uploadProfilePicture = createUploader({
    folder: "profile_pictures",
    fieldName : "profile_picture"
});

router.get("/users", userController.getAllUsers);

router.get("/users/:user_id", userController.getUserById);

router.post("/users", validate(createUserSchema),userController.addUser);

router.patch("/users/:user_id", validate(userIdParamSchema, "params"),
  validate(updateUserSchema, "body"),userController.updateUser);

router.delete("/users/:user_id", validate(userIdParamSchema, "params"),userController.deleteUser);

router.patch("/users/:user_id/profile_picture",uploadProfilePicture,userController.updateProfilePicture);

router.delete("/users/:user_id/profile_picture",validate(userIdParamSchema, "params"),userController.deleteProfilePicture);

module.exports = router;