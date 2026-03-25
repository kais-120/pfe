const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

  const Notification = sequelize.define("notification", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(
        "booking",
        "document",
        "payment",
      ),
      allowNull: false,
    },

    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: "notifications",
    timestamps: true,
  });

module.exports =  Notification;