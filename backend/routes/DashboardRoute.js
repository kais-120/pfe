const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const { GetDashboardStats, GetDashboardServicesStats, GetLatestActivity, GetPartner, getMonthlyStats, getBooking } = require("../controllers/DashboardController");
const router = express.Router();

router.get("/status",[AuthenticateToken,AuthenticateAgent],GetDashboardStats);
router.get("/service-status",[AuthenticateToken,AuthenticateAgent],GetDashboardServicesStats);
router.get("/activity",[AuthenticateToken,AuthenticateAgent],GetLatestActivity);
router.get("/partner",[AuthenticateToken,AuthenticateAgent],GetPartner);
router.get("/monthly-stats",[AuthenticateToken,AuthenticateAgent],getMonthlyStats);
router.get("/booking",[AuthenticateToken,AuthenticateAgent],getBooking);

module.exports = router;