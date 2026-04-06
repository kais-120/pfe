const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { GetDashboardStats, GetDashboardServicesStats, GetLatestActivity, GetPartner, getMonthlyStats, getBooking, GetPartnerDashboardStats } = require("../controllers/DashboardController");
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


module.exports = router;