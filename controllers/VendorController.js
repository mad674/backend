const vendor=require('../models/Vendor');
const jwt=require('jsonwebtoken');

const bcrypt=require('bcryptjs');
const dotenv=require('dotenv');

dotenv.config();
const secretkey=process.env.Whatisyourname;
const vendorRegister=async(req,res)=>{
    const {username,password,confirmPassword}=req.body;
    try{
        const vendorEmail=await vendor.findOne({username});
        if(vendorEmail){
            return res.status(400).json({msg:'username already exists'});
        }
        // const salt=await bcrypt.genSalt();
        const hashedPassword=await bcrypt.hash(password,10);
        const newVendor=await vendor.create({
            username,
            password:hashedPassword
        });
        await newVendor.save();
        res.status(201).json({msg:'vendor created successfully',success:true});
        const token=jwt.sign({id:newVendor._id},secretkey);
        console.log('registered successfully');
    }catch(err){
        // const token=jwt.sign({id:newVendor._id},process.env.JWT_SECRET);
        console.log(err);
        res.status(500).json({error:'internal server error',success:false});
    }
}

const vendorLogin=async(req,res)=>{
    const {username,password}=req.body;
    try{
        const vendorEmail=await vendor.findOne({username});
        if(!vendorEmail){
            return res.status(400).json({msg:'username not found'});
        }
        const isMatch=await bcrypt.compare(password,vendorEmail.password);
        if(!isMatch){
            return res.status(400).json({msg:'wrong password'});
        }
        const token=jwt.sign({vendorid:vendorEmail._id},secretkey,{expiresIn:'1d'});//generate token 
        const vendorid=vendorEmail._id;
        console.log(vendorid);
        res.status(200).json({msg:'login successfully',token,vendorid,success:true});
        console.log('this is token');
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error',success:false});
    }
}

const getvendor=async(req,res)=>{    
    try{
        const employee= await vendor.find();
        res.status(200).json({employee,success:true});
    }catch(err){
        res.status(500).json({error:'internal server error',success:false});
    }
}
const single=async(req,res)=>{
    try{
        const employee=await vendor.findById(req.params.id);
        // res.status(200).json({employee,success:true});
        if(!employee){
            return res.status(404).json({msg:'employee not found'});
        }
        res.status(200).json({employee,success:true});
    }catch(err){
        res.status(500).json({error:'internal server error',success:false});
    }
    // const token = req.headers.authorization?.split(' ')[1]; // Assume token is in 'Bearer <token>' format
    // const userId = getUserFromToken(token);

    // if (!userId) {
    //     return res.status(401).json({ message: 'Invalid token' });
    // }

    // try {
    //     const user = await User.findById(userId);
    //     if (!user) {
    //     return res.status(404).json({ message: 'User not found' });
    //     }
    //     res.json(user);
    // } catch (error) {
    //     res.status(500).json({ message: 'Server error' });
    // }
}
const updateVendor=async(req,res)=>{
    try{
        const {username,password}=req.body;
        const myemployee=await vendor.findByIdAndUpdate(req.params.id,{username,password});
        if(!employee){
            return res.status(404).json({msg:'employee not found'});
        }
        res.status(200).json({employee,success:true});
    }catch(err){
        res.status(500).json({error:'internal server error',success:false});
    }
}
const deleteVendor=async(req,res)=>{
    try{
        const employee=await vendor.findByIdAndDelete(req.params.id);
        if(!employee){
            return res.status(404).json({msg:'employee not found'});
        }
        res.status(200).json({employee,success:true});
    }catch(err){
        res.status(500).json({error:'internal server error',success:false});
    }
}
module.exports={vendorRegister,vendorLogin,getvendor,single,updateVendor,deleteVendor}