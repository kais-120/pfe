const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { AddHotel, AddRoom, GetHotel, GetAllServices, GetAllHotel } = require("../controllers/ServiceController");
const upload = require("../middlewares/Uploads");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.get("/get/hotels",GetAllHotel);
router.get("/get/hotel/:id",GetHotel);
router.get("/get",[AuthenticateToken,AuthenticateAgent],GetAllServices);
router.get("/hotel/get",[AuthenticateToken,AuthenticatePartner],GetHotel);
router.post("/hotel/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddHotel);
router.post("/hotel/room/add",[AuthenticateToken,AuthenticatePartner],AddRoom);

module.exports = router;