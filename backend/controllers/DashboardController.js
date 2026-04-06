// controllers/statsController.js
const { Op, QueryTypes } = require("sequelize");
const { User, Booking, Hotel, Agence, Voyage, Compagnie, Location, PartnerFile, HotelBookingDetails, FlightBookingDetails, CarRentalBookingDetails, CircuitBookingDetails, OfferBookingDetails, Room, Vehicle, Flight, Circuit, Offer, Reviews } = require("../models");
const Payment = require("../models/Payment");
const Activity = require("../models/Activity");
const sequelize = require("../configs/db");

exports.GetDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = startOfMonth;

    const totalUsers = await User.count();
    const totalPartner = await User.count({ where: { role: "partner" } });

    const usersThisMonth = await User.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
    });

    const usersLastMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
    });

    const partnersThisMonth = await User.count({
      where: { createdAt: { [Op.gte]: startOfMonth }, role: "partner" },
    });

    const partnersLastMonth = await User.count({
      where: {
        role: "partner",
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
    });

    const usersDelta = usersLastMonth
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
      : 100;

    const partnerDelta = partnersLastMonth
      ? ((partnersThisMonth - partnersLastMonth) / partnersLastMonth) * 100
      : 100;

    const totalBookings = await Booking.count();

    const bookingsThisMonth = await Booking.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
    });

    const bookingsLastMonth = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
    });

    const bookingsDelta = bookingsLastMonth
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : 100;

    const totalRevenue = await Payment.sum("amount") || 0;

    const revenueThisMonth =
      (await Payment.sum("amount", {
        where: { createdAt: { [Op.gte]: startOfMonth } },
      })) || 0;

    const revenueLastMonth =
      (await Payment.sum("amount", {
        where: {
          createdAt: {
            [Op.gte]: startOfPrevMonth,
            [Op.lt]: endOfPrevMonth,
          },
        },
      })) || 0;

    const revenueDelta = revenueLastMonth
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 100;

    res.json({
      message: "data status",
      data: [
        {
          label: "users",
          value: totalUsers.toLocaleString(),
          delta: +usersDelta.toFixed(1),
        },
        {
          label: "partner",
          value: totalPartner.toLocaleString(),
          delta: +partnerDelta.toFixed(1),
        },
        {
          label: "booking",
          value: totalBookings.toLocaleString(),
          delta: +bookingsDelta.toFixed(1),
        },
        {
          label: "payment",
          value: totalRevenue.toLocaleString(),
          delta: +revenueDelta.toFixed(1),
        },
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetDashboardServicesStats = async (req, res) => {
  try {
    const hotel = await Hotel.count();
    const agency = await Agence.count();
    const voyage = await Voyage.count();
    const airline = await Compagnie.count();
    const location = await Location.count();
    const total = hotel + agency + voyage + airline + location;

    const calcPct = (val) => total ? +((val / total) * 100).toFixed(1) : 0;

    res.json({
      message: "data status",
      data: [
        {
          label: "hotel",
          value: hotel,
          pct: calcPct(hotel),
        },
        {
          label: "agency",
          value: agency,
          pct: calcPct(agency),
        },
        {
          label: "location",
          value: location,
          pct: calcPct(location),
        },
        {
          label: "airline",
          value: airline,
          pct: calcPct(airline),
        },
        {
          label: "voyage",
          value: voyage,
          pct: calcPct(voyage),
        },
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetLatestActivity = async (req, res) => {
  try {
    const activity = await Activity.findAll({
      order: [["createdAt", "DESC"]],
      limit: 6
    });
    res.json({ message: "Latest activity", activity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetPartner = async (req, res) => {
  try {
    const document = await PartnerFile.findAll({
      order: [["createdAt", "DESC"]],
      limit: 6,
      include: [
        {
          model: User,
          as: "users",
          attributes: ["name"]
        }
      ]
    });
    res.json({ message: "partner document", document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const data = await sequelize.query(`
      SELECT 
        TO_CHAR(date_trunc('month', m.month), 'Mon') AS month,
        COALESCE(SUM(p.amount), 0) AS rev,
        COALESCE(COUNT(b.id), 0) AS res
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - interval '5 month',
        date_trunc('month', CURRENT_DATE),
        interval '1 month'
      ) AS m(month)
      LEFT JOIN payments p 
        ON date_trunc('month', p."createdAt") = m.month
      LEFT JOIN booking b 
        ON date_trunc('month', b."createdAt") = m.month
      GROUP BY m.month
      ORDER BY m.month ASC;
    `, { type: QueryTypes.SELECT });

    res.json({
      message: "monthly stats",
      data: data.map(d => ({
        month: d.month,
        rev: Number(d.rev),
        res: Number(d.res)
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      limit: 6,
      include: [
        { model: User, as: "userBooking", attributes: ["name"] },

        { model: HotelBookingDetails, as: "bookingHotelDetails" },
        { model: FlightBookingDetails, as: "flightBooking" },
        { model: CarRentalBookingDetails, as: "carDetails" },
        { model: CircuitBookingDetails, as: "circuitBooking" },
        { model: OfferBookingDetails, as: "offerBooking" },
      ],
      order: [["createdAt", "DESC"]],
    })

    const typeMap = {
      hotel: "Hôtel",
      "compagnies aériennes": "Vol",
      "location de voitures": "Voiture",
      "voyages circuits": "Circuit",
      "agence de voyage": "Offre",
    }

    const formatted = bookings.map((booking) => {
      let service = ""

      switch (booking.type) {
        case "hotel":
          service = booking.hotel_booking_detail
            ? `Room ${booking.hotel_booking_detail.room_id}`
            : "Hôtel"
          break

        case "compagnies aériennes":
          service = booking.flight_booking_detail
            ? `Flight ${booking.flight_booking_detail.flight_id}`
            : "Vol"
          break

        case "location de voitures":
          service = booking.car_rental_booking_detail
            ? `Vehicle ${booking.car_rental_booking_detail.vehicle_id}`
            : "Voiture"
          break

        case "voyages circuits":
          service = booking.circuit_booking_detail
            ? `Circuit ${booking.circuit_booking_detail.circuit_id}`
            : "Circuit"
          break

        case "agence de voyage":
          service = booking.offer_booking_detail
            ? `Offer ${booking.offer_booking_detail.offer_id}`
            : "Offre"
          break

        default:
          service = "Service"
      }

      return {
        id: booking.id,
        user: booking.userBooking?.name || "Unknown",
        type: typeMap[booking.type] || booking.type,
        service,
        amount: booking.total_price,
        status: booking.status,
        date: new Date(booking.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }
    })

    res.json(formatted)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.GetPartnerDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const partner_id = req.userId;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = startOfMonth;

    const partner = await User.findByPk(partner_id,
      {
        attributes: [],
        include: [
          {
            model: PartnerFile,
            as: "partnerInfo",
            attributes: ["sector"]
          }
        ]
      }
    );
    let totalBookings = 0
    let includeConfig = [];
    if (partner.partnerInfo[0].sector === "location de voitures") {
      totalBookings = await Booking.count({
        include: [
          {
            model: CarRentalBookingDetails,
            as: "carDetails",
            required: true,
            include: [
              {
                model: Vehicle,
                as: "vehicleBooking",
                required: true,
                include: [
                  {
                    model: Location,
                    as: "locationVehicle",
                    where: { partner_id },
                    required: true,
                  }
                ]
              }
            ]
          },
        ]
      })
      includeConfig = [
        {
          model: CarRentalBookingDetails,
          as: "carDetails",
          required: true,
          include: [
            {
              model: Vehicle,
              as: "vehicleBooking",
              required: true,
              include: [
                {
                  model: Location,
                  as: "locationVehicle",
                  where: { partner_id },
                  required: true,
                }
              ]
            }
          ]
        },
      ]
    }

    else if (partner.partnerInfo[0].sector === "agence de voyage") {
      totalBookings = await Booking.count({
        include: [
          {
            model: OfferBookingDetails,
            as: "offerBooking",
            required: true,
            include: [
              {
                model: Offer,
                as: "bookingDetailsOffer",
                required: true,
                include: [
                  {
                    model: Agence,
                    as: "agencyOffer",
                    where: { partner_id },
                    required: true,
                  }
                ]
              }
            ]
          }
        ]
      })
      includeConfig = [
        {
          model: OfferBookingDetails,
          as: "offerBooking",
          required: true,
          include: [
            {
              model: Offer,
              as: "bookingDetailsOffer",
              required: true,
              include: [
                {
                  model: Agence,
                  as: "agencyOffer",
                  where: { partner_id },
                  required: true,
                }
              ]
            }
          ]
        }
      ]
    }

    else if (partner.partnerInfo[0].sector === "hôtel") {
      totalBookings = await Booking.count({
        include: [
          {
            model: HotelBookingDetails,
            as: "bookingHotelDetails",
            required: true,
            include: [
              {
                model: Room,
                as: "RoomHotelBooking",
                required: true,
                include: [
                  {
                    model: Hotel,
                    as: "hotelRoom",
                    where: { partner_id },
                    required: true,
                  }
                ]
              }
            ]
          }
        ]
      })
      includeConfig = [
        {
          model: HotelBookingDetails,
          as: "bookingHotelDetails",
          required: true,
          include: [
            {
              model: Room,
              as: "RoomHotelBooking",
              required: true,
              include: [
                {
                  model: Hotel,
                  as: "hotelRoom",
                  where: { partner_id },
                  required: true,
                }
              ]
            }
          ]
        }
      ]
    }

    else if (partner.partnerInfo[0].sector === "compagnies aériennes") {
      totalBookings = await Booking.count({
        include: [
          {
            model: FlightBookingDetails,
            as: "flightBooking",
            required: true,
            include: [
              {
                model: Flight,
                as: "detailsFlight",
                required: true,
                include: [
                  {
                    model: Compagnie,
                    as: "compagnieFlight",
                    where: { partner_id },
                    required: true,
                  }
                ]
              }
            ]
          },
        ]
      })
      includeConfig = [
        {
          model: FlightBookingDetails,
          as: "flightBooking",
          required: true,
          include: [
            {
              model: Flight,
              as: "detailsFlight",
              required: true,
              include: [
                {
                  model: Compagnie,
                  as: "compagnieFlight",
                  where: { partner_id },
                  required: true,
                }
              ]
            }
          ]
        },
      ]
    }

    else {
      totalBookings = await Booking.count({
        include: [
          {
            model: CircuitBookingDetails,
            as: "circuitBooking",
            required: true,
            include: [
              {
                model: Circuit,
                as: "circuitDetails",
                required: true,
                include: [
                  {
                    model: Voyage,
                    as: "voyagesCircuit",
                    where: { partner_id },
                    required: true,
                  }
                ]
              }
            ]
          },
        ]
      })
      includeConfig = [
        {
          model: CircuitBookingDetails,
          as: "circuitBooking",
          required: true,
          include: [
            {
              model: Circuit,
              as: "circuitDetails",
              required: true,
              include: [
                {
                  model: Voyage,
                  as: "voyagesCircuit",
                  where: { partner_id },
                  required: true,
                }
              ]
            }
          ]
        },
      ]
    }


    const bookingsThisMonth = await Booking.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
      include: includeConfig,
      distinct: true,
      col: "id"
    });

    const bookingsLastMonth = await Booking.count({
      where: {
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
      include: includeConfig,
      distinct: true,
      col: "id"
    });

    const bookingsDelta = bookingsLastMonth
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : 100;

      function cleanInclude(include) {
  return include.map(item => ({
    ...item,
    attributes: [],
    required: true,
    include: item.include ? cleanInclude(item.include) : []
  }));
}
const cleanedInclude = cleanInclude(includeConfig);

    const totalRevenue = await Payment.sum("amount", {
      include: [
        {
          model: Booking,
          as: "bookingPayment",
          attributes: [],
            required: true,
            include:cleanedInclude 
        }
      ]
    }) || 0;

    const revenueThisMonth =
      (await Payment.sum("amount", {
        where: { createdAt: { [Op.gte]: startOfMonth } },
        include: [
          {
            model: Booking,
            as: "bookingPayment",
            attributes: [],
            required: true,
            include: cleanedInclude
          }
        ]

      })) || 0;

    const revenueLastMonth =
      (await Payment.sum("amount", {
        where: {
          createdAt: {
            [Op.gte]: startOfPrevMonth,
            [Op.lt]: endOfPrevMonth,
          },
        },
        include: [
          {
            model: Booking,
            as: "bookingPayment",
            attributes: [],
            required: true,
            include: cleanedInclude
          }
        ]
      })) || 0;

    const revenueDelta = revenueLastMonth
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 100;

      let totalReview = 0

      if(partner.partnerInfo[0].sector === "hôtel"){
        totalReview = await Reviews.count({include:{
          model:Hotel,
          as:"reviewHotel",
          where:{partner_id}
        }})
        const reviewThisMonth = await Reviews.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
      include:[
        {
          model:Hotel,
          as:"reviewHotel",
          where:{partner_id}
        }
      ]
      
    });

    const reviewLastMonth = await Reviews.count({
      where: {
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
      include: [
        {
          model:Hotel,
          as:"reviewHotel",
          where:{partner_id}
        }
      ]
    });

    const reviewsDelta = reviewLastMonth
      ? ((reviewThisMonth - reviewLastMonth) / reviewLastMonth) * 100
      : 100;
      }
console.log(totalReview)
    res.json({
      message: "data status",
      data: [
        {
          label: "booking",
          value: totalBookings.toLocaleString(),
          delta: +bookingsDelta.toFixed(1),
        },
        {
          label: "payment",
          value: totalRevenue.toLocaleString(),
          delta: +revenueDelta.toFixed(1),
        },
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};