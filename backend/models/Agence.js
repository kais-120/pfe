const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Agence = sequelize.define(
  "Agence",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "refuse", "accept"),
      defaultValue: "pending",
    },

    partner_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "agences",
    timestamps: true,
    paranoid: true,
    deletedAt: "deleted_at",
  }
);

module.exports = Agence;