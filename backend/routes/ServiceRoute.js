const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { AddHotel, AddRoom, GetAllServices, GetAllHotel, GetHotel, GetPublicHotel, GetSearchHotels, AddLocation, GetLocation, AddVehicle, AddAgency, GetAgency, AddOffer, AddAirline, GetAirline, AddFlight, AddVoyage, GetVoyage, AddCircuit, GetPublicLocation, checkAvailability, GetVehicleById, GetPublicAgency, GetOfferById, municipalities, GetPublicAirline, GetFlightById, GetPublicVoyage, GetCircuitById, GetSearchRooms, GetSearchAirline, SearchVehicle, DeleteService, GetRoom, UpdateHotel, UpdateVehicle, UpdateCircuit, DeleteCircuit, DeleteRoom, VisibilityRoom, DeleteOffer, DeleteVehicle, UpdateOffer, GetClass, GetDestination } = require("../controllers/ServiceController");
const upload = require("../middlewares/Uploads");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.get("/get",[AuthenticateToken,AuthenticateAgent],GetAllServices);
router.delete("delete/:type/:id",[AuthenticateToken,AuthenticateAgent],DeleteService)

router.get("/get/hotels",GetAllHotel);
router.get("/get/destination",GetDestination);
router.post("/get/hotels/search",GetSearchHotels);
router.post("/get/hotel/room/search/:id",GetSearchRooms);
router.get("/get/hotel/:id",GetPublicHotel);
router.get("/hotel/get",[AuthenticateToken,AuthenticatePartner],GetHotel);
router.post("/hotel/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddHotel);
router.post("/hotel/room/add",[AuthenticateToken,AuthenticatePartner],AddRoom);
router.get("/hotel/get/room/:id",[AuthenticateToken,AuthenticatePartner],GetRoom);
router.delete("/hotel/room/:id",[AuthenticateToken,AuthenticatePartner],DeleteRoom);
router.put("/hotel/room/:id",[AuthenticateToken,AuthenticatePartner],VisibilityRoom);
router.post("/hotel/update",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],UpdateHotel);

router.post("/location/add",[AuthenticateToken,AuthenticatePartner],AddLocation);
router.get("/location/get",[AuthenticateToken,AuthenticatePartner],GetLocation);
router.get("/location/public/get",GetPublicLocation);
router.post("/location/search/get",SearchVehicle);
router.post("/check-availability", checkAvailability)
router.get("/vehicle/get/:id", GetVehicleById)
router.post("/location/vehicle/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddVehicle);
router.put("/vehicle/update/:id",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])] ,UpdateVehicle)
router.delete("/vehicle/:id",[AuthenticateToken,AuthenticatePartner] ,DeleteVehicle)

router.post("/agency/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:1}])],AddAgency);
router.get("/agency/get",[AuthenticateToken,AuthenticatePartner],GetAgency);
router.delete("/offer/:id",[AuthenticateToken,AuthenticatePartner],DeleteOffer);
router.get("/agency/public/get",GetPublicAgency);
router.get("/offer/get/:id",GetOfferById);
router.post("/agency/offer/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddOffer)
router.put("/agency/offer/update/:id",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],UpdateOffer)
;
router.post("/airline/add",[AuthenticateToken,AuthenticatePartner],AddAirline);
router.get("/airline/get",[AuthenticateToken,AuthenticatePartner],GetAirline);
router.get("/airline/get/class",[AuthenticateToken,AuthenticatePartner],GetClass);
router.post("/airline/search/get",GetSearchAirline);
router.get("/airline/public/get",GetPublicAirline);
router.get("/airline/flight/public/get/:id",GetFlightById);
router.post("/airline/flight/add",[AuthenticateToken,AuthenticatePartner],AddFlight);

router.post("/voyage/add",[AuthenticateToken,AuthenticatePartner],AddVoyage);
router.get("/voyage/get",[AuthenticateToken,AuthenticatePartner],GetVoyage);
router.get("/voyage/public/get",GetPublicVoyage);
router.delete("/voyage/circuit/:id",[AuthenticateToken,AuthenticatePartner],DeleteCircuit);
router.get("/voyage/circuit/public/get/:id",GetCircuitById);
router.delete("/circuit/:id",DeleteCircuit);
router.post("/voyage/circuit/add",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],AddCircuit);
router.put("/voyage/circuit/update/:id",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"service_doc",maxCount:15}])],UpdateCircuit);




module.exports = router;