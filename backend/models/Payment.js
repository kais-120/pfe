const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Payment = sequelize.define("payments", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    client_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        }
    },
    booking_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "booking",
            key: "id"
        }
    },
}, {
    tableName: "payments",
});

module.exports = Payment;