const { body, validationResult } = require("express-validator");
const { Hotel, User, Booking, HotelBookingDetails, Reviews, Agence, Offer } = require("../models");
const Room = require("../models/Room");
const ImageService = require("../models/ImageServices");
const { Op, where } = require("sequelize");
const Location = require("../models/Location");
const Vehicle = require("../models/Vehicle");

exports.GetPublicHotel = async (req,res) => {
        try{
            const { id } = req.params
           const hotel = await Hotel.findByPk(id,{
            include:[
                {
                    model:ImageService,
                    where: { type: "hotel" },
                    as:"imagesHotel"
                },{
                        model:Room,
                        as:"rooms"
                }
            ]
        });
        if(!hotel){
            return res.status(404).json({message:"hotel not found"});
        }
            return res.json({message:"hotel found",hotel});
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"error server"})
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
        where: { government: destination },
        attributes: ["id", "government"],
        include: [
          {
            model: Room,
            as: "rooms"
          }
        ]
      })

      const availableHotels = hotels
        .map(hotel => {

          let totalPrice = 0
          let selectedRooms = []

          const isValid = rooms.every(roomRequest => {

            const [adults, children] = roomRequest
            const guests = adults + children

            const room = hotel.rooms.find(r => r.capacity >= guests)

            if (!room) return false

            const pricePerNight =
              room.price_by_day +
              adults * room.price_by_adult +
              children * room.price_by_children

            totalPrice += pricePerNight * nights

            selectedRooms.push({
              roomId: room.id,
              name: room.name,
              capacity: room.capacity,
              priceByDay: room.price_by_day,
              priceByAdult: room.price_by_adult,
              priceByChildren: room.price_by_children,
              requestedAdults: adults,
              requestedChildren: children,
              pricePerNight
            })

            return true
          })

          if (!isValid) return null

          return {
            ...hotel.toJSON(),
            nights,
            totalPrice,
            selectedRooms
          }

        })
        .filter(Boolean)

      if (availableHotels.length === 0) {
        return res.status(404).json({
          message: "no hotel available"
        })
      }

      return res.json({
        message: "hotel found",
        hotels: availableHotels
      })

    } catch (err) {
      return res.status(500).json({message: "server error"})
    }
  }
]

exports.GetAllHotel = async (req,res) => {
        try{
           const hotel = await Hotel.findAll({
            limit: 9,
            include:[
                {
                    model:ImageService,
                    where: { type: "hotel" },
                    as:"imagesHotel",
                    required:false
                },{
                    model:Room,
                    as:"rooms"
                }
            ]
        });
            return res.json({message:"hotel found",hotel});
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"error server"})
        }

    }
exports.GetAllServices = async (req,res) => {
        try{
            const hotel = await Hotel.findAll({
                include:[
                { 
                    model:User,
                    as:"partnerHotel",
                    attributes: { exclude: ["password"] }
                }
            ]
            });
            return res.json({message:"hotel found",hotel});
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"error server"})
        }

    }
exports.GetHotel = async (req,res) => {
        try{
            const partner_id = req.userId;
            const hotel = await Hotel.findOne({where: {partner_id},
                include:[
                    {
                        model:Room,
                        as:"rooms"
                    },
                    {
                        model:Reviews,
                        as:"hotelReview",
                        where :{type_service:"hotels"},
                        include:[
                            {
                                model:User,
                                as:"clientReview",
                                attributes:["name"]
                            }
                        ]
                    }
                ]
            });
            if(!hotel){
                return res.status(404).json({message:"hotel not found"});
            }
            const images = await ImageService.findAll({where :{type:"hotel",service_id:hotel.id}})
            const data = {...hotel.toJSON(),images}
            return res.json({message:"hotel found",hotel:data});
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"error server"})
        }

    }
exports.AddHotel = [
     body("name").notEmpty().withMessage("name is required"),
    body("description").notEmpty().withMessage("description is required"),
    body("address").notEmpty().withMessage("address by day is required"),
    body("equipments").notEmpty().withMessage("equipments by day is required"),
    async (req,res) => {
         const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const partner_id = req.userId;
            const {name,description,address,equipments} = req.body;
            const hotel = await Hotel.create({name,description,address,equipments,partner_id});
            const files = req.files.service_doc;
            for (const element of files) {
            await ImageService.create({
                image_url: element.filename,
                type: "hotel",
                service_id: hotel.id
            });
            }
            return res.json({message:"hotel created"});
        }catch(err){
            return res.status(500).send({message:"error server"})
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
    async (req,res) => {
        const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
        const {name,capacity,price_by_day,count,price_by_children,price_by_adult} = req.body;
        const userId = req.userId;
        const hotel = await Hotel.findOne({where : {partner_id:userId}});
        if(!hotel){
            return res.status(404).json({message:"hotel not found"});
        }
        await Room.create({name,capacity,price_by_day,price_by_adult,price_by_children,count,hotel_id:hotel.id});
        return res.json({message:"hotel created"});
    }catch{
            return res.status(500).send({message:"error server"})
    }
    }
]

exports.AddLocation = [
    body("name").notEmpty().withMessage("name is required"),
    body("address").notEmpty().withMessage("address by day is required"),
    async (req,res) => {
         const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const partner_id = req.userId;
            const {name,address} = req.body;
            await Location.create({name,address,partner_id});
            return res.json({message:"location created"});
        }catch(err){
            return res.status(500).send({message:"error server"})
        }

    }
]

exports.GetLocation = async (req,res) => {
        try{
            const partner_id = req.userId;
            const location = await Location.findOne({where: {partner_id},
                include:[
                    {
                        model:Vehicle,
                        as:"vehicle",
                        required:false,
                        include:[
                            {
                                model:ImageService,
                                as:"imagesVehicle",
                                required:false,
                                where:{type:"vehicle"}
                            }
                        ]
                    },
                ]
            });
            if(!location){
                return res.status(404).json({message:"location not found"});
            }
            return res.json({message:"location found",location});
        }catch(err){
            console.log(err)
            return res.status(500).send({message:"error server"})
        }

    }

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
        deposit,
        caution_standard,
        description,
        features,
      } = req.body;

      

    const vehicle = await Vehicle.create({
        location_id: location.id,
        brand,
        model,
        year,
        category,
        fuel,
        seats,
        price_per_day,
        min_age,
        license_years,
        deposit,
        caution_standard,
        description,
        features,
      });
       const files = req.files.service_doc;
            for (const element of files) {
            await ImageService.create({
                image_url: element.filename,
                type: "vehicle",
                service_id: vehicle.id
            });
            }

      return res.json({message: "vehicle created"});
    } catch (err) {
      console.log(err)
      return res.status(500).send({ message: "error server" });
    }
  },
];

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
       if(!file){
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

    await agence.update({logo:file.filename});

      return res.status(201).send({message: "Agence créée avec succès"});
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "Erreur serveur" });
    }
  },
];

exports.GetAgency = async (req,res) => {
        try{
            const partner_id = req.userId;
            const agency = await Agence.findOne({where: {partner_id},
            
            include:[
                {
                    model:Offer,
                    as:"offers",
                    required:false,
                    include:[{
                        model:ImageService,
                        as:"imagesOffer",
                        where:{type:"agence"},
                        required:false,
                    }]
                },
                
            ]
        });
            if(!agency){
                return res.status(404).json({message:"agency not found"});
            }
            return res.json({message:"agency found",agency});
        }catch(err){
          console.log(err)
            return res.status(500).send({message:"error server"})
        }

    }
exports.AddOffer = [
  body("title").notEmpty().withMessage("title is required"),
  body("type").notEmpty().withMessage("type is required"),
  body("destination").notEmpty().withMessage("destination is required"),
  body("price").isNumeric().withMessage("price must be a number"),

  body("duration").isInt({ min: 1 }).withMessage("duration is required"),
  body("max_persons").isInt({ min: 1 }).withMessage("max_persons is required"),

  body("description").notEmpty().withMessage("description is required"),

  body("included").notEmpty().withMessage("included is required"),
  body("not_included").notEmpty().withMessage("not_included is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .send({ errors: errors.array().map((e) => e.msg) });
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

      let included;
      let not_included;

      try {
        included = JSON.parse(req.body.included);
        if (!Array.isArray(included)) throw new Error();
      } catch {
        return res.status(400).send({ message: "included must be a JSON array" });
      }

      try {
        not_included = JSON.parse(req.body.not_included);
        if (!Array.isArray(not_included)) throw new Error();
      } catch {
        return res
          .status(400)
          .send({ message: "not_included must be a JSON array" });
      }
    const userId = req.userId;
      const agency = await Agence.findOne({
        where: { partner_id: userId },
      });
      if(!agency){
         return res.status(404).json({ message: "agency not found" });
      }
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
        agency_id:agency.id
      });
      const files = req.files.service_doc;
            for (const element of files) {
            await ImageService.create({
                image_url: element.filename,
                type: "agence",
                service_id: offer.id
            });
            }
      return res.status(201).json({
        message: "Offer created successfully",
        offer,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "server error" });
    }
  },
];