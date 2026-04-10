const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

  const Vehicle = sequelize.define("Vehicle",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement:true
      },

      location_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references:{
          model:"locations",
          key:"id"
        },
        onDelete:'CASCADE',  
      },

      brand: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      model: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      category: {
        type: DataTypes.ENUM("economy", "standard", "luxury"),
        allowNull: false,
      },

      fuel: {
        type: DataTypes.ENUM("petrol", "diesel", "electric", "hybrid"),
        allowNull: false,
      },
      seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price_per_day: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      min_age: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },

      license_years: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      caution_standard: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      deposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      features: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "maintenance"),
        defaultValue: "active",
      },
    },
    {
      tableName: "vehicles",
      timestamps: true,
    }
  );

module.exports = Vehicle;