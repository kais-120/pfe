const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const CarRentalBookingDetails = sequelize.define("car_rental_booking_details",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    pickup_date:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    return_date:{
        type:DataTypes.DATE,
        allowNull:false,
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
    vehicle_id:{
        type:DataTypes.BIGINT,
        allowNull:true,
        references:{
            model:"vehicles",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
    
});
module.exports = CarRentalBookingDetails;