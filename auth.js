// Authentication System
const Auth = {
    currentUser: null,

    // ✅ Auto login on page load - validates session against server
    init() {
        try {
            const savedUser = localStorage.getItem("lcl_user");

            if (savedUser) {
                const parsed = JSON.parse(savedUser);

                // Validate that the parsed object looks like a real user
                if (parsed && parsed.id && parsed.email) {
                    // Optimistically restore from localStorage for instant UI
                    this.currentUser = parsed;
                    console.log("✅ Auto-logged in (localStorage):", this.currentUser.displayName);

                    // Then validate against the server to confirm the account still exists
                    fetch(`${window.location.origin}/api/validate-session?userId=${encodeURIComponent(parsed.id)}`)
                        .then(res => res.json())
                        .then(result => {
                            if (result.valid && result.user) {
                                // Refresh local cache with latest user data from server
                                this.currentUser = result.user;
                                localStorage.setItem("lcl_user", JSON.stringify(result.user));
                                console.log("✅ Session validated by server:", this.currentUser.displayName);
                                // Re-render UI in case admin status or display name changed
                                if (typeof App !== "undefined" && App.updateUI) {
                                    App.updateUI();
                                }
                            } else {
                                // Account no longer exists in the database — force logout
                                console.warn("⚠️ Server rejected session (account deleted or invalid), logging out");
                                this.currentUser = null;
                                localStorage.removeItem("lcl_user");
                                if (typeof App !== "undefined" && App.updateUI) {
                                    App.updateUI();
                                    App.navigateTo("home");
                                }
                            }
                        })
                        .catch(err => {
                            // Server unreachable — keep the localStorage session as-is
                            console.warn("⚠️ Could not reach server for session validation, keeping local session:", err.message);
                        });
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
