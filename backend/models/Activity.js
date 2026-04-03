const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Activity = sequelize.define("activities", {
    id:{ 
        type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true 
        },
    type:{ 
        type: DataTypes.STRING(50), 
        allowNull: false 
    },
    title: { 
        type: DataTypes.STRING(255), 
        allowNull: false 
    },
});
module.exports = Activity;