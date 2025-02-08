const mongoose=require('mongoose');

const vendorSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        // unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        // required:true
    },
    images:{
        type:[String],
        default:[]
        // required:true
    },
    colorimg:{
        type:[String],
        default:[]
        // required:true
    },
    otp:{
        type:String,
        default:0
    },
    createdAt:Date,
    expiresAt:Date,
});

module.exports=mongoose.model('Vendor',vendorSchema)
