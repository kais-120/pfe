const { body, validationResult } = require("express-validator");
const { Otp, User } = require("../models");
const crypto = require('crypto');
const { otpSend } = require("../util/sendEmail");


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
    .isNumeric().withMessage("code should be number")
    ,
    async(req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {code,hash} = req.body;
            const date = new Date();
            const otpUser = await Otp.findOne({where: {token:hash}});
            if(!otpUser){
                return res.status(404).send({message:"user not found"});
            }
            if(date > otpUser.expire_at){
                return res.status(410).send({message:"otp gone"});
            }
            else if(code !== otpUser.code){
                console.log(otpUser.code)
                return res.status(403).send({message:"otp is wrong"});
            }
            else{
                const user = await User.findByPk(otpUser.user_id);
                user.update({verified_at:date})
                otpUser.destroy();
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
    async (req,res)=>{
         const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({ errors: errors.array().map(err => err.msg) });
        }
        try{
            const {hash} = req.body;
            const date = new Date();
            const userOtp = await Otp.findOne({where: {token:hash}});
            if(!userOtp){
                return res.status(404).send({message:"user not found"});
            }
            const user = await User.findByPk(userOtp.user_id);
            const code = crypto.randomInt(100000, 1000000);
            const fullName = `${user.first_name} ${user.last_name}`;
            otpSend(user.email,fullName,code);
            const expire_at = new Date(Date.now() + 5 * 60 * 1000);
            userOtp.update({created_at:date,code,expire_at})
            return res.send({message:"code updated"});

        }catch(err){
            console.log(err)
            return res.status(500).json({message:"server error"});
        }
    }
]