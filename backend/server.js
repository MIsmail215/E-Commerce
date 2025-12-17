const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Private-Network", "true"); 
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// Database Connection
mongoose.connect('mongodb://192.168.10.30:27017/techvault')
  .then(() => console.log('>>> Connected to MongoDB (VM 3) successfully! <<<'))
  .catch(err => console.error('!!! MongoDB Connection Error:', err));

// Cart Model
const CartSchema = new mongoose.Schema({
    email: { type: String, required: true }, 
    products: [{ productId: String, name: String, price: Number, quantity: { type: Number, default: 1 } }]
});
const Cart = mongoose.model('Cart', CartSchema);

// --- UPDATED REGISTER ROUTE (Now saves Security Answer) ---
app.post('/register', async (req, res) => {
    try {
        const { email, password, securityAnswer } = req.body;
        console.log(`Attempting to register: ${email}`); 

        if (!email || !password || !securityAnswer) {
            return res.status(400).json({ error: "Missing email, password, or security answer" });
        }

        const newUser = new User({ email, password, securityAnswer });
        await newUser.save();

        console.log("User saved successfully with MFA setup!");
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error("!!! REGISTRATION ERROR !!!", err);
        res.status(500).json({ error: 'Error registering user', details: err.message });
    }
});

// --- UPDATED LOGIN ROUTE (Adds MFA Checks) ---
app.post('/login', async (req, res) => {
    try {
        const { email, password, securityAnswer } = req.body;
        const user = await User.findOne({ email }); 

        // 1. Basic Credential Check
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // 2. MFA: If no answer provided yet, tell Frontend to ask for it
        if (!securityAnswer) {
            return res.status(200).json({ 
                message: 'MFA Required', 
                mfaRequired: true 
            });
        }

        // 3. MFA: Verify the answer (Case-insensitive)
        if (user.securityAnswer && user.securityAnswer.toLowerCase() === securityAnswer.toLowerCase()) {
            return res.status(200).json({ 
                message: 'Login Successful', 
                email: user.email 
            });
        } else {
            return res.status(401).json({ message: 'Invalid Security Answer' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// --- PRODUCTS & CART ROUTES ---
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/cart/add', async (req, res) => {
    const { username, product } = req.body; 
    const userEmail = username; 

    try {
        let cart = await Cart.findOne({ email: userEmail });
        if (!cart) cart = new Cart({ email: userEmail, products: [] });

        const existingItem = cart.products.find(p => p.productId === product._id);
        if (existingItem) existingItem.quantity += 1;
        else cart.products.push({ productId: product._id, name: product.name, price: product.price, quantity: 1 });

        await cart.save();
        res.status(200).json({ message: "Item added to cart", cart });
    } catch (err) {
        console.error("Cart Error:", err);
        res.status(500).json({ error: "Could not add to cart" });
    }
});

app.get('/cart/:email', async (req, res) => {
    try {
        const cart = await Cart.findOne({ email: req.params.email });
        res.json(cart || { products: [] });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});

app.post('/cart/checkout', async (req, res) => {
    const { email } = req.body;
    console.log(`[Checkout] Processing order for: ${email}`);

    try {
        await Cart.updateOne(
            { email: email },
            { $set: { products: [] } } 
        );

        console.log(`[Checkout] Cart cleared for ${email}`);
        res.json({ message: "Order placed successfully!" });
    } catch (err) {
        console.error("Checkout Error:", err);
        res.status(500).json({ error: "Failed to place order" });
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
