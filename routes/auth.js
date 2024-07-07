const express = require('express');
const router = express.Router(); // Create a router instance

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Route to render register form
router.get('/register', (req, res) => {
    res.render('register', { user: req.session.userId }); // Pass user based on session data
});

// Route to handle registration form submission
// router.post('/register', async (req, res) => {
//     const { email, password } = req.body;
    
//     try {
//         // Check if the user already exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).send('User already registered.');
//         }

//         // Create a new user instance
//         user = new User({ email, password });

//         // Hash the password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         // Save the user to the database
//         await user.save();

//         // Generate a JWT token for email verification
//         const token = jwt.sign({ userId: user._id }, 'yourownbusiness', { expiresIn: '1h' });

//         // Create a Nodemailer transporter
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: 'lavishgurjar8529496261@gmail.com', // Your Gmail email address
//                 pass: 'vzijxvcqwhpxakrl' // Your Gmail password
//             }
//         });

//         // Email options
//         const mailOptions = {
//             from: 'no-reply@yourdomain.com', // Sender email
//             to: user.email, // Recipient email
//             subject: 'Email Verification', // Subject line
//             text: `Verify your email: http://localhost:3000/auth/verify/${token}` // Email body with verification link
//         };

//         // Send the email
//         await transporter.sendMail(mailOptions);

//         // Redirect to login page after successful registration
//         res.redirect('/auth/login');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error registering new user.');
//     }
// });


router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('User already registered.');
        }

        // Create a new user instance
        user = new User({ email, password });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Skip email verification for localhost
        if (req.hostname === 'localhost') {
            user.verified = true; // Mark the user as verified
        } else {
            // Generate a JWT token for email verification
            const token = jwt.sign({ userId: user._id }, 'yourownbusiness', { expiresIn: '1h' });

            // Create a Nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'lavishgurjar8529496261@gmail.com', // Use environment variable for email
                    pass: 'vzijxvcqwhpxakrl'  // Use environment variable for password
                }
            });

            // Email options
            const mailOptions = {
                from: 'no-reply@yourdomain.com', // Sender email
                to: user.email, // Recipient email
                subject: 'Email Verification', // Subject line
                text: `Verify your email: https://${req.hostname}/auth/verify/${token}` // Update verification link
            };

            // Send the email
            await transporter.sendMail(mailOptions);
        }

        // Save the user to the database
        await user.save();

        // Redirect to login page after successful registration
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error registering new user.');
    }
});







// Route to handle email verification
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        // Verify the JWT token
        const { userId } = jwt.verify(token, 'yourownbusiness');

        // Find the user by userId and update the verified status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Set user's verified status to true
        user.verified = true;
        await user.save();

        // Redirect to login page after successful verification
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(400).send('Invalid or expired token.');
    }
});


// Route to render login form
router.get('/login', (req, res) => {
    res.render('login', { user: req.session.userId }); // Pass user based on session data
});


// Route to handle login form submission
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Invalid email or password.');
        console.log(email)

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) return res.status(400).send('Invalid email or password.');

        if (!user.verified) return res.status(400).send('Email not verified.');

        req.session.userId = user._id;
        console.log(req.session.userId);
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in.');
    }
});




// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router; // Export the router instance
