const sequelize = require("../configs/db");
const { DataTypes } = require("sequelize");

  const FlightClasses = sequelize.define("flight_classes", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_adult: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_children: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    seats_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    flight_id: {
      type: DataTypes.BIGINT,
      references:{
        model:"flights",
        key:"id"
      }
      
    },
  });

module.exports = FlightClasses;