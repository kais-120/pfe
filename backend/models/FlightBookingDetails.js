const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const FlightBookingDetails = sequelize.define("flight_booking_details",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    seat_class:{
        type:DataTypes.ENUM("économique", "business", "premiére"),
        allowNull:false,
    },
    passenger_count:{
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
    flight_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"flights",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
    
});
module.exports = FlightBookingDetails;