const express = require('express');
const multer = require('multer');
// const bcrypt = require('bcryptjs');
// const nodemailer = require("nodemailer");
const vendorController = require('../controllers/VendorController');
// const verifyToken = require('../Middlewares/verifyToken');
const fs = require('fs');
const path = require('path');
// const vendor = require('../models/Vendor');
const router = express.Router();

// Ensure directories exist
const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Multer setup for sketch img
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = 'uploads/';
            ensureDirectoryExistence(uploadPath);
            cb(null, uploadPath); // Define the destination folder for uploads
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname); // Define the filename
        }
    })
});
// Set up multer storage color img
const up = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname,'..', 'output');
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            console.log("Received filename:", file.originalname);
            const fileName = file.originalname; // Use provided filename or default to timestamp
            cb(null, fileName);
        }
    })
 });

// routes for storing imges
router.post('/sktvendor/:user',up.single('images'), vendorController.sktvendor);
router.post('/imgvendor/:id', upload.array('images', 100), vendorController.imgvendor);
// routes for login and register
router.post('/register', vendorController.vendorRegister);
router.post('/login', vendorController.vendorLogin);
//getting all data of users
router.get('/allvendor', vendorController.getvendor);
router.get('/singlevendor/:id', vendorController.single);
router.get('/getimg/:id', vendorController.getimage);
//updating database
router.put('/updatevendor/:id', vendorController.updateVendor);
//connection for flask
router.post('/predict/:id', vendorController.predict);
//compare otp for login
router.post('/comparepassword', vendorController.compareOtp);
// routes for deleting images
router.delete('/deleteimage', vendorController.deleteimage);
router.delete('/deleteallimages', vendorController.deleteAllImages);
//account delete
router.delete('/deletevendor/:id', vendorController.deleteVendor);
// routes for other authentication
router.post('/forgot', vendorController.forgotmail);
router.post('/google', vendorController.googlelogin);

module.exports = router;
