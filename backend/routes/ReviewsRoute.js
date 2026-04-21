const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { AddReview, GetReview, AddClaim, GetAdminReview, RefuseClaim, AcceptClaim } = require("../controllers/ReviewController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.post("/add/:id",AuthenticateToken,AddReview)
router.get("/get/:id",GetReview)
router.post("/partner/add/claim/:id",[AuthenticateToken,AuthenticatePartner],AddClaim)
router.get("/admin/reviews",[AuthenticateToken,AuthenticateAgent],GetAdminReview)
router.put("/claim/accept/:id",[AuthenticateToken,AuthenticateAgent],AcceptClaim)
router.put("/claim/refuse/:id",[AuthenticateToken,AuthenticateAgent],RefuseClaim)

module.exports = router;