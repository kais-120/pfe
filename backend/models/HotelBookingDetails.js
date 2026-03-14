const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const HotelBookingDetails = sequelize.define("hotel_booking_details",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    check_in_date:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    check_out_date:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    number_of_guests_adult:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    number_of_guests_children:{
        type:DataTypes.INTEGER,
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
    room_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"rooms",
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