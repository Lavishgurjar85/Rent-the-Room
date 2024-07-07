const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const Room = require('../models/Room');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

cloudinary.config({ 
    cloud_name: 'dv3wp7wkp', 
    api_key: '231666164798457', 
    api_secret: 'o1_Nfqh2iNM29EN6-qBBCjNtX4Y'
  });
  


// Upload room details
router.get('/upload', async(req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    const user = await User.findById(req.session.userId);
    res.render('upload', { user: user });
});

router.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.photo) {
            throw new Error('No file uploaded');
        }

        // Cloudinary direct upload
        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: 'rooms',
            resource_type: 'auto'
        });

        // Create new room object with Cloudinary URL
        const { title, description, address, rent } = req.body;
        const room = new Room({
            title,
            description,
            address,
            rent,
            photo: result.secure_url,
            userId: req.session.userId,
        });

        // Save room to MongoDB
        await room.save();

        // Redirect to view rooms page
        res.redirect('/rooms/view');
    } catch (error) {
        console.error('Error uploading room details:', error);
        res.status(500).send('Error uploading room details.');
    }
});
  

// View available rooms with search filters
router.get('/view', async (req, res) => {
    const { address, minRent, maxRent } = req.query;
    let query = {};

    if (address) {
        query.address = new RegExp(address, 'i'); // Case-insensitive search
    }

    if (minRent) {
        query.rent = { ...query.rent, $gte: minRent }; // Greater than or equal to minRent
    }

    if (maxRent) {
        query.rent = { ...query.rent, $lte: maxRent }; // Less than or equal to maxRent
    }

    try {
        const rooms = await Room.find(query);
        const user = await User.findById(req.session.userId);
        res.render('view-rooms', { rooms, address, minRent, maxRent, user:user });
    } catch (error) {
        res.status(500).send('Error fetching rooms.');
    }
});

// User's rooms for update/delete
router.get('/my-rooms', async (req, res) => {
    try {
        const rooms = await Room.find({ userId: req.session.userId });
        const user = await User.findById(req.session.userId);
        res.render('my-rooms', { rooms ,user:user });
    } catch (error) {
        res.status(500).send('Error fetching user rooms.');
    }
});

// Update room
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, address, rent } = req.body;
    try {
        await Room.findByIdAndUpdate(id, { title, description, address, rent });
        res.redirect('/rooms/my-rooms');
    } catch (error) {
        res.status(500).send('Error updating room.');
    }
});

// Delete room
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Room.findByIdAndDelete(id);
        res.redirect('/rooms/my-rooms');
    } catch (error) {
        res.status(500).send('Error deleting room.');
    }
});

module.exports = router;
