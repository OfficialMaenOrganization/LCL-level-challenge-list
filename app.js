import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [user, setUser] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    // --- FIX: THIS RUNS ON REFRESH ---
    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        const savedData = localStorage.getItem('userData');
        if (loggedInUser && savedData) {
            setUser(JSON.parse(savedData));
            // Optional: Verify token with backend here
        }
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        const res = await axios.get('https://your-api-url.up.railway.app/api/leaderboard');
        setLeaderboard(res.data);
    };

    const handleLogin = async (username, password) => {
        try {
            const res = await axios.post('https://your-api-url.up.railway.app/api/login', { username, password });
            if (res.data.user) {
                // --- FIX: SAVE TO LOCAL STORAGE ---
                localStorage.setItem('user', res.data.user);
                localStorage.setItem('userData', JSON.stringify(res.data.userData));
                setUser(res.data.userData);
                alert("Logged in!");
            } else {
                alert("Check credentials");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        // --- FIX: CLEAR LOCAL STORAGE ---
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        setUser(null);
    };

    return (
        <div className="App">
            <nav>
                {user ? (
                    <div>
                        <span>Welcome, {user.username}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <button onClick={() => handleLogin('test', 'password')}>Login (Example)</button>
                )}
            </nav>

            <h1>Leaderboard</h1>
            <ul>
                {leaderboard.map((player, index) => (
                    <li key={index}>{player.username}: {player.points}pts</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
