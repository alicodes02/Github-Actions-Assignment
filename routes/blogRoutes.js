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

  // Use the authentication middleware for routes that require authentication
  router.post('/add-blog', authenticateUser, async (req, res) => {

    try {

      const currentUser = req.user; 

      const { title, content } = req.body;
  
      const newBlog = new Blog({
        title,
        content,
        ownerId: currentUser._id,
        ownerName: currentUser.username,
      });
  
      const savedBlog = await newBlog.save();
  
      res.status(201).json({ message: 'Blog post created successfully', blog: savedBlog });
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Retrieve a list of all blog posts
router.get('/all-blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json({ blogs });
    } catch (error) {
        console.error('Error retrieving blog posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Retrieve a specific blog post by ID

router.get('/blog/:id', async (req, res) => {

    try {
        const blog = await Blog.findById(req.params.id).populate('owner', 'userName email');
        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        res.status(200).json({ blog });
    } catch (error) {
        console.error('Error retrieving blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a specific blog post by ID

router.put('/update-blog/:id', authenticateUser, async (req, res) => {
    try {
        const currentUser = req.user;
        const { title, content } = req.body;
        const blog = await Blog.findOne({ _id: req.params.id, ownerId: currentUser._id });

        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found or unauthorized' });
        }

        blog.title = title;
        blog.content = content;

        const updatedBlog = await blog.save();

        res.status(200).json({ message: 'Blog post updated successfully', blog: updatedBlog });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete a specific blog post by ID
router.delete('/delete-blog/:id', authenticateUser, async (req, res) => {

    try {

        const currentUser = req.user;
        const blog = await Blog.deleteOne({ _id: req.params.id, ownerId: currentUser._id });

        res.status(200).json({ message: 'Blog post deleted successfully' });

    } catch (error) {
        
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Implement pagination and filtering for blog post listings
router.get('/blogs', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const blogs = await Blog.find()
            .populate('owner', 'userName email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        res.status(200).json({ blogs });
    } catch (error) {
        console.error('Error retrieving blog posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Allow users to rate blog posts
router.post('/rate-blog/:id', authenticateUser, async (req, res) => {
    try {
        const currentUser = req.user;
        const { rating } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        blog.ratings.push({
            user: currentUser._id,
            rating,
        });

        const updatedBlog = await blog.save();

        res.status(200).json({ message: 'Rating added successfully', blog: updatedBlog });
    } catch (error) {
        console.error('Error adding rating to blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Allow users to comment on blog posts

router.post('/comment-blog/:id', authenticateUser, async (req, res) => {
    try {
        const currentUser = req.user;
        const { comment } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        blog.comments.push({
            user: currentUser._id,
            comment,
        });

        const updatedBlog = await blog.save();

        res.status(200).json({ message: 'Comment added successfully', blog: updatedBlog });
    } catch (error) {
        console.error('Error adding comment to blog post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Implement sorting and filtering options for posts

router.get('/filtered-blogs', async (req, res) => {
    try {
        const { sortBy, sortOrder } = req.query;
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const filteredBlogs = await Blog.find().sort(sortOptions).populate('owner', 'userName email');
        res.status(200).json({ blogs: filteredBlogs });
    } catch (error) {
        console.error('Error retrieving filtered blog posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// get blogs by user id

router.get('/blogs/:userId', async (req, res) => {

    const userId = req.params.userId;
  
    try {
      // Fetch blogs for the specific Suser
      const blogs = await Blog.find({ ownerId: userId });
  
      // Check if the user has any blogs
      if (!blogs || blogs.length === 0) {
        return res.status(404).json({ message: 'User has no blogs.' });
      }
  
      res.status(200).json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;