const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Project = sequelize.define(
  "Project",
  {
    project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    exp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    project_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // tableName: "projects",
    timestamps: false,
  }
);

Project.relations = (models) => {
  Project.belongsTo(models.Experience, {
    foreignKey: "exp_id",
    as: "experience",
  });
};

module.exports = Project;
