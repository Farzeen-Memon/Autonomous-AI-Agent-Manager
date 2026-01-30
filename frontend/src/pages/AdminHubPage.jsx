import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Logo from '../components/common/Logo';
import '../styles/AdminHub.css';
import '../styles/AdminDashboard.css'; // Reuse technical-grid

const AdminHubPage = () => {
    const navigate = useNavigate();
    const { logout: contextLogout } = useUser();

    return (
        <div className="admin-hub-container">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col h-screen sticky top-0 bg-[#0F0C1D] z-20">
                <div className="p-6 flex-1">
                    <div className="mb-10">
                        <Logo />
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-[0.2em] font-bold ml-11">Autonomous Core</p>
                    </div>
                    <nav className="space-y-2">
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-electric-purple/10 text-electric-purple border border-electric-purple/20 transition-all">
                            <span className="material-symbols-outlined fill-1">dashboard</span>
                            <span className="font-bold text-sm uppercase tracking-wider">Dashboard</span>
                        </Link>
                        <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 hover:text-white transition-all">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-bold text-sm uppercase tracking-wider">Settings</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="core-hub-main technical-grid">
                {/* Header */}
                <header className="hub-header">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white border border-white/5 transition-all"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                            <span className="material-symbols-outlined text-sm">terminal</span>
                            <span>Nexo</span>
                            <span className="text-white/10">/</span>
                            <span className="text-white/60">Hub</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/30">
                        <span className="material-symbols-outlined cursor-pointer hover:text-white">notifications</span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-white">help</span>
                        <button
                            onClick={() => {
                                contextLogout();
                                navigate('/login');
                            }}
                            className="p-1.5 rounded-lg border border-white/5 text-white/30 hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                </header >

                {/* Center Content */}
                < main className="core-hub-content" >
                    <div className="core-card">
                        <div className="rocket-icon-container">
                            <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                        </div>
                        <p className="status-badge">System Initialized</p>
                        <h1 className="hub-title">Welcome to the Core.</h1>
                        <p className="hub-description">
                            No active projects detected. Initialize your first autonomous AI agent to begin orchestration.
                        </p>
                        <button
                            onClick={() => navigate('/admin/project-matching')}
                            className="create-project-btn"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create New Project
                        </button>
                        <p className="technical-label">Technical Square Grid Background Active</p>
                    </div>
                </main >

                {/* Footer */}
                < footer className="hub-footer" >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs text-[#5DE6FF]">verified_user</span>
                        <span>Secure Encryption Active • End-to-End Encrypted Workspace</span>
                    </div>
                    <div className="flex gap-6">
                        <span>Latency: 12ms</span>
                        <span>Uptime: 100%</span>
                        <span>Version: 1.0.4-Beta</span>
                    </div>
                </footer >
            </div >
        </div >
    );
};

export default AdminHubPage;
