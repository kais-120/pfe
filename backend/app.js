const express = require("express");
const router = express.Router();
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const ServiceRoute = require("./routes/ServiceRoute");

router.use("/auth",AuthRoute);
router.use("/user",UserRoute);
router.use("/service",ServiceRoute);

module.exports = router;