const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const express = require("express");
const multer = require("multer");


const app = express();
app.use(express.json());

// const logger = require("./middleware/ValidateUser");
// app.use(logger); 

// app.use("/uploads", express.static("src/uploads"));
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const userRoutes = require("./routes/userRoutes");
const educationRoutes = require("./routes/educationRoutes");

app.use("/api", userRoutes);
app.use("/api", educationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});