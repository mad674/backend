const express=require('express');
const app=express();
const PORT= process.env.PORT || 4000;
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const bodyparser=require('body-parser');
const vendorRoutes=require('./routes/VendorRoutes');
const cors=require('cors');
dotenv.config();
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log('connected to mongoDB'))
    .catch((err)=>console.log(err));

    // app.use(express.json());
app.use(bodyparser.json());
app.use(cors());
app.use('/vendor',vendorRoutes);

app.use(express.json());

// app.get('/singlevendor/:id', async (req, res) => {
//     const vendorId = req.params.id;
  
//     // Validate the ID format
//     if (!mongoose.Types.ObjectId.isValid(vendorId)) {
//       return res.status(400).json({ message: 'Invalid ID format' });
//     }
  
//     try {
//       const vendor = await Vendor.findById(vendorId);
//       if (!vendor) {
//         return res.status(404).json({ message: 'Vendor not found' });
//       }
//       res.json(vendor);
//     } catch (error) {
//       console.error('Error fetching vendor:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
// });
  
app.listen(PORT,()=>console.log(`server is running on port ${PORT}`))
app.use('/home',(req,res)=>{
    res.send('<h1>welcome to jewelry</h1>')
})

