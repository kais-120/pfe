const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { BookingHotel, GetPartnerBookingHotel, GetClientBooking, BookingFlight, BookingLocation, BookingCircuit, BookingOffer, GetPartnerBookingLocation, GetPartnerBookingAgency, GetPartnerBookingCircuit, ScannerBooking, GetPartnerBookingAirline } = require("../controllers/BookingController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const router = express.Router();

router.post("/hotel/:id",[AuthenticateToken],BookingHotel);
router.post("/flight/:id",[AuthenticateToken],BookingFlight);
router.post("/location/:id",[AuthenticateToken],BookingLocation);
router.post("/circuit/:id",[AuthenticateToken],BookingCircuit);
router.post("/offer/:id",[AuthenticateToken],BookingOffer);

router.get("/get/partner/hotel",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingHotel);
router.get("/get/partner/voyage",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingCircuit);
router.get("/get/partner/agency",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingAgency);
router.get("/get/partner/airline",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingAirline);
router.get("/get/partner/location",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingLocation);
router.get("/get/client",[AuthenticateToken],GetClientBooking);
router.post("/scanner",[AuthenticateToken,AuthenticatePartner],ScannerBooking)

module.exports = router;