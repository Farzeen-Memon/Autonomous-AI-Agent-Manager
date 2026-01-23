import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const [profile, setProfile] = useState({
        name: 'Admin User',
        email: 'admin@nexo.ai',
        role: 'System Administrator',
        department: 'Engineering',
        skills: 'React, Node.js, Python, AI/ML',
        experience: '10+ years in Software Architecture',
        photoPreview: null
    });
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        taskUpdates: true,
        weeklyReports: false
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, photoPreview: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        alert('Profile updated successfully!');
    };

    return (
        <div className="settings-page fade-in">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">System Settings</h2>
                    <p className="dashboard-subtitle">Configure your workspace and personal preferences</p>
                </div>
            </div>

            <div className="settings-grid">

                {/* Profile Settings */}
                <div className="card settings-section">
                    <div className="settings-section-header">
                        <span className="material-icons-outlined settings-icon">person</span>
                        <h3>Account Profile</h3>
                    </div>
                    <div className="settings-section-content">
                        <form onSubmit={handleSaveProfile}>
                            <div className="settings-profile-photo">
                                <div className="settings-avatar">
                                    {profile.photoPreview ? (
                                        <img src={profile.photoPreview} alt="Profile" />
                                    ) : (
                                        <div className="settings-avatar-placeholder">
                                            <span className="material-icons-outlined">person</span>
                                        </div>
                                    )}
                                </div>
                                <label className="btn btn-secondary">
                                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>upload</span>
                                    Update Avatar
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                            </div>

                            <div className="settings-form-grid">
                                <div className="form-group">
                                    <label className="label">Display Name</label>
                                    <input
                                        className="input"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Work Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Role</label>
                                    <input
                                        className="input"
                                        value={profile.role}
                                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Department</label>
                                    <input
                                        className="input"
                                        value={profile.department}
                                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="label">Skills</label>
                                    <textarea
                                        className="input"
                                        value={profile.skills}
                                        onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                                        rows="2"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label className="label">Experience</label>
                                    <textarea
                                        className="input"
                                        value={profile.experience}
                                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="settings-actions">
                                <button type="submit" className="btn btn-primary">
                                    Apply Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="card settings-section">
                    <div className="settings-section-header">
                        <span className="material-icons-outlined settings-icon">notifications</span>
                        <h3>Notification Preferences</h3>
                    </div>
                    <div className="settings-section-content">
                        <div className="settings-item">
                            <div className="settings-item-info">
                                <div className="settings-item-label">Email Alerts</div>
                                <div className="settings-item-description">
                                    Critical task and system updates via email
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.emailNotifications}
                                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="settings-item">
                            <div className="settings-item-info">
                                <div className="settings-item-label">Weekly Summaries</div>
                                <div className="settings-item-description">
                                    Digest report of AI agent performance
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.weeklyReports}
                                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
