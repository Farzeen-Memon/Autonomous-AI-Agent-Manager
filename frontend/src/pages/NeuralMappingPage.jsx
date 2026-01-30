import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/NeuralMapping.css';

const NeuralMappingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId, title: stateTitle } = location.state || {};
    const [projectTitle, setProjectTitle] = React.useState(stateTitle || "");
    const [matches, setMatches] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchMatches = async () => {
            if (!projectId) return;
            try {
                // Fetch project details for the title
                const projResponse = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (projResponse.ok) {
                    const projData = await projResponse.json();
                    if (projData.project?.title) {
                        setProjectTitle(projData.project.title);
                    }
                }

                // Fetch matches
                const response = await fetch(`${API_BASE_URL}/projects/${projectId}/match`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMatches(data);
                } else {
                    console.error('Failed to fetch matches:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching matches:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [projectId]);

    const handleFinalize = async () => {
        if (!projectId) {
            navigate('/admin/dashboard');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'finalized',
                    assigned_team: matches.map(m => m.profile._id)
                })
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
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
                    onClick={handleLogout}
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
                <svg className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-40">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {!loading && matches.map((match, idx) => {
                        const total = matches.length;
                        const angle = (idx / total) * 2 * Math.PI;
                        const radiusX = 35 + Math.random() * 5;
                        const radiusY = 30 + Math.random() * 5;
                        const targetX = 50 + radiusX * Math.cos(angle);
                        const targetY = 50 + radiusY * Math.sin(angle);

                        return (
                            <line
                                key={`filament-${idx}`}
                                x1="50%"
                                y1="50%"
                                x2={`${targetX}%`}
                                y2={`${targetY}%`}
                                stroke={idx % 2 === 0 ? "#8B7CFF" : "#5DE6FF"}
                                strokeWidth="1.5"
                                className="neural-connection-line reveal-filament"
                                filter="url(#glow)"
                                style={{
                                    animationDelay: `${1000 + idx * 150}ms`,
                                    strokeDasharray: '300',
                                    strokeDashoffset: '300'
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Central Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center reveal-core">
                    <div className="w-24 h-24 rounded-full sphere-glow flex items-center justify-center relative -mb-8 z-10 border-4 border-[#1B1730]">
                        <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
                        <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">hub</span>
                    </div>
                    <div className="project-core-box px-14 pt-12 pb-8 rounded-2xl text-center min-w-[450px]">
                        <h1 className="text-3xl font-bold tracking-tight text-soft-white mb-2">{projectTitle || "Neural Interface Initializing..."}</h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-10 bg-primary/40"></div>
                            <p className="text-primary font-mono text-[10px] tracking-[0.4em] uppercase">Central Neural Core</p>
                            <div className="h-px w-10 bg-primary/40"></div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Engineer Nodes */}
                {loading ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 z-50">
                        <p className="font-mono text-primary animate-pulse tracking-[0.3em] uppercase text-xs">Synchronizing Neural Connections...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-20 z-50">
                        <p className="font-mono text-red-400 tracking-[0.3em] uppercase text-xs">No Matching Neural Nodes Found</p>
                    </div>
                ) : (
                    matches.map((match, idx) => {
                        // Dynamic spatial distribution around the center core
                        const total = matches.length;
                        const angle = (idx / total) * 2 * Math.PI;
                        const radiusX = 35 + Math.random() * 5; // Variation for organic feel
                        const radiusY = 30 + Math.random() * 5;

                        // Calculate positions in percentages
                        const left = 50 + radiusX * Math.cos(angle);
                        const top = 50 + radiusY * Math.sin(angle);

                        const colors = [
                            { ring: 'profile-ring-cyan', tag: 'soft-cyan' },
                            { ring: 'profile-ring-purple', tag: 'primary' }
                        ];
                        const colorSet = colors[idx % colors.length];

                        return (
                            <div
                                key={match.profile.id || match.profile._id}
                                className="absolute z-40 reveal-node"
                                style={{
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    animationDelay: `${1500 + idx * 200}ms`
                                }}
                            >
                                <div className="relative flex flex-col items-center group">
                                    <div className="drag-handle mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-soft-cyan text-xl">drag_indicator</span>
                                    </div>
                                    <div className="relative mb-4">
                                        <div className={`w-24 h-24 rounded-full ${colorSet.ring} overflow-hidden bg-black`}>
                                            <img
                                                alt={match.profile.full_name}
                                                className="w-full h-full object-cover"
                                                src={match.profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAaOZf7n7G1HMD5clSidK04vMqgB31u5IonIUlUo9FKjMHYO80Ztal1uJ7g1_jZtAqe7rEhytZ_pmfsx64eS3Mvr--vNDLVdgVm1YSo84VEfvfzFxfQL7rkf7R949hyiDDq7B9AJQgVZDonf9LROj1BxiIThwsmGRIO5PUdd5pNyuR6RAO81YDtYHRErMpO8tTpqeM4jMuDFe_d-4WWR2cnWeLQGNNijksvaUk3zi1fejNMmGmCzYkzaru7Tbj3Xd-LJ41HijI"}
                                            />
                                        </div>
                                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 bg-${colorSet.tag} text-carbon-black text-[10px] font-bold px-2 py-0.5 rounded uppercase`}>
                                            {idx === 0 ? 'Lead' : 'Specialist'}
                                        </div>
                                    </div>
                                    <div className="hud-glass p-5 rounded-xl border-soft-cyan/30 text-center w-52 shadow-2xl">
                                        <h3 className="text-xl font-bold text-white leading-none mb-1">{match.profile.full_name.split(' ')[0]}</h3>
                                        <p className="text-[10px] text-soft-cyan font-mono uppercase tracking-wider mb-3">Neural Score: {match.score}</p>

                                        <div className="mb-4 text-left p-2 rounded bg-white/5 border border-white/10">
                                            <p className="text-[8px] uppercase font-bold text-primary mb-1">Assigned Task</p>
                                            <p className="text-[11px] font-semibold text-slate-200 line-clamp-2 leading-tight">
                                                {match.suggested_task || "General Logic Optimization"}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-[9px] text-slate-500 uppercase">Sync Level</span>
                                            <span className="text-xs font-bold text-primary">{Math.round((match.score / 20) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
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
