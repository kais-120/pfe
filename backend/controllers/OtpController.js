const { body, validationResult } = require("express-validator");
const { Otp, User } = require("../models");
const crypto = require('crypto');
const { otpSend, otpResend } = require("../util/sendEmail");


exports.OtpRegisterCreate = async (user_id) => {
    const code = crypto.randomInt(100000, 1000000);
    const hash = crypto.createHash("sha256")
    .update(crypto.randomInt(100000, 1000000).toString())
    .digest("hex")
    try{
        await Otp.create({user_id,code,type:"register",token:hash})
        return{code,hash}
    }catch{
       return "server error";
    }
}
exports.VerifyOtp = [
    body("hash").notEmpty().withMessage("hash is required"),
    body("code").notEmpty().withMessage("code is required")
    .isLength({ min: 6, max: 6 }).withMessage("code should be 6 number")
    .isNumeric().withMessage("code should be number"),
    body("type").notEmpty().withMessage("type required")
    .isIn(["forgot_password","register"])
    ,
    async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {code,hash,type} = req.body;
            const date = new Date();
            const otpUser = await Otp.findOne({where: {token:hash,type}});
            if(!otpUser){
                return res.status(404).send({message:"user not found"});
            }
            if(date > otpUser.expire_at){
                return res.status(410).send({message:"otp gone"});
            }
            else if(code !== otpUser.code){
                return res.status(403).send({message:"otp is wrong"});
            }
            else{
                const user = await User.findByPk(otpUser.user_id);
                user.update({verified_at:date})
                return res.send({message:"account verified"});
            }

        }catch(err){
            console.log(err)
            return res.status(500).json({message:"server error"});
        }
    }
]
exports.ResendOtp = [
    body("hash").notEmpty().withMessage("hash required"),
    body("type").notEmpty().withMessage("hash required"),
    async (req,res)=>{
         const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {hash,type} = req.body;
            const date = new Date();
            const userOtp = await Otp.findOne({where: {token:hash}});
            if(!userOtp){
                return res.status(404).send({message:"user not found"});
            }
            const user = await User.findByPk(userOtp.user_id);
            const code = crypto.randomInt(100000, 1000000);
            otpResend(user.email,user.name,code.toString(),type);
            const expire_at = new Date(Date.now() + 5 * 60 * 1000);
            userOtp.update({created_at:date,code,expire_at})
            return res.send({message:"code updated"});

        }catch(err){
            console.log(err)
            return res.status(500).json({message:"server error"});
        }
    }
];
exports.ForgotPasswordEmail = async (user_id) => {
    const code = crypto.randomInt(100000, 1000000);
    const hash = crypto.createHash("sha256")
    .update(crypto.randomInt(100000, 1000000).toString())
    .digest("hex")
    try{
        await Otp.create({user_id,code,type:"forgot_password",token:hash,user_id})
        return{code,hash}
    }catch(err){
       return "server error";
    }
}
exports.EmailChangeOtp = async (user_id) => {
    const code = crypto.randomInt(100000, 1000000);
    try{
        await Otp.create({user_id,code,type:"email",user_id})
        return code
    }catch(err){
       return "server error";
    }
}