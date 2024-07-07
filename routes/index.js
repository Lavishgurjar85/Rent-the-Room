const express = require('express');
const router = express.Router();

// Define routes using router
router.get('/', (req, res) => {
  // Handle route logic here
  res.render('index', { user: req.session.userId }); // Assuming you've set up session correctly
});

// Export the router
module.exports = router;
