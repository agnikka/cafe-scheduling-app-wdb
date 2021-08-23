"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      // define association here
      this.belongsTo(User, { foreignKey: "ID_user" });
    }
  }
  Schedule.init(
    {
      ID_user: {
        allowNull: false,
        type: DataTypes.INTEGER,
        // references: {
        //   model: "users",
        //   key: "id",
        // },
      },
      day: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      start_at: {
        allowNull: false,
        type: DataTypes.TIME,
      },
      end_at: {
        allowNull: false,
        type: DataTypes.TIME,
      },
    },
    {
      sequelize,
      tableName: "schedules",
      modelName: "Schedule",
    }
  );
  return Schedule;
};
