const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes'); 
const blogRoutes = require('./routes/blogRoutes'); 
const userInteractionRoutes = require('./routes/userInteractionRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server is listening to requests on port 3000');
});

mongoose.connect('mongodb://127.0.0.1/WebAssignment02', {
    
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

.then(() => {
    console.log('Database Connected Successfully');
})

.catch(() => {
    console.log('Error Connecting Database');
});

app.use('/', authRoutes);
app.use('/', blogRoutes);
app.use('/', userInteractionRoutes);
app.use('/', adminRoutes);


  

