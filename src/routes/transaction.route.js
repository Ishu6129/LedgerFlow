const express=require("express")
const authMiddleWare=require("../middleware/auth.middleware.js")
const transactionController=require("../controllers/transaction.controller.js")

const router=express.Router();


/**
 * - POST /api/transactions
 */
router.post("/",authMiddleWare.authMiddleWare,transactionController.createTransaction)

/**
 * - POST /api/transactions/system/initial-fund
 */
router.post("/system/initial-fund",authMiddleWare.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)

module.exports=router