const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const Blog = require('../models/Blog');
const jwt = require('jsonwebtoken');

// Admin middleware to check if the request is made by an admin

const isAdmin = async (req, res, next) => {

        console.log('Request received at IsAdmin');

        const { username, password } = req.body;

        if (username === 'admin' && password === '098') {
            
            next();
        }

        else {

            res.status(401).send('Invalid Credentials! Admin Access is required!');
        }
    
};

// Route to view all users (admin access required)

router.get('/all-users', isAdmin, async (req, res) => {

    console.log('Request received at get users route');

    try {

        const users = await User.find({}, 'username email password followers');
        res.status(200).json({ users });

    } 
    
    catch (error) {

        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

// Route to block/disable a user (admin access required)

router.patch('/admin/block-user/:userId', isAdmin, async (req, res) => {

    try {
        const userToBlock = await User.findById(req.params.userId);

        if (!userToBlock) {
            return res.status(404).json({ error: 'User not found' });
        }

        userToBlock.blocked = true;
        await userToBlock.save();

        res.status(200).json({ message: 'User blocked successfully', user: userToBlock });

    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to list all blog posts with Title, Author, Creation Date, and Average Rating (admin access required)

router.get('/admin/blog-posts', isAdmin, async (req, res) => {
    try {

        const blogPosts = await Blog.find({})
            .populate('owner', 'username email')
            .select('title author createdAt averageRating');

        res.status(200).json({ blogPosts });

    } catch (error) {
        console.error('Error retrieving blog posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to view a particular blog post (admin access required)

router.get('/admin/blog-posts/:postId', isAdmin, async (req, res) => {
    try {
        const blogPost = await Blog.findById(req.params.postId).populate('owner', 'username email');

        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        res.status(200).json({ blogPost });
    } catch (error) {
        console.error('Error retrieving blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to disable a blog (admin access required)
router.patch('/admin/disable-blog/:postId', isAdmin, async (req, res) => {

    try {
        const blogToDisable = await Blog.findById(req.params.postId);

        if (!blogToDisable) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        blogToDisable.disabled = true;
        await blogToDisable.save();

        res.status(200).json({ message: 'Blog disabled successfully', blog: blogToDisable });
    } catch (error) {
        console.error('Error disabling blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
