const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. Connect to MongoDB (Railway Environment Variable)
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB - Data is now permanent"))
    .catch(err => console.log("DB Connection Error: ", err));

// 2. Data Schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    completedLevels: [String]
});
const User = mongoose.model('User', UserSchema);

const LevelSchema = new mongoose.Schema({
    name: String,
    creator: String,
    difficulty: String,
    id: String,
    points: Number
});
const Level = mongoose.model('Level', LevelSchema);

// 3. AUTH ROUTES (Fixes Refresh Logout)
app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    try {
        const user = await User.create({ username: req.body.username, password: hashedPassword });
        res.json({ status: 'ok' });
    } catch (err) { res.json({ status: 'error', error: 'Duplicate username' }) }
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.json({ status: 'error', user: false });

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (isPasswordValid) {
        const token = jwt.sign({ username: user.username }, 'secret123'); // Use a real secret in production
        return res.json({ status: 'ok', user: token, userData: { username: user.username, points: user.points } });
    } else {
        return res.json({ status: 'error', user: false });
    }
});

// 4. LEADERBOARD ROUTES (Fixes Leaderboard clearing)
app.get('/api/leaderboard', async (req, res) => {
    const players = await User.find().sort({ points: -1 }).limit(100);
    res.json(players);
});

app.get('/api/levels', async (req, res) => {
    const levels = await Level.find().sort({ points: -1 });
    res.json(levels);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
