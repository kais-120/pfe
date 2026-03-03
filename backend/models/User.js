const { verify } = require("jsonwebtoken");
const sequelize = require("../configs/db");
const {DataTypes} = require("sequelize");

const User = sequelize.define("users",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    first_name:{
    type:DataTypes.STRING,
    allowNull:false
    },
    last_name:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    email:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    role:{
    type:DataTypes.ENUM(["client","admin"]),
    defaultValue:"client"

    },
    password:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    verified_at:{
    type:DataTypes.DATE,
    }

})
module.exports = User;