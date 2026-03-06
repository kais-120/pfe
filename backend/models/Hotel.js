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
    price:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    detail:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("En attente","refuse","accept"),
        allowNull:false,
        defaultValue:"En attente"
    },
    address:{
         type:DataTypes.STRING(150),
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