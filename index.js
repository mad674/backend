// const express=require('express');
// const app=express();
// const PORT= process.env.PORT || 4000;
// const mongoose=require('mongoose')
// const dotenv=require('dotenv')
// const bodyparser=require('body-parser');
// const vendorRoutes=require('./routes/VendorRoutes');
// const cors=require('cors');
// dotenv.config();
// mongoose.connect(process.env.MONGO_URI)
//     .then(()=>console.log('connected to mongoDB'))
//     .catch((err)=>console.log(err));

//     // app.use(express.json());
// app.use(bodyparser.json());
// app.use(cors());
// app.use('/vendor',vendorRoutes);

// app.use(express.json());
// app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))
// app.use('/home',(req,res)=>{
//     res.send('<h1>welcome to jewelry</h1>')
// })
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4123;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const vendorRoutes = require('./routes/VendorRoutes');
const cors = require('cors');
const path=require('path');
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

// Middleware setup
app.use(express.json()); // Use Express's built-in JSON parser
app.use(cors());

// Routes
app.use('/vendor', vendorRoutes);
app.use('/home', (req, res) => {
    res.send('<h1>Welcome to Jewelry</h1>');
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

