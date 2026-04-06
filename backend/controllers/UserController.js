const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { User, PartnerFile, Otp } = require("../models");
const fs = require("fs");
const path = require("path");
const { partnerMail, otpSend, forgetPassword, EmailChange } = require("../util/sendEmail");
const RefuseReason = require("../models/RefuseReason");
const { Op } = require("sequelize");
const Notification = require("../models/Notification");
const { getIO } = require("../initSocket");
const { ForgotPasswordEmail, EmailChangeOtp } = require("./OtpController");
const Activity = require("../models/Activity");


exports.AddAgent = [
    body("firstName").notEmpty().withMessage("first name is required"),
    body("lastName").notEmpty().withMessage("last name is required"),
    body("email").notEmpty().withMessage("email is required"),
    body("phone").notEmpty().withMessage("phone number is required")
        .isLength(8).withMessage("phone number should be 8")
        .isNumeric().withMessage("phone number should be a number"),
    body("password").notEmpty().withMessage("password required")
        .isLength({ min: 6 }).withMessage("password should at least be 6"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { firstName, lastName, email, password, phone } = req.body;
            const existEmail = await User.findOne({ where: { email } });
            const existPhone = await User.findOne({ where: { phone } });
            if (existEmail) {
                return res.status(422).json({ message: "email is already used" });
            }
            if (existPhone) {
                return res.status(422).json({ message: "phone is already used" });
            }
            const passwordHah = await bcrypt.hash(password, 10);
            await User.create({ first_name: firstName, last_name: lastName, email, password: passwordHah, phone });
            return res.status(201).json({ message: "account created" });
        } catch {
            return res.status(500).json({ message: "server error" });
        }
    }
]
exports.UpdateFiles = [
    body("rip").notEmpty().withMessage("rip is required")
        .isLength({ min: 20, max: 20 }).withMessage("rip should be 20")
        .isNumeric().withMessage("rip should be a number"),
    body("cin").notEmpty().withMessage("cin is required")
        .isLength({ min: 8, max: 8 }).withMessage("cin should be 8")
        .isNumeric().withMessage("cin should be a number"),
    body("matricule_fiscale").notEmpty().withMessage("matricule_fiscale is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.files?.partner_doc) {
                req.files.partner_doc.forEach(file => {
                    fs.unlinkSync(path.join("uploads/partner_files", file.filename))
                })
            }
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const io = getIO()
            const partner_id = req.userId;
            const { rip, cin, matricule_fiscale } = req.body;
            const existPartner = await PartnerFile.findOne({ where: { partner_id } });
            const existCin = await PartnerFile.findOne({
                where: {
                    cin,
                    partner_id: {
                        [Op.ne]: partner_id
                    }
                }
            });
            const existRip = await PartnerFile.findOne({
                where: {
                    rip,
                    partner_id: {
                        [Op.ne]: partner_id
                    }
                }
            });
            const existMatriculeFiscale = await PartnerFile.findOne({
                where: {
                    matricule_fiscale,
                    partner_id: {
                        [Op.ne]: partner_id
                    }
                }
            });
            if (existCin) {
                if (req.files?.partner_doc) {
                    req.files.partner_doc.forEach(file => {
                        fs.unlinkSync(path.join("uploads/partner_files", file.filename))
                    })
                    return res.status(422).send({ message: "cin used" })
                }
            }
            if (existRip) {
                if (req.files?.partner_doc) {
                    req.files.partner_doc.forEach(file => {
                        fs.unlinkSync(path.join("uploads/partner_files", file.filename))
                    })
                }
                return res.status(422).send({ message: "Rip used" })
            }
            if (existMatriculeFiscale) {
                if (req.files?.partner_doc) {
                    req.files.partner_doc.forEach(file => {
                        fs.unlinkSync(path.join("uploads/partner_files", file.filename))
                    })
                }
                return res.status(422).send({ message: "matricule fiscale used" })
            }
            const files = req.files.partner_doc;
            const keys = ["cin_recto", "cin_verso", "matricule_fiscale_image", "register_commerce", "autorisation_ONTT"]
            const data = { cin, rip, matricule_fiscale, partner_id, status: "en attente" }
            files.forEach((element, index) => {
                data[keys[index]] = element.filename
            });
            if (existPartner) {
                if (existPartner.cin_recto && existPartner.cin_verso && existPartner.matricule_fiscale_image && existPartner.register_commerce && existPartner.autorisation_ONTT) {
                    fs.unlinkSync(path.join("uploads/partner_files", existPartner.cin_recto))
                    fs.unlinkSync(path.join("uploads/partner_files", existPartner.cin_verso))
                    fs.unlinkSync(path.join("uploads/partner_files", existPartner.matricule_fiscale_image))
                    fs.unlinkSync(path.join("uploads/partner_files", existPartner.register_commerce))
                    fs.unlinkSync(path.join("uploads/partner_files", existPartner.autorisation_ONTT))
                }
                const n = await Notification.create({ title: "partnaire document", message: "partnaire a mise a jour un document", type: "document" });
                io.to("admin").emit("newNotification", n)
                await existPartner.update(data)
            }
            else {
                await PartnerFile.create(data);
                await Notification.create({ title: "partnaire document", message: "partnaire a somite un document", type: "document" });
                io.to("admin").emit("newNotification")

            }
            const partner = await User.findByPk(partner_id)
            await Activity.create({ type: "partner", titre: `Dossier partenaire soumis — ${partner.name}` })
            return res.send({ message: "file updated1" })
        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }

    }
]
exports.VerifyPartner = async (req, res) => {
    try {
        const partner_id = req.userId;
        const user = await PartnerFile.findOne({ where: { partner_id } });
        if (user.status === "accepté") {
            return res.send({ message: "partner verified" });
        }
        else if (user.status === "en attente") {
            return res.status(202).send({ message: "partner files pending" });
        }
        return res.status(405).send({ message: "partner refused" });
    } catch (err) {
        return res.status(500).send({ message: "error server" })
    }
}
exports.ValidateStep = [
    body("step").notEmpty().withMessage("step is required"),
    body("cin")
        .if(body("step").equals("0"))
        .notEmpty().withMessage("CIN is required")
        .isLength({ min: 8, max: 8 }).withMessage("CIN must be 8 digits")
        .isNumeric().withMessage("CIN must be numeric"),

    body("matricule_fiscale")
        .if(body("step").equals("1"))
        .notEmpty().withMessage("Matricule fiscale is required"),

    body("rip")
        .if(body("step").equals("2"))
        .notEmpty().withMessage("RIP is required"),
    async (req, res) => {
         const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.files?.partner_doc) {
                req.files.partner_doc.forEach(file => {
                    fs.unlinkSync(path.join("uploads/partner_files", file.filename))
                })
            }
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {

            const partner_id = req.userId;
            const { step, cin, matricule_fiscale, rip } = req.body
            let errors = {}

            if (step == 0) {
                const existing = await PartnerFile.findOne({ where: { cin } })
                if (existing && existing.partner_id !== Number(partner_id)) {
                    errors.cin = "CIN déjà utilisé"
                }
            }

            if (step == 1) {
                const existing = await PartnerFile.findOne({ where: { matricule_fiscale } })
                if (existing && existing.partner_id !== Number(partner_id)) {
                    errors.matricule_fiscale = "Matricule fiscale déjà utilisé"
                }
            }

            if (step == 2) {
                const existing = await PartnerFile.findOne({ where: { rip } })
                if (existing && existing.partner_id !== Number(partner_id)) {
                    errors.rip = "Rip déjà utilisé"
                }
            }

            if (Object.keys(errors).length > 0) {
                return res.status(400).json({ errors })
            }

            return res.json({ valid: true })

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.Users = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (user.role === "admin") {
            const users = await User.findAll({
                attributes: {
                    exclude: "password"
                }
            });
            return res.send({ message: "list of users", users })
        }
        const users = await User.findAll({ where: { role: "partner" } });
        return res.send({ message: "list of users", users })

    } catch {
        return res.status(500).send({ message: "error server" })
    }
}
exports.DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send({ message: "user not found" })
        }
        await user.destroy();
        return res.send({ message: "user deleted" })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}
exports.GetUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if (user.role === "admin") {
            const users = User.findAll();
            return res.send({ message: "list of users", users })
        }
        const users = User.findAll({ where: { role: "partner" } });
        return res.send({ message: "list of users", users })

    } catch {
        return res.status(500).send({ message: "error server" })
    }
}
exports.PartnerFile = async (req, res) => {
    try {
        const partnerFiles = await PartnerFile.findAll(
            {
                where: {
                    status: {
                        [Op.ne]: null
                    }
                },
                include: [
                    {
                        model: User,
                        as: "users"
                    }
                ]
            }
        );
        return res.send({ message: "list of documents", partnerFiles })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "error server" })
    }
}
exports.GetPartnerFile = async (req, res) => {
    try {
        const { id } = req.params;
        const partnerFiles = await PartnerFile.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "users"
                }
            ]
        });
        if (!partnerFiles) {
            return res.status(404).send({ message: "documents not found" })
        }
        return res.send({ message: "documents found", partnerFiles })

    } catch (err) {
        return res.status(500).send({ message: "error server" })
    }
}
exports.AcceptFile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId
        const partnerFiles = await PartnerFile.findByPk(id);
        if (!partnerFiles) {
            return res.status(404).send({ message: "partner file not found" })
        }
        partnerFiles.update({ status: "accepté", accepted_by: userId });
        return res.send({ message: "partner file updated" })

    } catch {
        return res.status(500).send({ message: "error server" })
    }
}

exports.RefuseFile = [
    body("reason").notEmpty().withMessage("reason required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { reason } = req.body;
            const { id } = req.params;
            const userId = req.userId;
            const reasonData = reason.split(".")
            const partnerFiles = await PartnerFile.findByPk(id);
            if (!partnerFiles) {
                return res.status(404).send({ message: "partner file not found" })
            }
            const { email, first_name } = await User.findByPk(partnerFiles.partner_id)
            partnerMail(email, first_name, reasonData, "rejetée");
            partnerFiles.update({ status: "rejetée" });
            await RefuseReason.create({ message: reason, file_id: id, rejected_by: userId })
            return res.send({ message: "partner file updated" })

        } catch (err) {
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.HistoryPartnerFiles = async (req, res) => {
    try {
        const { id } = req.params;
        const partnerFiles = await PartnerFile.findByPk(id, {
            attributes: ["status"],
            include: [
                {
                    model: User,
                    as: "responsibleAccepted",
                    attributes: ["name", "email", "phone"]
                },
                {
                    model: RefuseReason,
                    as: "RefuseReason",
                    include: [
                        {
                            model: User,
                            as: "responsibleRejected",
                            attributes: ["name", "email", "phone"]
                        }
                    ]
                }
            ]
        });
        return res.send({ message: "partner file found", history: partnerFiles })
    } catch {
        return res.status(500).send({ message: "error server" })
    }
}

exports.UpdateInformation = [
    body("name").notEmpty().withMessage("name is required"),
    body("phone").notEmpty().withMessage("phone is required")
        .isNumeric().withMessage("phone should be numeric")
        .isLength({ min: 8, max: 8 }).withMessage("phone length should be 8 number")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { name, phone } = req.body;
            const user_id = req.userId;
            const user = await User.findByPk(user_id);
            const existPhone = await User.findOne({
                where: {
                    phone,
                    id: {
                        [Op.ne]: user_id
                    }
                }
            });
            if (existPhone) {
                return res.status(422).send({ message: "phone number exist" });
            }
            await user.update({ name, phone });
            return res.send({ message: "user info is update" });

        } catch {
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.UpdateEmail = [
    body("email").notEmpty().withMessage("email is required"),
    body("code").notEmpty().withMessage("code is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { email, code } = req.body;
            const user_id = req.userId;
            const date = new Date();
            const user = await User.findByPk(user_id);
            const otpCode = await Otp.findOne({
                where: { user_id, type: "email" }
                , order: [["create_at", "DESC"]]
            });
            console.log(otpCode)
            if (!otpCode) {
                return res.status(404).send({ message: "user not found" });
            }
            if (date > otpCode.expire_at) {
                return res.status(410).send({ message: "otp gone" });
            }
            else if (code !== otpCode.code) {
                return res.status(403).send({ message: "otp is wrong" });
            }
            await user.update({ email });
            return res.send({ message: "email is update" });

        } catch (err) {
            console.log(err)
            return res.status(500).send({ message: "error server" })
        }
    }
]
exports.SendEmailOtp = [
    body("newEmail").notEmpty().withMessage("new email is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { newEmail } = req.body;
            const user_id = req.userId;
            const user = await User.findByPk(user_id);
            const existEmail = await User.findOne({
                where: {
                    email: newEmail,
                    id: {
                        [Op.ne]: user_id
                    }
                }
            });
            if (existEmail) {
                return res.status(422).send({ message: "email exist" });
            }
            const otp = await EmailChangeOtp(user_id);
            EmailChange(newEmail, user.name, otp.toString());
            return res.send({ message: "email send" });
        } catch (err) {
            return res.status(500).send({ message: "error server" })
        }
    }
]

exports.UpdatePassword = [
    body("currentPassword").notEmpty().withMessage("cureent password is required"),
    body("newPassword").notEmpty().withMessage("new password is required")
    , async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try {
            const { currentPassword, newPassword } = req.body;
            const user_id = req.userId;
            const user = await User.findByPk(user_id);
            const verifyCurrentPassword = await bcrypt.compare(currentPassword, user.password);
            if (!verifyCurrentPassword) {
                return res.status(401).send({ message: "the old password is wrong" });
            }
            const verifyNewPassword = await bcrypt.compare(newPassword, user.password);
            if (verifyNewPassword) {
                return res.status(422).send({ message: "the new password is the same as the old" });
            }
            const password = await bcrypt.hash(newPassword, 10)
            await user.update({ password })
            return res.send({ message: "password changed" });
        } catch (err) {
            return res.status(500).send({ message: "error server" })
        }

    }]
