const { User } = require("../models");

module.exports = async (req,res,next) => {
    try{
        const userId = req.userId;
        const user = await User.findByPk(userId);
        if(!user){
            return res.status(404).send({message:"user not found"});
        }
        if(user.role === "admin"){
            next();
        }
            return res.status(403).send({message:"Forbidden"});
    }catch{
        return res.status(500).send({message:"server error"});
    }
}