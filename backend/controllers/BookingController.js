const { body, validationResult } = require("express-validator");
const { Room, Booking, Hotel, User, Flight, Compagnie, FlightBookingDetails, FlightClasses, Vehicle, Location, CarRentalBookingDetails, Circuit, Voyage, CircuitBookingDetails, Offer, Agence, OfferBookingDetails, Package, Destination, PartnerFile, PaymentInstallments, Payment } = require("../models");
const HotelBookingDetails = require("../models/HotelBookingDetails");
const Notification = require("../models/Notification");
const { getIO } = require("../initSocket");
const Activity = require("../models/Activity");
const { CreatePayment } = require("./PaymentController");

exports.BookingHotel = [
    body("check_in_date").notEmpty().withMessage("check in date is required")
        .isDate().withMessage("check in date should be date"),
    body("check_out_date").notEmpty().withMessage("check out date is required")
        .isDate().withMessage("check out date should be date"),
    body("rooms").isArray({ min: 1 }).withMessage("rooms is required"),

    body("rooms.*.room_id")
        .notEmpty().withMessage("room_id is required")
        .isInt().withMessage("room_id should be integer"),

    body("rooms.*.adults")
        .notEmpty().withMessage("adults is required")
        .isInt({ min: 1 }).withMessage("adults should be number"),

    body("rooms.*.children")
        .notEmpty().withMessage("children is required")
        .isInt({ min: 0 }).withMessage("children should be number"),
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO();
            const { check_in_date, check_out_date, rooms } = req.body;
            const { id } = req.params;

            if (new Date(check_in_date) >= new Date(check_out_date)) {
                return res.status(400).send({ message: "date invalid" });
            }

            const hotel = await Hotel.findByPk(id);
            if (!hotel) {
                return res.status(404).send({ message: "hotel not found" });
            }

            const { partner_id } = hotel;

            let total_price = 0;
            const client_id = req.userId;

            const booking = await Booking.create({
                total_price: 0,
                type: "hotel",
                client_id
            });

            for (const r of rooms) {
                const room = await Room.findByPk(r.room_id);

                if (!room) {
                    await booking.destroy();
                    return res.status(404).send({ message: `room ${r.room_id} not found` });
                }

                const checkIn = new Date(check_in_date);
                const checkOut = new Date(check_out_date);

                const days = Math.ceil(
                    (checkOut - checkIn) / (1000 * 60 * 60 * 24)
                );

                const basePrice = room.price_by_day * days;
                const adultPrice = room.price_by_adult * r.adults * days;
                const childrenPrice = room.price_by_children * r.children * days;

                total_price += basePrice + adultPrice + childrenPrice;

                await HotelBookingDetails.create({
                    check_in_date,
                    check_out_date,
                    number_of_guests_adult: r.adults,
                    number_of_guests_children: r.children,
                    booking_id: booking.id,
                    room_id: r.room_id
                });
            }

            await booking.update({ total_price });
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: partner_id })
            io.to(`partner-${partner_id}`).emit("newNotification");
            await Activity.create({ type: "booking", titre: `Réservation #RES-${booking.id} en cours` })
            const url = await CreatePayment(total_price, booking.id, client_id)
            return res.send({ message: "booking create",url })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.BookingFlight = [
    body("seat_class").notEmpty().withMessage("seat class is required"),
    body("total_price").notEmpty().withMessage("total price is required"),
    body("adult_passenger_count").notEmpty().withMessage("adult passenger count is required"),
    body("children_passenger_count").notEmpty().withMessage("children passenger count is required"),
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { seat_class, total_price, adult_passenger_count,children_passenger_count } = req.body;
            const { id } = req.params;
            const client_id = req.userId
            const flight = await Flight.findByPk(id, {
                include: [
                    {
                        model: Compagnie,
                        as: "compagnieFlight",
                        attributes: ["partner_id"]
                    },
                ]
            });
            if (!flight) {
                return res.status(442).send({ message: "flight not found" })
            }

            const passenger_count = children_passenger_count + adult_passenger_count;

            const flightClassesSeat = await FlightClasses.findOne({ where: { flight_id: id, class_name: seat_class } })
            if (flightClassesSeat.seats_available < passenger_count) {
                return res.status(400).json({ message: "not enough seats" })
            }

            const booking = await Booking.create({ total_price, type: "compagnies aériennes", client_id });
            await FlightBookingDetails.create({ seat_class:seat_class.toLowerCase(), children_passenger_count,adult_passenger_count, booking_id: booking.id, flight_id: id })
            await flight.update({ seats_available: flight.seats_available - passenger_count })
            await flightClassesSeat.update({ seats_available: flightClassesSeat.seats_available - passenger_count })
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: flight.compagnieFlight.partner_id })
            io.to(`partner-${flight.compagnieFlight.partner_id}`).emit("newNotification");
            await Activity.create({ type: "booking", titre: `Réservation #RES-${booking.id} en cours` })
            const url = await CreatePayment(total_price, booking.id, client_id)
            return res.send({ message: "booking create",url })

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
    body("total_price").notEmpty().withMessage("total price is required")
        .isNumeric().withMessage("total price should be numeric")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { pickup_date, return_date, total_price } = req.body;
            const { id } = req.params;
            if (pickup_date >= return_date) {
                return res.status(400).send({ message: "date invalid" });
            }
            const vehicle = await Vehicle.findByPk(id, {
                include: [{
                    model: Location,
                    as: "locationVehicle",
                    attributes: ["partner_id"]
                }]
            });
            if (!vehicle) {
                return res.status(404).send({ message: "vehicle not found" })
            }
            const client_id = req.userId;
            const booking = await Booking.create({ total_price, type: "location de voitures", client_id });
            await CarRentalBookingDetails.create({ booking_id: booking.id, pickup_date, return_date, vehicle_id: id })

            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: vehicle.locationVehicle.partner_id })
            io.to(`partner-${vehicle.locationVehicle.partner_id}`).emit("newNotification");
            await Activity.create({ type: "booking", titre: `Réservation #RES-${booking.id} en cours` })
            const url = await CreatePayment(total_price, booking.id, client_id)
            return res.send({ message: "booking create" ,url})

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.BookingCircuit = [
    body("package_id").notEmpty().withMessage("package id is required")
        .isNumeric().withMessage("package id should be number"),
        body("total_price").notEmpty().withMessage("price is required")
        .isNumeric().withMessage("price should be numeric"),
    body("payment_method").notEmpty().withMessage("price is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { package_id, total_price, payment_method } = req.body;
            const { id } = req.params;
            const circuit = await Circuit.findByPk(id, {
                include: [{
                    model: Voyage,
                    as: "voyagesCircuit",
                    attributes: ["partner_id"]

                }]
            });
            if (!circuit) {
                return res.status(404).send({ message: "circuit not found" })
            }
            const package = await Package.findByPk(package_id);
            if (package.circuit_id != circuit.id) {
                return res.status(404).json({ message: "the circuit not have this package" })
            }
            if (package.number_place === 0) {
                return res.status(400).json({ message: "there no place" })
            }
            const client_id = req.userId;
            const booking = await Booking.create({ total_price: package.price, type: "voyages circuits", client_id,payment_method });
            await CircuitBookingDetails.create({ booking_id: booking.id, package_id, circuit_id: id });
            package.update({ number_place: package.number_place - 1 })

            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: circuit.voyagesCircuit.partner_id })
            io.to(`partner-${circuit.voyagesCircuit.partner_id}`).emit("newNotification");
            await Activity.create({ type: "booking", titre: `Réservation #RES-${booking.id} en cours` })
            
            let url = "";
            if(payment_method === "installment"){
                const installmentCount = package.installment || 1;
                const totalWithFee = total_price * 1.05;
                const amount = Math.round(totalWithFee / installmentCount);
                url = await CreatePayment(total_price, booking.id, client_id,package.installment,payment_method,amount)
            }else{
                url = await CreatePayment(total_price, booking.id, client_id)
            }
            
            
            return res.send({ message: "booking create" ,url})

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]

exports.BookingOffer = [
    body("package_id").notEmpty().withMessage("package is required")
        .isNumeric().withMessage("package should be numeric"),
    body("total_price").notEmpty().withMessage("price is required")
        .isNumeric().withMessage("price should be numeric"),
    body("payment_method").notEmpty().withMessage("price is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const { package_id, total_price, payment_method } = req.body;
            const { id } = req.params;
            const offer = await Offer.findByPk(id, {
                include: [{
                    model: Agence,
                    as: "agencyOffer",
                    attributes: ["partner_id"]

                }]
            });
            if (!offer) {
                return res.status(404).send({ message: "offer not found" })
            }
            const package = await Package.findByPk(package_id);
            if (!package) {
                return res.status(404).send({ message: "package not found" })
            }
            if (package.number_place === 0) {
                return res.status(400).send({ message: "the not place" })
            }
            const client_id = req.userId;
            const booking = await Booking.create({ total_price, type: "agence de voyage", client_id,payment_method });
            
            await OfferBookingDetails.create({ booking_id: booking.id,payment_method, offer_id: id, package_id })
            await package.update({ number_place: package.number_place - 1 })
            await Notification.create({ title: "Nouvelle réservation", message: "un client faire un réservation", type: "booking", user_id: offer.agencyOffer.partner_id })
            io.to(`partner-${offer.agencyOffer.partner_id}`).emit("newNotification");
            await Activity.create({ type: "booking", titre: `Réservation #RES-${booking.id} en cours` })
            
            let url = "";
            
            if(payment_method === "installment"){
                const installmentCount = package.installment || 1;
                const totalWithFee = total_price * 1.05;
                const amount = Math.round(totalWithFee / installmentCount);
                url = await CreatePayment(total_price, booking.id, client_id,package.installment,payment_method,amount)
            }else{
                url = await CreatePayment(total_price, booking.id, client_id)
            }
            return res.send({ message: "booking create",url })

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
                                    attributes: []
                                },
                                
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

exports.GetPartnerBookingCircuit = async (req, res) => {
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
                            attributes: ["category", "difficulty", "location", "title","duration"],
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
                                    model: Package,
                                    as: "packagesCircuit"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: "userBooking",
                    attributes:["name","id","email","phone"]
                },
                {
                    model:Payment,
                    as:"payment"
                },
                {
                    model:PaymentInstallments,
                    as:"paymentInstallments"
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
                            model: Package,
                            as: "bookingPackageOffer",
                            include: [
                                {
                                    model: Destination,
                                    as: "destination"
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
                    as: "userBooking",
                    attributes:["id","name","phone"]
                },
                {
                    model:Payment,
                    as:"payment",
                    attributes:{
                        exclude:["reference"]
                    }
                },
                {
                    model:PaymentInstallments,
                    as:"paymentInstallments"
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
            order:[
                ["createdAt","DESC"],
                  [{ model: PaymentInstallments, as: "paymentInstallments" }, "installment_number", "DESC"]

        ],
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
                    model: CarRentalBookingDetails,
                    as: "carDetails",
                    include: [
                        {
                            model: Vehicle,
                            as: "vehicleBooking",
                            include: [
                                {
                                    model: Location,
                                    as: "locationVehicle"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: FlightBookingDetails,
                    as: "flightBooking",
                    include: [
                        {
                            model: Flight,
                            as: "detailsFlight",
                            include: [
                                {
                                    model: Compagnie,
                                    as: "compagnieFlight"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: CircuitBookingDetails,
                    as: "circuitBooking",
                    include: [
                        {
                            model: Circuit,
                            as: "circuitDetails",
                            include: [
                                {
                                    model: Voyage,
                                    as: "voyagesCircuit"
                                },{
                                    model:Package,
                                    as:"packagesCircuit"
                                }
                            ]
                        }
                    ]
                },
                {
                    model: OfferBookingDetails,
                    as: "offerBooking",
                    include: [
                        {
                            model: Offer,
                            as: "bookingDetailsOffer",
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
                        }
                    ]
                },
                {
                    model:PaymentInstallments,
                    as:"paymentInstallments",

                }
            ]
        });
        return res.send({ booking: bookings })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}
