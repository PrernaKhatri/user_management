const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Experience = sequelize.define(
  "Experience",
  {
    exp_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {

    timestamps: false,
  }
);

Experience.relations = (models) => {
  Experience.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  Experience.hasMany(models.Project, {
    foreignKey: "exp_id",
    as: "projects",
  });
};

module.exports = Experience;
