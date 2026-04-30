const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const ImageService = sequelize.define("image_services",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    image_url:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    type:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    service_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
    },
},
{
    tableName:"image_services"
});
module.exports = ImageService;