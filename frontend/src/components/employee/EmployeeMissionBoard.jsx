import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import Logo from '../common/Logo';
import { API_BASE_URL } from '../../utils/constants';

const EmployeeMissionBoard = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState({
        backlog: [],
        inProgress: [],
        completed: []
    });
    const [loading, setLoading] = useState(true);

    const getProfileImage = () => {
        if (user?.profile?.profile_picture_url) {
            return `${API_BASE_URL}${user.profile.profile_picture_url}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8B7CFF&color=fff`;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'PENDING';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    };

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.id) return;

            try {
                // In a real app, you would fetch tasks assigned to this employee
                // For now, we'll simulate some tasks or fetch from an endpoint if available
                // const response = await fetch(`${API_BASE_URL}/api/tasks/employee/${user.id}`);

                // Simulating data for the "Cyberpunk/Mission" aesthetic
                setTimeout(() => {
                    setTasks({
                        backlog: [
                            { id: 1, title: 'Fraud Detection Enhancement', description: 'Implement ML models to detect high-velocity transaction patterns.', priority: 'low', deadline: '2026-05-15' },
                            { id: 2, title: 'OAuth2 Security Audit', description: 'Review all merchant dashboard authentication scopes and token lifecycles.', priority: 'medium', deadline: '2026-05-20' }
                        ],
                        inProgress: [
                            { id: 3, title: 'Backend API Migration', description: 'Phase 2: Payment platform infrastructure revamp and load balancing.', priority: 'high', deadline: new Date().toISOString(), progress: 65 }
                        ],
                        completed: [
                            { id: 4, title: 'Database Schema Update', description: 'PostgreSQL indexing for faster query response times in EU clusters.', completed_at: new Date(Date.now() - 86400000).toISOString() },
                            { id: 5, title: 'Legacy Code Deprecation', description: 'Removed v1 auth endpoints.', completed_at: new Date(Date.now() - 172800000).toISOString() }
                        ]
                    });
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user]);

    const getPriorityStyle = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-[var(--electric-purple)]/20 text-[var(--electric-purple)] border-[var(--electric-purple)]/40';
            case 'medium':
                return 'bg-[var(--electric-purple)]/10 text-[var(--electric-purple)] border-[var(--electric-purple)]/20';
            case 'low':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default:
                return 'bg-white/10 text-white border-white/20';
        }
    };

    return (
        <>
            <style>{`
                :root {
                    --carbon-black: #0F0C1D;
                    --card-bg: #1B1730;
                    --electric-purple: #8B7CFF;
                    --soft-cyan: #5DE6FF;
                    --obsidian: rgba(27, 23, 48, 0.9);
                }
                .bg-grid {
                    background-image: 
                        linear-gradient(to right, rgba(139, 124, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(139, 124, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .glass-header {
                    background: rgba(15, 12, 29, 0.7);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .kanban-column-header {
                    background: rgba(27, 23, 48, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(139, 124, 255, 0.1);
                }
                .task-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .task-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                    border-color: var(--electric-purple);
                }
                .glow-border {
                    box-shadow: 0 0 20px rgba(139, 124, 255, 0.15);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--electric-purple);
                    border-radius: 10px;
                }
                .pulse-cyan {
                    box-shadow: 0 0 0 0 rgba(93, 230, 255, 0.4);
                    animation: pulse-cyan 2s infinite;
                }
                .pulse-purple {
                    box-shadow: 0 0 0 0 rgba(139, 124, 255, 0.4);
                    animation: pulse-purple 2s infinite;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                @keyframes pulse-cyan {
                    70% { box-shadow: 0 0 0 6px rgba(93, 230, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(93, 230, 255, 0); }
                }
                @keyframes pulse-purple {
                    70% { box-shadow: 0 0 0 6px rgba(139, 124, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(139, 124, 255, 0); }
                }
            `}</style>

            <div className="antialiased flex overflow-hidden h-screen bg-[var(--carbon-black)] text-[#E2E8F0] font-['Plus_Jakarta_Sans']">
                <div className="fixed inset-0 bg-grid pointer-events-none"></div>

                {/* Sidebar */}
                <nav className="w-16 h-full flex flex-col items-center py-6 border-r border-white/5 bg-[var(--carbon-black)] z-50">
                    <div className="w-10 h-10 bg-[var(--electric-purple)] rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,124,255,0.4)] mb-auto shrink-0 animate-pulse">
                        <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </nav>

                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Status indicators */}
                    <div className="absolute top-[80px] left-6 z-10 font-mono text-[9px] text-[var(--electric-purple)]/60 tracking-widest uppercase pointer-events-none hidden md:block">
                        Sync: 98% <span className="text-white/20 mx-2">|</span> Core Latency: 2ms
                    </div>
                    <div className="absolute top-[80px] right-80 z-10 font-mono text-[9px] text-[var(--soft-cyan)]/60 tracking-widest uppercase text-right pointer-events-none hidden md:block">
                        Neural Link: Active
                    </div>

                    {/* Header */}
                    <header className="h-20 glass-header px-6 flex items-center justify-between z-40 shrink-0 gap-4">
                        <div className="flex items-center gap-8 min-w-0">
                            <h1 className="font-display font-bold text-xl tracking-tight text-white uppercase whitespace-nowrap">
                                Nexo <span className="text-white/40 font-light ml-2 text-xs tracking-[0.2em] hidden sm:inline">Mission Board</span>
                            </h1>
                            <div className="hidden lg:flex gap-8 items-center text-sm border-l border-white/10 pl-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[var(--soft-cyan)] pulse-cyan"></div>
                                    <span className="opacity-60 text-[10px] uppercase tracking-wider font-bold text-white/80">Focus</span>
                                    <span className="font-bold text-[var(--soft-cyan)] font-mono text-base">92%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[var(--electric-purple)] pulse-purple"></div>
                                    <span className="opacity-60 text-[10px] uppercase tracking-wider font-bold text-white/80">Efficiency</span>
                                    <span className="font-bold text-[var(--electric-purple)] font-mono text-base">94%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 shrink-0">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white truncate max-w-[150px]">{user?.name || 'Loading...'}</p>
                                <p className="text-[9px] text-[var(--soft-cyan)] uppercase tracking-widest truncate max-w-[150px]">
                                    {user?.profile?.specialization || user?.profile?.role || 'Employee'}
                                </p>
                            </div>
                            <div className="relative">
                                <img
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border-2 border-[var(--electric-purple)]/30 p-0.5 object-cover"
                                    src={getProfileImage()}
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--soft-cyan)] border-2 border-[var(--carbon-black)] rounded-full"></div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-all"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined">power_settings_new</span>
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 overflow-hidden relative p-6 pb-2 gap-8">
                        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
                            <div className="flex justify-between items-end mb-8 flex-wrap gap-4 shrink-0">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase leading-none">Mission Control</h2>
                                    <span className="text-[10px] text-[var(--electric-purple)] font-mono uppercase tracking-[0.3em] opacity-60">System Protocol: Active</span>
                                </div>
                                <button className="bg-[var(--electric-purple)] hover:bg-[#7a6bed] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(139,124,255,0.4)] z-10 whitespace-nowrap">
                                    <span className="material-symbols-outlined text-sm">add_task</span> INITIALIZE NEW MISSION
                                </button>
                            </div>

                            {/* Kanban Columns - Full Height Filling */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                                {/* BACKLOG Column */}
                                <div className="flex flex-col h-full min-h-0 bg-white/[0.01] rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-3">
                                            BACKLOG <span className="w-5 h-5 flex items-center justify-center bg-white/5 rounded text-[10px] font-mono text-white/80">{String(tasks.backlog.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-base text-white/20">terminal</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.backlog.map((task, index) => (
                                            <div key={index} className="task-card bg-[var(--card-bg)] border border-[var(--electric-purple)]/20 p-5 rounded-2xl shadow-xl">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[9px] px-2 py-1 font-bold rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority || 'Medium'} Priority
                                                    </span>
                                                    <span className="material-symbols-outlined text-lg opacity-20 hover:opacity-100 cursor-grab">drag_handle</span>
                                                </div>
                                                <h4 className="font-bold text-sm mb-2 text-white/90 break-words">{task.title}</h4>
                                                <p className="text-xs text-white/50 leading-relaxed mb-4 line-clamp-2 break-words">{task.description}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--soft-cyan)]/50 font-mono border-t border-white/5 pt-3">
                                                    <span className="material-symbols-outlined text-xs">event_upcoming</span>
                                                    <span>DUE: {formatDate(task.deadline)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* IN PROGRESS Column - Highlighted */}
                                <div className="flex flex-col h-full min-h-0 bg-[var(--electric-purple)]/[0.02] rounded-2xl border border-[var(--electric-purple)]/30 ring-1 ring-[var(--electric-purple)]/10 shadow-[0_0_30px_rgba(139,124,255,0.05)]">
                                    <div className="flex items-center justify-between p-4 border-b border-[var(--electric-purple)]/20">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--electric-purple)] flex items-center gap-3">
                                            IN PROGRESS <span className="w-5 h-5 flex items-center justify-center bg-[var(--electric-purple)]/20 rounded text-[10px] font-mono text-white">{String(tasks.inProgress.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-base text-[var(--electric-purple)] animate-pulse">sensors</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.inProgress.map((task, index) => (
                                            <div key={index} className="task-card bg-[#1E1935] border border-[var(--electric-purple)] p-5 rounded-2xl shadow-[0_0_20px_rgba(139,124,255,0.15)] glow-border">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[9px] px-2 py-1 font-bold rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority || 'High'} Priority
                                                    </span>
                                                    <span className="material-symbols-outlined text-lg text-[var(--electric-purple)]">radar</span>
                                                </div>
                                                <h4 className="font-bold text-sm mb-2 text-white break-words">{task.title}</h4>
                                                <p className="text-xs text-white/60 leading-relaxed mb-5 line-clamp-2 break-words">{task.description}</p>
                                                {task.progress !== undefined && (
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex justify-between text-[9px] font-mono text-[var(--electric-purple)]">
                                                            <span>PROGRESS</span>
                                                            <span>{task.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-[var(--electric-purple)] h-full shadow-[0_0_10px_rgba(139,124,255,1)]" style={{ width: `${task.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--electric-purple)] font-mono border-t border-[var(--electric-purple)]/20 pt-3">
                                                    <span className="material-symbols-outlined text-xs">warning</span>
                                                    <span>DUE: {formatDate(task.deadline)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* COMPLETED Column */}
                                <div className="flex flex-col h-full min-h-0 bg-white/[0.01] rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--soft-cyan)] flex items-center gap-3">
                                            COMPLETED <span className="w-5 h-5 flex items-center justify-center bg-[var(--soft-cyan)]/20 rounded text-[10px] font-mono text-[var(--soft-cyan)]">{String(tasks.completed.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-base text-[var(--soft-cyan)]">verified</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.completed.map((task, index) => (
                                            <div key={index} className="task-card bg-[var(--card-bg)]/40 border border-[var(--soft-cyan)]/10 p-5 rounded-2xl opacity-70 hover:opacity-100 transition-opacity">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[9px] px-2 py-1 bg-[var(--soft-cyan)]/10 text-[var(--soft-cyan)] font-bold rounded border border-[var(--soft-cyan)]/20 uppercase tracking-wider">Archived</span>
                                                    <span className="material-symbols-outlined text-[var(--soft-cyan)] text-sm">check_circle</span>
                                                </div>
                                                <h4 className="font-bold text-sm mb-2 text-white/80 break-words">{task.title}</h4>
                                                <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2 break-words">{task.description}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono border-t border-white/5 pt-3">
                                                    <span className="material-symbols-outlined text-xs">done_all</span>
                                                    <span>COMPLETED: {formatDate(task.completed_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Stats */}
                        <aside className="w-[300px] flex flex-col gap-6 shrink-0 relative z-30 hidden xl:flex">
                            <div className="h-full flex flex-col bg-[var(--card-bg)] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                                {/* Top accent line */}
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--soft-cyan)] to-transparent opacity-50"></div>

                                <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/5 pb-4">Weekly Progress</h3>

                                    {/* Circular Chart */}
                                    <div className="relative flex items-center justify-center mb-10">
                                        <svg className="w-48 h-48 transform -rotate-90">
                                            <circle className="text-[#151125]" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                                            <circle className="text-[var(--electric-purple)] drop-shadow-[0_0_15px_rgba(139,124,255,0.4)]" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502.6" strokeDashoffset="50.2" strokeLinecap="round" strokeWidth="12"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-display font-bold text-white tracking-tighter drop-shadow-lg">90%</span>
                                            <span className="text-[9px] uppercase text-[var(--soft-cyan)] font-bold tracking-[0.2em] mt-2">Efficiency Peak</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="bg-[#151125] p-4 rounded-xl border border-white/5 text-center group hover:border-[var(--electric-purple)]/30 transition-colors">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Missions</p>
                                            <p className="text-2xl font-display font-medium text-white group-hover:scale-110 transition-transform">
                                                {tasks.completed.length + tasks.inProgress.length}
                                                <span className="text-[12px] text-white/20 ml-1">/15</span>
                                            </p>
                                        </div>
                                        <div className="bg-[#151125] p-4 rounded-xl border border-white/5 text-center group hover:border-[var(--soft-cyan)]/30 transition-colors">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">XP Earned</p>
                                            <p className="text-2xl font-display font-medium text-[var(--soft-cyan)] group-hover:scale-110 transition-transform">2.4k</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4 border-b border-white/5 pb-2">Momentum Metrics</h3>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-orange-400 text-lg group-hover:scale-110 transition-transform">local_fire_department</span>
                                                    <span className="text-xs text-white/70 font-medium">Focus Streak</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-white">3 DAYS</span>
                                            </div>
                                            <div className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[var(--soft-cyan)] text-lg group-hover:scale-110 transition-transform">auto_graph</span>
                                                    <span className="text-xs text-white/70 font-medium">Velocity Delta</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-[var(--soft-cyan)]">+12.4%</span>
                                            </div>
                                            <div className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[var(--electric-purple)] text-lg group-hover:scale-110 transition-transform">memory</span>
                                                    <span className="text-xs text-white/70 font-medium">Neural Load</span>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-white">MID-RANGE</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-5 bg-[var(--electric-purple)]/[0.03] rounded-2xl border border-[var(--electric-purple)]/20 relative overflow-hidden group hover:bg-[var(--electric-purple)]/[0.05] transition-colors">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--electric-purple)]/10 blur-3xl rounded-full"></div>
                                        <div className="flex items-center gap-2 mb-3 text-[var(--soft-cyan)]">
                                            <span className="material-symbols-outlined text-base">lightbulb</span>
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">System Optimization</span>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-white/60">Complete 2 more high-priority tasks by Friday to achieve your efficiency bonus.</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </main>

                    {/* Footer */}
                    <footer className="h-10 border-t border-white/5 bg-[var(--carbon-black)] px-8 flex items-center justify-between z-40 hidden md:flex shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[var(--electric-purple)] text-lg">timeline</span>
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em]">Temporal Track</span>
                        </div>
                        <div className="flex-1 max-w-3xl mx-12 h-1 bg-white/5 rounded-full overflow-hidden flex items-center">
                            <div className="w-[15%] h-full bg-[var(--electric-purple)] opacity-20"></div>
                            <div className="w-[20%] h-full bg-[var(--electric-purple)] opacity-60 shadow-[0_0_10px_#8B7CFF]"></div>
                            <div className="flex-1 h-full"></div>
                            <div className="w-[10%] h-full bg-[var(--soft-cyan)] opacity-80 shadow-[0_0_10px_#5DE6FF]"></div>
                        </div>
                        <div className="flex items-center gap-8 text-[9px] font-mono font-bold uppercase text-white/20">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--soft-cyan)] animate-pulse"></div>
                                <span className="text-[var(--electric-purple)]">LIVE TRACE</span>
                            </div>
                            <div className="flex gap-6">
                                <span className="hover:text-white cursor-pointer">MON</span>
                                <span className="text-[var(--electric-purple)] border border-[var(--electric-purple)]/50 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(139,124,255,0.2)]">WED</span>
                                <span className="hover:text-white cursor-pointer">FRI</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default EmployeeMissionBoard;
