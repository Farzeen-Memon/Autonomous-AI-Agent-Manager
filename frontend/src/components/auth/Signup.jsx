import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('employee');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Simulate signup success
        navigate('/role-selection');
    };

    return (
        <div className="glass-card fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="replicated-title">Create <span>Account</span></h1>
                <p className="replicated-subtitle">
                    Join Nexo and start managing your autonomous AI agents.
                </p>
            </div>

            <form onSubmit={handleSignup}>
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
                    <label className="form-label-replicated">FULL NAME</label>
                    <div className="input-replicated-wrap">
                        <input
                            type="text"
                            className="input-replicated"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <span className="material-symbols-outlined input-icon-right">person</span>
                    </div>
                </div>

                <div className="form-group-replicated">
                    <label className="form-label-replicated">EMAIL</label>
                    <div className="input-replicated-wrap">
                        <input
                            type="email"
                            className="input-replicated"
                            placeholder="name@nexo.ai"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <span className="material-symbols-outlined input-icon-right">mail</span>
                    </div>
                </div>

                <div className="form-group-replicated">
                    <label className="form-label-replicated">ACCESS KEY</label>
                    <div className="input-replicated-wrap">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="input-replicated"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                <div className="form-group-replicated">
                    <label className="form-label-replicated">CONFIRM ACCESS KEY</label>
                    <div className="input-replicated-wrap">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="input-replicated"
                            placeholder="••••••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                        <button
                            type="button"
                            className="input-icon-right"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <span className="material-symbols-outlined">
                                {showConfirmPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                </div>

                <div style={{ paddingTop: '0.5rem' }}>
                    <button type="submit" className="login-btn-replicated">
                        CREATE ACCOUNT
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                    </button>
                </div>

                <p className="signup-text">
                    Already have an account? <a href="/login" className="signup-link">Sign in</a>
                </p>

                <div className="footer-stats-row">
                    <span>v4.0.2 Stable</span>
                    <span>System Status: Optimal</span>
                </div>
            </form>
        </div>
    );
};

export default Signup;
