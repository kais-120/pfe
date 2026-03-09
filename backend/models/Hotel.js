const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Hotel = sequelize.define("hotels",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    detail:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("En attente","refuse","accept"),
        allowNull:false,
        defaultValue:"accept"
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false,
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
        tableName:"hotels"
});
module.exports = Hotel;