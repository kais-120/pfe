const { body, validationResult } = require("express-validator");
const { Hotel } = require("../models");
const Room = require("../models/Room");

exports.AddHotel = [
    
    ,
    async (req,res) => {

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
        const {name,capacity,price_by_day,count,price_by_children,price_by_adult} = req.body;
        const { id } = req.params;
        const userId = req.userId;
        const hotel = await Hotel.findByPk(id);
        if(hotel){
            return res.status(404).json({message:"hotel not found"});
        }
        if(hotel.partner_id !== userId){
            return res.status(403).json({message:"Forbidden"});
        }
        await Room.create({name,capacity,price_by_day,price_by_adult,price_by_children,count});
        return res.status(404).json({message:"hotel not found"});
    }
]