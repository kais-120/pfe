const { DataTypes } = require("sequelize");
const sequelize = require("../configs/db");

const PartnerFile = sequelize.define("partner_files",{
    id:{
        type:DataTypes.BIGINT,
        autoIncrement:true,
        primaryKey:true,
    },
    cin:{
        type:DataTypes.STRING(8)
    },
    sector:{
        type:DataTypes.STRING
    },
    // document
     cin_recto:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
    cin_verso:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
     matricule_fiscale:{
        type:DataTypes.STRING(20),
        allowNull:true,
    },
     matricule_fiscale_image:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
    register_commerce:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
    autorisation_ONTT:{
        type:DataTypes.STRING(100),
        allowNull:true,
    },
    status:{
        type:DataTypes.ENUM('en attente','accepté','rejetée'),
        allowNull:true
    },
    partner_id:{
        type:DataTypes.BIGINT,
        references:{
            model:"users",
            key:"id"
        },
        onDelete:"CASCADE"
    },
    rip:{
        type:DataTypes.STRING(20),
        allowNull:true,
    },
    accepted_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references:{
                model:"users",
                key:"id"
            },
            onDelete:"SET NULL"
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
},{
    tableName:"partner_files"
});

module.exports = PartnerFile;