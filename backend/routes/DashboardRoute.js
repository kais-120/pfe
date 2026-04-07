const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetDashboardStats, GetDashboardServicesStats, GetLatestActivity, GetPartner, getMonthlyStats, getBooking, GetPartnerDashboardStats, getRevenueChart, getBookingsChart, getLastBookings, getLastReviews, getRooms } = require("../controllers/DashboardController");
const AuthenticateAdmin = require("../middlewares/AuthenticateAdmin");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const router = express.Router();

router.get("/status",[AuthenticateToken,AuthenticateAdmin],GetDashboardStats);
router.get("/service-status",[AuthenticateToken,AuthenticateAdmin],GetDashboardServicesStats);
router.get("/activity",[AuthenticateToken,AuthenticateAdmin],GetLatestActivity);
router.get("/partner",[AuthenticateToken,AuthenticateAdmin],GetPartner);
router.get("/monthly-stats",[AuthenticateToken,AuthenticateAdmin],getMonthlyStats);
router.get("/booking",[AuthenticateToken,AuthenticateAdmin],getBooking);

router.get("/partner/status",[AuthenticateToken,AuthenticatePartner],GetPartnerDashboardStats);
router.get("/partner/revenue-chart",[AuthenticateToken,AuthenticatePartner], getRevenueChart);
router.get("/partner/booking-chart",[AuthenticateToken,AuthenticatePartner], getBookingsChart);
router.get("/partner/last-booking",[AuthenticateToken,AuthenticatePartner], getLastBookings);
router.get("/partner/last-reviews",[AuthenticateToken,AuthenticatePartner], getLastReviews);
router.get("/partner/my-rooms",[AuthenticateToken,AuthenticatePartner], getRooms);


module.exports = router;