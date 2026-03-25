const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Compagnie = sequelize.define("compagnies",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hub: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    classes: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    services: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    partner_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"users",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
    }
},{
    tableName:"compagnies",
    paranoid: true,
    deletedAt: "deleted_at"

});
module.exports = Compagnie;