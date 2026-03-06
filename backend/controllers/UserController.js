const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { User, PartnerFile } = require("../models");
const fs = require("fs");
const path = require("path");

exports.AddAgent = [
    body("firstName").notEmpty().withMessage("first name is required"),
    body("lastName").notEmpty().withMessage("last name is required"),
    body("email").notEmpty().withMessage("email is required"),
    body("phone").notEmpty().withMessage("phone number is required")
    .isLength(8).withMessage("phone number should be 8")
    .isNumeric().withMessage("phone number should be a number"),
    body("password").notEmpty().withMessage("password required")
    .isLength({min:6}).withMessage("password should at least be 6"),
    async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {firstName,lastName,email,password,phone} = req.body;
            const existEmail = await User.findOne({where:{email}});
            const existPhone = await User.findOne({where:{phone}});
            if(existEmail){
                return res.status(422).json({message:"email is already used"});
            }
            if(existPhone){
                return res.status(422).json({message:"phone is already used"});
            }
            const passwordHah = await bcrypt.hash(password,10);
            await User.create({first_name:firstName,last_name:lastName,email,password:passwordHah,phone});
            return res.status(201).json({message:"account created"});
        }catch{
            return res.status(500).json({message:"server error"});
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
    ,async (req,res) => {
         const errors = validationResult(req);
        if(!errors.isEmpty()){
             if(req.files?.partner_doc){
                req.files.partner_doc.forEach(file=>{
                    fs.unlinkSync(path.join("uploads/partner_files",file.filename))
                })
            }
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
        const {rip,cin,matricule_fiscale} = req.body;
        const existCin = await PartnerFile.findOne({where :{cin}});
        const existRip = await PartnerFile.findOne({where :{rip}});
        const existMatriculeFiscale = await PartnerFile.findOne({where :{matricule_fiscale}});
        if(existCin){
            if(req.files?.partner_doc){
                req.files.partner_doc.forEach(file=>{
                    fs.unlinkSync(path.join("uploads/partner_files",file.filename))
                })
                return res.status(422).send({message:"cin used"})
    }
        }
        if(existRip){
             if(req.files?.partner_doc){
                req.files.partner_doc.forEach(file=>{
                    fs.unlinkSync(path.join("uploads/partner_files",file.filename))
                })
            }
            return res.status(422).send({message:"Rip used"})
        }
        if(existMatriculeFiscale){
             if(req.files?.partner_doc){
                req.files.partner_doc.forEach(file=>{
                    fs.unlinkSync(path.join("uploads/partner_files",file.filename))
                })
            }
            return res.status(422).send({message:"matricule fiscale used"})
        }
        const partner_id = req.userId;
        const partner = await PartnerFile.findOne({where:{partner_id}})
        const files = req.files.partner_doc;
        const keys = ["cin_recto","cin_verso","matricule_fiscale_image","register_commerce_image","autorisation_ONTT_image"]
        const data = {cin,rip,matricule_fiscale,partner_id}
        files.forEach((element,index) => {
            data[keys[index]] = element.filename
        });
        await partner.update(data)
        return res.send({message:"file updated"})
    }catch(err){
        console.log(err)
        return res.status(500).send({message:"error server"})
    }

}
]
exports.VerifyPartner = async (req,res) => {
    try{
        const partner_id = req.userId;
        const user = await PartnerFile.findOne({where: {partner_id}});
        if(user.status === "accepted"){
            return res.send({message:"partner verified"});
        }
        else if(user.status === "pending"){
            return res.status(202).send({message:"partner files pending"});
        }
            return res.status(403).send({message:"partner refused"});
    }catch(err){
        return res.status(500).send({message:"error server"})
    }
}