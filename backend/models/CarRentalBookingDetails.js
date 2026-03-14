const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const HotelBookingDetails = sequelize.define("car_rental_booking_details",{
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
    pickup_location:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    dropoff_location:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    price:{
        type:DataTypes.DECIMAL,
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
    car_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"location",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
    
});
module.exports = HotelBookingDetails;