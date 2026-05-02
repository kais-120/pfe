const cron = require("node-cron");
const Booking = require("../../models/Booking");
const HotelBookingDetails = require("../../models/HotelBookingDetails");
const { CarRentalBookingDetails, FlightBookingDetails, CircuitBookingDetails, OfferBookingDetails, Package } = require("../../models");

module.exports = () => {
cron.schedule("*/5 * * * *", async () => {
  console.log("check bookings...");
  const bookings = Booking.findAll({where:{status:"confirmée"},
   include: [
                {
                    model: HotelBookingDetails,
                    as: "bookingHotelDetails",
                },
                {
                    model: CarRentalBookingDetails,
                    as: "carDetails",
                },
                {
                    model: FlightBookingDetails,
                    as: "flightBooking",
                },
                {
                    model: CircuitBookingDetails,
                    as: "circuitBooking",
                    include:[
                      {
                        model:Package,
                        as:"bookingPackageCircuit"
                      }
                    ]
                },
                {
                    model: OfferBookingDetails,
                    as: "offerBooking",
                    include:[
                      {
                        model:Package,
                        as:"bookingPackageOffer"
                      }
                    ]
                },
            ]
  }) 
});
}