const express=require("express")
const authMiddleWare=require("../middleware/auth.middleware.js")
const transactionController=require("../controllers/transaction.controller.js")

const router=express.Router();

router.post("/",authMiddleWare.authMiddleWare,transactionController.createTransaction)

module.exports=router 