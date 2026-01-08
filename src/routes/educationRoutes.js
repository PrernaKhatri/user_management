// console.log("education route is running")

const express = require("express");
const router = express.Router();

const educationController = require("../controllers/educationController");

const createUploader = require("../middleware/upload.middleware");

const uploadDegreePicture = createUploader({
    folder: "degree_pictures",
    fieldName : "degree_picture"
});

// Get all education of a user
router.get("/users/:user_id/education", educationController.getUserEducation);

// Add education 
router.post("/users/:user_id/education", educationController.addEducation);

// Update education
router.patch("/education/:education_id", educationController.updateEducation);

// Delete education
router.delete("/education/:education_id", educationController.deleteEducation);

//Uplooad/Update degree picture
router.patch(
  "/users/:user_id/education/:education_id/degree_picture",
  uploadDegreePicture,
  educationController.uploadDegreePicture
);

// Delete degree picture only
router.delete(
  "/users/:user_id/education/:education_id/degree_picture",
  educationController.deleteDegreePicture
);

module.exports = router;