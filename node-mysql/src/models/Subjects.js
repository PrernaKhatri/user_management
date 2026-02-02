const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Subject = sequelize.define(
  "Subject",
  {
    subject_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    education_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    subject_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Subject.associate = (models) => {
  Subject.belongsTo(models.UserEducation, {
    foreignKey: "education_id",
    as: "education",
    onDelete: "CASCADE",
  });
};

module.exports = Subject;
