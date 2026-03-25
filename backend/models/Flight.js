const sequelize = require("../configs/db");
const { DataTypes } = require("sequelize");

  const Flight = sequelize.define("flights", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    flight_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departure_airport: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    arrival_airport: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    departure: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    arrival: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration: {
       type:DataTypes.STRING,
      allowNull: false,
    },
    seats_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
     seats_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baggage_kg: {
      type: DataTypes.INTEGER,
      defaultValue: 23,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "programmé",
    },
    airline_id: {
      type: DataTypes.BIGINT,
      references:{
        model:"compagnies",
        key:"id"
      }
      
    },
    deleted_at:{
        type:DataTypes.DATE,
    }
  }, {
    tableName: "flights",
    paranoid:true,
    deletedAt:"deleted_at"
  });

module.exports = Flight;