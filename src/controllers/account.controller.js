const accountModel=require("../models/account.model.js")


async function createAccountController(req,res){
    try{
        const user=req.user;

        const account=await accountModel.create({
            user:user._id
        })
        res.status(201).json({
            message:"Account Created Successfully",
            status:"success",
            data:account
        })
    }catch(err){
        res.status(500).json({
            message:"Error creating account",
            status:"failed",
            error:err.message
        })
    }
}

async function getUserAccountsController(req,res){
    try{
        const user=req.user;
        const accounts=await accountModel.find({user:user._id})
        res.status(200).json({
            message:"User Accounts Fetched Successfully",
            status:"success",
            data:accounts
        })
    }catch(err){
        res.status(500).json({
            message:"Error fetching accounts",
            status:"failed",
            error:err.message
        })
    }
}

async function getAccountBalanceController(req,res){
    const user=req.user;
    const account=await accountModel.findOne({user:user._id})
    if(!account){
        return res.status(404).json({
            message:"Account not found for the user",
            status:"failed"
        })
    }
    try{
        const balance=await account.getBalance()
        res.status(200).json({
            message:"Account Balance Fetched Successfully",
            status:"success",
            data:{balance:balance}
        })
    }catch(err){
        res.status(500).json({
            message:"Error fetching balance",
            status:"failed",
            error:err.message
        })
    }
}

async function getAccountTransactionHistoryController(req,res){
    const user=req.user;
    const account=await accountModel.findOne({user:user._id})
    if(!account){
        return res.status(404).json({
            message:"Account not found for the user",
            status:"failed"
        })
    }
    try{
        const transactions=await account.getTransactionHistory();
        res.status(200).json({
            message:"Account Transaction History Fetched Successfully",
            status:"success",
            data:transactions
        })
    }catch(err){
        res.status(500).json({
            message:"Error fetching transaction history",
            status:"failed",
            error:err.message
        })
    }
}

module.exports={createAccountController,getUserAccountsController,getAccountBalanceController,getAccountTransactionHistoryController}