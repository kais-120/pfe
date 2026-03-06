const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Compagnie = sequelize.define("compagnies",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    price:{
        type:DataTypes.DOUBLE,
        allowNull:false,
    },
    name:{
        type:DataTypes.STRING(100),
        allowNull:false,
    },
    detail:{
        type:DataTypes.STRING(255),
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("En attente","refuse"),
        allowNull:false,
    },
    date_depart:{
         type:DataTypes.DATE,
        allowNull:false,
    },
    date_arrival:{
         type:DataTypes.DATE,
        allowNull:false,
    },
    time_depart:{
         type:DataTypes.TIME,
        allowNull:false,
    },
    time_arrival:{
         type:DataTypes.DATE,
        allowNull:false,
    },
    place_depart:{
         type:DataTypes.STRING(50),
        allowNull:false,
    },
    place_arrival:{
         type:DataTypes.STRING(50),
        allowNull:false,
    },
     number_person:{
         type:DataTypes.INTEGER(3),
        allowNull:false,
    },
     class:{
        type:DataTypes.ENUM("En attente","refuse","accept"),
        allowNull:false,
    },
    partner_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"users",
            key:"id"
        },
        onDelete:'CASCADE',
    },
    deleted_at:{
        type:DataTypes.DATE,
        allowNull:true
    }
},{
        tableName:"compagnies"
});
module.exports = Compagnie;