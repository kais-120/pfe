const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Booking = sequelize.define("booking",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    total_price:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("terminée", "confirmée","annulée"),
        allowNull:false,
        defaultValue:"confirmée"
    },
    type:{
        type:DataTypes.ENUM("agence de voyage","location de voitures","hotel","compagnies aériennes","voyages circuits"),
        allowNull:false,
    },
    client_id:{
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
        tableName:"booking"
});
module.exports = Booking;