const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Agence = sequelize.define("agences",{
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
        type:DataTypes.ENUM("pending","refuse","accept"),
        allowNull:false,
        defaultValue:"pending"
    },
    date_depart:{
         type:DataTypes.DATEONLY,
        allowNull:false,
    },
    date_arrival:{
         type:DataTypes.DATEONLY,
        allowNull:false,
    },
    time_depart:{
         type:DataTypes.TIME,
        allowNull:false,
    },
    time_arrival:{
         type:DataTypes.TIME,
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
        tableName:"agences"
});
module.exports = Agence;