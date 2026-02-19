const mongoose=require('mongoose');
const ledgerModel=require("./ledger.model.js")

const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"Account must belong to a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE","FROZEN","CLOSE"],
            message:"Status must be either ACTIVE, FROZEN or CLOSE",
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        required:[true,"Account must have a currency"],
        default:"INR"
    }
},{timestamps:true})

accountSchema.index({user:1,status:1})

accountschema.methods.getBalance=async function(){
    const findBalance=await ledgerModel.aggregate([
        {$match:{account:this._id}},
        {$group:{
            _id:null,
            totalDebit:{$sum:{$cond:[{$eq:["$type","DEBIT"]},"$amount",0]}},
            totalCredit:{$sum:{$cond:[{$eq:["$type","CREDIT"]},"$amount",0]}}
        }},
        {$project:{
            _id:0,
            balance:{$subtract:["$totalCredit","$totalDebit"]}
        }}
    ])
    if(findBalance.length>0){
        return findBalance[0].balance;
    }else{
        return 0;
    }
}


const AccountModel=mongoose.model("account",accountSchema);
module.exports=AccountModel;