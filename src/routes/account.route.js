const express=require("express");
const authMiddleWare = require("../middleware/auth.middleware.js");
const accountController=require("../controllers/account.controller.js")

const router=express.Router();

/**
 * - POST /api/accounts
 */
router.post("/",authMiddleWare.authMiddleWare,accountController.createAccountController)

/**
 * - GET /api/accounts
 */
router.get("/",authMiddleWare.authMiddleWare,accountController.getUserAccountsController)

/**
 * - GET /api/accounts/balance
 */
router.get("/balance",authMiddleWare.authMiddleWare,accountController.getAccountBalanceController)

/**
 * - GET /api/accounts/history
 */
router.get("/history",authMiddleWare.authMiddleWare,accountController.getAccountTransactionHistoryController)

module.exports=router