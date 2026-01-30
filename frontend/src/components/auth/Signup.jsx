import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../utils/constants';

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState(location.state?.initialRole || 'employee');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        number: false,
        special: false,
        uppercase: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChange = (value) => {
        setFormData({ ...formData, password: value });
        setPasswordRequirements({
            length: value.length >= 8,
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*]/.test(value),
            uppercase: /[A-Z]/.test(value)
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const { length, number, special, uppercase } = passwordRequirements;
        if (!(length && number && special && uppercase)) {
            alert('Please meet all password requirements for a secure access key.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Access Keys do not match!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: role
                })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', role);

                if (role === 'admin') {
                    navigate('/admin-provisioning');
                } else {
                    navigate('/employee-calibration');
                }
            } else {
                const error = await response.json();
                alert(error.detail || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            alert('Neural node registration failed.');
        }
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
                            onChange={(e) => handlePasswordChange(e.target.value)}
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
                    <div className="mt-3 grid grid-cols-2 gap-2 px-1">
                        <div className={`flex items-center gap-1 transition-opacity ${passwordRequirements.length ? 'opacity-100' : 'opacity-40'}`}>
                            <span className={`w-1 h-1 rounded-full ${passwordRequirements.length ? 'bg-secondary' : 'bg-slate-500'}`}></span>
                            <span className="text-[8px] uppercase font-bold text-slate-400">8+ CHARACTERS</span>
                        </div>
                        <div className={`flex items-center gap-1 transition-opacity ${passwordRequirements.uppercase ? 'opacity-100' : 'opacity-40'}`}>
                            <span className={`w-1 h-1 rounded-full ${passwordRequirements.uppercase ? 'bg-secondary' : 'bg-slate-500'}`}></span>
                            <span className="text-[8px] uppercase font-bold text-slate-400">UPPERCASE</span>
                        </div>
                        <div className={`flex items-center gap-1 transition-opacity ${passwordRequirements.number ? 'opacity-100' : 'opacity-40'}`}>
                            <span className={`w-1 h-1 rounded-full ${passwordRequirements.number ? 'bg-secondary' : 'bg-slate-500'}`}></span>
                            <span className="text-[8px] uppercase font-bold text-slate-400">NUMBER</span>
                        </div>
                        <div className={`flex items-center gap-1 transition-opacity ${passwordRequirements.special ? 'opacity-100' : 'opacity-40'}`}>
                            <span className={`w-1 h-1 rounded-full ${passwordRequirements.special ? 'bg-secondary' : 'bg-slate-500'}`}></span>
                            <span className="text-[8px] uppercase font-bold text-slate-400">SYMBOL</span>
                        </div>
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
