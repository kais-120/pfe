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
            model:"users",
            key:"id"
        },
        onDelete:'CASCADE'
    },
    
    hotel_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"hotels",
            key:"id"
        },
        allowNull:true
    },
    rate:{
        type:DataTypes.INTEGER,
    },
    review:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status: { 
        type: DataTypes.ENUM("approuvée","rejetée"), 
        defaultValue:"approuvée",
    }
},{
    tableName:"reviews"
});
module.exports = Reviews;