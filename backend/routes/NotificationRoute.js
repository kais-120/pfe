const express = require("express");
const AuthenticateToken = require("../middlewares/AuthenticateToken");
const AuthenticateAgent = require("../middlewares/AuthenticateAgent");
const { GetNotification, ReadById } = require("../controllers/NotificationController");
const router = express.Router();

router.get("",[AuthenticateToken],GetNotification)
router.put("/:id/read",[AuthenticateToken],ReadById)
router.put("read-all",[AuthenticateToken],GetNotification)

module.exports = router;