const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {

    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ error: 'Token is not correct' });
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), 'sshhhh');

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).send({ error: 'User not authenticated' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authentication:', error);
        res.status(401).send({ error: 'Error during authentication. Check the server logs for details.' });
    }
};


// Route to follow another user

router.post('/follow/:userId', authenticateUser, async (req, res) => {
    try {
        
        const currentUser = req.user;

        console.log(req.params.userId);

        const userToFollow = await User.findById(req.params.userId);

        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is already following the target user
        if (currentUser.followers.includes(userToFollow._id)) {
            return res.status(400).json({ error: 'You are already following this user' });
        }

        // Add the target user to the current user's followers
        currentUser.followers.push(userToFollow._id);
        await currentUser.save();

        res.status(200).json({ message: 'You are now following the user', user: userToFollow });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to display a user's feed with posts from followed bloggers
router.get('/feed', authenticateUser, async (req, res) => {
    try {
        const currentUser = req.user;

        // Get posts from followed bloggers
        const feedPosts = await Blog.find({ owner: { $in: currentUser.followers } })
            .populate('owner', 'username email')
            .sort({ content: -1 }); // Sort by creation date in descending order

        res.status(200).json({ feed: feedPosts });
    } catch (error) {
        console.error('Error retrieving feed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to get notifications for new followers and comments on the user's posts

router.get('/notifications', authenticateUser, async (req, res) => {
    try {
        const currentUser = req.user;

        // Get notifications
        const notifications = currentUser.notifications;

        currentUser.notifications = [];
        await currentUser.save();

        res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
