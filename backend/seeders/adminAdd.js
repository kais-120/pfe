require("dotenv").config();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
async function createAdmin (){
    try{
    const existAdmin = await User.findOne({where: {email:"admin@admin.com"}});
    if(existAdmin){
        console.warn("Admin already exists");
        process.exit();

    }
    const hashed = await bcrypt.hash("123456",10);
    await User.create({first_name:"admin",last_name:"admin",email:"admin@admin.com",password:hashed,role:"admin",phone:"55740526",verified_at:Date.now()});
    console.log("Admin created");
    process.exit();
    }catch(err){
        console.log(err);
        process.exit();
    }
}
createAdmin()