const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

const app = express();

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/' // Ensure this directory exists
}));


// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb+srv://lavishgurjar8529496261:OQehgodrkj4H9jYd@rental.do3kozk.mongodb.net/rentaldb')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// Initialize express-session with connect-mongo
app.use(session({
  secret: 'yourownbusiness',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://lavishgurjar8529496261:OQehgodrkj4H9jYd@rental.do3kozk.mongodb.net/rentaldb',
    ttl: 24 * 60 * 60 // Session TTL (optional)
  })
}));


// Additional middleware and routes setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Use index route
app.use('/', require('./routes/index')); // Make sure the path is correct

// Define and use your other routes here
app.use('/auth', require('./routes/auth'));
app.use('/rooms', require('./routes/rooms'));
app.use('/dashboard', require('./routes/dashboard'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
