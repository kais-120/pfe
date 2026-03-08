const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticateAdmin = require("../middlewares/AuthenticateAdmin");
const { AddAgent, UpdateFiles, VerifyPartner, Users, PartnerFile, GetUser, GetPartnerFile, RefuseFile, AcceptFile } = require("../controllers/UserController");
const AuthenticatePartner = require("../middlewares/AuthenticatePartner");
const upload = require("../middlewares/Uploads");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const router = express.Router();

router.post("/add/agent",[AuthenticateToken,AuthenticateAdmin],AddAgent);
router.get("/all",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],Users);
router.get("/user/:id",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],GetUser);
router.post("/update/files",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"partner_doc",maxCount:6}])],UpdateFiles)
router.get("/verify/partner",[AuthenticateToken,AuthenticatePartner],VerifyPartner);
router.get("/documents",[AuthenticateToken,AuthenticatePartner],VerifyPartner);
router.post("/partner/update/document",[AuthenticateToken,AuthenticatePartner,upload.fields([{name:"partner_doc",maxCount:6}])],VerifyPartner)
router.post("/update/document",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],VerifyPartner)
router.get("/admin/partner/documents",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],PartnerFile)
router.get("/admin/partner/document/:id",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],GetPartnerFile)
router.put("/admin/partner/document/accept/:id",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],AcceptFile)
router.put("/admin/partner/document/refuse/:id",[AuthenticateToken,AuthenticateAdmin,AuthenticateAgent],RefuseFile)

module.exports = router;