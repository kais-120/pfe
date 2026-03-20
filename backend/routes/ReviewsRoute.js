const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { AddReview, GetReview } = require("../controllers/ReviewController");
const router = express.Router();

router.post("/add/:id",AuthenticateToken,AddReview)
router.get("/get/:id",GetReview)

module.exports = router;