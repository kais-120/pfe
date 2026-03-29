const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const OfferBookingDetails = sequelize.define("offer_booking_details",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    start_date:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    end_date:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    number_of_participants:{
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
    offer_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"offers",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
    
});
module.exports = OfferBookingDetails;