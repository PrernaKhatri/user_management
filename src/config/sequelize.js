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
    await sequelize.authenticate();
    console.log("SEQUELIZE DB CONNECTED");
  } catch (err) {
    console.error("SEQUELIZE CONNECTION FAILED:", err.message);
  }
})();

module.exports = sequelize;
