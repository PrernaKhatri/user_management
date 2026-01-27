const fs = require("fs");
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
// const {DataTypes} = require("sequelize");

const app = express();
app.use(express.json());

// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const models = {};

const modelsPath = path.join(__dirname, "models");

fs.readdirSync(modelsPath)
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(modelsPath, file));
    models[model.name] = model;
  });

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
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


