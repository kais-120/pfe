const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const { otpSend } = require("../util/sendEmail");
const { OtpRegisterCreate } = require("./OtpController");
const { PartnerFile } = require("../models");


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
        const existEmail = await User.findOne({where:{email}});
        if(existEmail){
            return res.status(422).json({message:"email is already used"});
        }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name,email,password:hashed,phone});
        const fullName = `${firstName} ${lastName}`
        const otp = await OtpRegisterCreate(user.id);
        otpSend(email,fullName,otp.code.toString())
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
        const user = await User.findOne({where: {email} });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign({sub:user.id,iss:"domain",aud:"name"},process.env.JWTKEY);
        return res.status(200).json({ message: "valid credentials" , token : token , role : user.role });
       
    }catch(err){
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
        const existEmail = await User.findOne({where:{email}});
        const existPhone = await User.findOne({where:{phone}});
        if(existEmail){
            return res.status(422).json({message:"email is already used"});
        }
        if(existPhone){
            return res.status(422).json({message:"phone is already used"});
        }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name,email,password:hashed,role:"partner",phone});
        await PartnerFile.create({sector,partner_id:user.id})
        const otp = await OtpRegisterCreate(user.id);
        otpSend(email,name,otp.code.toString())
        return res.status(201).json({message:"account created",token:otp.hash});
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"server error"});
    }
    }
]
 