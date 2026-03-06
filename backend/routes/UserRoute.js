const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticateAdmin = require("../middlewares/AuthenticateAdmin");
const { AddAgent, UpdateFiles, VerifyPartner } = require("../controllers/UserController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const upload = require("../middlewares/Uploads");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.post("/add/agent",[AuthenticateToken,AuthenticateAdmin],AddAgent);
router.get("/user/all",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],AddAgent);
router.get("/user/:id",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],AddAgent);
router.post("/update/files",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"partner_doc",maxCount:6}])],UpdateFiles)
router.get("/verify/partner",[AuthenticateToken,AuthenticatePartner],VerifyPartner);
router.get("/documents",[AuthenticateToken,AuthenticatePartner],VerifyPartner);
router.post("/partner/update/document",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"partner_doc",maxCount:6}])],VerifyPartner)
router.post("/update/document",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],VerifyPartner)

module.exports = router;