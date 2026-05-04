// controllers/statsController.js
const { Op, QueryTypes, fn, col, literal, where } = require("sequelize");
const { User, Booking, Hotel, Agence, Voyage, Compagnie, Location, PartnerFile, HotelBookingDetails, FlightBookingDetails, CarRentalBookingDetails, CircuitBookingDetails, OfferBookingDetails, Room, Vehicle, Flight, Circuit, Offer, Reviews, Package } = require("../models");
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

    const totalRevenue = await Payment.sum("amount", { where: { status: "confirmée" } }) || 0;

    const revenueThisMonth =
      (await Payment.sum("amount", {
        where: { createdAt: { [Op.gte]: startOfMonth } },
      })) || 0;

    const revenueLastMonth =
      (await Payment.sum("amount", {
        where: {
          status: "confirmée",
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
  WITH payments_sum AS (
    SELECT 
      date_trunc('month', "createdAt") AS month,
      SUM(amount) AS rev
    FROM payments
    WHERE status = 'confirmée'
    GROUP BY month
  ),
  bookings_count AS (
    SELECT 
      date_trunc('month', "createdAt") AS month,
      COUNT(id) AS res
    FROM booking
    GROUP BY month
  )

  SELECT 
    TO_CHAR(m.month, 'Mon') AS month,
    COALESCE(p.rev, 0) AS rev,
    COALESCE(b.res, 0) AS res
  FROM generate_series(
    date_trunc('month', CURRENT_DATE) - interval '5 month',
    date_trunc('month', CURRENT_DATE),
    interval '1 month'
  ) AS m(month)

  LEFT JOIN payments_sum p ON p.month = m.month
  LEFT JOIN bookings_count b ON b.month = m.month

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

function getIncludeByPartner(sector, id) {
  let include = [];
  if (sector === "location de voitures") {
    include = [
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
                where: { partner_id: id },
                required: true,
              }
            ]
          }
        ]
      },
    ]
  }

  else if (sector === "agence de voyage") {

    include = [
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
                where: { partner_id: id },
                required: true,
              }
            ]
          }
        ]
      }
    ]
  }

  else if (sector === "hôtel") {
    include = [
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
                where: { partner_id: id },
                required: true,
              }
            ]
          }
        ]
      }
    ]
  }

  else if (sector === "compagnies aériennes") {
    include = [
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
                where: { partner_id: id },
                required: true,
              }
            ]
          }
        ]
      },
    ]
  }

  else {

    include = [
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
                where: { partner_id: id },
                required: true,
              },
              {
                model: Package,
                as: "packagesCircuit",
                required: true,
              }
            ]
          }
        ]
      },
    ]
  }
  return include;
}

exports.GetPartnerDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const partner_id = req.userId;

const offset = 2; // 

const startOfMonth = new Date(Date.UTC(
  now.getFullYear(),
  now.getMonth(),
  1,
  -offset, 0, 0
));   
const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = startOfMonth;

    const partner = await User.findByPk(partner_id);
    if(!partner){
      return res.status(404).json({message:"user not found"})
    }
    const totalBookings = await Booking.count({
      where: { partner_id }
    });

    const bookingsThisMonth = await Booking.count({
      where: { createdAt: { [Op.gte]: startOfMonth },partner_id },
      distinct: true,
      col: "id"
    });
   

    const bookingsLastMonth = await Booking.count({
      where: {
        partner_id,
        createdAt: {
          [Op.gte]: startOfPrevMonth,
          [Op.lt]: endOfPrevMonth,
        },
      },
      distinct: true,
      col: "id"
    });


    const bookingsDelta = bookingsLastMonth
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100
      : 100;


    const totalRevenue = await Payment.sum("amount", {
      where:{partner_id}
    }) || 0;

    const revenueThisMonth =
      (await Payment.sum("amount", {
        where: { createdAt: { [Op.gte]: startOfMonth },partner_id },
      })) || 0;

    const revenueLastMonth =
      (await Payment.sum("amount", {
        where: {
          createdAt: {
            [Op.gte]: startOfPrevMonth,
            [Op.lt]: endOfPrevMonth,
          },
          partner_id
        },
      })) || 0;

    const revenueDelta = revenueLastMonth
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
      : 100;


    if (bookingsThisMonth.type === "hotel") {
      const totalReview = await Reviews.count({
        include: {
          model: Hotel,
          as: "reviewHotel",
          where: { partner_id }
        }
      })
      const sumNote = await Reviews.sum("rate", {
        where : {status:"approuvée"},
        include: [
          {
            model: Hotel,
            as: "reviewHotel",
            attributes: [],
            where: { partner_id }
          }
        ]
      }) || 0
      const reviewThisMonth = await Reviews.count({
        where: { createdAt: { [Op.gte]: startOfMonth , status:"approuvée"} },
        include: [
          {
            model: Hotel,
            as: "reviewHotel",
            where: { partner_id }
          }
        ]

      });

      const reviewLastMonth = await Reviews.count({
        where: {
          status:"approuvée",
          createdAt: {
            [Op.gte]: startOfPrevMonth,
            [Op.lt]: endOfPrevMonth,
          },
        },
        include: [
          {
            model: Hotel,
            as: "reviewHotel",
            where: { partner_id }
          }
        ]
      });

      const reviewsDelta = reviewLastMonth
        ? ((reviewThisMonth - reviewLastMonth) / reviewLastMonth) * 100
        : 100;

      return res.json({
        message: "data status",
        data: [
          {
            label: "booking",
            value: totalBookings.toLocaleString(),
            delta: +bookingsDelta.toFixed(1),
          },
          {
            label: "review",
            value: totalReview.toLocaleString(),
            delta: +reviewsDelta.toFixed(1),
          },
          {
            label: "note",
            value: sumNote.toLocaleString(),
          },
          {
            label: "payment",
            value: totalRevenue.toLocaleString(),
            delta: +revenueDelta.toFixed(1),
          },
        ],
      });

    }
    return res.json({
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

exports.getRevenueChart = async (req, res) => {
  try {
    const partner_id = req.userId;
    const now = new Date();
    const fiveMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
      0, 0, 0
    );

    // 👇 conversion timezone (UTC -> Europe/Paris)
    const tzDate = `("payments"."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Paris')`;

    const monthlyData = await Payment.findAll({
      attributes: [
        [
          fn("EXTRACT", literal(`MONTH FROM ${tzDate}`)),
          "monthNum"
        ],
        [
          fn("EXTRACT", literal(`YEAR FROM ${tzDate}`)),
          "year"
        ],
        [
          fn("SUM", col("amount")),
          "total"
        ]
      ],
      raw: true,
      where: {
        partner_id,
        [Op.and]: [
          where(literal(tzDate), {
            [Op.gte]: fiveMonthsAgo
          })
        ]
      },
      group: [
        literal(`EXTRACT(YEAR FROM ${tzDate})`),
        literal(`EXTRACT(MONTH FROM ${tzDate})`)
      ],
      order: [
        [literal(`EXTRACT(YEAR FROM ${tzDate})`), "ASC"],
        [literal(`EXTRACT(MONTH FROM ${tzDate})`), "ASC"]
      ]
    });

    // 👇 labels
    const monthNames = [
      "jan", "fév", "mar", "avr",
      "mai", "juin", "juil", "aoû",
      "sep", "oct", "nov", "déc"
    ];

    const labels = monthlyData.map(
      d => `${monthNames[parseInt(d.monthNum) - 1]} ${d.year}`
    );

    const monthly = monthlyData.map(
      d => parseFloat(d.total)
    );
    console.log(monthly)

    return res.json({
      labels,
      monthly
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getBookingsChart = async (req, res) => {
  try {
    const partner_id = req.userId;

    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1,
      0, 0, 0
    );

    // 👇 timezone fix
    const tzDate = `("booking"."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Paris')`;

    const monthlyData = await Booking.findAll({
      attributes: [
        [
          fn("EXTRACT", literal(`YEAR FROM ${tzDate}`)),
          "year"
        ],
        [
          fn("EXTRACT", literal(`MONTH FROM ${tzDate}`)),
          "monthNum"
        ],
        [
          fn("COUNT", col("booking.id")),
          "total"
        ]
      ],
      raw: true,
      where: {
        partner_id,
        [Op.and]: [
          where(literal(tzDate), {
            [Op.gte]: startDate
          })
        ]
      },
      group: [
        literal(`EXTRACT(YEAR FROM ${tzDate})`),
        literal(`EXTRACT(MONTH FROM ${tzDate})`)
      ],
      order: [
        [literal(`EXTRACT(YEAR FROM ${tzDate})`), "ASC"],
        [literal(`EXTRACT(MONTH FROM ${tzDate})`), "ASC"]
      ]
    });

    const monthNames = [
      "jan", "fév", "mar", "avr",
      "mai", "juin", "juil", "aoû",
      "sep", "oct", "nov", "déc"
    ];

    const labels = monthlyData.map(
      d => `${monthNames[parseInt(d.monthNum) - 1]} ${d.year}`
    );

    const values = monthlyData.map(
      d => parseInt(d.total)
    );

    return res.json({
      labels,
      values
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// exports.getBookingsChart = async (req, res) => {
//   try {
//     const partner_id = req.userId;

//     // Verify partner exists
//     const partner = await User.findByPk(partner_id, {
//       attributes: ["createdAt"],
//     });

//     if (!partner) {
//       return res.status(404).json({ message: "Partner not found" });
//     }

//     const now = new Date();

//     // Calculate 6 months ago
//     const sixMonthsAgo = new Date(
//       now.getFullYear(),
//       now.getMonth() - 5,
//       1
//     );

//     const accountCreated = new Date(partner.createdAt);

//     // Use account creation date if more recent than 6 months ago
//     const startDate =
//       accountCreated > sixMonthsAgo ? accountCreated : sixMonthsAgo;

//     // Timezone conversion: UTC → Europe/Paris
//     const tzDate = `("booking"."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Paris')`;

//     // Query bookings with partner_id filter
//     const bookingsData = await Booking.findAll({
//       attributes: [
//         [fn("TO_CHAR", literal(tzDate), "YYYY-MM"), "month"],
//         [fn("COUNT", literal('DISTINCT "booking"."id"')), "total"]
//       ],
//       where: {
//         partner_id, // Filter by partner_id
//         [Op.and]: [
//           // Date range: from startDate to now
//           literal(`${tzDate} >= '${startDate.toISOString().split('T')[0]}'`),
//           literal(`${tzDate} <= '${now.toISOString().split('T')[0]}'`)
//         ]
//       },
//       group: [literal(`TO_CHAR(${tzDate}, 'YYYY-MM')`)],
//       order: [literal(`TO_CHAR(${tzDate}, 'YYYY-MM') ASC`)],
//       raw: true
//     });

//     // Generate all month keys from startDate to now (YYYY-MM format)
//     const monthKeys = [];
//     let tempDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

//     while (tempDate <= now) {
//       const year = tempDate.getFullYear();
//       const month = String(tempDate.getMonth() + 1).padStart(2, "0");
//       monthKeys.push(`${year}-${month}`);
//       tempDate.setMonth(tempDate.getMonth() + 1);
//     }

//     // Create a map of month -> booking count from query results
//     const dataMap = Object.fromEntries(
//       bookingsData.map(d => [d.month, parseInt(d.total)])
//     );

//     // Build values array (use 0 for months with no bookings)
//     const values = monthKeys.map(key => dataMap[key] || 0);

//     // Build labels array (French month abbreviations)
//     const labels = monthKeys.map(key => {
//       const [year, month] = key.split('-');
//       const date = new Date(year, parseInt(month) - 1, 1);
//       return date.toLocaleString("fr-FR", { month: "short" });
//     });

//     return res.json({
//       labels,
//       values
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getLastBookings = async (req, res) => {
  try {
    const partner_id = req.userId;
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
    const includeConfig = getIncludeByPartner(partner.partnerInfo[0].sector, partner_id);

    const cleanInclude = (include) => {
      return include.map(item => ({
        ...item,
        required: true,
        include: item.include ? cleanInclude(item.include) : []
      }));
    };

    const includes = cleanInclude(includeConfig);

    const bookings = await Booking.findAll({
      include: [
        {
          model: User,
          as: "userBooking",
          attributes: ["name"]
        }
        , ...includeConfig],
    });


    return res.json({
      message: "booking data",
      bookings: bookings.slice(0, 6)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLastReviews = async (req, res) => {
  try {
    const partner_id = req.userId;
    const totalReview = await Reviews.count({
      where : {status:"approuvée"},
      include: [
        {
          model: Hotel,
          as: "reviewHotel",
          attributes: [],
          where: { partner_id }
        }
      ]
    })
    const sumRate = await Reviews.sum("rate", {
      where : {status:"approuvée"},
      include: [
        {
          model: Hotel,
          as: "reviewHotel",
          attributes: [],
          where: { partner_id }
        }
      ]
    }) || 0;
    const reviewScore = totalReview === 0 ? 0 : sumRate / totalReview;
    const reviews = await Reviews.findAll({
      where : {status:"approuvée"},
      limit: 4,
      include: [{
        model: User,
        as: "clientReview",
        attributes: ["name"]
      },
      {
        model: Hotel,
        as: "reviewHotel",
        attributes: [],
        where: { partner_id }
      }
      ]
    })
    return res.json({
      message: "review data",
      reviews,
      totalReview,
      reviewScore
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getRooms = async (req, res) => {
  try {
    const partner_id = req.userId;
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
    if (partner.partnerInfo[0].sector !== "hôtel") {
      return res.status(403).json({ message: "partner not allow" })
    }
    const rooms = await Hotel.findAll({
      where: { partner_id },
      attributes: [],
      include: [
        {
          model: Room,
          as: "rooms",
        }
      ]
    })
    const today = new Date();
    const bookingsCount = await HotelBookingDetails.findAll({
      attributes: [
        "room_id",
        [fn("COUNT", col("room_id")), "totalBooked"]
      ],
      where: {
        check_out_date: {
          [Op.gte]: today
        }
      },
      group: ["room_id"],
      raw: true
    });
    const bookingMap = {};
    bookingsCount.forEach(b => {
      bookingMap[b.room_id] = parseInt(b.totalBooked);
    });
    const result = rooms.flatMap(hotel =>
      hotel.rooms.map(room => {
        const booked = bookingMap[room.id] || 0;
        const total = room.count;

        const occupation = total === 0 ? 0 : Math.round((booked / total) * 100);

        return {
          room_id: room.id,
          name: room.name,
          price: room.price_by_day,
          status: room.status,
          total,
          booked,
          occupation: occupation
        };
      })
    );

    return res.json({
      message: "review data",
      rooms: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const partner_id = req.userId;
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
    if (partner.partnerInfo[0].sector !== "location de voitures") {
      return res.status(403).json({ message: "partner not allow" })
    }
    const vehicles = await Location.findAll({
      where: { partner_id },
      attributes: [],
      include: [
        {
          model: Vehicle,
          as: "vehicles",
        }
      ]
    })
    const today = new Date();
    const locationCount = await CarRentalBookingDetails.findAll({
      attributes: [
        "vehicle_id",
        [fn("COUNT", col("vehicle_id")), "totalBooked"]
      ],
      where: {
        return_date: {
          [Op.gte]: today
        }
      },
      group: ["vehicle_id"],
      raw: true
    });
    const bookingMap = {};
    locationCount.forEach(b => {
      bookingMap[b.vehicle_id] = parseInt(b.totalBooked);
    });
    const result = vehicles.flatMap(location =>
      location.vehicles.map(vehicle => {
        const booked = bookingMap[vehicle.id] || 0;

        return {
          vehicle_id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price_by_day,
          status: vehicle.status,
          booked: booked === 0 ? false : true,
        };
      })
    );

    return res.json({
      message: "review data",
      vehicles: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFlight = async (req, res) => {
  try {
    const partner_id = req.userId;
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
    if (partner.partnerInfo[0].sector !== "compagnies aériennes") {
      return res.status(403).json({ message: "partner not allow" })
    }
    const flights = await Compagnie.findAll({
      where: { partner_id },
      attributes: [],
      include: [
        {
          model: Flight,
          as: "FlightCompagnie",
        }
      ]
    })
    const today = new Date();
    const bookingsCount = await FlightBookingDetails.findAll({
      attributes: [
        "flight_id",
        [fn("COUNT", col("flight_booking_details.flight_id")), "totalBooked"]
      ],
      include: [
        {
          model: Flight,
          as: "detailsFlight",
          attributes: [],
          where: {
            departure: {
              [Op.gte]: today
            }
          }
        }
      ],
      group: ["flight_booking_details.flight_id"],
      raw: true
    });
    const bookingMap = {};
    bookingsCount.forEach(b => {
      bookingMap[b.flight_id] = parseInt(b.totalBooked);
    });
    const result = flights.flatMap(compagnie =>
      compagnie.FlightCompagnie.map(flight => {
        const booked = bookingMap[flight.id] || 0;
        const total = flight.seats_available;
        console.log(flight)

        const occupation = total === 0 ? 0 : Math.round((booked / total) * 100);

        return {
          flight_id: flight.id,
          flight_number: flight.flight_number,
          status: flight.status,
          departure_airport: flight.departure_airport,
          arrival_airport: flight.arrival_airport,
          type_flight: flight.type_flight,
          total,
          booked,
          occupation: occupation
        };
      })
    );

    return res.json({
      message: "flight data",
      flight: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOffer = async (req, res) => {
  try {
    const partner_id = req.userId;

    const partner = await User.findByPk(partner_id, {
      attributes: [],
      include: [
        {
          model: PartnerFile,
          as: "partnerInfo",
          attributes: ["sector"]
        }
      ]
    });

    if (partner.partnerInfo[0].sector !== "agence de voyage") {
      return res.status(403).json({ message: "partner not allow" });
    }

    const agences = await Agence.findAll({
      where: { partner_id },
      attributes: [],
      include: [
        {
          model: Offer,
          as: "offers",
          include: [
            {
              model: Package,
              as: "packages",
              attributes: ["id", "number_place"]
            }
          ]
        }
      ]
    });

    const bookingsCount = await OfferBookingDetails.findAll({
      attributes: [
        "offer_id",
        [fn("COUNT", col("offer_booking_details.offer_id")), "totalBooked"]
      ],
      group: ["offer_booking_details.offer_id"],
      raw: true
    });

    const bookingMap = {};
    bookingsCount.forEach(b => {
      bookingMap[b.offer_id] = parseInt(b.totalBooked);
    });

    const result = agences.flatMap(agence =>
      agence.offers.map(offer => {

        const booked = bookingMap[offer.id] || 0;

        const total = offer.packages.reduce((sum, p) => {
          return sum + (p.number_place || 0);
        }, 0);

        const occupation =
          total === 0 ? 0 : Math.round((booked / total) * 100);

        return {
          offer_id: offer.id,
          title: offer.title,
          package: offer.packages.length,
          total,
          booked,
          occupation
        };
      })
    );

    return res.json({
      message: "offers stats",
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCircuit = async (req, res) => {
  try {
    const partner_id = req.userId;

    const partner = await User.findByPk(partner_id, {
      attributes: [],
      include: [
        {
          model: PartnerFile,
          as: "partnerInfo",
          attributes: ["sector"]
        }
      ]
    });

    if (partner.partnerInfo[0].sector !== "voyages circuits") {
      return res.status(403).json({ message: "partner not allow" });
    }

    const voyages = await Voyage.findAll({
      where: { partner_id },
      attributes: [],
      include: [
        {
          model: Circuit,
          as: "circuits",
          include: [
            {
              model: Package,
              as: "packagesCircuit",
              attributes: ["id", "number_place", "price"]
            }
          ]
        }
      ]
    });

    const bookingsCount = await CircuitBookingDetails.findAll({
      attributes: [
        "circuit_id",
        [fn("COUNT", col("circuit_booking_details.circuit_id")), "totalBooked"]
      ],
      group: ["circuit_booking_details.circuit_id"],
      raw: true
    });

    const bookingMap = {};
    bookingsCount.forEach(b => {
      bookingMap[b.circuit_id] = parseInt(b.totalBooked);
    });

    const result = voyages.flatMap(voyage =>
      voyage.circuits.map(circuit => {

        const booked = bookingMap[circuit.id] || 0;
        const total = (circuit.packagesCircuit || []).reduce((sum, p) => {
          return sum + (p.number_place || 0);
        }, 0);
        const occupation =
          total === 0
            ? 0
            : Math.max(1, Math.round((booked / total) * 100));

        return {
          circuit_id: circuit.id,
          title: circuit.title,
          package: circuit.packagesCircuit.length,
          total,
          booked,
          occupation
        };
      })
    );

    return res.json({
      message: "offers stats",
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};