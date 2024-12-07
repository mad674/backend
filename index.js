const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const vendorRoutes = require('./routes/VendorRoutes');
const cors = require('cors');
const path = require('path');
// const multer = require('multer');
// const fs = require('fs');
// const FormData = require('form-data');
// const fetch = require('node-fetch'); // Node-fetch for using fetch in Node.js
dotenv.config();
// const vendor=require('./models/Vendor');
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

// Middleware setup
app.use(express.json()); // Use Express's built-in JSON parser
app.use(cors()); // Enable CORS for all routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files
app.use('/output', express.static(path.join(__dirname, 'output'))); // Serve generated output files
app.use('/rcimg', express.static(path.join(__dirname, 'rcimg')));
app.use('/rsimg', express.static(path.join(__dirname, 'rsimg'))); 
app.use('/vendor', vendorRoutes);

// Home route
app.get('/home', (req, res) => {
    res.send('<h1>Welcome to Jewelry</h1>');
});
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  });
  
// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
