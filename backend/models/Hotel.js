const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const Hotel = sequelize.define("hotels",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true
    },
    name:{
        type:DataTypes.TEXT,
        allowNull:true,
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:false,
    },
    status:{
        type:DataTypes.ENUM("refuse","accept"),
        allowNull:false,
        defaultValue:"accept"
    },
    destination :{
        type:DataTypes.STRING,
        allowNull:true,
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false,
    },
     equipments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
    partner_id:{
        type:DataTypes.BIGINT,
        allowNull:false,
        references:{
            model:"users",
            key:"id"
        },
        onDelete:'CASCADE',
    }
},{
        tableName:"hotels"
});
module.exports = Hotel;