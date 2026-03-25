const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

 const Circuit = sequelize.define("circuit", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM("voyage","camping","désert","aventure","plage","montagne","culturel"),
      defaultValue: "voyage",
    },

    difficulty: {
      type: DataTypes.ENUM("facile", "modéré", "difficile","très difficile"),
      defaultValue: "modéré",
    },

    price_per_person: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    max_people: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    inclusions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    available_dates: {
      type: DataTypes.JSON, 
      defaultValue: [],
    },
    voyage_id:{
        type:DataTypes.BIGINT,
        references:{
            model:"voyages",
            key:"id",
        }
    },
    deleted_at:{
        type:DataTypes.DATE
    }
},{
    tableName:"circuit",
    paranoid:true,
    deletedAt:"deleted_at"
});
module.exports = Circuit;