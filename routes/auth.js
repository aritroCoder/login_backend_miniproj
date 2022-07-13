const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret' ;

// ROUTE 1: Create a User profile using: POST "/api/auth/signup". No login required
router.post('/signup', [
    body('username', 'Enter a valid name of more than 3 letters').isLength({ min: 3 }),
    body('phone', 'Enter a valid phone number').isLength(10),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
    body('confirmPassword', 'Password must match with confirm password').isLength({ min: 5 }),
  ], async (req, res) => {
    // If there are errors, return Bad request and the errors
    let errors = validationResult(req); 
    if(req.body.password.localeCompare(req.body.confirmPassword)!==0){
        return res.status(400).json({'errors': 'Confirm password must match the password provided'})
    }
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user with this username exists already
      let user = await User.findOne({ username: req.body.username });
      if (user) {
        return res.status(400).json({ errors: "Sorry a user with this username already exists" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
  
      // Create a new user
      user = await User.create({
        username: req.body.username,
        phone: req.body.phone,
        password: secPass
      });
      const authtoken = jwt.sign({
        username: user.username,
        phone: user.phone
      }, SECRET_KEY, {});
  
  
      // res.json(user)
      res.json({ user, authtoken })
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

  // ROUTE 2: Login to a User profile using: POST "/api/auth/login". No login required
router.post('/login', [
    body('username', 'Enter a valid username').isLength({ min: 3 }),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
  ], async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      // Check whether the user is present
      let user = await User.findOne({ username: username });
      if(!user){
          return res.status(400).json({errors: "User not found"});
      }
      const match = await bcrypt.compare(password, user.password);
      if(!match){
          return res.status(500).json({errors: "Wrong Login Credentials"});
      }
      var authtoken = jwt.sign({
        username: user.username,
        phone: user.phone
      }, SECRET_KEY, {});
      res.json({ user, authtoken })
  
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

  module.exports = router;