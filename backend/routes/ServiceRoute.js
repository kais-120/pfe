const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { AddHotel, AddRoom, GetAllServices, GetAllHotel, GetHotel, GetPublicHotel, GetSearchHotels, AddLocation, GetLocation, AddVehicle, AddAgency, GetAgency, AddOffer, AddAirline, GetAirline, AddFlight, AddVoyage, GetVoyage, AddCircuit, GetPublicLocation, checkAvailability, GetVehicleById, GetPublicAgency, GetOfferById, municipalities, GetPublicAirline, GetFlightById, GetPublicVoyage, GetCircuitById } = require("../controllers/ServiceController");
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

router.post("/location/add",[AuthenticateToken,AuthenticatePartner],AddLocation);
router.get("/location/get",[AuthenticateToken,AuthenticatePartner],GetLocation);
router.get("/location/public/get",GetPublicLocation);
router.post("/check-availability", checkAvailability)
router.get("/vehicle/get/:id", GetVehicleById)
router.post("/location/vehicle/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddVehicle);

router.post("/agency/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:1}])],AddAgency);
router.get("/agency/get",[AuthenticateToken,AuthenticatePartner],GetAgency);
router.get("/agency/public/get",GetPublicAgency);
router.get("/offer/get/:id",GetOfferById);
router.post("/agency/offer/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddOffer)
;
router.post("/airline/add",[AuthenticateToken,AuthenticatePartner],AddAirline);
router.get("/airline/get",[AuthenticateToken,AuthenticatePartner],GetAirline);
router.get("/airline/public/get",GetPublicAirline);
router.get("/airline/flight/public/get/:id",GetFlightById);
router.post("/airline/flight/add",[AuthenticateToken,AuthenticatePartner],AddFlight);

router.post("/voyage/add",[AuthenticateToken,AuthenticatePartner],AddVoyage);
router.get("/voyage/get",[AuthenticateToken,AuthenticatePartner],GetVoyage);
router.get("/voyage/public/get",GetPublicVoyage);
router.get("/voyage/circuit/public/get/:id",GetCircuitById);
router.post("/voyage/circuit/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddCircuit);




module.exports = router;