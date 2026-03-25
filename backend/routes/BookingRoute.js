const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { BookingHotel, GetPartnerBookingHotel, GetClientBooking } = require("../controllers/BookingController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const router = express.Router();

router.post("/hotel/:id",[AuthenticateToken],BookingHotel);
router.get("/get/partner/booking/hotel",[AuthenticateToken,AuthenticatePartner],GetPartnerBookingHotel);
router.get("/get/client/booking",[AuthenticateToken],GetClientBooking);

module.exports = router;