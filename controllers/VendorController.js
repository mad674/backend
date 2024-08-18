const vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config();

const secretkey = process.env.Whatisyourname;

const vendorRegister = async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    try {
        const vendorEmail = await vendor.findOne({ username });
        if (vendorEmail) {
            return res.status(400).json({ msg: 'username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = await vendor.create({
            username,
            password: hashedPassword
        });
        await newVendor.save();
        const token = jwt.sign({ id: newVendor._id }, secretkey);

        res.status(201).json({ msg: 'vendor created successfully', success: true, token });
        console.log('registered successfully',token);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

const vendorLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const vendorEmail = await vendor.findOne({ username });
        if (!vendorEmail) {
            return res.status(400).json({ msg: 'username not found' });
        }
        const isMatch = await bcrypt.compare(password, vendorEmail.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'wrong password' });
        }
        const token = jwt.sign({ vendorid: vendorEmail._id }, secretkey, { expiresIn: '1d' });
        const vendorid = vendorEmail._id;
        res.status(200).json({ msg: 'login successfully', token, vendorid, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

const getvendor = async (req, res) => {
    try {
        const employees = await vendor.find();
        res.status(200).json({ employees, success: true });
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

const updateVendor = async (req, res) => {
    try {
        const { username, password } = req.body;
        const updatedVendor = await vendor.findByIdAndUpdate(req.params.id, { username, password });
        if (!updatedVendor) {
            return res.status(404).json({ msg: 'employee not found' });
        }
        res.status(200).json({ updatedVendor, success: true });
    } catch (err) {
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

const deleteVendor = async (req, res) => {
    try {
        const deletedVendor = await vendor.findByIdAndDelete(req.params.id);
        if (!deletedVendor) {
            return res.status(404).json({ msg: 'employee not found' });
        }
        res.status(200).json({ deletedVendor, success: true });
    } catch (err) {
        res.status(500).json({ error: 'internal server error', success: false });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });
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

const Vendor = require('../models/Vendor'); // Import the Vendor model
const fs = require('fs');
const path = require('path');

const deleteImage = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const imageName = req.params.Name;
        console.log(vendorId, imageName);

        // Correctly reference the Vendor model
        const vendorRecord = await Vendor.findById(vendorId); // Rename to vendorRecord

        if (!vendorRecord) {
            return res.status(404).json({ msg: 'Vendor not found' });
        }

        // Remove image reference from database
        const imageIndex = vendorRecord.images.indexOf(imageName);
        if (imageIndex > -1) {
            vendorRecord.images.splice(imageIndex, 1);
            await vendorRecord.save();
        }

        // Delete the image file from filesystem
        const filePath = path.join(__dirname, '../uploads', imageName);
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete image from filesystem' });
            }
            res.status(200).json({ msg: 'Image deleted successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const mongoose = require('mongoose');

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



module.exports = { vendorRegister, vendorLogin, getvendor, single, updateVendor, deleteVendor, imgvendor, deleteImage, getimage };
