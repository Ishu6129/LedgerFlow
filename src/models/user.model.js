const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")



const userSchema=new mongoose.Schema({
    email:{
        type:String,
        trim:true,
        required:[true,"Email is required for creating the user"],
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/,"Invalid Email Adress"],
        unique:[true,"Email Already exists"]
    },
    name:{
        type:String,
        trim:true,
        required:[true,"Name is Required for creating an Account"]
    },
    password:{
        type:String,
        required:[true,"Password is Required for creating an Account"],
        minlength:[6,"Password should be of minimum 6 characters"],
        select:false
    }
},{timestamps:true})

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return
    }
    const hash =await bcrypt.hash(this.password,10)
    this.password=hash
    return
})

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

const userModel=mongoose.model("user",userSchema)
module.exports=userModel;