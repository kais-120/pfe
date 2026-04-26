const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const { CreatePayment, VerifyPayment, PaymentInstallments, CancelPayment } = require("../controllers/PaymentController");
const router = express.Router();

router.put("/verify",VerifyPayment);
router.put("/:id",AuthenticateToken,PaymentInstallments);
router.put("/cancel/:id",AuthenticateToken,CancelPayment);

module.exports = router;