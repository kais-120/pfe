const Otp = require("./Otp");
const User = require("./User");

User.hasMany(Otp, {
    foreignKey: "user_id",
    as: "otps"
});

Otp.belongsTo(User, {
    foreignKey: "user_id",
    as: "user"
});

module.exports = { User, Otp };