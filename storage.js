// Storage Management - Server + localStorage backup
const Storage = {
    DATA_KEY: 'lcl_data',
    API_URL: `${window.location.origin}/api/data`,
    cachedData: null,

    // 🔧 DEBUG MODE (turn false in production)
    DEBUG: true,

    // Default data structure
    getDefaultData() {
        return {
            users: [
                {
                    id: 'admin1',
                    email: 'maencopra@gmail.com',
                    displayName: 'Admin',
                    password: 'maenissocool12345gGs',
                    isAdmin: true
                }
            ],
            levels: [],

            pendingLevels: [],
            settings: {
                theme: 'dark',
                language: 'en',
                darkBackground: true
            }
        };
    },

    // Initialize - Load from server
    init() {
        console.log('🔧 Initializing Storage system...');

        const timestamp = new Date().getTime();
        fetch(`${this.API_URL}?t=${timestamp}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => {
                this.cachedData = data;
                localStorage.setItem(this.DATA_KEY, JSON.stringify(data));
                console.log('✅ Loaded data from server');

                if (this.DEBUG && data.users && Array.isArray(data.users)) {
                    console.log(`📋 Users: ${data.users.length}`);
                    data.users.forEach(u => {
                        console.log(`   ├─ ${u.displayName}${u.isAdmin ? ' 🔑 ADMIN' : ''}`);
                    });
                }
            })
            .catch(err => {
                console.warn('⚠️ Server unavailable, using localStorage');
                const localData = localStorage.getItem(this.DATA_KEY);

                if (localData) {
                    this.cachedData = JSON.parse(localData);
                    console.log('✅ Using localStorage (offline mode)');
                } else {
                    this.cachedData = this.getDefaultData();
                    localStorage.setItem(this.DATA_KEY, JSON.stringify(this.cachedData));
                    console.log('📝 Created new localStorage data');
                }
            });
    },

    // Get all data
    getData() {
        if (this.cachedData) return this.cachedData;

        const localData = localStorage.getItem(this.DATA_KEY);

        if (localData) {
            try {
                this.cachedData = JSON.parse(localData);
                return this.cachedData;
            } catch (err) {
                console.error('❌ localStorage corrupted');
                this.cachedData = this.getDefaultData();
                return this.cachedData;
            }
        }

        this.cachedData = this.getDefaultData();
        return this.cachedData;
    },

    // Save to server AND localStorage
    saveData(data) {
        this.cachedData = data;
        localStorage.setItem(this.DATA_KEY, JSON.stringify(data));

        const timestamp = new Date().getTime();
        fetch(`${this.API_URL}?t=${timestamp}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(() => console.log('✅ Saved to server'))
            .catch(err => console.warn('⚠️ Server save failed:', err.message));
    },

    // =====================
    // USER OPERATIONS
    // =====================

    addUser(email, displayName, password) {
        const data = this.getData();
        const userExists = data.users.some(u => u.email === email);

        if (userExists) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email,
            displayName,
            password,
            isAdmin: false
        };

        data.users.push(newUser);
        this.saveData(data);
        return { success: true, user: newUser };
    },

    getUserByEmail(email) {
        const data = this.getData();

        if (!data.users || !Array.isArray(data.users)) {
            console.error('❌ CRITICAL: Users array missing!');
            this.init();
            return this.getUserByEmail(email);
        }

        const user = data.users.find(u => u.email === email);

        if (this.DEBUG) {
            if (!user) {
                console.error(`❌ User NOT found: ${email}`);
                console.log(`📋 Available users (${data.users.length}):`);
                data.users.forEach(u => {
                    console.log(`   - ${u.displayName}${u.isAdmin ? ' 🔑' : ''}`);
                });
            } else {
                console.log(`✅ User FOUND: ${email}`);
            }
        }

        return user || null;
    },

    getUserById(id) {
        const data = this.getData();
        return data.users.find(u => u.id === id) || null;
    },

    // =====================
    // LEVEL OPERATIONS
    // =====================

    addLevel(levelData) {
        const data = this.getData();

        const newLevel = {
            id: 'level_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...levelData,
            submittedDate: new Date().toISOString(),
            status: 'approved'
        };

        data.levels.push(newLevel);
        this.saveData(data);
        return newLevel;
    },


    addPendingLevel(levelData, submittedBy) {
        const data = this.getData();

        const newPending = {
            id: 'pending_' + Date.now(),
            ...levelData,
            submittedBy,
            submittedDate: new Date().toISOString(),
            status: 'pending'
        };

        data.pendingLevels.push(newPending);
        this.saveData(data);
        return newPending;
    },

    getAllLevels() {
        return this.getData().levels || [];
    },

    getPendingLevels() {
        return this.getData().pendingLevels || [];
    },

    approvePendingLevel(pendingId) {
        const data = this.getData();
        const pending = data.pendingLevels.find(p => p.id === pendingId);

        if (!pending) return false;

        const newLevel = {
            id: 'level_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),

            ...pending,
            status: 'approved'
        };

        data.levels.push(newLevel);
        data.pendingLevels = data.pendingLevels.filter(p => p.id !== pendingId);

        this.saveData(data);
        console.log(`✅ Level "${newLevel.name}" approved!`);

        return true;
    },

    deleteLevel(levelId) {
        const data = this.getData();
        const index = data.levels.findIndex(l => l.id === levelId);

        if (index === -1) return false;

        const level = data.levels[index];
        data.levels.splice(index, 1);

        this.saveData(data);
        console.log(`✅ Level "${level.name}" deleted`);

        return true;
    },

    replaceLevel(currentId, newPosition) {
        const data = this.getData();
        const levelIndex = data.levels.findIndex(l => l.id === currentId);

        if (levelIndex === -1) return false;

        const [level] = data.levels.splice(levelIndex, 1);
        data.levels.splice(newPosition - 1, 0, level);

        this.saveData(data);
        console.log(`✅ "${level.name}" moved to position ${newPosition}`);

        return true;
    },

    updateLevel(levelId, updates) {
        const data = this.getData();
        const level = data.levels.find(l => l.id === levelId);

        if (!level) return false;

        Object.assign(level, updates);
        this.saveData(data);

        return true;
    },

    deletePendingLevel(pendingId) {
        const data = this.getData();
        const index = data.pendingLevels.findIndex(p => p.id === pendingId);

        if (index === -1) return false;

        const level = data.pendingLevels[index];
        data.pendingLevels.splice(index, 1);

        this.saveData(data);
        console.log(`✅ Level "${level.name}" rejected`);

        return true;
    },

    // =====================
    // SETTINGS
    // =====================

    getSettings() {
        return this.getData().settings;
    },

    updateSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        this.saveData(data);
    },

    getTheme() {
        return this.getSettings().theme;
    },

    setTheme(theme) {
        this.updateSettings({ theme });
    },

    getLanguage() {
        return this.getSettings().language;
    },

    setLanguage(language) {
        this.updateSettings({ language });
    },

    getDarkBackground() {
        return this.getSettings().darkBackground;
    },

    setDarkBackground(isDark) {
        this.updateSettings({ darkBackground: isDark });
    },

    // =====================
    // DEBUG
    // =====================

    getAllUsers() {
        return this.getData().users;
    },

    printAllData() {
        const data = this.getData();
        console.log('=== LCL DATA ===');
        console.log('Users:', data.users.length);
        console.log('Levels:', data.levels.length);
        console.log('Pending:', data.pendingLevels.length);
        console.log('Settings:', data.settings);
    },

    resetToDefault() {
        this.saveData(this.getDefaultData());
        console.log('✅ Data reset to defaults');
        setTimeout(() => window.location.reload(), 500);
    }
};

// === Initialize Storage ===
console.log('🔧 Starting Storage initialization...');
Storage.init();
