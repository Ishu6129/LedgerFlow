const userModel=require("../models/user.model.js")
const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blacklist.model.js")

async function authMiddleWare(req,res,next){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized Access,Token Missing !!!",
            status:"failed"
        })
    }
    const isBlackListed=await tokenBlacklistModel.findOne({token:token})
    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized Access,Token is Blacklisted !!!",
            status:"failed"
        })
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user=await userModel.findById(decoded.userId)
        req.user=user
        next()
    }
    catch(err){
        return res.status(401).json({
            message:"Unauthorized Access,Token Invalid !!!",
            status:"failed"
        })
    }
}

async function authSystemUserMiddleware(req,res,next){
    const token=req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorized Access,Token Missing !!!",
            status:"failed"
        })
    }
    const isBlackListed=await tokenBlacklistModel.findOne({token:token})
    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized Access,Token is Blacklisted !!!",
            status:"failed"
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user=await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden Access,Only System Users can Access !!!",
                status:"failed"
            })
        }
        req.systemUser=user
        next()
    }
    catch(err){
        return res.status(401).json({
            message:"Unauthorized Access,Token Invalid !!!",
            status:"failed"
        })
    }
}
module.exports={authMiddleWare,authSystemUserMiddleware}