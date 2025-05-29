// server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  const { email, password, name, gender } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

    // Create new user
    user = new User({ email, password, name, gender }); // Password will be hashed by pre-save hook

    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ message: 'User registered successfully', token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     // Compare passwords
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials.' });
//     }

//     // Generate JWT
//     const payload = {
//       user: {
//         id: user.id
//       }
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ message: 'Logged in successfully', token });
//       }
//     );

//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });




router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign token and return it along with user info
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;

        // Send token and user info
        res.json({
          message: 'Logged in successfully',
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email // optional if you need it
          }
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;