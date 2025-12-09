const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the new User model

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = 'mongodb://192.168.10.30:27017/techvault'; 
mongoose.connect(mongoURI)
  .then(() => console.log('>>> Connected to MongoDB (VM 3) successfully! <<<'))
  .catch(err => console.error('!!! MongoDB Connection Error:', err));

// --- ROUTES ---

// 1. Register Route (So you can create your admin user)
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Error registering user (Username might exist)' });
    }
});

// 2. Real Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user in VM 3
        const user = await User.findOne({ username });

        // Check if user exists AND password matches
        if (user && user.password === password) {
            res.status(200).json({ message: 'Login Successful', username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid Credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
