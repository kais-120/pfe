const Agence = require("./Agence");
const Booking = require("./Booking");
const Compagnie = require("./Compagnie");
const Hotel = require("./Hotel");
const HotelBookingDetails = require("./HotelBookingDetails");
const ImageService = require("./ImageServices");
const Location = require("./Location");
const Offer = require("./Offer");
const Otp = require("./Otp");
const PartnerFile = require("./PartnerFiles");
const RefuseReason = require("./RefuseReason");
const Reviews = require("./Reviews");
const Room = require("./Room");
const User = require("./User");
const Vehicle = require("./Vehicle");
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
    foreignKey:"partner_id",
    as:"partner"
});
Agence.belongsTo(User, {
    foreignKey: "partner_id",
    as: "agence"
})

User.hasMany(Compagnie, {
    foreignKey:"partner_id",
    as:"partnerCompagnie"
});
Compagnie.belongsTo(User, {
    foreignKey: "partner_id",
    as: "compagnie"
})

User.hasMany(Location, {
    foreignKey:"partner_id",
    as:"partnerLocation"
});
Location.belongsTo(User, {
    foreignKey: "partner_id",
    as: "location"
})

User.hasMany(Hotel, {
    foreignKey:"partner_id",
    as:"hotelPartner"
});
Hotel.belongsTo(User, {
    foreignKey: "partner_id",
    as: "partnerHotel"
})
User.hasMany(Voyage, {
    foreignKey:"partner_id",
    as:"partnerVoyage"
});
Voyage.belongsTo(User, {
    foreignKey: "partner_id",
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

User.hasMany(PartnerFile, {
    foreignKey:"accepted_by",
    as:"acceptedBy"
});
PartnerFile.belongsTo(User, {
    foreignKey: "accepted_by",
    as: "responsibleAccepted"
})

PartnerFile.hasMany(RefuseReason, {
    foreignKey: "file_id",
    as: "RefuseReason"
})
RefuseReason.belongsTo(PartnerFile, {
    foreignKey: "file_id",
    as: "PartnerFileRefuseReason"
})

User.belongsTo(RefuseReason, {
    foreignKey: "rejected_by",
    as: "rejectedBy"
})
RefuseReason.belongsTo(User, {
    foreignKey: "rejected_by",
    as: "responsibleRejected"
})

Hotel.hasMany(Room, {
    foreignKey: "hotel_id",
    as: "rooms"
})
Room.belongsTo(Hotel, {
    foreignKey: "hotel_id",
    as: "hotelRoom"
})
User.hasMany(Booking,{
    foreignKey:"client_id",
    as:"bookingUser"
});
Booking.belongsTo(User,{
    foreignKey:"client_id",
    as:"userBooking"
})

Booking.hasMany(HotelBookingDetails,{
    foreignKey:"booking_id",
    as:"bookingHotelDetails"
})
HotelBookingDetails.belongsTo(Booking,{
    foreignKey:"booking_id",
    as:"HotelDetailsBooking"
})

Room.hasMany(HotelBookingDetails,{
    foreignKey:"room_id",
    as:"HotelBookingDetails"
})
HotelBookingDetails.belongsTo(Room,{
    foreignKey:"room_id",
    as:"RoomHotelBooking"
})

Hotel.hasMany(ImageService, {
  foreignKey: "service_id",
  as: "imagesHotel"
})

ImageService.belongsTo(Hotel, {
  foreignKey: "service_id",
  as: "hotelImages"

})

User.hasMany(Reviews,{
    foreignKey:"client_id",
    as:"review"
}),
Reviews.belongsTo(User,{
    foreignKey:"client_id",
    as:"clientReview"
})

Hotel.hasMany(Reviews,{
    foreignKey:"service_id",
    as:"hotelReview"
}),
Reviews.belongsTo(Hotel,{
    foreignKey:"client_id",
    as:"reviewHotel"
})

Vehicle.hasMany(ImageService, {
  foreignKey: "service_id",
  as: "imagesVehicle"
})

ImageService.belongsTo(Vehicle, {
  foreignKey: "service_id",
  as: "vehicleImages"

})

Location.hasMany(Vehicle, {
  foreignKey: "location_id",
  as: "vehicle"
})

Vehicle.belongsTo(Location, {
  foreignKey: "location_id",
  as: "locationVehicle"

})

Offer.hasMany(ImageService, {
  foreignKey: "service_id",
  as: "imagesOffer"
})

ImageService.belongsTo(Offer, {
  foreignKey: "service_id",
  as: "offerImages"

})

Agence.hasMany(Offer, {
  foreignKey: "location_id",
  as: "offers"
})

Offer.belongsTo(Location, {
  foreignKey: "location_id",
  as: "agencyOffer"
})

module.exports = {  User, Otp,Agence,PartnerFile,Hotel,Compagnie,Voyage,
                    RefuseReason,Room,Booking,HotelBookingDetails,ImageService,
                    Reviews,Location,Vehicle,Offer};