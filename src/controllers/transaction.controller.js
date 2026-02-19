const accountModel=require("../models/account.model.js")
const transactionModel=require("../models/transaction.model.js")
const ledgerModel=require("../models/ledger.model.js")
const emailService=require("../services/email.service.js")
const mongoose=require("mongoose")

async function createTransaction(req,res){

    /* 1.Validation Request */
    const {fromUserAccount,toUserAccount,status,amount,idempotencyKey}=req.body;
    if(!fromUserAccount || !toUserAccount || !status || !amount || !idempotencyKey){
        return res.status(400).json({message:"All fields are required for making an transaction"})
    }
    cosnt fromUserAccountExists=await accountModel.findOne({_id:fromUserAccount})
    const toUserAccountExists=await accountModel.findOne({_id:toUserAccount})
    if(!fromUserAccountExists || !toUserAccountExists){
        return res.status(404).json({message:"Account not found"})
    }
    if(fromUserAccountExists.balance<amount){
        return res.status(400).json({message:"Insufficient balance"})
    }

    /* 2.Validate idempotency key*/
    const isTransactionExists=await transactionModel.findOne({idempotencyKey:idempotencyKey})
    if(isTransactionExists){
        if(isTransaction.status==="COMPLETED"){
            return res.status(200).json({message:"Transaction already completed :)",transaction:isTransaction})
        }else if(isTransaction.status==="PENDING"){
            return res.status(200).json({message:"Transaction is still processing !"})
        }else if(isTransaction.status==="FAILED"){
            return res.status(500).json({message:"Transaction failed preaviously,please Retry !"})
        }
        else if(isTransaction.status==="REVERSED"){
            return res.status(500).json({message:"Transaction was reversed preaviously,please Retry !"})
        }
    }

    /* 3.Check Account Status */
    if(fromUserAccount.status!=="ACTIVE" || toUserAccount.status!=="ACTIVE"){
        return res.status(400).json({message:"Both accounts must be active to make a transaction"})
    }

    /* 4. Derive sender balance from ledger */
    const balance=await fromUserAccount.getBalance();
    if(balance<amount){
        return res.status(400).json({message:`Insufficient balance! Your current balance is ${balance} and you are trying to transfer ${fromUserAccount.currency} ${amount}`})
    }

    /* 5. Create Transaction with PENDING status */
    const session=await mongoose.startSession();
    session.startTransaction();
    const tranasaction=await trasactionModel.create({
        fromUserAccount,
        toUserAccount,
        amount,
        status:"PENDING",
        idempotencyKey
    },{session:session})

    /* 6. Create DEBIT Ledger Entry */
    const debitLedgerEntry=await ledgerModel.create({
        account:fromUserAccount,
        type:"DEBIT",
        amount:amount,
        transaction:tranasaction._id
    },{session:session})

    /* 7. Create credit Ledger Entry */
    const creditLedgerEntry=await ledgerModel.create({
        account:toUserAccount,
        type:"CREDIT",
        amount:amount,
        transaction:tranasaction._id
    },{session:session})

    /* 8. Update Transaction Status to COMPLETED */
    tranasaction.status="COMPLETED";
    await tranasaction.save({session:session})

    /* 9. Commit Transaction */
    await session.commitTransaction();
    session.endSession();

    /* 10. Send Email Notification to both users */
    emailService.sendEmail(req.user.email,req.user.name,amount,toUserAccount._id)

    return res.status(200).json({message:"Transaction completed successfully!",transaction:tranasaction})
}

module.exports={
    createTransaction
}