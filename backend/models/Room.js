const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Room = sequelize.define("room", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
   price_by_day: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
   price_by_adult: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
   price_by_children: {
    type: DataTypes.FLOAT,
    defaultValue:0
  },
  count: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM(["active","inactive"]),
    defaultValue:"active"
  },
  hotel_id:{
        type:DataTypes.BIGINT,
        references:{
            model:"hotels",
            key:"id"
        },
        onDelete:"CASCADE"
    },
    deletedAt:{
      type:DataTypes.DATE
    }

}, {
  tableName: "rooms",
  paranoid:true,
  deletedAt:"deletedAt"
});

module.exports = Room;