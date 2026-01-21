const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});
const sequelize = require("./config/sequelize");
const express = require("express");
const multer = require("multer");
const abc = require("./models/abc");
abc(sequelize, require("sequelize").DataTypes);
const xyz = require("./models/xyz");
xyz(sequelize, require("sequelize").DataTypes);
const User = require("./models/User");
const UserEducation = require("./models/UserEducation");
const UserEducationMap = require("./models/UserEducationMap");
const Experience = require("./models/Experience");
const Project = require("./models/Projects")

const app = express();
app.use(express.json());

// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const models = { User, UserEducation, UserEducationMap, Experience, Project };
Object.values(models).forEach((model) => {
  if (model.relations) {
    model.relations(models);
  }
}); 

const baseUrlMiddleware = require("./middleware/baseUrl.middleware");
app.use(baseUrlMiddleware);

const userRoutes = require("./routes/userRoutes");
const educationRoutes = require("./routes/educationRoutes");

app.use("/api", userRoutes);
app.use("/api", educationRoutes);

(async () => {
  try { 
    await sequelize.sync(); 
    console.log("Tables synced");
  } catch (error) {
    console.error("DB error:", error);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});