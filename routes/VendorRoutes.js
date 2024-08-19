const vendorController=require('../controllers/VendorController');
const express=require('express');
const verifyToken = require('../Middlewares/verifyToken');
const router=express.Router();
router.post('/register',vendorController.vendorRegister);
router.post('/login',vendorController.vendorLogin);
router.get('/allvendor',vendorController.getvendor);
router.get('/singlevendor/:id',vendorController.single);
router.put('/updatevendor/:id',vendorController.updateVendor);
router.delete('/deletevendor/:id',vendorController.deleteVendor);
const multer = require('multer');
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
// router.put('/updatevendor/:id', async (req, res) => {
//     const { vendorid } = req.params;
//     const { password } = req.body;
  
//     try {
//       // Validate input
//       if (!password) {
//         return res.status(400).json({ message: 'Password is required' });
//       }
  
//       // Find user
//       const user = await user.findById(vendorid);
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       // Hash new password
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);
      
//       // Update password
//       user.password = hashedPassword;
//       await user.save();
  
//       res.status(200).json({ message: 'Password updated successfully' });
//     } catch (error) {
//       console.error('Error updating password:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
module.exports=router;

