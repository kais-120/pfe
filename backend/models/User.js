const { verify } = require("jsonwebtoken");
const sequelize = require("../configs/db");
const {DataTypes} = require("sequelize");

const User = sequelize.define("users",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
    type:DataTypes.STRING,
    allowNull:false
    },
    email:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    role:{
    type:DataTypes.ENUM(["client","admin","agent","partner"]),
    defaultValue:"client"
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    password:{
    type:DataTypes.STRING,
    allowNull:false,
    },
    verified_at:{
    type:DataTypes.DATE,
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }

})
module.exports = User;