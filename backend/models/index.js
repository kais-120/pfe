const Agence = require("./Agence");
const Compagnie = require("./Compagnie");
const Hotel = require("./Hotel");
const Location = require("./Location");
const Otp = require("./Otp");
const PartnerFile = require("./PartnerFiles");
const RefuseReason = require("./RefuseReason");
const Room = require("./Room");
const User = require("./User");
const Voyage = require("./Voyage");

User.hasMany(Otp, {
    foreignKey: "user_id",
    as: "otps"
});

Otp.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});
User.hasMany(Agence, {
    foreignKey:"partenaire_id",
    as:"partner"
});
Agence.belongsTo(User, {
    foreignKey: "user_id",
    as: "agence"
})

User.hasMany(Compagnie, {
    foreignKey:"partenaire_id",
    as:"partnerCompagnie"
});
Compagnie.belongsTo(User, {
    foreignKey: "user_id",
    as: "compagnie"
})

User.hasMany(Location, {
    foreignKey:"partenaire_id",
    as:"partnerLocation"
});
Location.belongsTo(User, {
    foreignKey: "user_id",
    as: "location"
})

User.hasMany(Hotel, {
    foreignKey:"partenaire_id",
    as:"partnerHotel"
});
Hotel.belongsTo(User, {
    foreignKey: "user_id",
    as: "hotel"
})
User.hasMany(Voyage, {
    foreignKey:"partenaire_id",
    as:"partnerVoyage"
});
Voyage.belongsTo(User, {
    foreignKey: "user_id",
    as: "voyage"
})
User.hasMany(PartnerFile, {
    foreignKey:"partner_id",
    as:"partnerInfo"
});
PartnerFile.belongsTo(User, {
    foreignKey: "partner_id",
    as: "users"
})

PartnerFile.hasMany(RefuseReason, {
    foreignKey: "file_id",
    as: "RefuseReason"
})
RefuseReason.belongsTo(PartnerFile, {
    foreignKey: "file_id",
    as: "PartnerFileRefuseReason"
})

Hotel.hasMany(Room, {
    foreignKey: "file_id",
    as: "room"
})
Room.belongsTo(Hotel, {
    foreignKey: "file_id",
    as: "hotelRoom"
})

module.exports = { User, Otp,Agence,PartnerFile,Hotel,Compagnie,Voyage,RefuseReason,Room};