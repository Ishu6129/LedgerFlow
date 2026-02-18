const express=require("express");
const authMiddleWare = require("../middleware/auth.middleware.js");
const accountController=require("../controllers/account.controller.js")

const router=express.Router();

router.post("/",authMiddleWare.authMiddleWare,accountController.createAccountController)


module.exports=router