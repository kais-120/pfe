const Agence = require("./Agence");
const Booking = require("./Booking");
const CarRentalBookingDetails = require("./CarRentalBookingDetails");
const Circuit = require("./Circuit");
const CircuitBookingDetails = require("./CircuitBookingDetails");
const Claim = require("./Claim");
const Compagnie = require("./Compagnie");
const Destination = require("./Destination");
const Flight = require("./Flight");
const FlightBookingDetails = require("./FlightBookingDetails");
const FlightClasses = require("./FlightClasses");
const Hotel = require("./Hotel");
const HotelBookingDetails = require("./HotelBookingDetails");
const Location = require("./Location");
const Offer = require("./Offer");
const OfferBookingDetails = require("./OfferBookingDetails");
const Otp = require("./Otp");
const Package = require("./Package");
const PartnerFile = require("./PartnerFiles");
const Payment = require("./Payment");
const PaymentInstallments = require("./PaymentInstallments");
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
    as: "partnerAgence"
})

User.hasMany(Compagnie, {
    foreignKey:"partner_id",
    as:"compagniePartner"
});
Compagnie.belongsTo(User, {
    foreignKey: "partner_id",
    as: "partnerCompagnie"
})

User.hasMany(Location, {
    foreignKey:"partner_id",
    as:"locationPartner"
});
Location.belongsTo(User, {
    foreignKey: "partner_id",
    as: "partnerLocation"
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
    as:"VoyagePartner"
});
Voyage.belongsTo(User, {
    foreignKey: "partner_id",
    as: "partnerVoyage"
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

User.hasMany(RefuseReason, {
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
    foreignKey:"hotel_id",
    as:"hotelReview"
}),
Reviews.belongsTo(Hotel,{
    foreignKey:"hotel_id",
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

Offer.belongsTo(Agence, {
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
Flight.belongsTo(Compagnie,{
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

Booking.hasMany(CarRentalBookingDetails, {
  foreignKey: "booking_id",
  as: "carDetails"
})

CarRentalBookingDetails.belongsTo(Booking, {
  foreignKey: "booking_id",
  as: "bookingCar"
})

Vehicle.hasMany(CarRentalBookingDetails, {
  foreignKey: "vehicle_id",
  as: "bookingVehicle"
})
CarRentalBookingDetails.belongsTo(Vehicle, {
  foreignKey: "vehicle_id",
  as: "vehicleBooking"
})

Booking.hasMany(FlightBookingDetails, {
  foreignKey: "booking_id",
  as: "flightBooking"
})
FlightBookingDetails.belongsTo(Booking, {
  foreignKey: "booking_id",
  as: "bookingsBooking"
})




Flight.hasMany(FlightBookingDetails, {
  foreignKey: "flight_id",
  as: "flightDetails"
})
FlightBookingDetails.belongsTo(Flight, {
  foreignKey: "flight_id",
  as: "detailsFlight"
})



Booking.hasMany(CircuitBookingDetails, {
  foreignKey: "booking_id",
  as: "circuitBooking"
})

CircuitBookingDetails.belongsTo(Booking, {
  foreignKey: "booking_id",
  as: "circuitBookingDetails"
})

Circuit.hasMany(CircuitBookingDetails, {
  foreignKey: "circuit_id",
  as: "bookingCircuit"
})

CircuitBookingDetails.belongsTo(Circuit, {
  foreignKey: "circuit_id",
  as: "circuitDetails"
})


Booking.hasMany(OfferBookingDetails, {
  foreignKey: "booking_id",
  as: "offerBooking"
})

OfferBookingDetails.belongsTo(Booking, {
  foreignKey: "booking_id",
  as: "bookingOffer"
})

Package.hasMany(OfferBookingDetails, {
  foreignKey: "package_id",
  as: "bookingPackage"
})
OfferBookingDetails.belongsTo(Package, {
  foreignKey: "package_id",
  as: "bookingPackageOffer"
})

Package.hasMany(CircuitBookingDetails, {
  foreignKey: "package_id",
  as: "bookingCircuitPackage"
})
CircuitBookingDetails.belongsTo(Package, {
  foreignKey: "package_id",
  as: "bookingPackageCircuit"
})

Offer.hasMany(OfferBookingDetails, {
  foreignKey: "offer_id",
  as: "offerDetailsBooking"
})

OfferBookingDetails.belongsTo(Offer, {
  foreignKey: "offer_id",
  as: "bookingDetailsOffer"
})

Offer.hasMany(OfferBookingDetails, {
  foreignKey: "offer_id",
  as: "offerDetails"
})

OfferBookingDetails.belongsTo(Offer, {
  foreignKey: "offer_id",
  as: "detailsOffer"
})

Package.hasMany(Destination, {
    foreignKey:"package_id",
    as:"destination"
})
Destination.belongsTo(Package, {
    foreignKey:"package_id",
    as:"packageDestination"
})

Offer.hasMany(Package, {
    foreignKey:"offer_id",
    as:"packages"
})
Package.belongsTo(Offer, {
    foreignKey:"offer_id",
    as:"offerPackage"
})

Circuit.hasMany(Package, {
    foreignKey:"circuit_id",
    as:"packagesCircuit"
})
Package.belongsTo(Circuit, {
    foreignKey:"circuit_id",
    as:"CircuitPackage"
})

Booking.hasMany(Payment,{
    foreignKey:"booking_id",
    as:"payment"
})
Payment.belongsTo(Booking,{
    foreignKey:"booking_id",
    as:"bookingPayment"
})

Booking.hasMany(PaymentInstallments,{
    foreignKey:"booking_id",
    as:"paymentInstallments"
})
PaymentInstallments.belongsTo(Booking,{
    foreignKey:"booking_id",
    as:"bookingPaymentInstallments"
})

Reviews.hasOne(Claim,{
    foreignKey:"review_id",
    as:"claim"
})
Claim.belongsTo(Reviews,{
    foreignKey:"review_id",
    as:"reviewsClaim"
})

User.hasMany(Claim,{
    foreignKey:"partner_id",
    as:"claims"
})
Claim.belongsTo(User,{
    foreignKey:"partner_id",
    as:"partnerClaims"
})


module.exports = {  User, Otp,Agence,PartnerFile,Hotel,Compagnie,Voyage,
                    RefuseReason,Room,Booking,HotelBookingDetails,
                    Reviews,Location,Vehicle,Offer,Flight,FlightClasses,Circuit,
                    CarRentalBookingDetails,FlightBookingDetails,CircuitBookingDetails,
                    OfferBookingDetails,Package,Destination,Payment,PaymentInstallments,Claim};