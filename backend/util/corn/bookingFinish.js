const cron = require("node-cron");
const Booking = require("../../models/Booking");
const HotelBookingDetails = require("../../models/HotelBookingDetails");
const { 
  CarRentalBookingDetails, 
  FlightBookingDetails, 
  CircuitBookingDetails, 
  OfferBookingDetails, 
  Package, 
  Flight
} = require("../../models");

module.exports = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("check bookings...");

    try {
      const bookings = await Booking.findAll({
        where: { status: "confirmée" },
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
            include:[
              {
                model:Flight,
                as:"detailsFlight"
              }
            ]
          },
          {
            model: CircuitBookingDetails,
            as: "circuitBooking",
            include: [
              {
                model: Package,
                as: "bookingPackageCircuit",
              },
            ],
          },
          {
            model: OfferBookingDetails,
            as: "offerBooking",
            include: [
              {
                model: Package,
                as: "bookingPackageOffer",
              },
            ],
          },
        ],
      });

      const now = new Date();

      for (const booking of bookings) {
        let endDate = null;

        if (booking.bookingHotelDetails) {
          const d = booking.bookingHotelDetails;
          endDate = new Date(`${d.check_out_date}T${d.check_out_time}`);
        }

        if (booking.carDetails) {
          endDate = new Date(booking.carDetails.return_date);
        }

        if (booking.flightBooking?.detailsFlight) {
          endDate = new Date(booking.flightBooking.detailsFlight.departure);
        }

        if (booking.circuitBooking?.bookingPackageCircuit) {
          const p = booking.circuitBooking.bookingPackageCircuit;
          if (p.departureDate && p.departureTime) {
            endDate = new Date(`${p.departureDate}T${p.departureTime}`);
          }
        }

        if (booking.offerBooking?.bookingPackageOffer) {
          const p = booking.offerBooking.bookingPackageOffer;
          if (p.departureDate && p.departureTime) {
            endDate = new Date(`${p.departureDate}T${p.departureTime}`);
          }
        }

        if (endDate && endDate < now) {
          booking.status = "terminée";
          await booking.save();

          console.log(`Booking ${booking.id} terminé`);
        }
      }
    } catch (err) {
      console.error("Cron error:", err);
    }
  });
};