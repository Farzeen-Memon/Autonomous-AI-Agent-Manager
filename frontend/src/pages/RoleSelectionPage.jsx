import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import '../styles/RoleSelection.css';

const RoleSelectionPage = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        if (role === 'admin') {
            navigate('/admin-provisioning');
        } else {
            navigate('/employee-calibration');
        }
    };

    return (
        <div className="bg-carbon-black min-h-screen text-white font-display">
            <div className="relative flex h-screen w-full flex-col overflow-x-hidden">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/5 px-6 py-4 lg:px-10 bg-carbon-black/90 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/50 hover:text-electric-purple transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Back to Login
                        </button>
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-electric-purple/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAEbCjAUkxIi-rfHs3ZvoojRNs8z-BRE-1c-z0KCFVh_yHXysL9qwExfdOlp8kZ3K81IQg1De1eLRt_uic5XrO3cq6JitPHKaurmB0bkacXHGFWjp0TZ00Fs8WtDhPEmBfxalsflZrunXlmfEQAnXlbFlVJGXnGVs-uMMwyD4ew409Dr9g3FgSPK72W4eQ6Vll49Qz0ezw_Zx9nSfsJTYzZgd2vOCxxhB7q8810d5WQl7C8_u2zBdTEGMueMvMpB_0ZsimnIZOrVs")' }}></div>
                    </div>
                </header>
                <div className="w-full h-1 bg-white/5">
                    <div className="h-full bg-electric-purple shadow-[0_0_15px_rgba(139,124,255,0.6)] transition-all duration-500" style={{ width: '15%' }}></div>
                </div>
                <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-40">
                    <div className="max-w-[1000px] w-full flex flex-col items-center">
                        <div className="mb-12 text-center">
                            <h1 className="text-high-contrast tracking-tight text-[36px] lg:text-[48px] font-bold leading-tight mb-4 tracking-tighter">
                                Select Your Neural Access Level
                            </h1>
                            <p className="text-white/50 text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
                                Determine your scope of operations within the Nexo Autonomous Network.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                            <div
                                onClick={() => handleRoleSelect('admin')}
                                className="card-depth card-glow group relative p-8 rounded-xl cursor-pointer flex flex-col items-center text-center transition-all duration-300"
                            >
                                <div className="mb-8 p-6 rounded-full bg-electric-purple/5 border border-electric-purple/10 group-hover:bg-electric-purple/10 transition-colors">
                                    <span className="material-symbols-outlined text-electric-purple text-5xl group-hover:scale-110 transition-transform duration-300">
                                        admin_panel_settings
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 tracking-wide text-high-contrast">System Administrator</h3>
                                <p className="text-white/40 mb-8 leading-relaxed">
                                    Manage AI agents, oversee neural node configurations, and control organizational billing and security protocols.
                                </p>
                                <button className="mt-auto w-full py-4 bg-electric-purple hover:bg-[#7A6AFF] text-white hover:text-carbon-black border border-white hover:border-black rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(139,124,255,0.4)]">
                                    Select Admin
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            </div>
                            <div
                                onClick={() => handleRoleSelect('employee')}
                                className="card-depth card-glow group relative p-8 rounded-xl cursor-pointer flex flex-col items-center text-center transition-all duration-300"
                            >
                                <div className="mb-8 p-6 rounded-full bg-electric-purple/5 border border-electric-purple/10 group-hover:bg-electric-purple/10 transition-colors ">
                                    <span className="material-symbols-outlined text-electric-purple text-5xl group-hover:scale-110 transition-transform duration-300">
                                        badge
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 tracking-wide text-high-contrast">Employee</h3>
                                <p className="text-white/40 mb-8 leading-relaxed">
                                    Interact with assigned agents, execute neural workflows, and monitor task outputs in the decentralized grid.
                                </p>
                                <button className="mt-auto w-full py-4 bg-electric-purple hover:bg-[#7A6AFF] text-white hover:text-carbon-black border border-white hover:border-black rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(139,124,255,0.4)]">
                                    Select Employee
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-16 flex flex-col items-center gap-3 w-full max-w-sm">
                            <div className="flex justify-between w-full mb-1">
                                <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Neural link status</span>
                                <span className="text-soft-cyan text-xs font-bold uppercase tracking-widest">Active</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-soft-cyan shadow-[0_0_8px_#5DE6FF]" style={{ width: '100%' }}></div>
                            </div>
                            <p className="text-white/20 text-xs mt-2 italic">Authority verification complete. System ready for Employee or Admin login.</p>
                        </div>
                    </div>
                </main>
                <footer className="p-6 text-center text-white/10 text-sm">
                    © 2024 Nexo Autonomous Systems. All rights reserved. Neural interface v2.0.4-delta.
                </footer>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
