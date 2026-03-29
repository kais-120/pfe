const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { BookingHotel, GetPartnerBookingHotel, GetClientBooking, BookingFlight, BookingLocation, BookingCircuit, BookingOffer } = require("../controllers/BookingController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const router = express.Router();

router.post("/hotel/:id",[AuthenticateToken],BookingHotel);
router.post("/flight/:id",[AuthenticateToken],BookingFlight);
router.post("/location/:id",[AuthenticateToken],BookingLocation);
router.post("/circuit/:id",[AuthenticateToken],BookingCircuit);
router.post("/offer/:id",[AuthenticateToken],BookingOffer);

router.get("/get/partner/booking/hotel",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingHotel);
router.get("/get/client/booking",[AuthenticateToken],GetClientBooking);

module.exports = router;