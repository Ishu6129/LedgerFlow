const userModel=require("../models/user.model.js")
const jwt=require("jsonwebtoken")
const emailService=require("../services/email.service.js")
/**
 * - User register controller
 * - POST /api/auth/register
 */
async function userRegisterController(req,res){
    try{
    const {email,password,name}=req.body
    const isExist=await userModel.findOne({email})
    if(isExist){
        return res.status(422).json({
            message:"User already exist",
            status:"failed"
        })
    } 
    const user=await userModel.create({email,password,name})
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"2d"
    })
    res.cookie("token",token)
    res.status(201).json({
        message:"User register successfully with id: "+user._id,
        email:user.email,
        status:"success",
        token:token
    })
    await emailService.sendRegistrationEmail(user.email,user.name)
    }catch(err){
        res.status(500).json({
            message:"Error during registration",
            status:"failed",
            error:err.message
        })
    }
}

/**
 * - User login controller
 * - POST /api/auth/login
 */
async function userLoginController(req,res){
    try{
    const {email,password}=req.body;
    const user=await userModel.findOne({email}).select("+password")
    if(!user){
        return res.status(404).json({
            message:"Email or password not valid",
            status:"failed"
        })
    }
    const isValidPassword=await user.comparePassword(password)
    if(!isValidPassword){
        return res.status(404).json({
            message:"Email or password not valid",
            status:"failed"
        })
    }
    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"2d"
    })
    res.cookie("token",token)
    res.status(200).json({
        message:"User logged in successfully",
        email:user.email,
        status:"success",
        token:token
    })
    await emailService.sendLoginNotificationEmail(user.email,user.name)
    }catch(err){
        res.status(500).json({
            message:"Error during login",
            status:"failed",
            error:err.message
        })
    }
}

module.exports={
    userRegisterController,userLoginController
}