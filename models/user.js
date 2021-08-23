"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Schedule }) {
      // define association here
      this.hasMany(Schedule, { foreignKey: "ID_user" }); //{ primaryKey: id } ?
    }
  }
  User.init(
    {
      // id: {
      //   primaryKey: true,
      // },
      lastname: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      firstname: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );
  return User;
};
