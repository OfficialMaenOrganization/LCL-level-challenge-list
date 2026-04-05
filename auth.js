// Authentication System
const Auth = {
    currentUser: null,

    // ✅ Auto login on page load
    init() {
        try {
            const savedUser = localStorage.getItem("lcl_user");

            if (savedUser) {
                const parsed = JSON.parse(savedUser);

                // Validate that the parsed object looks like a real user
                if (parsed && parsed.id && parsed.email) {
                    this.currentUser = parsed;
                    console.log("✅ Auto-logged in:", this.currentUser.displayName);
                } else {
                    console.warn("⚠️ Saved session invalid, clearing it");
                    localStorage.removeItem("lcl_user");
                }
            } else {
                console.log("ℹ️ No saved session found");
            }
        } catch (err) {
            // localStorage may be unavailable (incognito restrictions, corrupted data, etc.)
            console.warn("⚠️ Could not read session from localStorage:", err.message);
            this.currentUser = null;

            try {
                localStorage.removeItem("lcl_user");
            } catch (_) {
                // Silently ignore if we can't clean up either
            }
        }
    },


    // Login
    login(email, password) {
        const user = Storage.getUserByEmail(email);

        if (user && user.password === password) {
            this.currentUser = user;

            // ✅ Save session
            localStorage.setItem("lcl_user", JSON.stringify(user));

            return { success: true };
        }

        return { success: false, message: "Invalid email or password" };
    },

    // Register
    register(email, displayName, password) {
        return Storage.addUser(email, displayName, password);
    },

    // Logout
    logout() {
        this.currentUser = null;

        // ❌ Remove session
        localStorage.removeItem("lcl_user");
    },

    // Check login
    isLoggedIn() {
        return this.currentUser !== null;
    },

    // Check admin
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }
};
