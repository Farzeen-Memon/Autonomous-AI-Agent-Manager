import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import '../styles/ProjectDetails.css';

const DeploymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { result, projectId } = location.state || {};
    const [phase, setPhase] = React.useState('uploading'); // uploading -> syncing -> finalized

    React.useEffect(() => {
        const timer1 = setTimeout(() => setPhase('syncing'), 1500);
        const timer2 = setTimeout(() => setPhase('finalized'), 3500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!result) {
        return (
            <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
                <div className="text-white font-black uppercase tracking-widest animate-pulse">
                    No Deployment Data Detected
                    <button onClick={() => navigate('/admin/dashboard')} className="block mt-4 text-primary underline">Return to Hub</button>
                </div>
            </div>
        );
    }

    return (
        <div className="project-details-container min-h-screen flex flex-col p-8 md:p-12 relative overflow-hidden">
            {/* Background Decorative Blurs */}
            <div className="fixed top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary/10 blur-[150px] pointer-events-none opacity-50 animate-pulse-slow"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] pointer-events-none opacity-50"></div>

            <div className="flex justify-between items-center mb-16">
                <Logo />
                <div className="flex items-center gap-2 text-slate-500 font-mono text-xs tracking-[0.3em] uppercase">
                    Protocol: <span className="text-primary">Neural_Blast_v2.0</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center">

                {/* Visual Core */}
                <div className="relative mb-12">
                    <div className={`w-48 h-48 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${phase === 'finalized' ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-emerald-500/10' : 'border-primary shadow-[0_0_50px_rgba(139,124,255,0.3)] bg-primary/5 animate-pulse'}`}>
                        <span className={`material-symbols-outlined text-7xl transition-all duration-500 ${phase === 'finalized' ? 'text-emerald-500 scale-110' : 'text-primary'}`}>
                            {phase === 'finalized' ? 'verified' : phase === 'syncing' ? 'sync' : 'rocket_launch'}
                        </span>
                    </div>

                    {/* Floating Orbits */}
                    <div className="absolute inset-0 -m-4 border border-white/5 rounded-full animate-spin-slow"></div>
                    <div className="absolute inset-0 -m-12 border border-white/5 rounded-full animate-reverse-spin"></div>
                </div>

                <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 premium-gradient-text">
                    {phase === 'finalized' ? 'Deployment Secured' : 'Neural Re-Mapping...'}
                </h1>

                <p className="text-slate-400 font-mono tracking-widest text-sm mb-12 uppercase max-w-lg mx-auto">
                    {phase === 'finalized'
                        ? 'Project has been optimized and synched across all neural nodes successfully.'
                        : 'Re-distributing module assignments and synchronizing employee biometric protocols.'}
                </p>

                {/* Progress Bar System */}
                <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-full h-2 mb-12 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-out ${phase === 'uploading' ? 'w-1/3 progress-gradient' : phase === 'syncing' ? 'w-2/3 progress-gradient' : 'w-full bg-emerald-500'}`}
                    ></div>
                </div>

                {/* Statistics Grid */}
                {phase === 'finalized' && (
                    <div className="grid grid-cols-3 gap-8 w-full animate-in zoom-in duration-700 mb-12">
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="text-3xl font-black text-white mb-1">{result.tasks_updated}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nodes Re-Mapped</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="text-3xl font-black text-white mb-1">{result.team_size}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Agents Active</div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-white/5">
                            <div className="text-3xl font-black text-white mb-1">{result.notifications_sent}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Signals Sent</div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4 w-full max-w-sm">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        disabled={phase !== 'finalized'}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 ${phase === 'finalized' ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        Access Managed Portfolio
                    </button>
                    <button
                        onClick={() => navigate('/admin/project-details', { state: { projectId } })}
                        disabled={phase !== 'finalized'}
                        className={`w-full py-2 rounded-xl border border-white/10 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all ${phase !== 'finalized' && 'opacity-0 pointer-events-none'}`}
                    >
                        Return to Neural Console
                    </button>
                </div>
            </div>

            <footer className="mt-auto border-t border-white/10 pt-8 flex justify-between items-center text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                <div>Session Secure // AES-NN-256</div>
                <div>Status: {phase.toUpperCase()}</div>
                <div>End-to-End Encryption Verified</div>
            </footer>
        </div>
    );
};

export default DeploymentPage;
