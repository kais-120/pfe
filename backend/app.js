const express = require("express");
const router = express.Router();
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const ServiceRoute = require("./routes/ServiceRoute");
const BookingRoute = require("./routes/BookingRoute");
const PaymentRoute = require("./routes/PaymentRoute");

router.use("/auth",AuthRoute);
router.use("/user",UserRoute);
router.use("/service",ServiceRoute);
router.use("/booking",BookingRoute);
router.use("/payment",PaymentRoute);

module.exports = router;