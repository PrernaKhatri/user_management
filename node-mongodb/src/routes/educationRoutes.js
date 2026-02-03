const express = require("express");
const router = express.Router();
const educationController = require("../controllers/educationController");
const {
  createEducationSchema,
  updateEducationSchema,
  userIdParamSchema,
  educationIdParamSchema,
  userEducationParamSchema
} = require("../common/validations/education.validation");
const validate = require("../middleware/validate.middleware");
const createUploader = require("../middleware/upload.middleware");

const uploadDegreePicture = createUploader({
    folder: "degree_pictures",
    fieldName : "degree_picture"
});

// Add education 
router.post("/users/:user_id/education",validate(userIdParamSchema, "params"),validate(createEducationSchema),uploadDegreePicture,
educationController.addEducation);

//Get education 
router.get("/users/:user_id/education", validate(userIdParamSchema, "params"),educationController.getUserEducation);

//Update education
router.put(
    "/education/:education_id",validate(educationIdParamSchema, "params"),validate(updateEducationSchema),educationController.updateEducation);
  
// Delete education
router.delete("/education/:education_id", educationController.deleteEducation);

//Upload or update degree
router.put("/education/:education_id/degree_picture",validate(educationIdParamSchema, "params"),uploadDegreePicture,educationController.uploadDegreePicture);

// Delete degree picture only
router.delete("/education/:education_id/degree_picture",educationController.deleteDegreePicture);
  
module.exports = router;