const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Location = sequelize.define("locations",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    zone:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
    address:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("En attente","refuse","accept"),
        allowNull:false,
        defaultValue:"accept"
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
        allowNull:true
    }
},{
        tableName:"locations"
});
module.exports = Location;