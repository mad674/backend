// const vendor=require('../models/Vendor');
// const jwt=require('jsonwebtoken');
// const dotenv=require('dotenv');
// dotenv.config();
// const secretkey=process.env.Whatisyourname;
// const verifyToken=async(req,res,next)=>{
//     const token=req.headers.token;
//     if(!token){
//         return res.status(401).json({error:'token is required'});
//     }
//     try{
//         const decoded=jwt.verify(token,secretkey);
//         const vendor=await vendor.findById(decoded.id);
//         if(!vendor){
//             return res.status(401).json({error:'vendor not found '});
//         }
//         req.vendor=vendor._id;
//         next();
//     }catch(err){
//         console.log(err);
//         return res.status(401).json({error:'invalid token'});
//     }
// }
// module.exports=verifyToken