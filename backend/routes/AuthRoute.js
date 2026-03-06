const express = require("express");
const { Register, Login, Profile, PartnerRegister } = require("../controllers/AuthController");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { VerifyOtp, ResendOtp } = require("../controllers/OtpController");
const router = express.Router();

router.post("/register",Register);
router.post("/partner/register",PartnerRegister);
router.post("/login",Login);
router.put("/verify/otp",VerifyOtp);
router.put("/resend/otp",ResendOtp);
router.get("/profile",AuthenticateToken,Profile);

module.exports = router;