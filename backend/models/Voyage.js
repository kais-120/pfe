const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Voyage = sequelize.define("voyages",{
     id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
     name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categories: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    equipments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    deleted_at:{
        type: DataTypes.DATE,
    },
    partner_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"users",
            key:"id"
        },
        onDelete:'CASCADE',
    }
},{
        tableName:"voyages",
        paranoid:true,
        deletedAt:"deleted_at"
});
module.exports = Voyage;