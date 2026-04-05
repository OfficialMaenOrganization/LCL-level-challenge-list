const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONNECT TO SUPABASE ---
// In Railway, you must add SUPABASE_URL and SUPABASE_KEY to Variables
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

// --- ROUTES ---

// 1. Get Leaderboard (From Supabase, not JSON)
app.get('/api/leaderboard', async (req, res) => {
    const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false });
    
    if (error) return res.status(500).json(error);
    res.json(data);
});

// 2. Submit Level / Points
app.post('/api/submit', async (req, res) => {
    const { username, points, levelName } = req.body;

    // Check if player exists
    let { data: player } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single();

    if (player) {
        // Update existing player
        const { data, error } = await supabase
            .from('leaderboard')
            .update({ points: player.points + points })
            .eq('username', username);
        res.json({ message: "Points Updated" });
    } else {
        // Create new player
        await supabase
            .from('leaderboard')
            .insert([{ username, points }]);
        res.json({ message: "New Player Created" });
    }
});

// 3. Login / Auth (Refresh Problem Fix)
// Supabase handles this automatically on the frontend, 
// so your backend just needs to be the API.

const PORT = process.env.PORT || 3000;
app.listen(P
