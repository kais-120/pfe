const express = require("express");
const router = express.Router();
const AuthRoute = require("./routes/AuthRoute");

router.use("/auth",AuthRoute);

module.exports = router;