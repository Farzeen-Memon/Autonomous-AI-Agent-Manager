import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/employee');
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

                <div className="footer-stats-row">
                    <span>v4.0.2 Stable</span>
                    <span>Auth Service: Operational</span>
                </div>
            </form>
        </div>
    );
};

export default Login;
