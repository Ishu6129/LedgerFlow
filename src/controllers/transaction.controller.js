const accountModel=require("../models/account.model.js")
const transactionModel=require("../models/transaction.model.js")
const ledgerModel=require("../models/ledger.model.js")
const userModel=require("../models/user.model.js")
const emailService=require("../services/email.service.js")
const mongoose=require("mongoose")

async function createTransaction(req,res){
    try{
    /* 1.Validation Request */
    const {fromUserAccount,toUserAccount,amount,idempotencyKey}=req.body;
    if(!fromUserAccount || !toUserAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:"All fields are required for making an transaction"})
    }
    const fromUserAccountExists=await accountModel.findOne({_id:fromUserAccount})
    const toUserAccountExists=await accountModel.findOne({_id:toUserAccount})
    if(!fromUserAccountExists || !toUserAccountExists){
        return res.status(404).json({message:"Account not found"})
    }

    // Prevent transactions to the same account or between accounts owned by the same user
    if(String(fromUserAccountExists._id) === String(toUserAccountExists._id)){
        return res.status(400).json({message:"Cannot transfer to the same account"})
    }
    /* 3.Check Account Status */
    if(fromUserAccountExists.status!=="ACTIVE" || toUserAccountExists.status!=="ACTIVE"){
        return res.status(400).json({message:"Both accounts must be active to make a transaction"})
    }

    /* 4. Derive sender balance from ledger */
    const balance=await fromUserAccountExists.getBalance();
    if(balance<amount){
        return res.status(400).json({message:`Insufficient balance! Your current balance is ${balance} and you are trying to transfer ${fromUserAccountExists.currency} ${amount}`})
    }

    /* 5. Start Transaction Session */
    let session=await mongoose.startSession();
    session.startTransaction();

    /* 6. Validate idempotency key (INSIDE session for atomic check) */
    const isTransactionExists=await transactionModel.findOne({idempotencyKey:idempotencyKey}).session(session)
    if(isTransactionExists){
        session.endSession();
        if(isTransactionExists.status==="COMPLETED"){
            return res.status(200).json({message:"Transaction already completed :)",transaction:isTransactionExists})
        }else if(isTransactionExists.status==="PENDING"){
            return res.status(200).json({message:"Transaction is still processing !"})
        }else if(isTransactionExists.status==="FAILED"){
            return res.status(500).json({message:"Transaction failed preaviously,please Retry !"})
        }
        else if(isTransactionExists.status==="REVERSED"){
            return res.status(500).json({message:"Transaction was reversed preaviously,please Retry !"})
        }
    }

    /* 7. Create Transaction with PENDING status */
    const transaction=(await transactionModel.create([{
        from:fromUserAccountExists._id,
        to:toUserAccountExists._id,
        amount,
        status:"PENDING",
        idempotencyKey
    }],{session:session}))[0]

    /* 8. Create DEBIT Ledger Entry */
    const debitLedgerEntry=await ledgerModel.create([{
        account:fromUserAccountExists._id,
        type:"DEBIT",
        amount:amount,
        transaction:transaction._id
    }],{session:session})

    /* 9. Wait 7 seconds before creating CREDIT entry (concurrent request handling) */
    await new Promise((resolve) => setTimeout(resolve, 7 * 1000));

    /* 10. Create credit Ledger Entry */
    const creditLedgerEntry=await ledgerModel.create([{
        account:toUserAccountExists._id,
        type:"CREDIT",
        amount:amount,
        transaction:transaction._id
    }],{session:session})

    /* 11. Mark Transaction Status to COMPLETED */
    transaction.status="COMPLETED";
    await transaction.save({session:session})

    /* 12. Commit Transaction */
    await session.commitTransaction();
    session.endSession();

    /* 13. Send Email Notification to both users */
    // Send email to sender
    await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toUserAccountExists._id)
    
    // Send email to receiver
    const receiverUser = await userModel.findById(toUserAccountExists.user)
    await emailService.sendTransactionReceivedEmail(receiverUser.email,receiverUser.name,amount,req.user.name)

    return res.status(201).json({message:"Transaction completed successfully",transaction:transaction})
    }catch(error){
        if(session){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(400).json({message:"Transaction is Pending due to some issue, please retry after sometime"})
    }
}

async function createInitialFundsTransaction(req,res){
    const {toUserAccount,amount,idempotencyKey}=req.body;
    if(!toUserAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:"toUserAccount, amount and idempotencyKey are required"})
    }
    const toUserAccountExists=await accountModel.findOne({_id:toUserAccount})
    if(!toUserAccountExists){
        return res.status(400).json({message:"Invalid toAccount"})
    }
    if(toUserAccountExists.status!=="ACTIVE"){
        return res.status(400).json({message:"Account must be ACTIVE to receive initial fund"})
    }

    const fromSystemAccount=await accountModel.findOne({
        user:req.systemUser._id
    })
    if(!fromSystemAccount){
        return res.status(400).json({message:"System user account not found"})
    }

    /* 2. Start Transaction Session */
    let session=await mongoose.startSession();
    session.startTransaction();

    try{
    /* 3. Validate idempotency key (INSIDE session for atomic check) */
    const isTransactionExists=await transactionModel.findOne({idempotencyKey:idempotencyKey}).session(session)
    if(isTransactionExists){
        session.endSession();
        if(isTransactionExists.status==="COMPLETED"){
            return res.status(200).json({message:"Transaction already processed",transaction:isTransactionExists})
        }else if(isTransactionExists.status==="PENDING"){
            return res.status(200).json({message:"Transaction is still processing"})
        }else if(isTransactionExists.status==="FAILED"){
            return res.status(500).json({message:"Transaction processing failed, please retry"})
        }
        else if(isTransactionExists.status==="REVERSED"){
            return res.status(500).json({message:"Transaction was reversed, please retry"})
        }
    }

    /* 4. Create Transaction with PENDING status */
    const transaction=new transactionModel({
        from:fromSystemAccount._id,
        to:toUserAccountExists._id,
        amount,
        status:"PENDING",
        idempotencyKey
    })
    
    const debitLedgerEntry=await ledgerModel.create([{
        account:fromSystemAccount._id,
        type:"DEBIT",
        amount:amount,
        transaction:transaction._id
    }],{session:session})

    const creditLedgerEntry=await ledgerModel.create([{
        account:toUserAccountExists._id,
        type:"CREDIT",
        amount:amount,
        transaction:transaction._id
    }],{session:session}) 

    transaction.status="COMPLETED";
    await transaction.save({session:session})
    await session.commitTransaction();
    session.endSession();

    const receiverUser = await userModel.findById(toUserAccountExists.user)
    await emailService.sendInitialFundEmail(receiverUser.email,receiverUser.name,amount)
    return res.status(201).json({message:"Initial funds transaction completed successfully",transaction:transaction})
    }catch(error){
        if(session){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(400).json({message:"Transaction processing failed due to some issue, please retry after sometime"})
    }
}

module.exports={
    createTransaction,
    createInitialFundsTransaction
}