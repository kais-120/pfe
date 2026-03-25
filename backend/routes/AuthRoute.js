const express = require("express");
const { Register, Login, Profile, PartnerRegister, ForgotPassword, UpdatePassword } = require("../controllers/AuthController");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const { VerifyOtp, ResendOtp } = require("../controllers/OtpController");
const router = express.Router();

router.post("/register",Register);
router.post("/partner/register",PartnerRegister);
router.post("/login",Login);
router.put("/verify/otp",VerifyOtp);
router.put("/resend/otp",ResendOtp);
router.get("/profile",AuthenticateToken,Profile);
router.post("/forgot-password",ForgotPassword)
router.put("/update-password",UpdatePassword)

module.exports = router;