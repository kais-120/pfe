const { body, validationResult } = require("express-validator");
const { Hotel, User, Booking, HotelBookingDetails } = require("../models");
const Room = require("../models/Room");
const ImageService = require("../models/ImageServices");
const { Op, where } = require("sequelize");

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
      console.log(err)
      return res.status(500).json({
        message: "server error"
      })
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
            const hotel = await Hotel.findOne({partner_id,
                include:[
                    {
                        model:Room,
                        as:"rooms"
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