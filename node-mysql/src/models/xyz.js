module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      "xyz",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        freezeTableName: true  
      }
    );
  };
  