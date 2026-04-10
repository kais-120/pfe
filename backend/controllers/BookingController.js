const { body, validationResult } = require("express-validator");
const { Room, Booking, Hotel, User, Flight, Compagnie, FlightBookingDetails, FlightClasses, Vehicle, Location, CarRentalBookingDetails, Circuit, Voyage, CircuitBookingDetails, Offer, Agence, OfferBookingDetails, Package, Destination } = require("../models");
const HotelBookingDetails = require("../models/HotelBookingDetails");
const Notification = require("../models/Notification");
const { getIO } = require("../initSocket");
const Activity = require("../models/Activity");

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
        .isArray().withMessage("room id should be array")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { check_in_date, check_out_date, number_of_guests_adult, number_of_guests_children, rooms } = req.body;
            const { id } = req.params;
            if (check_in_date >= check_out_date) {
                return res.status(400).send({ message: "date invalid" });
            }
            const { partner_id } = await Hotel.findByPk(id);
            let total_price = 0;
            const client_id = req.userId;
            const booking = await Booking.create({ total_price, type: "hotel", client_id })
            let index = 0;
            for (const r of rooms) {
                const room = await Room.findByPk(r);
                if (!room) {
                    booking.destroy();
                    return res.status(404).send({ message: "room not found" });
                }
                const checkIn = new Date(check_in_date);
                const checkOut = new Date(check_out_date);
                const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                const adultPrice = room.price_by_adult * number_of_guests_adult[index] * days;
                const childrenPrice = room.price_by_children * number_of_guests_children[index] * days;
                total_price = total_price + adultPrice + childrenPrice
                HotelBookingDetails.create({ check_in_date, check_out_date, number_of_guests_adult: number_of_guests_adult[index], number_of_guests_children: number_of_guests_children[index], booking_id: booking.id, room_id: r })
                index++;
            };
            await booking.update({ total_price });
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: partner_id })
            io.to(`partner-${partner_id}`).emit("newNotification");
            await Activity.create({type:"booking",titre:`Réservation #RES-${booking.id} en cours`})
            return res.send({ message: "booking create" })

        } catch (err) {
            // console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.BookingFlight = [
    body("seat_class").notEmpty().withMessage("seat class is required"),
    body("price").notEmpty().withMessage("price is required"),
    body("passenger_count").notEmpty().withMessage("passenger count is required"),
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { seat_class, price, passenger_count } = req.body;
            const { id } = req.params;
            const client_id = req.userId
            const flight = await Flight.findByPk(id, {
                include: [
                    {
                        model: Compagnie,
                        as: "compagnieFlight",
                        attributes: ["partner_id"]
                    }
                ]
            });
            if (!flight) {
                return res.status(442).send({ message: "flight not found" })
            }
            if (flight.seats_available < passenger_count) {
                return res.status(400).json({ message: "not enough seats" });
            }
        
            const flightClassesSeat = await FlightClasses.findOne({where: {flight_id:id,class_name:seat_class}})
            if (flightClassesSeat.seats_available < passenger_count) {
                return res.status(400).json({message:"not enough seats"})
            }
            
            const booking = await Booking.create({ total_price: price, type: "compagnies aériennes", client_id });
            await FlightBookingDetails.create({ seat_class, passenger_count, booking_id: booking.id, flight_id: id })
            await flight.update({ seats_available: flight.seats_available - passenger_count })
            await flightClassesSeat.update({seats_available:flightClassesSeat.seats_available - passenger_count})
            await Notification.create({title:"Nouvelle réservation",message:"un client faire un réservation",type:"booking",user_id:flight.compagnieFlight.partner_id})
            io.to(`partner-${flight.compagnieFlight.partner_id}`).emit("newNotification");
            await Activity.create({type:"booking",titre:`Réservation #RES-${booking.id} en cours`})
            return res.send({ message: "booking create" })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.BookingLocation = [
    body("pickup_date").notEmpty().withMessage("pickup date is required")
        .isDate().withMessage("pickup date should be date"),
    body("return_date").notEmpty().withMessage("return date is required")
        .isDate().withMessage("return date should be date"),
    body("price").notEmpty().withMessage("price is required")
        .isNumeric().withMessage("price should be numeric")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { pickup_date, return_date,price } = req.body;
            const { id } = req.params;
            if (pickup_date >= return_date) {
                return res.status(400).send({ message: "date invalid" });
            }
            const vehicle = await Vehicle.findByPk(id,{
                include:[{
                    model:Location,
                    as:"locationVehicle",
                    attributes:["partner_id"]
                }]
            });
            if(!vehicle){
                return res.status(404).send({ message: "vehicle not found" })
            }
            console.log(vehicle.locationVehicle.partner_id)
            const client_id = req.userId;
            const booking = await Booking.create({ total_price:price, type: "location de voitures", client_id });
            await CarRentalBookingDetails.create({booking_id:booking.id,pickup_date,return_date,car_id:id})
            
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: vehicle.locationVehicle.partner_id })
            io.to(`partner-${vehicle.locationVehicle.partner_id}`).emit("newNotification");
            await Activity.create({type:"booking",titre:`Réservation #RES-${booking.id} en cours`})
            return res.send({ message: "booking create" })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.BookingCircuit = [
    body("package_id").notEmpty().withMessage("package id is required")
        .isNumeric().withMessage("package id should be number"),
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { package_id } = req.body;
            const { id } = req.params;
            const circuit = await Circuit.findByPk(id,{
                include:[{
                    model:Voyage,
                    as:"voyagesCircuit",
                    attributes:["partner_id"]
                    
                }]
            });
            if(!circuit){
                return res.status(404).send({ message: "circuit not found" })
            }
            const package = await Package.findByPk(package_id);
            if(package.circuit_id != circuit.id){
                return res.status(404).json({message:"the circuit not have this package"})
            }
            if(package.number_place === 0){
                return res.status(400).json({message:"there no place"})
            }
            const client_id = req.userId;
            const booking = await Booking.create({ total_price:package.price, type: "voyages circuits", client_id });
            await CircuitBookingDetails.create({booking_id:booking.id,package_id,circuit_id:id});
            package.update({number_place:package.number_place - 1})
            
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: circuit.voyagesCircuit.partner_id })
            io.to(`partner-${circuit.voyagesCircuit.partner_id}`).emit("newNotification");
            await Activity.create({type:"booking",titre:`Réservation #RES-${booking.id} en cours`})
            return res.send({ message: "booking create" })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]

exports.BookingOffer = [
    body("package_id").notEmpty().withMessage("package is required")
        .isNumeric().withMessage("package should be numeric"),
    body("price").notEmpty().withMessage("price is required")
        .isNumeric().withMessage("price should be numeric")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { package_id,price } = req.body;
            const { id } = req.params;
            const offer = await Offer.findByPk(id,{
                include:[{
                    model:Agence,
                    as:"agencyOffer",
                    attributes:["partner_id"]
                    
                }]
            });
            if(!offer){
                return res.status(404).send({ message: "offer not found" })
            }
            const package = await Package.findByPk(package_id);
            if(!package){
                return res.status(404).send({ message: "package not found" })
            }
            if(package.number_place === 0){
                return res.status(400).send({ message: "the not place" })
            }
            const client_id = req.userId;
            const booking = await Booking.create({ total_price:price, type: "agence de voyage", client_id });
            await OfferBookingDetails.create({booking_id:booking.id,offer_id:id,package_id})
            await package.update({number_place : package.number_place - 1})
            
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: offer.agencyOffer.partner_id })
            io.to(`partner-${offer.agencyOffer.partner_id}`).emit("newNotification");
            await Activity.create({type:"booking",titre:`Réservation #RES-${booking.id} en cours`})
            return res.send({ message: "booking create" })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]

exports.GetPartnerBookingHotel = async (req, res) => {
    try {
        const partner_id = req.userId;
        const bookings = await Booking.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: CircuitBookingDetails,
                    as: "circuitBooking",
                    required: true,
                    include: [
                        {
                            model: Circuit,
                            as: "circuitDetails",
                            attributes:["category","difficulty","location","title"],
                            required: true,
                            include: [
                                {
                                    model: Voyage,
                                    as: "voyagesCircuit",
                                    where: { partner_id },
                                    required: true,
                                    attributes: []
                                },
                                {
                                    model:Package,
                                    as:"packagesCircuit"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: "userBooking"
                }
            ]
        });
        return res.send({ booking: bookings })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}

exports.GetPartnerBookingLocation = async (req, res) => {
    try {
        const partner_id = req.userId;
        const bookings = await Booking.findAll({
            order: [["createdAt", "DESC"]],
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
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: "userBooking"
                }
            ]
        });
        return res.send({ booking: bookings })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}

exports.GetPartnerBookingAgency = async (req, res) => {
    try {
        const partner_id = req.userId;
        const bookings = await Booking.findAll({
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: OfferBookingDetails,
                    as: "offerBooking",
                    required: true,
                    include: [
                        {
                            model:Package,
                            as:"bookingPackageOffer",
                            include:[
                                {
                                    model:Destination,
                                    as:"destination"
                                }
                            ]
                        },
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
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: "userBooking"
                }
            ]
        });
        return res.send({ booking: bookings })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}


exports.GetClientBooking = async (req, res) => {
    try {
        const client_id = req.userId;
        const bookings = await Booking.findAll({
            where: { client_id },
            include: [
                {
                    model: HotelBookingDetails,
                    as: "bookingHotelDetails",
                    include: [
                        {
                            model: Room,
                            as: "RoomHotelBooking",
                            include: [
                                {
                                    model: Hotel,
                                    as: "hotelRoom",
                                    required: true,
                                    attributes: ["name", "address"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model:CarRentalBookingDetails,
                    as:"carDetails",
                    include:[
                        {
                            model:Vehicle,
                            as:"vehicleBooking",
                            include:[
                                {
                                    model:Location,
                                    as:"locationVehicle"
                                }
                            ]
                        }
                    ]
                },
                {
                    model:FlightBookingDetails,
                    as:"flightBooking",
                    include:[
                        {
                            model:Flight,
                            as:"detailsFlight",
                            include:[
                                {
                                    model:Compagnie,
                                    as:"compagnieFlight"
                                }
                            ]
                        }
                    ]
                },
                {
                    model:CircuitBookingDetails,
                    as:"circuitBooking",
                    include:[
                        {
                            model:Circuit,
                            as:"circuitDetails",
                            include:[
                                {
                                    model:Voyage,
                                    as:"voyagesCircuit"
                                }
                            ]
                        }
                    ]
                },
                {
                    model:OfferBookingDetails,
                    as:"offerBooking",
                    include:[
                        {
                            model:Offer,
                            as:"bookingDetailsOffer",
                            include:[
                                {
                                    model:Agence,
                                    as:"agencyOffer"
                                },
                                {
                                    model:Package,
                                    as:"packages",
                                    include:[
                                        {
                                            model:Destination,
                                            as:"destination"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        return res.send({ booking: bookings })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}
