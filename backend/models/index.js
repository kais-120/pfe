const Agence = require("./Agence");
const Booking = require("./Booking");
const Circuit = require("./Circuit");
const Compagnie = require("./Compagnie");
const Flight = require("./Flight");
const FlightClasses = require("./FlightClasses");
const Hotel = require("./Hotel");
const HotelBookingDetails = require("./HotelBookingDetails");
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

Location.hasMany(Vehicle, {
  foreignKey: "location_id",
  as: "vehicles"
})

Vehicle.belongsTo(Location, {
  foreignKey: "location_id",
  as: "locationVehicle"

})


Agence.hasMany(Offer, {
  foreignKey: "agency_id",
  as: "offers"
})

Offer.belongsTo(Location, {
  foreignKey: "agency_id",
  as: "agencyOffer"
})

Flight.hasMany(FlightClasses,{
    foreignKey: "flight_id",
    as: "flightClasses"
})
FlightClasses.hasMany(Flight,{
    foreignKey: "flight_id",
    as: "flight"
})

Compagnie.hasMany(Flight,{
    foreignKey: "airline_id",
    as: "FlightCompagnie"
})
Flight.hasMany(Compagnie,{
    foreignKey: "airline_id",
    as: "compagnieFlight"
})

Voyage.hasMany(Circuit,{
    foreignKey:"voyage_id",
    as:"circuits"
});
Circuit.belongsTo(Voyage,{
    foreignKey:"voyage_id",
    as:"voyagesCircuit"
});

module.exports = {  User, Otp,Agence,PartnerFile,Hotel,Compagnie,Voyage,
                    RefuseReason,Room,Booking,HotelBookingDetails,
                    Reviews,Location,Vehicle,Offer,Flight,FlightClasses,Circuit};