const express = require("express");
const router = express.Router();
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const ServiceRoute = require("./routes/ServiceRoute");
const BookingRoute = require("./routes/BookingRoute");
const PaymentRoute = require("./routes/PaymentRoute");
const ReviewRoute = require("./routes/ReviewsRoute");
const NotificationRoute = require("./routes/NotificationRoute");
const DashboardRoute = require("./routes/DashboardRoute");

router.use("/auth",AuthRoute);
router.use("/user",UserRoute);
router.use("/service",ServiceRoute);
router.use("/booking",BookingRoute);
router.use("/payment",PaymentRoute);
router.use("/review",ReviewRoute);
router.use("/notification",NotificationRoute);
router.use("/dashboard",DashboardRoute);

module.exports = router;