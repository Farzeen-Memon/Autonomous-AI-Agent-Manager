import React from 'react';
import RobotIllustration from '../components/auth/RobotIllustration';
import Logo from '../components/common/Logo';
import '../styles/replicated-login.css';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-page-container">
            {/* Cinematic Background Elements */}
            <div className="cinematic-bg"></div>
            <div className="data-particles"></div>
            <div className="volumetric-aura"></div>

            {/* Navbar */}
            <header className="auth-nav">
                <div className="auth-nav-logo">
                    <Logo textClassName="logo-text" />
                </div>
                <div className="auth-nav-right">
                    <div className="system-status">
                        <span className="status-dot"></span>
                        SYSTEM_ACCESS: ACTIVE_PROMPT
                    </div>
                    <div className="secure-entry-tag">
                        Secure Entry
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="auth-content-wrap">
                <div className="auth-grid">
                    <section className="auth-visual-section">
                        <RobotIllustration />
                    </section>
                    <section className="auth-form-section">
                        {children}
                    </section>
                </div>
            </main>

            {/* Subtle Footer Line */}
            <footer className="auth-replicated-footer"></footer>
        </div>
    );
};

export default AuthLayout;
