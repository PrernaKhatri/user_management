// console.log("Education routes loaded");

const express = require("express");
const router = express.Router();
const educationController = require("../controllers/educationController");
const {createEducationSchema,updateEducationSchema,userIdParamSchema,educationIdParamSchema,userEducationParamSchema 
} = require("../common/validations/education.validation");
const validate = require("../middleware/validate.middleware");
const createUploader = require("../middleware/upload.middleware");

const uploadDegreePicture = createUploader({
    folder: "degree_pictures",
    fieldName : "degree_picture"
});

// Get all education of a user
router.get("/users/:user_id/education", educationController.getUserEducation);

// Add education 
router.post("/users/:user_id/education",validate(userIdParamSchema, "params"),validate(createEducationSchema,"body"),
educationController.addEducation);

// Update education
router.patch(
  "/education/:education_id",validate(educationIdParamSchema, "params"),validate(updateEducationSchema),educationController.updateEducation);

// Delete education
router.delete("/education/:education_id", educationController.deleteEducation);

//Upload/Update degree picture
router.patch(
  "/education/:education_id/degree_picture",
  validate(educationIdParamSchema, "params"),
  uploadDegreePicture,
  educationController.uploadDegreePicture
);

// Delete degree picture only
router.delete(
  "/users/:user_id/education/:education_id/degree_picture",
  educationController.deleteDegreePicture
);

module.exports = router;