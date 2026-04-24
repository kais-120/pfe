const { body, validationResult } = require("express-validator");
const { Hotel, User, Booking, HotelBookingDetails, Reviews, Agence, Offer, Compagnie, Voyage, Circuit, CarRentalBookingDetails, PartnerFile, Claim } = require("../models");
const Room = require("../models/Room");
const ImageService = require("../models/ImageServices");
const Location = require("../models/Location");
const Vehicle = require("../models/Vehicle");
const Flight = require("../models/Flight");
const FlightClasses = require("../models/FlightClasses");
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const Package = require("../models/Package");
const Destination = require("../models/Destination");
const sequelize = require("../configs/db");
const Activity = require("../models/Activity");
const path = require("path")
const fs = require("fs")

exports.GetPublicHotel = async (req, res) => {
  try {
    const { id } = req.params
    const hotelData = await Hotel.findByPk(id, {
      include: [
        {
          model: Room,
          as: "rooms"
        },
        {
          model: Reviews,
          as: "hotelReview",
          where: { status: "approuvée" },
          include: [
            {
              model: User,
              as: "clientReview",
              attributes: ["name"]
            }
          ]
        }
      ]
    });
    if (!hotelData) {
      return res.status(404).json({ message: "hotel not found" });
    }

    const images = await ImageService.findAll({
      where: {
        type: "hotel",
      },
    });
    const hotelJSON = hotelData.toJSON();
    const imagesHotel = images.filter(
      (img) => String(img.service_id) === String(hotelJSON.id)
    );
    const hotel = {
      ...hotelJSON,
      imagesHotel,
    };
    return res.json({ message: "hotel found", hotel });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}

exports.DeleteService = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (type === "hotels") {
      const hotel = await Hotel.findByPk(id);
      if (!hotel) {
        return res.status(404).json({ message: "hotel not found" });
      }
      hotel.destroy();
    }
    else if (type === "compagnies") {
      const airline = await Compagnie.findByPk(id);
      if (!airline) {
        return res.status(404).json({ message: "airline not found" });
      }
      airline.destroy();
    }
    else if (type === "locations") {
      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ message: "location not found" });
      }
      location.destroy();
    }
    else if (type === "agences") {
      const agency = await Agence.findByPk(id);
      if (!agency) {
        return res.status(404).json({ message: "agency not found" });
      }
      agency.destroy();
    }
    else {
      const voyage = await Voyage.findByPk(id);
      if (!voyage) {
        return res.status(404).json({ message: "voyage not found" });
      }
      voyage.destroy();
    }

    return res.json({ message: "service found" });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}



exports.GetSearchHotels = [
  body("destination").notEmpty().withMessage("destination is required"),
  body("checkIn").notEmpty().isDate().withMessage("checkIn should be date"),
  body("checkOut").notEmpty().isDate().withMessage("checkOut should be date"),
  body("rooms").notEmpty().isArray().withMessage("rooms should be array"),

  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map(err => err.msg)
      })
    }

    try {
      const { destination, checkIn, checkOut, rooms } = req.body

      const nights =
        (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)

      const hotels = await Hotel.findAll({
        where: { destination },
        include: [
          { model: Room, as: "rooms" }
        ]
      })

      const imagesHotel = await ImageService.findAll({
        where: { type: "hotel" }
      });

      const availableHotels = hotels
        .map(hotel => {
          let totalPrice = 0

          const isValid = rooms.every(roomRequest => {
            const { adults, children } = roomRequest
            const guests = adults + children

            const room = hotel.rooms.find(r => r.capacity >= guests)
            if (!room) return false

            const pricePerNight =
              room.price_by_day +
              adults * room.price_by_adult +
              children * room.price_by_children

            totalPrice += pricePerNight * nights
            return true
          })

          if (!isValid) return null

          const hotelJSON = hotel.toJSON()

          hotelJSON.imagesHotel = imagesHotel.filter(
            img => String(img.service_id) === String(hotelJSON.id)
          )

          hotelJSON.nights = nights
          hotelJSON.totalPrice = totalPrice

          return hotelJSON
        })
        .filter(Boolean)

      if (availableHotels.length === 0) {
        return res.status(404).json({ message: "no hotel available" })
      }

      return res.json({
        message: "hotel found",
        hotels: availableHotels
      })

    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: "server error" })
    }
  }
]

exports.GetSearchRooms = [
  body("checkIn").notEmpty().isDate().withMessage("checkIn should be date"),
  body("checkOut").notEmpty().isDate().withMessage("checkOut should be date"),
  body("rooms").notEmpty().isArray().withMessage("rooms should be array"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map(err => err.msg)
      });
    }

    try {
      const { id } = req.params; // hotel id
      const { checkIn, checkOut, rooms } = req.body;

      // حساب عدد الليالي
      const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

      // جلب كل الغرف للفندق المحدد
      const hotel = await Hotel.findOne({
        where: { id },
        attributes: ["id", "name", "destination"],
        include: [
          {
            model: Room,
            as: "rooms"
          }
        ]
      });

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      let totalPrice = 0;
      const availableRooms = [];

      const isValid = rooms.every(roomRequest => {
        const [adults, children] = roomRequest;
        const guests = adults + children;

        const room = hotel.rooms.find(r => r.capacity >= guests && !availableRooms.includes(r.id));

        if (!room) return false;

        const pricePerNight =
          room.price_by_day +
          adults * room.price_by_adult +
          children * room.price_by_children;


        availableRooms.push({
          roomId: room.id,
          name: room.name,
          capacity: room.capacity,
          priceByDay: room.price_by_day,
          priceByAdult: room.price_by_adult,
          priceByChildren: room.price_by_children,
          requestedAdults: adults,
          requestedChildren: children,
          pricePerNight,
          totalPrice: pricePerNight * nights
        });

        return true;
      });

      if (!isValid) {
        return res.status(404).json({ message: "No available rooms for the selected configuration" });
      }

      return res.json({
        message: "Rooms found",
        hotel: {
          id: hotel.id,
          name: hotel.name,
          destination: hotel.destination,
          nights,
          rooms: availableRooms
        }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
]

exports.GetAllHotel = async (req, res) => {
  try {
    const hotelData = await Hotel.findAll({
      limit: 9,
      include: [
        {
          model: Room,
          as: "rooms"
        }
      ]
    });
    const images = await ImageService.findAll({
      where: {
        type: "hotel",
      },
    });

    const hotel = hotelData.map((hotel) => {
      const hotelJSON = hotel.toJSON();

      const imagesHotel = images.filter(
        (img) => String(img.service_id) === String(hotelJSON.id)
      );

      return {
        ...hotelJSON,
        imagesHotel,
      };
    });

    return res.json({ message: "hotel found", hotel });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}
exports.GetAllServices = async (req, res) => {
  try {
    const [
      hotels,
      agences,
      compagnies,
      locations,
      voyages
    ] = await Promise.all([
      Hotel.findAll({
        include: [
          {
            model: User,
            as: "partnerHotel",
            include: [{
              model: PartnerFile,
              as: "partnerInfo",
              attributes: ["cin"]
            }]
          }
        ]
      }),
      Agence.findAll({
        include: [
          {
            model: User,
            as: "partnerAgence",
            include: [{
              model: PartnerFile,
              as: "partnerInfo",
              attributes: ["cin"]
            }]
          }
        ]
      }),
      Compagnie.findAll({
        include: [
          {
            model: User,
            as: "partnerCompagnie",
            include: [{
              model: PartnerFile,
              as: "partnerInfo",
              attributes: ["cin"]
            }]
          }
        ]
      }),
      Location.findAll({
        include: [
          {
            model: User,
            as: "partnerLocation",
            include: [{
              model: PartnerFile,
              as: "partnerInfo",
              attributes: ["cin"]
            }]
          }
        ]
      }),
      Voyage.findAll({
        include: [
          {
            model: User,
            as: "partnerVoyage",
            include: [{
              model: PartnerFile,
              as: "partnerInfo",
              attributes: ["cin"]
            }]
          }
        ]
      })
    ]);
    console.log(hotels)

    return res.status(200).json({
      success: true,
      data: {
        hotels,
        agences,
        compagnies,
        locations,
        voyages
      }
    });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}
exports.GetHotel = async (req, res) => {
  try {
    const partner_id = req.userId;
    const hotel = await Hotel.findOne({
      where: { partner_id },
      include: [
        {
          model: Room,
          as: "rooms"
        },
        {
          model: Reviews,
          as: "hotelReview",
          include: [
            {
              model: User,
              as: "clientReview",
              attributes: ["name"]
            },
            {
              model: Claim,
              as: "claim",
              attributes: ["id", "reason", "message", "status"]
            }
          ]
        }
      ]
    });
    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" });
    }
    const images = await ImageService.findAll({ where: { type: "hotel", service_id: hotel.id } })
    const data = { ...hotel.toJSON(), images }
    const review = await Reviews.findAll({
      where:
        { hotel_id: hotel.id, status: "approuvée" },
      attributes: ["rate"]
    }
    );
    return res.json({ message: "hotel found", hotel: data, review });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}
exports.AddHotel = [
  body("name").notEmpty().withMessage("name is required"),
  body("description").notEmpty().withMessage("description is required"),
  body("address").notEmpty().withMessage("address by day is required"),
  body("equipments").notEmpty().withMessage("equipments by day is required"),
  body("destination").notEmpty().withMessage("destination by day is required"),
  body("start").notEmpty().withMessage("start is required")
    .isNumeric().withMessage("start should be numeric"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try {
      const partner_id = req.userId;
      const { name, description, address, equipments, destination, start } = req.body;
      const hotel = await Hotel.create({ name, description, address, equipments, destination, start, partner_id });
      const files = req.files.service_doc;
      for (const element of files) {
        await ImageService.create({
          image_url: element.filename,
          type: "hotel",
          service_id: hotel.id
        });
      }
      await Activity.create({ type: "service", titre: `Nouvel hôtel a créé` })
      return res.json({ message: "hotel created" });
    } catch (err) {
      return res.status(500).send({ message: "error server" })
    }

  }
]
exports.AddRoom = [
  body("name").notEmpty().withMessage("name is required"),
  body("capacity").notEmpty().withMessage("capacity is required")
    .isNumeric().withMessage("capacity should be numeric"),
  body("price_by_day").notEmpty().withMessage("price by day is required")
    .isNumeric().withMessage("price by day should be a number"),
  body("price_by_adult").notEmpty().withMessage("price by adult is required")
    .isNumeric().withMessage("price by adult should be a number"),
  body("count").notEmpty().withMessage("email is required")
    .isNumeric().withMessage("count should be numeric"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try {
      const { name, capacity, price_by_day, count, price_by_children, price_by_adult } = req.body;
      const userId = req.userId;
      const hotel = await Hotel.findOne({ where: { partner_id: userId } });
      if (!hotel) {
        return res.status(404).json({ message: "hotel not found" });
      }
      await Room.create({ name, capacity, price_by_day, price_by_adult, price_by_children, count, hotel_id: hotel.id });
      return res.json({ message: "hotel created" });
    } catch {
      return res.status(500).send({ message: "error server" })
    }
  }
]

exports.DeleteRoom = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const hotel = await Hotel.findOne({ where: { partner_id: userId } });
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }
    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" });
    }
    if (room.hotel_id !== hotel.id) {
      return res.status(403).json({ message: "you don't have the access to delete this room" });
    }
    const existingBooking = await HotelBookingDetails.findOne({
      where: { room_id: id },
      include: [
        {
          model: Booking,
          as: "HotelDetailsBooking",
          where: {
            status: ["en attente", "confirmée"],
            deleted_at: null
          }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Impossible de supprimer cette chambre, elle a des réservations en cours"
      });
    }
    await room.destroy();
    return res.json({ message: "hotel created" });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }
}

exports.VisibilityRoom = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const hotel = await Hotel.findOne({ where: { partner_id: userId } });
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }
    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" });
    }
    if (room.hotel_id !== hotel.id) {
      return res.status(403).json({ message: "you don't have the access to delete this room" });
    }
    const status = room.status === "active" ? "inactive" : "active"
    await room.update({ status });
    return res.json({ message: "room is change there visibility" });
  } catch {
    return res.status(500).send({ message: "error server" })
  }
}

exports.GetRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ where: { hotel_id: id } })
    if (!room) {
      return res.status(404).json({ message: "room not found" });
    }
    return res.json({ message: "room found", room });
  } catch {
    return res.status(500).send({ message: "error server" })
  }
}

exports.UpdateHotel = async (req, res) => {
  try {
    const partner_id = req.userId;
    const { name, description, destination, address, star, delete_images } = req.body;

    let equipments = [];
    if (req.body.equipments) {
      equipments = Array.isArray(req.body.equipments)
        ? req.body.equipments
        : [req.body.equipments];
    }

    const hotel = await Hotel.findOne({ where: { partner_id } });
    if (!hotel) {
      return res.status(404).json({ message: 'Hôtel non trouvé' });
    }

    await hotel.update({
      name: name || hotel.name,
      description: description || hotel.description,
      destination: destination?.trim() || hotel.destination,
      address: address || hotel.address,
      star: star ? parseInt(star) : hotel.star,
      equipments: equipments.length > 0 ? equipments : hotel.equipments,
    });

    if (delete_images) {
      try {
        const idsToDelete = JSON.parse(delete_images);
        if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
          await ImageService.destroy({
            where: {
              id: idsToDelete,
              service_id: hotel.id,
            },
          });
        }
      } catch (error) {
        console.error('Error parsing delete_images:', error);
      }
    }

    if (req.files) {
      if (req.files?.service_doc?.length > 0) {
        const imagePromises = req.files.service_doc.map(file =>
          ImageService.create({
            image_url: file.filename,
            type: 'hotel',
            service_id: hotel.id,
          }),
        );
        await Promise.all(imagePromises);
      }
    }


    return res.status(200).json({
      message: 'Hôtel modifié avec succès',
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return res.status(500).json({
      message: 'Erreur lors de la modification de l\'hôtel',
      error: error.message,
    });
  }
};

exports.AddLocation = [
  body("name").notEmpty().withMessage("name is required"),
  body("address").notEmpty().withMessage("address is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array().map(err => err.msg) });
    }
    try {
      const partner_id = req.userId;
      const { name, address } = req.body;
      await Location.create({ name, address, partner_id });
      await Activity.create({ type: "service", titre: `Nouvel location a créé` })
      return res.json({ message: "location created" });
    } catch (err) {
      return res.status(500).send({ message: "error server" })
    }

  }
]

exports.GetLocation = async (req, res) => {
  try {
    const partner_id = req.userId;
    const locationData = await Location.findOne({
      where: { partner_id },
      include: [
        {
          model: Vehicle,
          as: "vehicles",
          required: false,
        },
      ]
    });
    if (!locationData) {
      return res.status(404).send({ message: "location not found" });
    }
    const images = await ImageService.findAll({
      where: {
        type: "vehicle",
      },
    });

    const locationJSON = locationData.toJSON();
    const vehiclesWithImages = locationJSON.vehicles.map((vehicle) => {
      const imagesVehicle = images.filter(
        (img) => String(img.service_id) === String(vehicle.id)
      );

      return {
        ...vehicle,
        imagesVehicle,
      };
    });
    const location = {
      ...locationJSON,
      vehicle: vehiclesWithImages,
    };
    return res.json({ message: "location found", location });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

}


exports.SearchVehicle = [
  body("pickupLocation").notEmpty().withMessage("Pickup location is required"),
  body("pickupDate").notEmpty().withMessage("Pickup date is required"),
  body("returnDate").notEmpty().withMessage("Return date is required"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });

      const { pickupLocation, pickupDate, returnDate } = req.body;

      const pickupStart = new Date(`${pickupDate}T00:00:00+01:00`);
      const returnEnd = new Date(`${returnDate}T23:59:59+01:00`);

      const location = await Location.findOne({
        where: {
          zone: pickupLocation,
          status: "accept"
        }
      });

      if (!location)
        return res.status(404).json({ message: "Location not found" });

      let vehicles = await Vehicle.findAll({
        include: [{
          model: Location,
          as: "locationVehicle"
        }],
        where: {
          location_id: location.id,
          status: "available"
        }
      });

      const bookedCars = await CarRentalBookingDetails.findAll({
        where: {
          vehicle_id: { [Op.in]: vehicles.map(v => v.id) },
          deleted_at: null,
          [Op.or]: [
            { pickup_date: { [Op.between]: [pickupStart, returnEnd] } },
            { return_date: { [Op.between]: [pickupStart, returnEnd] } },
            {
              pickup_date: { [Op.lte]: pickupStart },
              return_date: { [Op.gte]: returnEnd }
            }
          ]
        }
      });

      const bookedCarIds = bookedCars.map(b => b.vehicle_id);
      vehicles = vehicles.filter(v => !bookedCarIds.includes(v.id));

      const images = await ImageService.findAll({
        where: {
          type: "vehicle",
          service_id: { [Op.in]: vehicles.map(v => v.id) }
        }
      });

      const vehiclesWithImages = vehicles.map(vehicle => {
        const vehicleJSON = vehicle.toJSON();

        const imagesVehicle = images.filter(
          img => String(img.service_id) === String(vehicle.id)
        );

        return {
          ...vehicleJSON,
          images: imagesVehicle
        };
      });

      res.send({
        message: "Available cars found",
        vehicles: vehiclesWithImages
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
];
exports.GetPublicLocation = async (req, res) => {
  try {
    const locationData = await Location.findAll({
      limit: 6,
      include: [
        {
          model: Vehicle,
          as: "vehicles",
          limit: 1
        }
      ]
    });

    const images = await ImageService.findAll({
      where: {
        type: "vehicle",
      },
    });

    const result = locationData.map((location) => {
      const loc = location.toJSON();

      const vehiclesWithImages = (loc.vehicles || []).map((vehicle) => {
        const imagesVehicle = images.filter(
          (img) => String(img.service_id) === String(vehicle.id)
        );

        return {
          ...vehicle,
          images: imagesVehicle,
        };
      });

      return {
        ...loc,
        vehicles: vehiclesWithImages,
      };
    });

    return res.send({ message: "list of location", data: result, });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "server error" });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date } = req.body

    if (!vehicle_id || !start_date || !end_date) {
      return res.status(400).json({ message: "Missing data" })
    }

    const conflict = await CarRentalBookingDetails.findOne({
      where: {
        vehicle_id: vehicle_id,

        [Op.and]: [
          {
            pickup_date: {
              [Op.lt]: end_date,
            },
          },
          {
            return_date: {
              [Op.gt]: start_date,
            },
          },
        ],
      },

      include: [
        {
          model: Booking,
          as: "bookingCar",
          where: {
            status: {
              [Op.ne]: "annulée",
            },
          },
        },
      ],
    })

    if (conflict) {
      return res.json({
        available: false,
        message: "car is already booking",
      })
    }

    return res.json({
      available: true,
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Server error",
    })
  }
}

exports.GetVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = await Vehicle.findByPk(id);

    if (!vehicleData) {
      return res.status(404).send({ message: "Vehicle not found" });
    }

    const images = await ImageService.findAll({
      where: { type: "vehicle", service_id: id },
    });

    const vehicle = {
      ...vehicleData.toJSON(),
      images: images.map(img => img.toJSON()),
    };

    return res.send({ message: "Vehicle detail", vehicle });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server error" });
  }
};

exports.AddVehicle = [
  body("brand").notEmpty().withMessage("brand is required"),
  body("model").notEmpty().withMessage("model is required"),
  body("year").isInt({ min: 1990 }).withMessage("year is invalid"),

  body("category")
    .isIn(["economy", "standard", "luxury"])
    .withMessage("invalid category"),

  body("fuel")
    .isIn(["petrol", "diesel", "electric", "hybrid"])
    .withMessage("invalid fuel"),

  body("seats").isInt({ min: 1 }).withMessage("seats must be >= 1"),

  body("price_per_day")
    .isNumeric()
    .withMessage("price_per_day must be a number"),

  body("deposit").isNumeric().withMessage("deposit must be a number"),

  body("caution_standard")
    .isInt({ min: 0 })
    .withMessage("caution_standard must be >= 0"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array().map((err) => err.msg) });
    }

    try {
      const userId = req.userId;
      const location = await Location.findOne({
        where: { partner_id: userId },
      });

      if (!location) {
        return res.status(404).json({ message: "location not found" });
      }

      const { brand, model, year, category, fuel, seats, price_per_day, min_age, license_years, deposit, caution_standard, description, features } = req.body;
      const vehicle = await Vehicle.create({ location_id: location.id, brand, model, year, category, fuel, seats, price_per_day, min_age, license_years, deposit, caution_standard, description, features });
      const files = req.files.service_doc;
      for (const element of files) {
        await ImageService.create({
          image_url: element.filename,
          type: "vehicle",
          service_id: vehicle.id
        });
      }

      return res.json({ message: "vehicle created" });
    } catch (err) {
      console.log(err)
      return res.status(500).send({ message: "error server" });
    }
  },
];

exports.UpdateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand,
      model,
      year,
      category,
      fuel,
      seats,
      price_per_day,
      min_age,
      license_years,
      caution_standard,
      deposit,
      description,
      status,
      delete_images,
    } = req.body;

    // Parse features array
    let features = [];
    if (req.body.features) {
      features = Array.isArray(req.body.features)
        ? req.body.features
        : [req.body.features];
    }

    // Find vehicle
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Véhicule non trouvé" });
    }

    // Update vehicle fields
    await vehicle.update({
      brand: brand || vehicle.brand,
      model: model || vehicle.model,
      year: year ? parseInt(year) : vehicle.year,
      category: category || vehicle.category,
      fuel: fuel || vehicle.fuel,
      seats: seats ? parseInt(seats) : vehicle.seats,
      price_per_day: price_per_day || vehicle.price_per_day,
      min_age: min_age ? parseInt(min_age) : vehicle.min_age,
      license_years: license_years ? parseInt(license_years) : vehicle.license_years,
      caution_standard: caution_standard ? parseInt(caution_standard) : vehicle.caution_standard,
      deposit: deposit || vehicle.deposit,
      description: description || vehicle.description,
      status: status || vehicle.status,
      features: features.length > 0 ? features : vehicle.features,
    });

    if (delete_images) {
      try {
        const idsToDelete = JSON.parse(delete_images);
        if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
          await ImageService.destroy({
            where: {
              id: idsToDelete,
              service_id: vehicle.id,
            },
          });
        }
      } catch (error) {
        console.error("Error parsing delete_images:", error);
      }
    }

    if (req.files) {
      if (req.files?.service_doc?.length > 0) {
        const imagePromises = req.files.service_doc.map((file) =>
          ImageService.create({
            image_url: file.filename,
            type: "vehicle",
            service_id: vehicle.id,
          })
        );
        await Promise.all(imagePromises);
      }
    }
    return res.status(200).json({
      message: "Véhicule modifié avec succès",
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return res.status(500).json({
      message: "Erreur lors de la modification du véhicule",
      error: error.message,
    });
  }
};

exports.DeleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const partner_id = req.userId;
    const vehicle = await Vehicle.findByPk(id);
    if (vehicle.partner_id != partner_id) {
      return res.status(403).json({
        message: "you don't have access to delete this vehicle",
      });
    }
    await vehicle.destroy();
    return res.status(200).json({
      message: "vehicle deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "error server",
    });
  }
};

exports.AddAgency = [
  body("name").notEmpty().withMessage("name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("address").notEmpty().withMessage("address is required"),
  body("phone").notEmpty().withMessage("phone is required"),
  body("email").isEmail().withMessage("Email invalid"),

  body("website").optional().isURL().withMessage("Website invalid"),
  body("facebook").optional().isURL().withMessage("Facebook invalid"),
  body("instagram").optional(),
  body("twitter").optional(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array().map((e) => e.msg) });
    }
    try {
      const userId = req.userId;
      const file = req.files.service_doc;
      if (!file) {
        return res.status(422).send({ message: "logo not found" });
      }

      const {
        name,
        description,
        address,
        phone,
        email,
        website,
        facebook,
        instagram,
        twitter,
      } = req.body;

      const agence = await Agence.create({
        name,
        description,
        address,
        phone,
        email,

        website: website || null,
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,

        partner_id: userId,
      });
      await agence.update({ logo: file[0].filename });
      await Activity.create({ type: "service", titre: `Nouvel agence a créé` })

      return res.status(201).send({ message: "Agence créée avec succès" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Erreur serveur" });
    }
  },
];

exports.GetPublicAgency = async (req, res) => {
  try {
    const agencyData = await Agence.findAll({
      limit: 6,
      include: [
        {
          model: Offer,
          as: "offers",
          required: true,
          include: [
            {
              model: Package,
              as: "packages",
              include: [
                {
                  model: Destination,
                  as: "destination"
                }
              ]
            }
          ]
        }
      ]
    });

    const images = await ImageService.findAll({
      where: {
        type: "offer",
      },
    });

    const result = agencyData.map((agency) => {
      const ag = agency.toJSON();

      const offersWithImages = (ag.offers || []).map((offer) => {
        const imagesOffer = images.filter(
          (img) => String(img.service_id) === String(offer.id)
        );

        return {
          ...offer,
          images: imagesOffer,
        };
      });

      return {
        ...ag,
        offers: offersWithImages,
      };
    });

    return res.send({ message: "list of agency", data: result, });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "server error" });
  }
};

exports.GetOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offerData = await Offer.findByPk(id, {
      include: [
        {
          model: Agence,
          as: "agencyOffer"
        },
        {
          model: Package,
          as: "packages",
          include: [
            {
              model: Destination,
              as: "destination"
            }
          ]
        }
      ]
    });

    if (!offerData) {
      return res.status(404).send({ message: "offer not found" });
    }

    const images = await ImageService.findAll({
      where: { type: "offer", service_id: id },
    });

    const offer = {
      ...offerData.toJSON(),
      images: images.map(img => img.toJSON()),
    };

    return res.send({ message: "offer detail", offer });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Server error" });
  }
};


exports.GetAgency = async (req, res) => {
  try {
    const partner_id = req.userId;
    const agencyData = await Agence.findOne({
      where: { partner_id },
      include: [
        {
          model: Offer,
          as: "offers",
          required: false,
          include: [{
            model: Package,
            as: "packages",
          }]
        },

      ]
    });
    if (!agencyData) {
      return res.status(404).json({ message: "agency not found" });
    }
    const images = await ImageService.findAll({
      where: {
        type: "offer",
      },
    });

    const agencyJSON = agencyData.toJSON();
    const offerWithImages = agencyJSON.offers.map((offers) => {
      const imagesOffer = images.filter(
        (img) => String(img.service_id) === String(offers.id)
      );

      return {
        ...offers,
        imagesOffer,
      };
    });
    const agency = {
      ...agencyJSON,
      offers: offerWithImages,
    };
    return res.json({ message: "agency found1", agency });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

};


exports.UpdateOffer = async (req, res) => {
  const { id } = req.params
  const {
    title, location, description,
    category, difficulty,
    packages,
    removed_images,
    removed_package
  } = req.body

  const inclusions = req.body["inclusions[]"] || []
  const available_dates = req.body["available_dates[]"] || []

  try {
    await Offer.update(
      {
        title, location, description,
        category, difficulty,
        inclusions: Array.isArray(inclusions) ? inclusions : [inclusions],
        available_dates: Array.isArray(available_dates) ? available_dates : [available_dates],
      },
      { where: { id } }
    )

    if (removed_images) {
      const ids = JSON.parse(removed_images)
      if (ids.length > 0) {
        const toDelete = await ImageService.findAll({ where: { id: ids } })
        toDelete.forEach((img) => {
          const filePath = path.join(__dirname, "../uploads", img.image_url)
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        })
        await ImageService.destroy({ where: { id: ids } })
      }
    }

    if (req.files && req.files?.service_doc?.length > 0) {
      const imageRecords = req.files.service_doc.map((file) => ({
        image_url: file.filename,
        type: "offer",
        service_id: id,
      }))
      await ImageService.bulkCreate(imageRecords)
    }

    if (removed_package) {
      const packIds = JSON.parse(removed_package)
      if (packIds.length > 0) {
        for (const id of packIds) {
          const pkg = await Package.findByPk(id)
          pkg.destroy();
        }
      }

    }
    if (packages) {
      const pkgs = JSON.parse(packages)

      for (const pkg of pkgs) {
        const existing = await Package.findByPk(pkg.id)

        if (!existing) {
          const createdPackage = await Package.create({
            title: pkg.title,
            month: pkg.month,
            year: Number(pkg.year),
            type: pkg.type,
            departureDate: pkg.departureDate,
            departureTime: pkg.departureTime,
            departureAirport: pkg.departureAirport,
            returnDate: pkg.returnDate,
            returnTime: pkg.returnTime,
            returnAirport: pkg.returnAirport,
            price: pkg.price,
            number_place: pkg.seats,
            installment: pkg.installment,
            offer_id: id,
          })

          if (pkg.destinations?.length > 0) {
            const destinationsData = pkg.destinations.map(d => ({
              name: d.name,
              rating: d.rating || 3,
              nights: d.nights || 1,
              package_id: createdPackage.id,
            }))

            await Destination.bulkCreate(destinationsData)
          }

        } else {
          await existing.update({
            title: pkg.title,
            month: pkg.month,
            year: Number(pkg.year),
            type: pkg.type,
            departureDate: pkg.departureDate,
            departureTime: pkg.departureTime,
            departureAirport: pkg.departureAirport,
            returnDate: pkg.returnDate,
            returnTime: pkg.returnTime,
            returnAirport: pkg.returnAirport,
            price: pkg.price,
            number_place: pkg.seats,
            installment: pkg.installment,
          })

          await Destination.destroy({
            where: { package_id: pkg.id }
          })

          if (pkg.destinations?.length > 0) {
            const destinationsData = pkg.destinations.map(d => ({
              name: d.name,
              rating: d.rating || 3,
              nights: d.nights || 1,
              package_id: pkg.id,
            }))

            await Destination.bulkCreate(destinationsData)
          }
        }
      }
    }

    return res.json({ message: "offer updated." })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}


exports.AddOffer = [
  body("title").notEmpty().withMessage("title is required"),
  body("type").notEmpty().withMessage("type is required"),
  body("destination").notEmpty().withMessage("destination is required"),
  body("duration").isInt({ min: 1 }).withMessage("duration is required"),
  body("description").notEmpty().withMessage("description is required"),
  body("included").notEmpty().withMessage("included is required"),
  body("not_included").notEmpty().withMessage("not_included is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const {
        title,
        type,
        destination,
        price,
        duration,
        max_persons,
        description,
      } = req.body;

      let included = [];
      let not_included = [];
      let packages = [];

      try {
        included = JSON.parse(req.body.included || "[]");
        if (!Array.isArray(included)) throw new Error();
      } catch {
        return res.status(400).json({ message: "included must be array" });
      }

      try {
        not_included = JSON.parse(req.body.not_included || "[]");
        if (!Array.isArray(not_included)) throw new Error();
      } catch {
        return res.status(400).json({ message: "not_included must be array" });
      }

      try {
        packages = JSON.parse(req.body.packages || "[]");
        if (!Array.isArray(packages)) throw new Error();
      } catch {
        return res.status(400).json({ message: "packages must be array" });
      }

      // ───── Get agency ─────
      const agency = await Agence.findOne({
        where: { partner_id: req.userId },
      });

      if (!agency) return res.status(404).json({ message: "agency not found" });

      // ───── Create Offer ─────
      const offer = await Offer.create({
        title,
        type,
        destination,
        price,
        duration,
        max_persons,
        description,
        included,
        not_included,
        agency_id: agency.id,
      });

      for (const pkg of packages) {
        const createdPackage = await Package.create({
          title: pkg.title,
          month: pkg.month,
          year: Number(pkg.year),
          type: pkg.type,
          departureDate: pkg.departureDate,
          departureTime: pkg.departureTime,
          departureAirport: pkg.departureAirport,
          returnDate: pkg.returnDate,
          returnTime: pkg.returnTime,
          returnAirport: pkg.returnAirport,
          price: pkg.price,
          number_place: pkg.seats,
          installment: pkg.installment,
          offer_id: offer.id,
        });

        if (pkg.destinations && pkg.destinations.length > 0) {
          const destinationsData = pkg.destinations.map((d) => ({
            name: d.name,
            rating: d.rating || 3,
            nights: d.nights || 1,
            package_id: createdPackage.id,
          }));

          await Destination.bulkCreate(destinationsData);
        }
      }

      // ───── Upload images ─────
      const files = req.files?.service_doc || [];

      for (const file of files) {
        await ImageService.create({
          image_url: file.filename,
          type: "offer",
          service_id: offer.id,
        });
      }

      return res.status(201).json({
        message: "Offer created with packages successfully",
        offer,
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "server error" });
    }
  },
];

exports.AddAirline = [
  body("name")
    .notEmpty().withMessage("name is required"),

  body("hub")
    .notEmpty().withMessage("hub is required")
    .isLength({ min: 3 }).withMessage("Hub invalid"),

  body("description")
    .notEmpty().withMessage("description is required"),

  body("classes")
    .isArray({ min: 1 }).withMessage("select at less one class"),

  body("amenities")
    .isArray({ min: 1 }).withMessage("select at less service"),
  , async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { name, hub, description, classes, amenities } = req.body;
      const partner_id = req.userId;

      await Compagnie.create({
        name,
        hub,
        description,
        classes,
        services: amenities,
        partner_id
      });
      await Activity.create({ type: "service", titre: `Nouvel compagnie a créé` })
      return res.status(201).send({ message: "airline created" });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Server error", });
    }
  }
];

exports.GetAirline = async (req, res) => {
  try {
    const partner_id = req.userId;
    const airline = await Compagnie.findOne({
      where: { partner_id },
      include: [
        {
          model: Flight,
          as: "FlightCompagnie",
          required: false,
        }
      ]
    });
    if (!airline) {
      return res.status(404).json({ message: "airline not found" });
    }
    return res.json({ message: "airline found", airline });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

};
exports.GetFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await Flight.findByPk(id, {
      include: [
        {
          model: Compagnie,
          as: "compagnieFlight",
          required: false,
        }, {
          model: FlightClasses,
          as: "flightClasses"
        }
      ]
    });
    if (!flight) {
      return res.status(404).json({ message: "airline not found" });
    }
    return res.json({ message: "airline found", flight });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

};

exports.GetPublicAirline = async (req, res) => {
  try {
    const airline = await Compagnie.findAll({
      limit: 6,
      include: [
        {
          model: Flight,
          as: "FlightCompagnie",
          required: true,
          include: [
            {
              model: FlightClasses,
              as: "flightClasses"
            }
          ]
        }
      ]
    });


    return res.send({ message: "list of airline", airline });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "server error" });
  }
};


exports.GetSearchAirline = [
  body("type")
    .notEmpty().withMessage("type is required")
    .isIn(["aller-simple", "aller retour"]).withMessage("type is invalid"),
  body("from")
    .notEmpty().withMessage("from is required"),
  body("to")
    .notEmpty().withMessage("to is required"),
  body("dateFlight")
    .notEmpty().withMessage("date flight is required"),
  body("dateReturnFlight")
    .if(body("type").equals("go and return"))
    .notEmpty().withMessage("date return flight is required"),
  body("number")
    .notEmpty().withMessage("number is required")
    .isInt({ min: 1 }).withMessage("number must be at least 1"),
  body("class")
    .notEmpty().withMessage("class is required"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      const {
        type,
        from,
        to,
        dateFlight,
        dateReturnFlight,
        number,
        class: flightClass
      } = req.body;


      if (type === "aller retour") {
        const startReturn = new Date(`${dateReturnFlight}T00:00:00+01:00`);
        const endReturn = new Date(`${dateReturnFlight}T23:59:59+01:00`);
        const start = new Date(`${dateFlight}T00:00:00+01:00`);
        const end = new Date(`${dateFlight}T23:59:59+01:00`);
        const flights = await Compagnie.findAll({
          include: [
            {
              model: Flight,
              as: "FlightCompagnie",
              required: true,
              where: {
                departure_airport: from,
                arrival_airport: to,
                arrival: {
                  [Op.between]: [startReturn, endReturn]
                },
                departure: {
                  [Op.between]: [start, end]
                }
              },
              include: [
                {
                  model: FlightClasses,
                  as: "flightClasses",
                  where: {
                    class_name: flightClass,
                    seats_available: {
                      [Op.gte]: number
                    }
                  }
                }
              ]
            }
          ]
        });
        res.send({ message: "flights found", flights })
      } else {
        const start = new Date(`${dateFlight}T00:00:00+01:00`);
        const end = new Date(`${dateFlight}T23:59:59+01:00`);

        const flights = await Compagnie.findAll({
          include: [
            {
              model: Flight,
              as: "FlightCompagnie",
              required: true,
              where: {
                departure_airport: from,
                arrival_airport: to,
                departure: {
                  [Op.between]: [start, end]
                }
              },
              include: [
                {
                  model: FlightClasses,
                  as: "flightClasses",
                  where: {
                    class_name: flightClass,
                    seats_available: {
                      [Op.gte]: number
                    }
                  }
                }
              ]
            }
          ]
        });
        res.send({ message: "flights found", flights })

      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "server error" });
    }
  }
];
exports.AddFlight = [
  body("flight_number").notEmpty().withMessage("Flight number is required"),
  body("type_flight").notEmpty().withMessage("type Flight is required"),
  body("from").notEmpty().withMessage("Departure airport is required"),
  body("to").notEmpty().withMessage("Arrival airport is required")
    .custom((value, { req }) => {
      if (value === req.body.from) {
        throw new Error("Arrival and departure airports must be different");
      }
      return true;
    }),
  body("departure").notEmpty().withMessage("Departure time is required")
    .isISO8601().withMessage("Departure must be a valid date"),
  body("arrival").notEmpty().withMessage("Arrival time is required")
    .isISO8601().withMessage("Arrival must be a valid date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departure)) {
        throw new Error("Arrival must be after departure");
      }
      return true;
    }),
  body("duration").optional().isString(),
  body("classes").notEmpty().withMessage("Classes are required")
    .isObject().withMessage("Classes must be an object")
    .custom((value) => {
      const hasAtLeastOne = Object.values(value).some(
        v => v !== "" && v !== null && Number(v) > 0
      );
      if (!hasAtLeastOne) {
        throw new Error("At least one class price is required");
      }
      return true;
    }),
  body("classesChildren").notEmpty().withMessage("classes Children are required")
    .isObject().withMessage("classes Children must be an object")
    .custom((value) => {
      const hasAtLeastOne = Object.values(value).some(
        v => v !== "" && v !== null && Number(v) > 0
      );
      if (!hasAtLeastOne) {
        throw new Error("At least one class price is required");
      }
      return true;
    }),
  body("seatsClasses").notEmpty().withMessage("Seats per class are required")
    .isObject().withMessage("SeatsClasses must be an object")
    .custom((value, { req }) => {
      const totalSeats = Object.values(value)
        .map(v => parseInt(v) || 0)
        .reduce((a, b) => a + b, 0);

      if (totalSeats > parseInt(req.body.seats_total)) {
        throw new Error("Total seats per classes exceed total seats");
      }
      const classKeys = Object.keys(req.body.classes || {});
      const seatKeys = Object.keys(value || {});
      const mismatch = classKeys.some(k => !seatKeys.includes(k));
      if (mismatch) {
        throw new Error("SeatsClasses must match classes keys");
      }
      return true;
    }),
  body("seats_total").notEmpty().withMessage("Total seats is required")
    .isInt({ min: 1 }),
  body("baggage_kg").optional()
    .isInt({ min: 0 }),
  body("status").optional()
    .isIn(["programmé", "annulé", "retardé"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const t = await Flight.sequelize.transaction();
    const partner_id = req.userId;

    try {
      let {
        flight_number,
        from,
        to,
        departure,
        arrival,
        duration,
        classes,
        classesChildren,
        seatsClasses,
        seats_total,
        baggage_kg,
        status,
        type_flight
      } = req.body;

      if (typeof classes === "string") classes = JSON.parse(classes);
      if (typeof seatsClasses === "string") seatsClasses = JSON.parse(seatsClasses);
      const airline = await Compagnie.findOne({ where: { partner_id } });

      const seats_available = Object.values(seatsClasses)
        .map(v => parseInt(v) || 0)
        .reduce((a, b) => a + b, 0);

      const flight = await Flight.create({
        flight_number,
        departure_airport: from,
        arrival_airport: to,
        departure,
        arrival,
        duration,
        seats_total,
        seats_available,
        baggage_kg,
        status,
        airline_id: airline.id,
        type_flight
      }, { transaction: t });


      const classRows = Object.keys(classes)
        .filter(cls => classes[cls] && Number(classes[cls]) > 0)
        .map(cls => ({
          class_name: cls,
          price_adult: Number(classes[cls]),
          price_children: Number(classesChildren[cls]),
          seats_available: Number(seatsClasses[cls] || 0),
          flight_id: flight.id,
        }));

      await FlightClasses.bulkCreate(classRows, { transaction: t });

      await t.commit();

      return res.status(201).json({
        message: "flight created"
      });

    } catch (err) {
      await t.rollback();
      console.error(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
];

exports.AddVoyage = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("website").optional({ checkFalsy: true }).isURL().withMessage("Invalid website URL"),
  body("phone").optional().matches(/^[0-9+\s-]{8}$/).withMessage("Invalid phone number"),
  body("categories").isArray().withMessage("Categories must be an array"),
  body("equipments").isArray().withMessage("Equipments must be an array"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const {
        name, description, location, website, phone, categories, equipments } = req.body;
      const partner_id = req.userId;
      await Voyage.create({
        name,
        description,
        location,
        website,
        phone,
        categories,
        equipments,
        partner_id
      });
      await Activity.create({ type: "service", titre: `Nouvel voyage a créé` })
      res.status(201).send({ message: "voyage created" });
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: "server error" });
    }

  }
];
exports.GetVoyage = async (req, res) => {
  try {
    const partner_id = req.userId;
    const voyageData = await Voyage.findOne({
      where: { partner_id },
      include: [
        {
          model: Circuit,
          as: "circuits",
          required: false,
          where: {
            deletedAt: null
          },
          include: [
            {
              model: Package,
              as: "packagesCircuit",
              required: false,

              include: [
                {
                  model: Destination,
                  as: "destination",
                  required: false,

                }
              ]
            }
          ]
        }
      ]
    });
    if (!voyageData) {
      return res.status(404).json({ message: "voyage not found" });
    }
    const images = await ImageService.findAll({
      where: {
        type: "circuit",
      },
    });
    const voyageJSON = voyageData.toJSON();

    const circuitsWithImages = voyageJSON.circuits.map((circuits) => {
      const imagesCircuits = images.filter(
        (img) => String(img.service_id) === String(circuits.id)
      );

      return {
        ...circuits,
        imagesCircuits,
      };
    });

    const voyage = {
      ...voyageJSON,
      circuits: circuitsWithImages,
    };
    return res.json({ message: "voyage found", voyage });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

};

exports.GetCircuitById = async (req, res) => {
  try {
    const { id } = req.params;
    const circuitData = await Circuit.findByPk(id, {
      include: [
        {
          model: Voyage,
          as: "voyagesCircuit",
        },
        {
          model: Package,
          as: "packagesCircuit",
          include: [
            {
              model: Destination,
              as: "destination"
            }
          ]
        }
      ]
    });
    if (!circuitData) {
      return res.status(404).json({ message: "circuit not found" });
    }

    const images = await ImageService.findAll({
      where: { type: "circuit", service_id: id },
    });

    const circuit = {
      ...circuitData.toJSON(),
      images: images.map(img => img.toJSON()),
    };

    return res.json({ message: "circuit found", circuit });
  } catch (err) {
    console.log(err)
    return res.status(500).send({ message: "error server" })
  }

};

exports.UpdateCircuit = async (req, res) => {
  const { id } = req.params
  const {
    title, location, description,
    category, difficulty,
    packages,
    removed_images,
    removed_package
  } = req.body

  const inclusions = req.body["inclusions[]"] || []
  const available_dates = req.body["available_dates[]"] || []

  try {
    await Circuit.update(
      {
        title, location, description,
        category, difficulty,
        inclusions: Array.isArray(inclusions) ? inclusions : [inclusions],
        available_dates: Array.isArray(available_dates) ? available_dates : [available_dates],
      },
      { where: { id } }
    )

    if (removed_images) {
      const ids = JSON.parse(removed_images)
      if (ids.length > 0) {
        const toDelete = await ImageService.findAll({ where: { id: ids } })
        toDelete.forEach((img) => {
          const filePath = path.join(__dirname, "../uploads", img.image_url)
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        })
        await ImageService.destroy({ where: { id: ids } })
      }
    }

    if (req.files && req.files.service_doc.length > 0) {
      const imageRecords = req.files.service_doc.map((file) => ({
        image_url: file.filename,
        type: "circuit",
        service_id: id,
      }))
      await ImageService.bulkCreate(imageRecords)
    }

    if (removed_package) {
      for (const id of removed_package) {
        const pkg = await Package.findByPk(id)
        pkg.destroy();
      }
    }

        if (packages) {
      const pkgs = JSON.parse(packages)

      for (const pkg of pkgs) {
        const existing = await Package.findByPk(pkg.id)

        if (!existing) {
          const createdPackage = await Package.create({
            title: pkg.title,
            month: pkg.month,
            year: Number(pkg.year),
            type: pkg.type,
            departureDate: pkg.departureDate,
            departureTime: pkg.departureTime,
            departureAirport: pkg.departureAirport,
            returnDate: pkg.returnDate,
            returnTime: pkg.returnTime,
            returnAirport: pkg.returnAirport,
            price: pkg.price,
            number_place: pkg.seats,
            installment: pkg.installment,
            offer_id: id,
          })

          if (pkg.destinations?.length > 0) {
            const destinationsData = pkg.destinations.map(d => ({
              name: d.name,
              rating: d.rating || 3,
              nights: d.nights || 1,
              package_id: createdPackage.id,
            }))

            await Destination.bulkCreate(destinationsData)
          }

        } else {
          await existing.update({
            title: pkg.title,
            month: pkg.month,
            year: Number(pkg.year),
            type: pkg.type,
            departureDate: pkg.departureDate,
            departureTime: pkg.departureTime,
            departureAirport: pkg.departureAirport,
            returnDate: pkg.returnDate,
            returnTime: pkg.returnTime,
            returnAirport: pkg.returnAirport,
            price: pkg.price,
            number_place: pkg.seats,
            installment: pkg.installment,
          })

          await Destination.destroy({
            where: { package_id: pkg.id }
          })

          if (pkg.destinations?.length > 0) {
            const destinationsData = pkg.destinations.map(d => ({
              name: d.name,
              rating: d.rating || 3,
              nights: d.nights || 1,
              package_id: pkg.id,
            }))

            await Destination.bulkCreate(destinationsData)
          }
        }
      }
    }


    return res.json({ message: "Circuit mis à jour avec succès." })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Erreur serveur." })
  }
}

exports.GetPublicVoyage = async (req, res) => {
  try {
    const voyageData = await Voyage.findAll({
      limit: 6,
      include: [
        {
          model: Circuit,
          as: "circuits",
          required: true,
          include: [
            {
              model: Package,
              as: "packagesCircuit",
              attributes: ["price"]
            }
          ]
        }
      ]
    });

    if (!voyageData || voyageData.length === 0) {
      return res.status(404).json({ message: "voyage not found" });
    }
    const images = await ImageService.findAll({
      where: {
        type: "circuit",
      },
    });
    const voyageJSON = voyageData.map(v => v.toJSON());
    const voyages = voyageJSON.map(voyage => {

      const circuitsWithImages = voyage.circuits.map((circuit) => {
        const imagesCircuits = images.filter(
          (img) => String(img.service_id) === String(circuit.id)
        );

        return {
          ...circuit,
          imagesCircuits,
        };
      });

      return {
        ...voyage,
        circuits: circuitsWithImages,
      };
    });
    return res.json({ message: "voyage found", voyages });

  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "server error" });
  }
};

exports.DeleteCircuit = async (req, res) => {
  try {
    const { id } = req.params;
    const partner_id = req.userId;
    const circuit = await Circuit.findByPk(id);
    if (!circuit) {
      return res.status(404).json({ message: "circuit not found" })
    }
    if (circuit.partner_id != partner_id) {
      return res.status(403).json({ message: "you don't have access to this circuit" })
    }
    await circuit.destroy();
    return res.json({ message: "circuit deleted" })
  } catch {
    return res.status(500).json({ message: "error service" })
  }
}

exports.DeleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const partner_id = req.userId;
    const offer = await Offer.findByPk(id, {
      include: {
        model: Agence,
        as: "agencyOffer"
      }
    });
    if (!offer) {
      return res.status(404).json({ message: "offer not found" })
    }
    if (offer.agencyOffer.partner_id != partner_id) {
      return res.status(403).json({ message: "you don't have access to this offer" })
    }
    await offer.destroy();
    return res.json({ message: "offer deleted" })
  } catch {
    return res.status(500).json({ message: "error service" })
  }
}
exports.AddCircuit = [
  body("title").notEmpty().withMessage("Title is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("description").isLength({ min: 10 }).withMessage("Description must be at least 10 chars"),
  body("category").isIn(["voyage", "camping", "désert", "aventure", "plage", "montagne", "culturel"]).withMessage("Invalid category"),
  body("difficulty").isIn(["facile", "modéré", "difficile", "très difficile"]).withMessage("Invalid difficulty"),
  body("inclusions").optional({ checkFalsy: true }).isArray(),
  body("available_dates").optional({ checkFalsy: true }).isArray(),
  async (req, res) => {
    try {
      const { title, location, description, category, difficulty, inclusions, available_dates } = req.body;
      const partner_id = req.userId;
      let packages = [];
      try {
        packages = JSON.parse(req.body.packages || "[]");
        if (!Array.isArray(packages)) throw new Error();
      } catch {
        return res.status(400).json({ message: "packages must be array" });
      }

      const voyage = await Voyage.findOne({ where: { partner_id } });
      if (!voyage) {
        res.status(404).send({ message: "voyage not found" });
      }
      let maxDuration = 0;

      for (const pkg of packages) {
        const departure = new Date(pkg.departureDate);
        const ret = new Date(pkg.returnDate);

        const duration = Math.max(
          1,
          Math.ceil((ret - departure) / (1000 * 60 * 60 * 24))
        );

        if (duration > maxDuration) {
          maxDuration = duration;
        }
      }
      const circuit = await Circuit.create({ title, location, duration: maxDuration, description, category, difficulty, inclusions, available_dates, voyage_id: voyage.id });

      for (const pkg of packages) {
        const createdPackage = await Package.create({
          title: pkg.title,
          month: pkg.month,
          year: Number(pkg.year),
          type: pkg.type,
          departureDate: pkg.departureDate,
          departureTime: pkg.departureTime,
          departureAirport: pkg.departureAirport,
          returnDate: pkg.returnDate,
          returnTime: pkg.returnTime,
          returnAirport: pkg.returnAirport,
          price: pkg.price,
          number_place: pkg.seats,
          installment: pkg.installment,
          circuit_id: circuit.id,
        });

        if (pkg.destinations && pkg.destinations.length > 0) {
          const destinationsData = pkg.destinations.map((d) => ({
            name: d.name,
            rating: d.rating || 3,
            nights: d.nights || 1,
            package_id: createdPackage.id,
          }));

          await Destination.bulkCreate(destinationsData);
        }
      }

      const files = req.files.service_doc;
      for (const element of files) {
        await ImageService.create({
          image_url: element.filename,
          type: "circuit",
          service_id: circuit.id
        });
      }
      res.status(201).send({ message: "circuit created" });
    } catch (err) {
      console.log(err)
      res.status(500).send({ message: "server error" });
    }
  }
];

