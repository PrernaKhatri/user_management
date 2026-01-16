const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const UserEducation = sequelize.define(
  "UserEducation",
  {
    education_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    education_level: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    institution_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    passing_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    degree_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "user_education",
    timestamps: false,
  }
);

module.exports = UserEducation;
