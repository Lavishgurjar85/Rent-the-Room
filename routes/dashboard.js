const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to handle dashboard requests
router.get('/', async(req, res) => {
    // Check if user is authenticated
    if (!req.session.userId) {
        return res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
    const user = await User.findById(req.session.userId);
    // Render your dashboard view or perform other dashboard-related actions
    res.render('dashboard', { user: user}); // Example: Passing user data to dashboard view
});

module.exports = router;
