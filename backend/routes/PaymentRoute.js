const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { CreatePayment, VerifyPayment } = require("../controllers/PaymentController");
const router = express.Router();

router.put("/verify",VerifyPayment);

module.exports = router;