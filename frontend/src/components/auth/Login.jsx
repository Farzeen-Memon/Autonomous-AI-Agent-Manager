import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../utils/constants';

const Login = () => {
    const navigate = useNavigate();
    const { fetchProfile } = useUser();
    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                // Security Fix: Strict Role Verification
                const serverRole = data.role;

                // If user tried to login as Admin but is actually Employee (or vice versa)
                if (role !== serverRole) {
                    // Fail the login
                    alert('User not found. Please check your role selection.');
                    return;
                }

                // Only if roles match, proceed to store credentials
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', serverRole);

                await fetchProfile(); // Populate global state

                if (serverRole === 'admin') {
                    navigate('/admin/dashboard');
                } else if (serverRole === 'employee') {
                    navigate('/employee');
                } else {
                    alert('Unknown role. Contact support.');
                }
            } else if (response.status === 404) {
                alert('User not found. Please Sign Up.');
                // Optional: navigate('/signup');
            } else {
                const error = await response.json();
                alert(error.detail || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Connection to neural core failed.');
        }
    };

    return (
        <div className="glass-card fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="replicated-title">Welcome to <span>Nexo</span></h1>
                <p className="replicated-subtitle">
                    Redefining autonomous AI management through secure neural interfaces.
                </p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="segmented-control">
                    <button
                        type="button"
                        className={`role-tab ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => setRole('admin')}
                    >
                        ADMIN
                    </button>
                    <button
                        type="button"
                        className={`role-tab ${role === 'employee' ? 'active' : ''}`}
                        onClick={() => setRole('employee')}
                    >
                        EMPLOYEE
                    </button>
                </div>

                <div className="form-group-replicated">
                    <label className="form-label-replicated">EMAIL</label>
                    <div className="input-replicated-wrap">
                        <input
                            type="email"
                            className="input-replicated"
                            placeholder="name@nexo.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <span className="material-symbols-outlined input-icon-right">mail</span>
                    </div>
                </div>

                <div className="form-group-replicated">
                    <div className="form-label-replicated">
                        <span>ACCESS KEY</span>
                        <a href="#" className="recover-link">RECOVER?</a>
                    </div>
                    <div className="input-replicated-wrap">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input-replicated"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="input-icon-right"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                    <button type="submit" className="login-btn-replicated">
                        LOG IN
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                    </button>
                </div>

                <p className="signup-text">
                    Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
                </p>

                <div className="footer-stats-row text-[10px] opacity-30">
                    <span>© Nexo 2026</span>
                    <span>Auth Service: Operational</span>
                </div>
            </form>
        </div>
    );
};

export default Login;
