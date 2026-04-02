const sequelize = require("../configs/db");
const { DataTypes } = require("sequelize");

  const Destination = sequelize.define("destinations", {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },

    nights: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:"packages",
        key:"id"
      }
    },
    deleted_at:{
        type:DataTypes.DATE,
    }
  }, {
    tableName: "destinations",
    paranoid:true,
    deletedAt:"deleted_at"
  });

module.exports = Destination;