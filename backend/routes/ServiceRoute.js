const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { AddHotel, AddRoom } = require("../controllers/ServiceController");
const router = express.Router();

router.post("/hotel/get",[AuthenticateToken,AuthenticatePartner],AddHotel);
router.post("/hotel/add",[AuthenticateToken,AuthenticatePartner],AddHotel);
router.post("/hotel/room/add/:id",[AuthenticateToken,AuthenticatePartner],AddRoom);

module.exports = router;