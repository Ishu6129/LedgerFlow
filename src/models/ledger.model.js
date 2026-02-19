const mongoose=require("mongoose");

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Ledger entry must belong to an account"],
        index:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'transaction',
        required:[true,"Ledger entry must belong to a transaction"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Ledger entry must have an amount"],
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["DEBIT","CREDIT"],
            message:"Type must be either DEBIT or CREDIT",
        },
        required:[true,"Ledger entry must have a type"],
        immutable:true
    }
},{timestamps:true}
)

function preventLedgerModification(){
    throw new Error("Ledger entries cannot be modified or deleted");
}


ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);

ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);

ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('findOneAndRemove',preventLedgerModification);

ledgerSchema.pre('replaceOne',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);

const LedgerModel=mongoose.model("ledger",ledgerSchema);
module.exports=LedgerModel;