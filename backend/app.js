const express = require("express");
const router = express.Router();
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");

router.use("/auth",AuthRoute);
router.use("/user",UserRoute);

module.exports = router;