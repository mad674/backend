const vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require("nodemailer");
// const querystring = require('querystring');
// var https = require('follow-redirects').https;
const { v4: uuidv4 } = require('uuid');
var messageId = uuidv4();
const secretkey = process.env.Whatisyourname;
const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose');
const { oauth2Client } = require('../Middlewares/googleconfig');
// const { spawn } = require('child_process');
const FormData = require('form-data');
const { console } = require('inspector');

//function for authuntications 
const vendorRegister = async (req, res) => {
    const { username,email, password, confirmPassword } = req.body;
    try {
        // const vendorEmail = await vendor.findOne({ username });
        const emailverfy=await vendor.findOne({email});
        if(emailverfy){
            return res.status(400).json({ msg: 'email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = await vendor.create({
            username,
            email,
            password: hashedPassword
        });
        await newVendor.save();
        const token = jwt.sign({ id: newVendor._id }, secretkey, { expiresIn: process.env.JWT_EXPIRE });
        res.status(201).json({ msg: 'vendor created successfully', success: true, token });
        // console.log('registered successfully',token);
    } catch (err) { 
        console.log(err);
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

const vendorLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const vendorEmail = await vendor.findOne({ email });
        if (!vendorEmail) {
            return res.status(400).json({ msg: 'email not found' });
        }
        const isMatch = await bcrypt.compare(password, vendorEmail.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'wrong password' });
        }
        const token = jwt.sign({ vendorid: vendorEmail._id }, secretkey, { expiresIn: process.env.JWT_EXPIRE });
        const vendorid = vendorEmail._id;
        res.status(200).json({ msg: 'login successfully', token, vendorid, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

//get method to get data
const getvendor = async (req, res) => {
    try {
        const employees = await vendor.find();
        res.status(200).json({ users:employees, success: true });
    } catch (err) {
        res.status(500).json({ error: 'internal server error', success: false });
    }
}
const single = async (req, res) => {
    try {
        const employee = await vendor.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ msg: 'employee not found' });
        }
        res.status(200).json({ employee, success: true });
    } catch (err) {
        res.status(500).json({ error: 'internal server error', success: false });
    }
}
// updating data 
const updateVendor = async (req, res) => {
    // const { vendorid } = req.params.id;
    const { password } = req.body;
  
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    console.log(password);
    try {
    //   console.log("vendorid",vendorid);
      // Initialize and find user
      const user = await vendor.findById(req.params.id);; // Corrected this line
      console.log("user",user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Hash and update password
      const hashedPassword = await bcrypt.hash(password, 10);

    //   console.log("hashedPassword",hashedPassword);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
      
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
//deleting data
const deleteVendor = async (req, res) => {
    try {
        const v = await vendor.findById(req.params.id);
        if (!v) {
            return res.status(404).json({ msg: 'employee not found' });
        }
        v.images.forEach((image) => {
            const imagePath = path.join(__dirname, '../uploads/', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Deletes each image file from the server
            }
        });
        v.colorimg.forEach((image) => {
            const imagePath = path.join(__dirname, '../output/', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Deletes each image file from the server
            }
        });
        v.images = [];
        v.colorimg = [];
        await v.save();
        const deletedVendor = await vendor.findByIdAndDelete(req.params.id);
        if(!deletedVendor){
            return res.status(404).json({ msg: 'employee not found' });
        }
        res.status(200).json({ deletedVendor, success: true });
    } catch (err) {
        res.status(500).json({ error: 'internal server error', success: false });
    }
}
//imgs uploads to database
const imgvendor = async (req, res) => {
    try {
        // Extract filenames from the uploaded files
        const images = req.files.map(file => file.filename);
        // Find the existing vendor
        const existingVendor = await vendor.findById(req.params.id);

        if (!existingVendor) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }

        // Ensure the images array is initialized
        if (!existingVendor.images) {
            existingVendor.images = [];
        }

        // Append the new images to the array
        existingVendor.images.push(...images);

        // Save the updated vendor
        const savedVendor = await existingVendor.save();
        res.status(200).json({ msg: 'Images uploaded successfully', success: true, vendor: savedVendor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};
const sktvendor = async (req, res) => {
    try {
        const file = req.body; // The uploaded file
        const user = req.params.user; // The user ID from the URL

        // Log request body for debugging
        console.log("Request body:", req.body);

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Log the file and user info for debugging
        console.log(`Received file: ${file.filename} from user: ${user}`);

        // Simulate vendor model update
        const existingVendor = await vendor.findById(user);
        if (!existingVendor) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }

        // Initialize the colorimg array if it doesn't exist
        if (!existingVendor.colorimg) {
            existingVendor.colorimg = [];
        }
        const isFileExists = existingVendor.colorimg.some(
            (img) => img.toLowerCase() === file.filename.toLowerCase()
        );

        if (!isFileExists) {
            // Append the new image to the array
            existingVendor.colorimg.push(file.filename);
            await existingVendor.save();
            // res.status(200).json({ message: 'Image uploaded and saved successfully' });
        }

        // Send a success response
        res.status(200).json({
            message: 'Image uploaded successfully',
            fileName: file.filename,
            user: user
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Error uploading image' });
    }
}
//get images 
const getimage = async (req, res) => {
    try {
        const vendorData = await vendor.findById(req.params.id);
        if (!vendorData) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }
        res.status(200).json({ images: vendorData.images, success: true });
    } catch (err) {
        console.error('Error in getimage:', err.message);
        res.status(500).json({ error: 'internal server error', success: false });
    }
};
//mail actions
const feedback = async (req, res) => {
    const { firstname, lastname, email, mobile, concern } = req.body;
    // console.log(firstname, lastname, email, mobile, concern);
    try {
        var transporter = nodemailer.createTransport({
            service: "gmail",//gmail
            auth: {
            user: process.env.Gmail,
            pass: process.env.PASS
            }
        });
        const info = await transporter.sendMail({
            // from: 'nsachingoud@gmail.com', // sender address
            to: process.env.companymail, // list of receivers
            subject: `feedback from ${firstname+" "+lastname}`, // Subject line
            text: "feedback from user!", // plain text body
            html: `<p>This is ${firstname+" "+lastname}. <br> This is my email ${email}. <br> This is my Phone number ${mobile}. <br> This is my feedback : ${concern}</p> <br> <p>Thanks & Regards</p> <p>${firstname+" "+lastname}</p>`, // html body
        });
        if (info.messageId) {
            console.log("Email sent successfully");
        } else {
            console.log("Email sent failed");
        }
        res.status(200).json({ feedback: "feedback sent successfully", success: true });
    } catch (err) {
        console.error('Error in getimage:', err.message);
        res.status(500).json({ error: 'internal server error', success: false });
    }
}
const compareOtp = async (req, res) => {
    const { otp, byotp } = req.body;
    try {
        const isMatch = await bcrypt.compare(otp, byotp);
        res.send({
            message: isMatch ? "Password matched" : "Password not matched",
            success: isMatch
        });
    } catch (error) {
        res.status(500).send({ message: "Error comparing passwords", success: false });
    }
};
const forgotmail=async(req,res)=>{
    const {email}=req.body;
    console.log(email);
        const vendorEmail = await vendor.findOne({ email });
        try{
            const gotp=`${Math.floor(1000+Math.random()*9000)}`;
            // console.log(gotp);
            var transporter = nodemailer.createTransport({
                service: "gmail",//gmail
                auth: {
                user: process.env.Gmail,
                pass: process.env.PASS
                }
            });
            const info = await transporter.sendMail({
                // from: 'nsachingoud@gmail.com', // sender address
                to: email, // list of receivers
                subject: "Verify Your Email", // Subject line
                text: "new otp generated", // plain text body
                html: `<p>Enter <b>${gotp}</b> in the app to verify your email address</p><p>This code will expire in 5 minutes</p>`
            });
            const hashedotp=await bcrypt.hash(gotp,10);
            const token = jwt.sign({ vendorid: vendorEmail._id }, secretkey, { expiresIn: process.env.JWT_EXPIRE });
            if(info.messageId){
                let user=await vendor.findOneAndUpdate(
                    {email},
                    {otp:hashedotp},
                    {createdAt:Date.now()},
                    {expiresAt:Date.now()+300000},
                    {new: true }
                );

                if(!user){
                    return res.status(404).json({message:"user not found"});
                }
                return res.status(200).json({message:"otp send to your email",success:true,token:token});
            }
        }catch(err){
            console.log(err);
            return res.status(500).json({message:"Internal server error"});
        }
    
};
//google login apis
const googlelogin = async (req, res) => {
    try {
        const { code } = req.body; 
        const googleres = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleres.tokens);

        const userdata = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleres.tokens.access_token}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${googleres.tokens.access_token}`
            }
        });

        const userDataJson = await userdata.json();
        // console.log("userde",userDataJson);
        const { email,name } = userDataJson;

        let vendorEmail = await vendor.findOne({ email });
        if (!vendorEmail) {
            vendorEmail = await vendor.create({ email,username:name });
        }

        const token = jwt.sign({ vendorid: vendorEmail._id }, secretkey, { expiresIn: process.env.JWT_EXPIRE });

        return res.status(200).json({ message: "User found", success: true, token: token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//function for ml models 
const gold = async(req, res) => {
    try {
        const imageEntry = await vendor.findById(req.params.id);
        if (!imageEntry || !imageEntry.images.length) {
           return res.status(404).json({ error: 'No images found in the database' });
        }
        const imageName = imageEntry.images[imageEntry.images.length - 1];
        const imagePath = `${process.env.webpath}/uploads/${imageName}`;
        console.log('Image Path:', imagePath);
        const response = await fetch(imagePath);  
        if (!response.ok) {
            return res.status(404).json({ error: 'Image file not found at the URL' });
        }
        const formData = new FormData();
        formData.append('image', imagePath, 'base64');
        const name=imageName.split('-')[1];
        //for canvas img directly generation api
        if(name=='canvasimg.jpg'){
            const apiResponse = await fetch(`${process.env.FLASK_URL}/gold`, {
                method: 'POST',
                body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!apiResponse.ok) {
                const errorBody = await apiResponse.text();
                console.error('Error from Flask API:', errorBody);
                throw new Error('Error from Flask API: ' + apiResponse.statusText);
            }const result = await apiResponse.json();
            console.log('Result from Flask API:', result);
            res.status(200).json({ result, success: true });
        }else{
            //classification for jewelry img or not api
            const validate= await fetch(`${process.env.FLASK_URL}/predict`, {
                method: 'POST',
                body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const validateResponse = await validate.json();
            if(validateResponse==null){
                return res.status(404).json({ error: 'Image file not found at the URL' });
            }//generation of jewelry img api
            if(validateResponse.success){
                const apiResponse = await fetch(`${process.env.FLASK_URL}/gold`, {
                    method: 'POST',
                    body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!apiResponse.ok) {
                    const errorBody = await apiResponse.text();
                    console.error('Error from Flask API:', errorBody);
                    throw new Error('Error from Flask API: ' + apiResponse.statusText);
                }const result = await apiResponse.json();
                console.log('Result from Flask API:', result);
                res.status(200).json({ result, success: true });
            }else{
                const imageExists = imageEntry.images.includes(imageName);
                if (!imageExists) {
                    return res.status(404).json({ message: 'Image not found in the vendor profile' });
                }
                // Remove the image from the vendor's image list
                imageEntry.images = imageEntry.images.filter(img => img !== imageName);
                imageEntry.colorimg = imageEntry.colorimg.filter(img => img !== imageName);

                // Save the updated vendor information to the database
                await imageEntry.save();

                // Delete the image file from the server's Multer uploads folder
                const imagePath = path.join(__dirname, '../uploads/', imageName);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Deletes the image file
                }
                res.status(200).json({ error: 'Given image is not jewelry image' });
            }
        }
    }catch(error) {
        console.error('Error communicating with Flask API:', error);
        res.status(500).json({ error: 'Error making prediction' });
    }
};

const silver = async(req, res) => {
    try {
        const imageEntry = await vendor.findById(req.params.id);
        if (!imageEntry || !imageEntry.images.length) {
            return res.status(404).json({ error: 'No images found in the database' });
        }

        const imageName = imageEntry.images[imageEntry.images.length - 1];
        const imagePath = `${process.env.webpath}/uploads/${imageName}`;
        console.log('Image Path:', imagePath);
        const response = await fetch(imagePath);  
        if (!response.ok) {
            return res.status(404).json({ error: 'Image file not found at the URL' });
        }
        const formData = new FormData();
        formData.append('image', imagePath, 'base64');
        const name=imageName.split('-')[1];
        if(name=='canvasimg.jpg'){
            const apiResponse = await fetch(`${process.env.FLASK_URL}/silver`, {
                method: 'POST',
                body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!apiResponse.ok) {
                const errorBody = await apiResponse.text();
                console.error('Error from Flask API:', errorBody);
                throw new Error('Error from Flask API: ' + apiResponse.statusText);
            }
            const result = await apiResponse.json();
            res.status(200).json({ result, success: true });
        }else{
            const validate= await fetch(`${process.env.FLASK_URL}/predict`, {
                method: 'POST',
                body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const validateResponse = await validate.json();
            if(validateResponse==null){
                return res.status(404).json({ error: 'Image file not found at the URL' });
            }
            if(validateResponse.success){
                const apiResponse = await fetch(`${process.env.FLASK_URL}/silver`, {
                    method: 'POST',
                    body: JSON.stringify({ image: formData ,user:req.params.id}), // formData,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!apiResponse.ok) {
                    const errorBody = await apiResponse.text();
                    console.error('Error from Flask API:', errorBody);
                    throw new Error('Error from Flask API: ' + apiResponse.statusText);
                }
                const result = await apiResponse.json();
                res.status(200).json({ result, success: true });
            }else{
                const imageExists = imageEntry.images.includes(imageName);
                if (!imageExists) {
                    return res.status(404).json({ message: 'Image not found in the vendor profile' });
                }
                // Remove the image from the vendor's image list
                imageEntry.images = imageEntry.images.filter(img => img !== imageName);
                imageEntry.colorimg = imageEntry.colorimg.filter(img => img !== imageName);

                // Save the updated vendor information to the database
                await imageEntry.save();

                // Delete the image file from the server's Multer uploads folder
                const imagePath = path.join(__dirname, '../uploads/', imageName);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Deletes the image file
                }
                res.status(200).json({ error: 'Given image is not jewelry image' });
            }
        }

    } catch (error) {
        console.error('Error communicating with Flask API:', error);
        res.status(500).json({ error: 'Error making prediction' });
    }
};

//function to for delete image
const deleteimage = async (req, res) => {
    const { image } = req.body; // The image filename to delete
    const token = req.headers.authorization.split(' ')[1]; // Extract JWT token from headers
    try {
        // Decode JWT to get vendor ID
        const decodedToken = jwt.decode(token);
        const vendorId = decodedToken.vendorid;

        // Find vendor by ID
        const v = await vendor.findById(vendorId);
        if (!v) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        // Check if the image exists in the vendor's image list
        const imageExists = v.images.includes(image);
        if (!imageExists) {
            return res.status(404).json({ message: 'Image not found in the vendor profile' });
        }
        // Remove the image from the vendor's image list
        v.images = v.images.filter(img => img !== image);
        v.colorimg = v.colorimg.filter(img => img !== image);

        // Save the updated vendor information to the database
        await v.save();

        // Delete the image file from the server's Multer uploads folder
        const imagePath = path.join(__dirname, '../uploads/', image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Deletes the image file
        }
        const colimagePath = path.join(__dirname, '../output/', image);
        if (fs.existsSync(colimagePath)) {
            fs.unlinkSync(colimagePath); // Deletes the image file
        }

        return res.status(200).json({ message: 'Image deleted successfully from both the database and server' });
    } catch (error) {
        console.error('Error deleting image:', error);
        return res.status(500).json({ message: 'Failed to delete image', error });
    }
}
const deleteAllImages=async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract JWT token

    try {
        // Decode JWT to get vendor ID
        const decodedToken = jwt.decode(token);
        const vendorId = decodedToken.vendorid;

        // Find vendor by ID
        const v = await vendor.findById(vendorId);
        if (!v) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        // Delete all images from the Multer uploads folder (if they exist)
        v.images.forEach((image) => {
            const imagePath = path.join(__dirname, '../uploads/', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Deletes each image file from the server
            }
        });
        v.colorimg.forEach((image) => {
            const imagePath = path.join(__dirname, '../output/', image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Deletes each image file from the server
            }
        });
        v.images = [];
        v.colorimg = [];
        await v.save();

        console.log('All images deleted successfully');

        return res.status(200).json({ message: 'All images deleted successfully' });
    } catch (error) {
        console.error('Error deleting all images:', error);
        return res.status(500).json({ message: 'Failed to delete all images', error });
    }
}
module.exports = { vendorRegister, vendorLogin, deleteimage,deleteAllImages,getvendor, single, updateVendor, deleteVendor, imgvendor, getimage ,forgotmail,googlelogin,sktvendor,gold,silver,compareOtp,feedback};
