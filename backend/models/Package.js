const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Package = sequelize.define("packages", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    departureDate: {
      type: DataTypes.DATEONLY,
    },

    departureTime: {
      type: DataTypes.TIME,
    },

    departureAirport: {
      type: DataTypes.STRING,
    },

    returnDate: {
      type: DataTypes.DATEONLY,
    },

    returnTime: {
      type: DataTypes.TIME,
    },

    returnAirport: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    number_place: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    installment: {
      type: DataTypes.STRING,
    },

    deleted_at:{
      type: DataTypes.DATE,
    },
    offer_id:{
      type:DataTypes.BIGINT,
      allowNull:true,
      references:{
        model:"offers",
        key:"id"
      }
    },
    circuit_id:{
      type:DataTypes.BIGINT,
      references:{
        model:"circuit",
        key:"id"
      }
    }
  },{
  paranoid:true,
  deletedAt:"deleted_at"
})
module.exports = Package;