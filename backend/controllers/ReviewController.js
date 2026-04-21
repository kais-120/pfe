const { body, validationResult } = require("express-validator");
const { Reviews, Hotel, User } = require("../models");
const Activity = require("../models/Activity");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");

exports.AddReview = [
    body("review").notEmpty().withMessage("review required"),
    body("rate").notEmpty().withMessage("rate required")
    .isNumeric().withMessage("rate should be a numeric"),
    async(req,res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array().map(err => err.msg)
        })
        }
        try{
            const { review,rate } = req.body;
            const { id } = req.params;
            const client_id = req.userId;
            await Reviews.create({client_id,hotel_id:id,rate,review})
                const hotel = await Hotel.findByPk(id);
                await Activity.create({type:"review",titre:`Avis ${rate}★ posté sur ${hotel.name}`})
            
            return res.status(201).json({message: "review created"})
        }catch(err){
            console.log(err)
        return res.status(500).json({message: "server error"})
        }
    }
]
exports.GetReview = async(req,res) => {
        try{
            const { id } = req.params;
            const reviews = await Reviews.findAll({where: {hotel_id:id,status:"approuvée"}})
            if(!reviews){
                return res.status(404).json({message: "reviews not found"})
            }
            return res.json({message: "review found",reviews})
        }catch{
        return res.status(500).json({message: "server error"})
        }
}

exports.AddClaim = [
    body("message").notEmpty().withMessage("message"),
    body("reason").notEmpty().withMessage("reason required"),
    async(req,res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array().map(err => err.msg)
        })
        }
        try{
            const { message,reason } = req.body;
            const { id } = req.params;
            const review = await Reviews.findByPk(id);
            if(!review){
                return res.status(404).json({message: "review not found"})
            }
            const partner_id = req.userId;
            await Claim.create({review_id:id,partner_id,message,reason})
            await Activity.create({ type: "claim",titre: `Nouvelle réclamation : ${reason}`,})
            await Notification.create({title: "Nouvelle réclamation",type:"claim",message:"Votre réclamation a été envoyée avec succès"})
            return res.status(201).json({message: "claim created"})
        }catch{
        return res.status(500).json({message: "server error"})
        }
    }
]

exports.GetAdminReview = async(req,res) => {
        try{
            const reviews = await Reviews.findAll({
                include:[
                    {
                        model:Claim,
                        as:"claim"
                    },
                    {
                        model:User,
                        as:"clientReview",
                        attributes:["id","name"]
                    },
                    {
                        model:Hotel,
                        as:"reviewHotel",
                        attributes:["id","name"],
                        include:[
                            {
                                model:User,
                                as:"partnerHotel",
                                attributes:["name"]
                            }
                        ]
                    }
                ]
            })
            if(!reviews){
                return res.status(404).json({message: "reviews not found"})
            }
            return res.json({message: "reviews found",reviews})
        }catch(err){
            console.log(err)
        return res.status(500).json({message: "server error"})
        }
}

exports.AcceptClaim = async(req,res) => {
        try{
            const {id} = req.params;
            const claim = await Claim.findByPk(id);
            const review = await Reviews.findByPk(claim.review_id)
            if(!claim){
                return res.status(404).json({message: "claim not found"})
            }
            claim.update({status:"approuvée"});
            review.update({status:"rejetée"});

            return res.json({message: "claim is accepted"})
        }catch(err){
            console.log(err)
        return res.status(500).json({message: "server error"})
        }
}

exports.RefuseClaim = async(req,res) => {
        try{
           const {id} = req.params;
            const claim = await Claim.findByPk(id);
            if(!claim){
                return res.status(404).json({message: "claim not found"})
            }
            claim.update({status:"rejetée"});
            return res.json({message: "claim is refused"})
        }catch(err){
            console.log(err)
        return res.status(500).json({message: "server error"})
        }
}