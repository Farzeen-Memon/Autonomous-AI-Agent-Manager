import React, { useState } from 'react';

const Profile = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        jobTitle: '',
        skills: '',
        bio: '',
        timezone: 'UTC',
        availability: 'full-time'
    });

    return (
        <div className="profile-completion-container fade-in">
            <div className="completion-header">
                <h2 className="completion-title">Complete Your Professional Profile</h2>
                <p className="completion-subtitle">Help our AI agents understand your expertise for better task allocation.</p>
            </div>

            <div className="completion-card card">
                <form className="completion-form">
                    <div className="form-two-column">
                        {/* Left Column: Personal Info */}
                        <div className="form-column">
                            <h3 className="section-title">Personal Information</h3>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="label">First Name</label>
                                    <input className="input" placeholder="John" />
                                </div>
                                <div className="form-group flex-1">
                                    <label className="label">Last Name</label>
                                    <input className="input" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Primary Job Title</label>
                                <input className="input" placeholder="Senior Software Engineer" />
                            </div>

                            <div className="form-group">
                                <label className="label">Professional Bio</label>
                                <textarea className="input textarea" rows="3" placeholder="Tell us about your background..."></textarea>
                            </div>
                        </div>

                        {/* Right Column: Skills & Availability */}
                        <div className="form-column">
                            <h3 className="section-title">Capabilities & Logistics</h3>

                            <div className="form-group">
                                <label className="label">Core Skills (Comma separated)</label>
                                <input className="input" placeholder="React, Python, AWS, System Design" />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label className="label">Primary Timezone</label>
                                    <select className="input">
                                        <option>UTC (London)</option>
                                        <option>EST (New York)</option>
                                        <option>PST (Los Angeles)</option>
                                        <option>IST (New Delhi)</option>
                                    </select>
                                </div>
                                <div className="form-group flex-1">
                                    <label className="label">Availability Status</label>
                                    <select className="input">
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Consulting</option>
                                    </select>
                                </div>
                            </div>

                            <div className="profile-completion-footer">
                                <div className="completion-status">
                                    <div className="status-progress-bar">
                                        <div className="status-progress-fill" style={{ width: '60%' }}></div>
                                    </div>
                                    <span className="status-text">60% Complete</span>
                                </div>
                                <button type="button" className="btn btn-primary btn-wide">
                                    Finish Profile Setup
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
