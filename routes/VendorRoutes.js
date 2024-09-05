const vendorController=require('../controllers/VendorController');
const express=require('express');
const verifyToken = require('../Middlewares/verifyToken');
const router=express.Router();
const nodemailer=require("nodemailer");
const bcrypt = require('bcryptjs');
router.post('/register',vendorController.vendorRegister);
router.post('/login',vendorController.vendorLogin);
router.get('/allvendor',vendorController.getvendor);
router.get('/singlevendor/:id',vendorController.single);
router.put('/updatevendor/:id',vendorController.updateVendor);
router.delete('/deletevendor/:id',vendorController.deleteVendor);
const multer = require('multer');
const Vendor = require('../models/Vendor');
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/'); // Define the destination folder for uploads
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname); // Define the filename
        }
    })
});
router.post('/imgvendor/:id', upload.array('images',10), vendorController.imgvendor);
router.get('/getimg/:id',vendorController.getimage);
router.put('/delimges/:id', vendorController.deleteImg);
router.delete('/delimg/:id/:Name', vendorController.deleteImage);
router.post('/imgvendor/:id',vendorController.imgvendor);
router.post('/forgot',vendorController.forgotmail);
router.post('/comparepassword',async(req,res)=>{
    const {otp,byotp}=req.body;
    const bypss = await bcrypt.compare(otp, byotp);
    if (bypss) {
        res.send({message:"password matched",success:true});
    }else{
        res.send({message:"password not matched",success:false});
    }
});
router.post('/google',vendorController.googlelogin);
module.exports=router;

