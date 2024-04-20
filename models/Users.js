const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }], 
    notifications: [{ type: String }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
