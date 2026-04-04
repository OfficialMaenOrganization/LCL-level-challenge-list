// Authentication System
const Auth = {
    currentUser: null,

    // ✅ Auto login on page load
    init() {
        const savedUser = localStorage.getItem("lcl_user");

        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            console.log("✅ Auto-logged in:", this.currentUser.displayName);
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
