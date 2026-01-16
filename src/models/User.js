const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    joining_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "users",   // must match your existing table name
    timestamps: false,    // because you didn’t mention createdAt/updatedAt
  }
);

module.exports = User;
