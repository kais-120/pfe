const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Reviews = require("./Reviews");
const User = require("./User");

const Claim = sequelize.define("claim", {
    id:{ 
        type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true 
        },
    review_id:{ 
        type: DataTypes.BIGINT, 
        references:{
            model:Reviews,
            key:"id",
        }
    },
    partner_id: { 
       type: DataTypes.BIGINT, 
        references:{
            model:User,
            key:"id",
        }
    },
    reason: { 
        type: DataTypes.STRING(255), 
    },
    message: { 
        type: DataTypes.STRING(255), 
    },
    status: { 
        type: DataTypes.ENUM("en attente","approuvée","rejetée"), 
        defaultValue:"en attente",
    },
});
module.exports = Claim;