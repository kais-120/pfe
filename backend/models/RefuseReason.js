const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const RefuseReason = sequelize.define("refuse_reason",{
  id:{
            type:DataTypes.BIGINT,
            primaryKey:true,
            autoIncrement:true,
        },
        message:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        file_id:{
            type:DataTypes.BIGINT,
            allowNull:false,
            references:{
                model:"partner_files",
                key:"id",
            },
            onDelete:"cascade"
        },
         rejected_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references:{
                model:"users",
                key:"id"
            },
            onDelete:"SET NULL"
        },
        rejected_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

},{
        tableName:"refuse_reason",
        timestamps:false
    }
)
module.exports = RefuseReason;