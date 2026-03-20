const { body, validationResult } = require("express-validator");
const { Room, Booking, Hotel, User } = require("../models");
const HotelBookingDetails = require("../models/HotelBookingDetails");

exports.BookingHotel = [
    body("check_in_date").notEmpty().withMessage("check in date is required")
    .isDate().withMessage("check in date should be date"),
    body("check_out_date").notEmpty().withMessage("check out date is required")
    .isDate().withMessage("check out date should be date"),
    body("number_of_guests_children").notEmpty().withMessage("number of guests children is required")
    .isArray().withMessage("number of guests children should be array"),
    body("number_of_guests_adult").notEmpty().withMessage("number of guests adult is required")
    .isArray().withMessage("number of guests adult should be array"),
    body("rooms").notEmpty().withMessage("room id is required")
    .isArray().withMessage("room id should be array"),
    ,async (req,res) => {
        const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const { check_in_date,check_out_date,number_of_guests_adult,number_of_guests_children,rooms } = req.body;
            if(check_in_date >= check_out_date){
                return res.status(400).send({message:"date invalid"});
            }
            let total_price = 0;
            const client_id = req.userId;
            const booking = await Booking.create({total_price,type:"hotel",client_id})
            let index = 0;
            for(const r of rooms){
                const room = await Room.findByPk(r);
                    if(!room){
                        booking.destroy();
                        return res.status(404).send({message:"room not found"});
                    }
                    const checkIn = new Date(check_in_date);
                    const checkOut = new Date(check_out_date);
                    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                    const adultPrice = room.price_by_adult * number_of_guests_adult[index] * days;
                    const childrenPrice = room.price_by_children * number_of_guests_children[index] * days;
                    total_price = total_price + adultPrice + childrenPrice
                    HotelBookingDetails.create({check_in_date,check_out_date,number_of_guests_adult:number_of_guests_adult[index],number_of_guests_children:number_of_guests_children[index],booking_id:booking.id,room_id:r})
                    index++;
            };
            await booking.update({total_price})
            return res.send({message:"booking create"})

        }catch(err){
            return res.status(500).send({message:"error server"})
        }
    }
]
exports.GetPartnerBookingHotel = async (req,res) => {
    try{
        const partner_id = req.userId;
        const bookings = await Booking.findAll({
            include:[
                {
                    model:HotelBookingDetails,
                    as:"bookingHotelDetails",
                    required: true,
                    include:[
                        {
                            model:Room,
                            as:"RoomHotelBooking",
                            required: true,
                            include:[
                                {
                                    model:Hotel,
                                    as:"hotelRoom",
                                    where:{partner_id},
                                    required: true,
                                    attributes: [] 
                                }
                            ]
                        }
                    ]
                },
                {
                    model:User,
                    as:"userBooking"
                }
            ]
        });
            return res.send({booking:bookings})

    }catch(err){
        console.log(err)
        return res.status(500).send({message:"error server"})
    }
}
exports.GetClientBooking = async (req,res) => {
    try{
        const client_id = req.userId;
        const bookings = await Booking.findAll({where:{client_id},
            include:[
                {
                    model:HotelBookingDetails,
                    as:"bookingHotelDetails",
                    include:[
                        {
                            model:Room,
                            as:"RoomHotelBooking",
                            include:[
                                {
                                    model:Hotel,
                                    as:"hotelRoom",
                                    required: true,
                                    attributes: ["name","address"] 
                                }
                            ]
                        }
                    ]
                }
            ]
        });
            return res.send({booking:bookings})

    }catch(err){
        console.log(err)
        return res.status(500).send({message:"error server"})
    }
}
