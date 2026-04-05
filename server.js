// Node.js server with Supabase backend
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verify Supabase connection
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('✅ Supabase client initialized');

// Initialize Supabase tables with default data
async function initializeDatabase() {
    try {
        // Check if users table exists by trying to fetch
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (usersError) {
            console.log('📝 Creating tables...');
            // Tables don't exist, log instructions
            console.log('⚠️  Please create tables in Supabase dashboard:');
            console.log('   1. Go to: https://bbvfpwcppnvdmoqzdapk.supabase.co/project/_/editor');
            console.log('   2. Create tables OR run SQL from SUPABASE_SETUP.sql');
            return;
        }

        console.log('✅ Database tables ready');

        // Check if default data exists
        if (users && users.length === 0) {
            console.log('📥 Inserting default data...');

            // Insert default admin users
            await supabase.from('users').insert([
                {
                    id: 'admin1',
                    email: 'maencopra@gmail.com',
                    display_name: 'Admin',
                    password: 'maenissocool12345gGs',
                    is_admin: true
                },
                {
                    id: 'admin2',
                    email: 'Xennyplayz@gmail.com',
                    display_name: 'Xennyplayz',
                    password: 'xennyplayznona6755',
                    is_admin: true
                }
            ]);

            // Insert default level
            await supabase.from('levels').insert({
                id: 1,
                name: 'Stereo Madness',
                level_id: 1,
                url: 'https://example.com/level1',
                youtube_url: 'https://youtube.com/watch?v=example1',
                thumbnail: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%234a90e2%22 width=%22300%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2220%22%3EStereo Madness%3C/text%3E%3C/svg%3E',
                difficulty: 'Easy',
                submitted_by: 'Admin',
                submitted_date: new Date().toISOString(),
                status: 'approved'
            });

            // Insert default settings
            await supabase.from('settings').insert({
                id: 1,
                theme: 'dark',
                language: 'en',
                dark_background: true
            });

            console.log('✅ Default data inserted');
        } else {
            console.log(`✅ Database has ${users.length} users`);

            // Ensure admin2 exists (upsert so it's idempotent on every restart)
            await supabase.from('users').upsert({
                id: 'admin2',
                email: 'Xennyplayz@gmail.com',
                display_name: 'Xennyplayz',
                password: 'xennyplayznona6755',
                is_admin: true
            }, { onConflict: 'id' });
            console.log('✅ admin2 (Xennyplayz) ensured in database');

            // Remove bridgegamescom@gmail.com if it exists
            const { data: deleted, error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('email', 'bridgegamescom@gmail.com')
                .select();

            if (!deleteError && deleted && deleted.length > 0) {
                console.log('🗑️  Removed user: bridgegamescom@gmail.com');
            }
        }
    } catch (error) {
        console.error('❌ Database error:', error.message);
    }
}

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// API Routes

// GET all data
app.get('/api/data', async (req, res) => {
    try {
        const [users, levels, pending, settings] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('levels').select('*').eq('status', 'approved').order('id'),
            supabase.from('levels').select('*').eq('status', 'pending').order('submitted_date'),
            supabase.from('settings').select('*').limit(1).single()
        ]);

        const data = {
            users: users.data || [],
            levels: levels.data || [],
            pendingLevels: pending.data || [],
            settings: settings.data || { theme: 'dark', language: 'en', dark_background: true }
        };

        res.json(data);
    } catch (error) {
        console.error('❌ Error reading data:', error);
        res.status(500).json({ error: 'Failed to read data', details: error.message });
    }
});

// POST/UPDATE all data (bulk update)
app.post('/api/data', async (req, res) => {
    try {
        const { users, levels, pendingLevels, settings } = req.body;

        // Update users
        if (users && Array.isArray(users)) {
            for (const user of users) {
                await supabase.from('users').upsert(user, { onConflict: 'id' });
            }
        }

        // Update approved levels
        if (levels && Array.isArray(levels)) {
            for (const level of levels) {
                await supabase.from('levels').upsert({ ...level, status: 'approved' }, { onConflict: 'id' });
            }
        }

        // Update pending levels
        if (pendingLevels && Array.isArray(pendingLevels)) {
            for (const level of pendingLevels) {
                await supabase.from('levels').upsert({ ...level, status: 'pending' }, { onConflict: 'id' });
            }
        }

        // Update settings
        if (settings) {
            await supabase.from('settings').upsert(settings, { onConflict: 'id' });
        }

        console.log('✅ Data saved at:', new Date().toLocaleTimeString());
        res.json({ success: true, message: 'Data saved to Supabase' });
    } catch (error) {
        console.error('❌ Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data', details: error.message });
    }
});

// GET location info (for Railway/production)
app.get('/api/data-file-location', async (req, res) => {
    res.json({
        location: SUPABASE_URL,
        type: 'Supabase Cloud Database',
        database: 'Production'
    });
});

// GET validate session - checks if a user ID still exists in the database
app.get('/api/validate-session', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ valid: false, error: 'Missing userId parameter' });
    }

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.log(`🔒 Session validation failed for userId: ${userId}`);
            return res.json({ valid: false });
        }

        console.log(`✅ Session validated for: ${user.email}`);

        // Normalize snake_case Supabase columns to camelCase for the frontend
        const normalizedUser = {
            id: user.id,
            email: user.email,
            displayName: user.display_name || user.displayName || user.displayname || '',
            password: user.password,
            isAdmin: user.is_admin || user.isAdmin || user.isadmin || false
        };

        res.json({ valid: true, user: normalizedUser });
    } catch (error) {
        console.error('❌ Error validating session:', error.message);
        res.status(500).json({ valid: false, error: 'Server error during validation' });
    }
});

// Start server
(async () => {
    await initializeDatabase();

    app.listen(PORT, () => {
        console.log('╔════════════════════════════════════════╗');
        console.log('║  LCL - Level Challenge List Server     ║');
        console.log('║  ☁️  POWERED BY SUPABASE              ║');
        console.log('╠════════════════════════════════════════╣');
        console.log(`║  🚀 Server running on:                 ║`);
        console.log(`║  http://localhost:${PORT}                       ║`);
        console.log('║                                        ║');
        console.log('║  📍 Open in all browsers:              ║');
        console.log(`║  Edge: http://localhost:${PORT}         ║`);
        console.log(`║  Brave: http://localhost:${PORT}        ║`);
        console.log(`║  Chrome: http://localhost:${PORT}       ║`);
        console.log('║                                        ║');
        console.log('║  ☁️  Database:                         ║');
        console.log('║  Supabase Cloud (Production Ready)     ║');
        console.log('║                                        ║');
        console.log('║  ✅ All data synced to cloud!         ║');
        console.log('║  Press Ctrl+C to stop server           ║');
        console.log('╚════════════════════════════════════════╝');
    });
})();
