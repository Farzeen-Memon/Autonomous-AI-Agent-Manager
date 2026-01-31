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
        const fetchProjectDetails = async () => {
            if (!projectId) return;
            try {
                // Fetch project details
                const projResponse = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (projResponse.ok) {
                    const projData = await projResponse.json();

                    if (projData.project?.title) {
                        setProjectTitle(projData.project.title);
                    }

                    // If the project already has a team assigned (from the previous page), use it!
                    if (projData.team && projData.team.length > 0) {
                        console.log("Using assigned team from project:", projData.team);
                        const formattedMatches = projData.team.map(member => ({
                            profile: member.profile,
                            score: 10, // Default score for manually assigned members if not persisted
                            suggested_task: "Assigned Project Member",
                            matched_skills: member.skills ? member.skills.map(s => s.skill_name) : []
                        }));
                        setMatches(formattedMatches);
                        setLoading(false);
                        return;
                    }
                }

                // Fallback: If no team assigned, run matcher
                console.log("No assigned team found, running AI matcher...");
                const response = await fetch(`${API_BASE_URL}/projects/${projectId}/match`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMatches(data);
                }
            } catch (error) {
                console.error('Error loading project data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
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
                        // Start angle from -PI/2 (top) so the first node is at the top
                        const angle = (idx / total) * 2 * Math.PI - (Math.PI / 2);

                        // Increase radius to fit the larger cards without overlap
                        const radiusX = 42;
                        const radiusY = 35;

                        // Calculate positions in percentages
                        const left = 50 + radiusX * Math.cos(angle);
                        const top = 50 + radiusY * Math.sin(angle);

                        // Colors based on index for variety
                        const isEven = idx % 2 === 0;
                        const ringColor = isEven ? 'border-[#5DE6FF]' : 'border-[#8B7CFF]';
                        const badgeColor = isEven ? 'bg-[#5DE6FF] text-black' : 'bg-[#8B7CFF] text-white';
                        const glowColor = isEven ? 'shadow-[0_0_15px_rgba(93,230,255,0.5)]' : 'shadow-[0_0_15px_rgba(139,124,255,0.5)]';

                        return (
                            <div
                                key={match.profile.id || match.profile._id}
                                className="absolute z-40 reveal-node"
                                style={{
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    transform: 'translate(-50%, -50%)', // Centering the node on the calculated point
                                    animationDelay: `${500 + idx * 200}ms`
                                }}
                            >
                                <div className="flex flex-col items-center group">
                                    {/* Drag Handle / Menu Dots */}
                                    <div className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <div className="grid grid-cols-2 gap-0.5">
                                            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                            <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Avatar Section */}
                                    <div className="relative mb-[-10px] z-20 flex flex-col items-center">
                                        <div className={`w-20 h-20 rounded-full border-2 ${ringColor} p-1 bg-[#0F0C1D] ${glowColor} transition-shadow duration-500`}>
                                            <img
                                                alt={match.profile.full_name}
                                                className="w-full h-full rounded-full object-cover"
                                                src={match.profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAaOZf7n7G1HMD5clSidK04vMqgB31u5IonIUlUo9FKjMHYO80Ztal1uJ7g1_jZtAqe7rEhytZ_pmfsx64eS3Mvr--vNDLVdgVm1YSo84VEfvfzFxfQL7rkf7R949hyiDDq7B9AJQgVZDonf9LROj1BxiIThwsmGRIO5PUdd5pNyuR6RAO81YDtYHRErMpO8tTpqeM4jMuDFe_d-4WWR2cnWeLQGNNijksvaUk3zi1fejNMmGmCzYkzaru7Tbj3Xd-LJ41HijI"}
                                            />
                                        </div>
                                        <div className={`${badgeColor} text-[9px] font-bold px-3 py-0.5 rounded -mt-2 z-30 uppercase tracking-wider`}>
                                            {match.profile.specialization ? match.profile.specialization.split(' ')[0] : 'ENGINEER'}
                                        </div>
                                    </div>

                                    {/* Task Card Section */}
                                    <div className="bg-[#0F0C1D]/80 border border-slate-700/50 rounded-xl p-5 w-56 text-center backdrop-blur-md shadow-2xl relative z-10 pt-6 mt-1 group-hover:border-primary/50 transition-colors">
                                        <h3 className="text-lg font-bold text-white mb-1">{match.profile.full_name.split(' ')[0]}</h3>

                                        <div className="text-[9px] text-[#8B7CFF] uppercase tracking-[0.2em] mb-2 font-mono">
                                            Operational Task
                                        </div>

                                        <div className="text-sm font-bold text-slate-100 mb-4 line-clamp-2 leading-tight min-h-[2.5rem] flex items-center justify-center">
                                            {match.suggested_task || "Core Logic Implementation"}
                                        </div>

                                        <div className="flex justify-between items-center border-t border-white/10 pt-3 text-[10px]">
                                            <span className="text-slate-500 font-mono">DEADLINE</span>
                                            <span className="text-red-400 font-mono font-bold">Priority Alpha</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Central Core Re-Design */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center reveal-core">
                    {/* Floating Orb Icon */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B7CFF] to-[#5DE6FF] flex items-center justify-center shadow-[0_0_40px_rgba(139,124,255,0.6)] z-20 mb-[-20px] animate-pulse-slow border-4 border-[#0F0C1D]">
                        <span className="material-symbols-outlined text-4xl text-white">hub</span>
                    </div>

                    {/* Rectangular Title Box */}
                    <div className="bg-[#120F26] border border-slate-700/50 px-12 pt-10 pb-6 rounded-2xl text-center min-w-[400px] shadow-2xl relative z-10">
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">{projectTitle || "Initializing..."}</h1>
                        <div className="flex items-center justify-center gap-3 opacity-60">
                            <div className="h-px w-8 bg-slate-600"></div>
                            <p className="text-slate-400 font-mono text-[9px] tracking-[0.3em] uppercase">Central Neural Core</p>
                            <div className="h-px w-8 bg-slate-600"></div>
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
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Online</span>
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
