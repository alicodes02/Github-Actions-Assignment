const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  
    const { username, email, password } = req.body;
  
    const existingUser = await User.findOne({ email });
  
    if (existingUser) {
      res.status(401).send('User already exists.');
    } else {
      const newUser = new User({
        username,
        email,
        password,
      });
  
      console.log('New user before saving:', newUser);
  
      await newUser.save();
  
      const token = jwt.sign({ username, email }, 'sshhhh');
      res.status(200).json({ message: 'Sign Up Successful!', token });
    }
  });
  

router.post('/admin', (req, res) => {

    console.log(req.body);

    const {username, password} = req.body;

    if(username === 'admin' && password === '098') {

        const token = jwt.sign({userName}, 'sshhhh', { expiresIn: '1h' });

        res.status(200).json({"message": "'Admin Logged In Successfully!'", token});
    }

    else {

        res.status(404).send('Invalid Credentials');
    }
});

router.post('/login', async (req, res) => {
    
    console.log(req.body);
    
    const {email, password} = req.body;

    const user = await User.findOne({email,password});

    if (user) {

        const token = jwt.sign({ email }, 'sshhhh', { expiresIn: '6h' });

        res.status(200).send({ "Message": "Sign in Successful", token, user});
    }

    else {

        res.status(200).send('Invalid Credentials!');
    }
});

module.exports = router;
