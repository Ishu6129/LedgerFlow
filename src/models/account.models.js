const mongoose=require('mongoose');

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

const AccountModel=mongoose.model("account",accountSchema);
module.exports=AccountModel;