const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Offer = sequelize.define(
  "offers",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    destination: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },


    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },


    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    included: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },

    not_included: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    agency_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"agences",
            key:"id"
        }
    },

    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "offers",
    timestamps: true,
  }
);

module.exports = Offer;