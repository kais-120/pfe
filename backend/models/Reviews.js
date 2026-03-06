const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Reviews = sequelize.define("Reviews",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true,
    },
    client_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"clients",
            key:"id"
        },
        onDelete:'CASCADE'
    },
    type_service:{
        type:DataTypes.ENUM("hotels","voyages","locations","agences","compagnies")
    },
    service_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
    },
    rate:{
        type:DataTypes.INTEGER,
    },
    review:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    tableName:"reviews"
});
module.exports = Reviews;