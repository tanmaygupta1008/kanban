// In routes/userRoutes.js (or modify your auth routes if it makes sense there)
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const authMiddleware = require('../middleware/auth'); // Assuming you have an auth middleware

router.get('/email/:email', userController.getUserByEmail);

module.exports = router;