const APIKEY = process.env.APIKEY;
module.exports = (req,res,next) => {
    const apiHeader = req.headers.x_api_key;
    if(!apiHeader){
        return res.status(404).send({message:"api key not found"});
    }
    else if(apiHeader !== APIKEY){
        return res.status(403).send({message:"Api key wrong"});
    }
    next();
}