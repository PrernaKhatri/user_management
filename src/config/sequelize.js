const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

(async () => {
  try {     
    console.log("Sequelize db connected");
  } catch (err) {
    console.error("Sequelize connection failed:", err.message);
  }
})();

module.exports = sequelize;
