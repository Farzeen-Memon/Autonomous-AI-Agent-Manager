import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import '../styles/NeuralMapping.css';

const NeuralMappingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId, title } = location.state || {};

    const handleFinalize = async () => {
        if (!projectId) {
            navigate('/admin/dashboard');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: 'finalized' })
            });

            if (response.ok) {
                navigate('/admin/dashboard');
            } else {
                console.error('Failed to finalize project');
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error('Error finalizing project:', error);
            navigate('/admin/dashboard');
        }
    };

    return (
        <div className="neural-mapping-body text-slate-100 min-h-screen overflow-hidden bg-grid relative">
            {/* HUD: Sync Confidence */}
            <div className="fixed top-8 left-8 z-50 flex flex-col gap-4">
                <button
                    onClick={() => navigate('/admin/project-matching')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 backdrop-blur-md rounded-lg border border-white/5 hover:border-primary/30 w-fit"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                </button>
                <div className="hud-glass p-4 rounded-lg flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-primary tracking-[0.2em] uppercase">Sync Confidence</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">99.2</span>
                        <span className="text-primary text-xs mb-1">%</span>
                    </div>
                    <div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary w-[99%]"></div>
                    </div>
                </div>
            </div>

            {/* HUD: Network Latency */}
            <div className="fixed top-8 right-8 z-50 flex flex-col gap-4 items-end">
                <button
                    onClick={() => navigate('/login')}
                    className="p-1.5 rounded-lg bg-white/5 backdrop-blur-md border border-white/5 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center"
                    title="Logout"
                >
                    <span className="material-symbols-outlined text-lg">logout</span>
                </button>
                <div className="hud-glass p-4 rounded-lg text-right flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-soft-cyan tracking-[0.2em] uppercase">Network Latency</span>
                    <div className="flex items-end justify-end gap-2">
                        <span className="text-2xl font-bold text-soft-cyan">14</span>
                        <span className="text-soft-cyan/60 text-xs mb-1">MS</span>
                    </div>
                    <div className="flex gap-1 mt-1 justify-end">
                        <div className="h-1 w-4 bg-soft-cyan"></div>
                        <div className="h-1 w-4 bg-soft-cyan"></div>
                        <div className="h-1 w-4 bg-soft-cyan/20"></div>
                        <div className="h-1 w-4 bg-soft-cyan/20"></div>
                    </div>
                </div>
            </div>

            {/* Centered Logo */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 opacity-60 hover:opacity-100 transition-opacity">
                <Logo />
            </div>

            <main className="relative w-screen h-screen overflow-hidden">
                {/* Connection Filaments */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="filament filament-cyan" style={{ width: '30%', top: '30%', left: '20%', transform: 'rotate(25deg)' }}></div>
                    <div className="filament" style={{ width: '30%', top: '30%', right: '20%', transform: 'rotate(-25deg)' }}></div>
                    <div className="filament" style={{ width: '25%', bottom: '35%', left: '25%', transform: 'rotate(-30deg)' }}></div>
                    <div className="filament filament-cyan" style={{ width: '25%', bottom: '35%', right: '25%', transform: 'rotate(30deg)' }}></div>
                </div>

                {/* Central Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full sphere-glow flex items-center justify-center relative -mb-8 z-10 border-4 border-[#1B1730]">
                        <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
                        <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">hub</span>
                    </div>
                    <div className="project-core-box px-14 pt-12 pb-8 rounded-2xl text-center min-w-[450px]">
                        <h1 className="text-3xl font-bold tracking-tight text-soft-white mb-2">{title || "Infrastructure Migration v2.4"}</h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-10 bg-primary/40"></div>
                            <p className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase">Central Neural Core</p>
                            <div className="h-px w-10 bg-primary/40"></div>
                        </div>
                    </div>
                </div>

                {/* Engineer: Felix */}
                <div className="absolute top-[12%] left-[10%] z-40">
                    <div className="relative flex flex-col items-center group">
                        <div className="drag-handle mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-soft-cyan text-xl">drag_indicator</span>
                        </div>
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full profile-ring-cyan overflow-hidden bg-black">
                                <img alt="Felix" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaOZf7n7G1HMD5clSidK04vMqgB31u5IonIUlUo9FKjMHYO80Ztal1uJ7g1_jZtAqe7rEhytZ_pmfsx64eS3Mvr--vNDLVdgVm1YSo84VEfvfzFxfQL7rkf7R949hyiDDq7B9AJQgVZDonf9LROj1BxiIThwsmGRIO5PUVdd5pNyuR6RAO81YDtYHRErMpO8tTpqeM4jMuDFe_d-4WWR2cnWeLQGNNijksvaUk3zi1fejNMmGmCzYkzaruZju7Tbj3Xd-LJ41HijI" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-soft-cyan text-carbon-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Engineer</div>
                        </div>
                        <div className="hud-glass p-5 rounded-xl border-soft-cyan/30 text-center w-52 shadow-2xl">
                            <h3 className="text-xl font-bold text-white leading-none mb-1">Felix</h3>
                            <p className="text-[10px] text-soft-cyan font-mono uppercase tracking-wider mb-3">Operational Task</p>
                            <p className="text-sm font-semibold text-slate-300 mb-4 uppercase">Core API Refactor</p>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 uppercase">Deadline</span>
                                <span className="text-xs font-bold text-red-400">14h : 22m</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer: Aria */}
                <div className="absolute top-[12%] right-[10%] z-40">
                    <div className="relative flex flex-col items-center group">
                        <div className="drag-handle mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-primary text-xl">drag_indicator</span>
                        </div>
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full profile-ring-purple overflow-hidden bg-black">
                                <img alt="Aria" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUfD6CIXhWjgj7zvMg2TvuCXa6r5yRiX-pYjpZeO5iYHxqjrhMfmT2e4LIsM4OSULrJrgVeOJhgQN4pcYdHiPv1V7H05h-6Ev5smrzUpyagaQj6AOedZb34gWa24voQW-66-1N_pmIGPk7SXRrOxOVUPjKl2xs36cLEXo9CfK1D_PcTKJkHKfss5PA9xcZ0mPfpEEB-XIjZ1VA3aVY1Icy5gIMLZs-EiEHkZIsjkBaqQcdJA-OkAfvy5-PoHXej0c4pZtXfU36ae4" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-carbon-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Developer</div>
                        </div>
                        <div className="hud-glass p-5 rounded-xl border-primary/30 text-center w-52 shadow-2xl">
                            <h3 className="text-xl font-bold text-white leading-none mb-1">Aria</h3>
                            <p className="text-[10px] text-primary font-mono uppercase tracking-wider mb-3">Operational Task</p>
                            <p className="text-sm font-semibold text-slate-300 mb-4 uppercase">UX Synchronization</p>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 uppercase">Deadline</span>
                                <span className="text-xs font-bold text-white">Oct 24, 2024</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lead: Xavier */}
                <div className="absolute bottom-[18%] left-[15%] z-40">
                    <div className="relative flex flex-col items-center group">
                        <div className="drag-handle mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-primary text-xl">drag_indicator</span>
                        </div>
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full profile-ring-purple overflow-hidden bg-black">
                                <img alt="Xavier" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLtIqED_GoRiDeLf9LXQSzvrmPscI2CnATcwuss7-9yoikYjc35Sy3eQsja62VVACS0iUoIfA2sbLZbCPzFpN-ADTDZ7kb9X-zR2e3wFvYYFMlxbf-PehrE_Oj-w1RTpTrDdY-Vtdfs6kFeqMA_CB6dsbGMvTJZcWLBEaFaKRgkdCWvRGbfpq9RPPKY9N7f0_8eodCgWgrgC_-Ywse9pVsa9QpLonJb0VhM_S7BcQ7Rru3FE313ylovBQZ1_0tR_Z3w4D79zLjASY" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-carbon-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Lead</div>
                        </div>
                        <div className="hud-glass p-5 rounded-xl border-primary/30 text-center w-52 shadow-2xl">
                            <h3 className="text-xl font-bold text-white leading-none mb-1">Xavier</h3>
                            <p className="text-[10px] text-primary font-mono uppercase tracking-wider mb-3">Operational Task</p>
                            <p className="text-sm font-semibold text-slate-300 mb-4 uppercase">Security Layer 4</p>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[9px] text-slate-500 uppercase">Deadline</span>
                                <span className="text-xs font-bold text-primary">Priority Alpha</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unassigned Slot */}
                <div className="absolute bottom-[18%] right-[15%] z-40">
                    <div className="relative flex flex-col items-center group">
                        <div className="drag-handle mb-2 opacity-20 group-hover:opacity-60 transition-opacity">
                            <span className="material-symbols-outlined text-slate-500 text-xl">drag_indicator</span>
                        </div>
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5">
                                <span className="material-symbols-outlined text-white/20 text-3xl">person_add</span>
                            </div>
                        </div>
                        <div className="hud-glass p-5 rounded-xl border-white/10 text-center w-52 opacity-40 shadow-2xl">
                            <h3 className="text-xl font-bold text-white/40 leading-none mb-1">Unassigned</h3>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-3">Neural Slot</p>
                            <p className="text-sm font-semibold text-slate-600 mb-4 uppercase">Pending Validation</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
                <div className="max-w-[1440px] mx-auto flex justify-between items-end">
                    <div className="hud-glass p-4 rounded-xl w-80 pointer-events-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Neural Link Active</span>
                        </div>
                        <div className="space-y-1 font-mono text-[9px] text-slate-500">
                            <p>&gt; Spatial optimization complete</p>
                            <p>&gt; Verified 4/4 neural slots positioned</p>
                            <p>&gt; Ready for team manual re-ordering</p>
                        </div>
                    </div>
                    <button
                        onClick={handleFinalize}
                        className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-10 py-5 rounded-xl shadow-[0_0_30px_rgba(139,124,255,0.4)] flex items-center gap-4 transition-all transform active:scale-95 group pointer-events-auto"
                    >
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-[10px] font-mono uppercase opacity-70 mb-1 tracking-widest">Network Confirmation</span>
                            <span>Finalize Team Deployment</span>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">rocket_launch</span>
                        </div>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default NeuralMappingPage;
