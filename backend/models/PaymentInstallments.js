const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");
const Payment = require("./Payment");

const PaymentInstallments = sequelize.define("payment_installments", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    installment_number : {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("en attente", "payé", "échoué"),
        allowNull:true,
        defaultValue:"en attente"
    },
    reference: {
        type:DataTypes.STRING,
        allowNull:true,
    },
    payment_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Payment,
            key: "id"
        }
    },
}, {
    tableName: "payment_installments",
});

module.exports = PaymentInstallments;