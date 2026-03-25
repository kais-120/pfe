const sequelize = require("../configs/db");
const {DataTypes, NOW} = require("sequelize");

const Otp = sequelize.define("otp",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    code:{
    type:DataTypes.STRING(6),
    allowNull:false
    },
    type: {
        type: DataTypes.ENUM("register", "forgot_password","email"),
        allowNull: false
    },
    create_at:{
    type:DataTypes.DATE,
    defaultValue:NOW
    },
    expire_at:{
        type:DataTypes.DATE,
    },
    token:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    user_id:{
        type:DataTypes.BIGINT,
        allowNull:true,
        references:{
            model:"users",
            key:"id"
        }
    }
    
},{
    tableName:"otp",
    timestamps:false,
    hooks:{
        beforeCreate:(otp)=>{
            otp.expire_at = new Date(Date.now() + 5 * 60 * 1000);
        }
    }
})
module.exports = Otp;