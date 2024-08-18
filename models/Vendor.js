const mongoose=require('mongoose');

const vendorSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        default:[]
        // required:true
    },
});

module.exports=mongoose.model('Vendor',vendorSchema)