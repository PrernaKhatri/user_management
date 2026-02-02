const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db")
const path = require("path");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const baseUrlMiddleware = require("./middleware/baseUrl.middleware");
app.use(baseUrlMiddleware);


const userRoutes = require("./routes/userRoutes");
// const educationRoutes = require("./routes/educationRoutes");

app.use("/api", userRoutes);
// app.use("/api", educationRoutes);

app.get("/", (req, res) => {
    res.send("MongoDB User Management API running");
  });
  
  const PORT = process.env.PORT || 5001;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });