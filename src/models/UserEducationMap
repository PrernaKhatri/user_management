const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const UserEducationMap = sequelize.define(
  "UserEducationMap",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },

    education_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = UserEducationMap;
