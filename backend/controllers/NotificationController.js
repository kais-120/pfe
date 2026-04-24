const { User } = require("../models");
const Notification = require("../models/Notification");

exports.GetNotification = async (req,res) => {
    try{
        const id = req.userId;
        const user = await User.findByPk(id);
        if(!user){
            return res.status(404).send({message:"user not found"})
        }
        if(user.role === "admin" || user.role === "agent"){
            const notifications = await Notification.findAll({where:{type:"document"}
             ,order: [["createdAt", "DESC"]],})
            return res.send({message:"notification found",notifications})
        }
         const notifications = await Notification.findAll({where:{user_id:id}
        , order: [["createdAt", "DESC"]],})
            return res.send({message:"notification found",notifications})
    }catch{
        res.status(500)
    }
}
exports.ReadById = async (req,res) => {
    try{
        const {id} = req.params;
        const notification = await Notification.findByPk(id)
        if(!notification){
            return res.status(404).send({message:"notification not found"})
        }
        await notification.update({is_read:true})
            return res.send({message:"notification read it"})
    }catch{
        res.status(500)
    }
}
exports.ReadAll = async (req,res) => {
    try{
        const id = req.userId;
        const user = await User.findByPk(id);
        if(!user){
            return res.status(404).send({message:"user not found"})
        }
        if(user.role === "admin" || user.role === "agent"){
           await Notification.update(
                { is_read: true },
                {
                    where: {
                    user_id: null,
                    is_read: false
                    }
                }
                )
            return res.send({message:"all notification read it"})
        }
         const notifications = await Notification.findAll({where:{user_id:id}})
         await Notification.update(
            { is_read: true },
            {
                where: {
                user_id:id,
                is_read: false
                }
            }
            )
            return res.send({message:"all notification read it"})
    }catch(err){
        console.log(err)
        return res.status(500).json({message:"server error"})
    }
}