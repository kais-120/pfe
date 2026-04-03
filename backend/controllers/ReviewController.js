const { body, validationResult } = require("express-validator");
const { Reviews, Hotel } = require("../models");
const Activity = require("../models/Activity");

exports.AddReview = [
    body("review").notEmpty().withMessage("review required"),
    body("rate").notEmpty().withMessage("rate required")
    .isNumeric().withMessage("rate should be a numeric"),
    body("type_service").notEmpty().withMessage("service required")
    .isIn("hotels","voyages","locations","agences","compagnies").withMessage("service not allow"),
    async(req,res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array().map(err => err.msg)
        })
        }
        try{
            const { review,rate,type_service } = req.body;
            const { id } = req.params;
            const client_id = req.userId;
            await Reviews.create({client_id,type_service,service_id:id,rate,review})
            if(type_service === "hotels"){
                const hotel = await Hotel.findByPk(id);
                await Activity.create({type:"review",titre:`Avis ${rate}★ posté sur ${hotel.name}`})
            }
            return res.status(201).json({message: "review created"})
        }catch{
        return res.status(500).json({message: "server error"})
        }
    }
]
exports.GetReview = async(req,res) => {
        try{
            const { id } = req.params;
            const reviews = await Reviews.findAll({where: {service_id:id}})
            if(!reviews){
                return res.status(404).json({message: "reviews not found"})
            }
            return res.json({message: "review found",reviews})
        }catch{
        return res.status(500).json({message: "server error"})
        }
    }