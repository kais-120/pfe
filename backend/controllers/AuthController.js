const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const { otpSend, forgetPassword } = require("../util/sendEmail");
const { OtpRegisterCreate, ForgotPasswordEmail } = require("./OtpController");
const { PartnerFile, Otp } = require("../models");
const { Op } = require("sequelize");
const Activity = require("../models/Activity");


exports.Register =[
    body("firstName").notEmpty().withMessage("first name is required"),
    body("lastName").notEmpty().withMessage("last name is required"),
    body("email").notEmpty().withMessage("email is required"),
    body("password").notEmpty().withMessage("password required")
    .isLength({min:6}).withMessage("password should at least be 6"),
    body("phone").notEmpty().withMessage("password required")
    .isLength({min:8,max:8}).withMessage("phone number should at least be 8")
    .isNumeric().withMessage("phone number should numeric")
    ,async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
        const {firstName,lastName,email,password,phone} = req.body;
        const name = firstName + " " +lastName;
        const existEmail = await User.findOne({ where: { email:email.toLowerCase() } });
        const existPhone = await User.findOne({ where: { phone } });

            let errors = {};

            if (existEmail) {
            errors.email = "email is already used";
            }

            if (existPhone) {
            errors.phone = "phone is already used";
            }

            if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                message: "Validation error",
                errors
            });
            }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name,email:email.toLowerCase(),password:hashed,phone});
        const fullName = `${firstName} ${lastName}`
        const otp = await OtpRegisterCreate(user.id);
        otpSend(email.toLowerCase(),fullName,otp.code.toString())
        Activity.create({type:"auth",titre:"Nouvel client inscrit"})
        return res.status(201).json({message:"account created",token:otp.hash});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"server error"});
    }
    }
]
exports.Login = [
    body("email").notEmpty().withMessage("email required"),
    body("password").notEmpty().withMessage("password required"),
    async (req,res) => {
 const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
        const {email,password} = req.body;
        const user = await User.findOne({where: {email:email.toLowerCase()} });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign({sub:user.id,iss:"domain",aud:"name"},process.env.JWTKEY);
        return res.status(200).json({ message: "valid credentials" , token : token , role : user.role });
       
    }catch(err){
        console.log(err)
        return res.status(500).json({message:err});
    }
}
]
exports.Profile = async (req,res) => {
    try{
        const id = req.userId;
        const user = await User.findByPk(id,
            { attributes:{
            exclude:"password"
            }});
        if(!user){
            return res.status(404).send({message:"user not found"});
        }
        if(user.role === "partner"){
             const user = await User.findByPk(id,
            { attributes:{
            exclude:"password"
            },
            include:[
                {
                    model:PartnerFile,
                    as:"partnerInfo",
                    attributes:["sector"]
                }
            ]
        });
        return res.status(200).send({message:"user found",data:user});
        }
        return res.status(200).send({message:"user found",data:user});
    }catch{
        return res.status(500).send({message:"server error"})
    }
}
exports.PartnerRegister =[
    body("name").notEmpty().withMessage("name is required"),
    body("phone").notEmpty().withMessage("phone number is required")
    .isLength(8).withMessage("phone number should be 8")
    .isNumeric().withMessage("phone number should be a number"),
    body("email").notEmpty().withMessage("email is required"),
    body("sector").notEmpty().withMessage("sector is required")
    .isIn(["agence de voyage","location de voitures","hôtel","compagnies aériennes","voyages circuits"]).withMessage("sector not match"),
    body("password").notEmpty().withMessage("password required")
    .isLength({min:6}).withMessage("password should at least be 6")
    ,async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
        const {name,email,password,phone,sector} = req.body;
         const existEmail = await User.findOne({ where: { email:email.toLowerCase() } });
        const existPhone = await User.findOne({ where: { phone } });

                let errors = {};

                if (existEmail) {
                errors.email = "email is already used";
                }

                if (existPhone) {
                errors.phone = "phone is already used";
                }

            if (Object.keys(errors).length > 0) {
            return res.status(422).json({
                message: "Validation error",
                errors
            });
            }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name,email:email.toLowerCase(),password:hashed,role:"partner",phone});
        await PartnerFile.create({sector,partner_id:user.id})
        const otp = await OtpRegisterCreate(user.id);
        otpSend(email.toLowerCase(),name,otp.code.toString())
        Activity.create({type:"auth",titre:"Nouvel partenaire inscrit"})
        return res.status(201).json({message:"account created",token:otp.hash});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"server error"});
    }
    }
]
exports.ForgotPassword = [
    body("email").notEmpty().withMessage("email is required")
    ,async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {email} = req.body;
            const user = await User.findOne({where: {email:toLowerCase()}});
            if(!user){
                return res.status(404).send({ message: "user not found" });
            }
            const otp = await ForgotPasswordEmail(user.id);
            forgetPassword(email.toLowerCase(),user.name,otp.code.toString());
            return res.send({message:"code send to email",token:otp.hash});
        }catch(err){
            return res.status(500).send({ message: "server error" });
        }
    }
];

exports.UpdatePassword = [
    body("password").notEmpty().withMessage("password is required"),
    body("token").notEmpty().withMessage("token is required"),
    ,async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {password,token} = req.body;
            const otp = await Otp.findOne({where: {token}})
             if(!otp){
                return res.status(404).send({ message: "otp not found" });
            }
            const user = await User.findByPk(otp.user_id);
            if(!user){
                return res.status(404).send({ message: "user not found" });
            }
            const hashPassword = await bcrypt.hash(password,10)
            user.update({password:hashPassword});
            otp.destroy()
            return res.send({message:"password updated"});
        }catch(err){
            console.log(err)
            return res.status(500).send({ message: "server error" });
        }
    }
];