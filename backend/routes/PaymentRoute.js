const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { CreatePayment } = require("../controllers/PaymentController");
const router = express.Router();

router.post("/service",CreatePayment);
module.exports = router;