const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Package = require("./Package");

const CircuitBookingDetails = sequelize.define("circuit_booking_details",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    booking_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"booking",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    circuit_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"circuit",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    package_id:{
        type:DataTypes.BIGINT,
        references:{
            model:Package,
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
    
});
module.exports = CircuitBookingDetails;