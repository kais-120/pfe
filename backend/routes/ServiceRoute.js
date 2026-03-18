const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { AddHotel, AddRoom, GetAllServices, GetAllHotel, GetHotel, GetPublicHotel, GetSearchHotels } = require("../controllers/ServiceController");
const upload = require("../middlewares/Uploads");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.get("/get/hotels",GetAllHotel);
router.post("/get/hotels/search",GetSearchHotels);
router.get("/get/hotel/:id",GetPublicHotel);
router.get("/get",[AuthenticateToken,AuthenticateAgent],GetAllServices);
router.get("/hotel/get",[AuthenticateToken,AuthenticatePartner],GetHotel);
router.post("/hotel/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddHotel);
router.post("/hotel/room/add",[AuthenticateToken,AuthenticatePartner],AddRoom);

module.exports = router;