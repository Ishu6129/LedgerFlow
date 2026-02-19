const mongoose=require('mongoose');


const transactionSchema=new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Transaction must have a from account"],
        index:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Transaction must have a to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Status must be either PENDING, COMPLETED or FAILED",
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Transaction must have an amount"],
    },
    idempotencyKey:{
        type:String,
        required:[true,"Transaction must have an idempotency key"],
        index:true,
        unique:true
    }
},{timestamps:true}
)

const transactionModel=mongoose.model("transaction",transactionSchema);
module.exports=transactionModel;