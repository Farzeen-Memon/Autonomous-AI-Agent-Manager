import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import { useUser } from '../context/UserContext';
import '../styles/ProjectDetails.css';

const ProjectDetailsPage = () => {
    const { user, logout: contextLogout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = location.state || {};
    const [projectData, setProjectData] = React.useState(null);
    const [team, setTeam] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [logs, setLogs] = React.useState([
        { id: 1, type: 'ai', title: 'AI RE-OPTIMIZATION', desc: 'Member departure detected. Awaiting trigger to re-map 14 modules.', time: '14:02:55 UTC' },
        { id: 2, type: 'reroute', title: 'TASK REROUTE', desc: 'Task #402-B moved from Felix to Aria.', time: '13:44:12 UTC' },
        { id: 3, type: 'milestone', title: 'MILESTONE REACHED', desc: 'Core Architecture mapping completed for Node Segment Alpha.', time: '11:15:00 UTC' }
    ]);
    const [healthData, setHealthData] = React.useState({ health: 'stable', issues: [], metrics: {} });
    const [simulationData, setSimulationData] = React.useState(null);
    const [isSimulating, setIsSimulating] = React.useState(false);
    const [isApplying, setIsApplying] = React.useState(false);
    const [showSimulation, setShowSimulation] = React.useState(false);

    const getProfileImage = () => {
        const avatar = user?.profile?.avatar_url || user?.profile?.profile_image;
        if (typeof avatar === 'string' && avatar.length > 0) {
            if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            return `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || 'Admin')}&background=8B7CFF&color=fff`;
    };

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    const fetchProjectDetails = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjectData(data.project);
                setTeam(data.team);
                fetchHealth();
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/health`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setHealthData(data);
            }
        } catch (error) {
            console.error('Error fetching health:', error);
        }
    };

    const handleSimulateReplan = async () => {
        setIsSimulating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/replan-simulate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSimulationData(data);
                setShowSimulation(true);
            }
        } catch (error) {
            console.error('Simulation failed:', error);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleApplyReplan = async () => {
        setIsApplying(true);
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/replan-apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tasks: simulationData.proposed_tasks,
                    assignments: simulationData.proposed_assignments
                })
            });
            if (response.ok) {
                const result = await response.json();
                setShowSimulation(false);
                setSimulationData(null);

                // Show success message with deployment details
                const message = `✅ Neural Replan Applied Successfully!\n\n` +
                    `🚀 Project Status: ${result.project_status?.toUpperCase() || 'FINALIZED'}\n` +
                    `📋 Tasks Updated: ${result.tasks_updated || 0}\n` +
                    `👥 Team Size: ${result.team_size || 0}\n` +
                    `📧 Notifications Sent: ${result.notifications_sent || 0}\n\n` +
                    `The project has been deployed to the portfolio and all team members have been notified of their assignments.`;

                alert(message);

                // Navigate to portfolio to see the deployed project
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 1500);
            }
        } catch (error) {
            console.error('Failed to apply replan:', error);
            alert('Failed to apply replanning. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    React.useEffect(() => {
        fetchProjectDetails();

        // Periodic data synchronization (Real-time updates)
        const syncInterval = setInterval(fetchProjectDetails, 10000); // Sync every 10 seconds
        const healthInterval = setInterval(fetchHealth, 15000);

        // Simulate real-time activity context
        const interval = setInterval(() => {
            setLogs(prev => {
                const newLog = {
                    id: Date.now(),
                    type: Math.random() > 0.5 ? 'ai' : 'reroute',
                    title: 'SYSTEM UPDATE',
                    desc: `Neural node ${Math.floor(Math.random() * 1000)} linked successfully.`,
                    time: new Date().toLocaleTimeString() + ' UTC'
                };
                return [newLog, ...prev.slice(0, 4)];
            });
        }, 8000);

        return () => {
            clearInterval(syncInterval);
            clearInterval(interval);
            clearInterval(healthInterval);
        };
    }, [projectId]);

    const totalTasks = projectData?.tasks?.length || 0;
    const completedTasks = projectData?.tasks?.filter(t => t.status === 'completed').length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const calculateDaysLeft = () => {
        if (!projectData?.deadline) return 'TBD';
        const diffTime = new Date(projectData.deadline) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#0B0B14] flex items-center justify-center font-mono text-primary text-xs uppercase tracking-[0.5em] animate-pulse">
                Neural Link Initializing...
            </div>
        );
    }

    return (
        <div className="project-details-container h-screen flex flex-col grid-bg selection:bg-primary selection:text-white overflow-hidden w-full transition-all duration-700">
            {/* Header */}
            <header className="h-16 shrink-0 glass-panel border-b border-white/5 px-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-8">
                    <div className="cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                        <Logo />
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-[16px] font-bold tracking-widest text-slate-400 uppercase">
                        <Link to="/admin/dashboard" className="hover:text-primary transition-colors">Portal</Link>
                        <Link to="#" className="text-white border-b-2 border-primary pb-1">Project Core</Link>
                        <Link to="/admin/employees" className="hover:text-primary transition-colors">Team Meta</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-5">
                    <div className="text-right hidden sm:block">
                        <div className="text-lg font-semibold text-white">{user?.profile?.full_name || 'Admin'}</div>
                        <div className="text-[16px] text-primary font-bold uppercase tracking-widest">ADMIN</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold overflow-hidden shadow-lg shadow-primary/10 transition-transform hover:scale-105">
                        <img
                            alt="Profile"
                            className="w-full h-full object-cover opacity-90"
                            src={getProfileImage()}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || 'Admin')}&background=8B7CFF&color=fff`; }}
                        />
                    </div>
                    <div className="relative cursor-pointer hover:bg-white/5 p-2 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400 text-xl">notifications</span>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0B0B14]"></div>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-1"></div>
                    <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden w-full transition-all duration-500">
                {/* Title and Breadcrumbs Area */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[18px] text-slate-500 uppercase font-mono mb-1">
                            <span
                                className="material-symbols-outlined text-[32px] cursor-pointer hover:text-primary transition-all hover:scale-110 active:scale-95"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                arrow_back
                            </span>
                            Portfolio <span className="mx-1 opacity-30">/</span> <span className="text-slate-300">Active Core</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold tracking-tight font-display uppercase text-white">
                                {projectData?.title || 'Neural Core'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[16px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                                    Confidence: 92%
                                </span>
                                <span className="px-2 py-0.5 rounded text-[16px] font-bold bg-white/5 text-slate-400 border border-white/10 font-mono uppercase">
                                    {projectData?._id?.substring(0, 8).toUpperCase() || 'NODE-00'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded glass-panel border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-base font-bold uppercase tracking-widest text-white">
                            <span className="material-symbols-outlined text-lg">download</span> Export Core
                        </button>
                        <button
                            onClick={() => navigate('/admin/project-matching', { state: { projectId } })}
                            className="px-4 py-2 rounded bg-primary hover:bg-primary/90 transition-all flex items-center gap-2 text-base font-bold text-black shadow-lg shadow-primary/20 uppercase tracking-widest"
                        >
                            <span className="material-symbols-outlined text-lg">psychology</span> Edit Neural
                        </button>
                    </div>
                </div>

                {/* 🟢🟡🔴 HEALTH STATUS BANNER */}
                {healthData && (
                    <div className={`shrink-0 glass-panel border rounded-xl p-5 transition-all duration-500 ${healthData.health === 'critical'
                        ? 'border-red-500/40 bg-red-500/5'
                        : healthData.health === 'warning'
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : 'border-emerald-500/40 bg-emerald-500/5'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Health Indicator */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${healthData.health === 'critical'
                                    ? 'bg-red-500/20 text-red-500'
                                    : healthData.health === 'warning'
                                        ? 'bg-amber-500/20 text-amber-500'
                                        : 'bg-emerald-500/20 text-emerald-500'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        {healthData.health === 'critical' ? 'error' : healthData.health === 'warning' ? 'warning' : 'check_circle'}
                                    </span>
                                </div>

                                {/* Health Info */}
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-lg font-black uppercase tracking-widest ${healthData.health === 'critical'
                                            ? 'text-red-500'
                                            : healthData.health === 'warning'
                                                ? 'text-amber-500'
                                                : 'text-emerald-500'
                                            }`}>
                                            {healthData.health === 'critical' ? '🔴 CRITICAL ALERT' : healthData.health === 'warning' ? '🟡 WARNING STATE' : '🟢 STABLE OPERATION'}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${healthData.health === 'critical'
                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                            : healthData.health === 'warning'
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            }`}>
                                            Risk Score: {healthData.metrics?.risk_score || 0}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">
                                        {healthData.health === 'critical'
                                            ? 'Major risks detected. Immediate replanning recommended.'
                                            : healthData.health === 'warning'
                                                ? 'Minor risks detected. Consider optimization review.'
                                                : 'All systems operational. Project tracking within parameters.'}
                                    </p>
                                    {healthData.issues && healthData.issues.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {healthData.issues.map((issue, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 uppercase tracking-wider">
                                                    {issue.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Metrics Display */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{healthData.metrics?.progress || 0}%</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Progress</div>
                                    {healthData.metrics?.expected_progress > 0 && (
                                        <div className="text-[9px] text-slate-600 mt-0.5">
                                            Expected: {healthData.metrics.expected_progress}%
                                        </div>
                                    )}
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{healthData.metrics?.days_left || 0}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Days Left</div>
                                </div>
                                <div className="w-px h-12 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{healthData.metrics?.max_load || 0}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Max Load</div>
                                </div>

                                {/* Action Button */}
                                {(healthData.health === 'critical' || healthData.health === 'warning') && (
                                    <>
                                        <div className="w-px h-12 bg-white/10"></div>
                                        <button
                                            onClick={handleSimulateReplan}
                                            disabled={isSimulating}
                                            className={`px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg ${healthData.health === 'critical'
                                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                                                : 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30'
                                                } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {isSimulating ? 'refresh' : 'psychology'}
                                            </span>
                                            {isSimulating ? 'Simulating...' : healthData.health === 'critical' ? 'Run Replanning' : 'Review Optimization'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SIMULATION MODAL */}
                {showSimulation && simulationData && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="glass-panel border border-primary/30 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Neural Replanning Simulation</h2>
                                        <p className="text-sm text-slate-400">{simulationData.summary}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowSimulation(false)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-slate-400">close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Proposed Tasks */}
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined">task_alt</span>
                                        Proposed Task Distribution ({simulationData.proposed_tasks?.length || 0} Tasks)
                                    </h3>
                                    <div className="space-y-3">
                                        {simulationData.proposed_tasks?.map((task, idx) => (
                                            <div key={idx} className="glass-panel border border-white/5 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white mb-1">{task.title}</h4>
                                                        <p className="text-sm text-slate-400">{task.description}</p>
                                                        {task.required_skills && task.required_skills.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {task.required_skills.map((skill, sidx) => (
                                                                    <span key={sidx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-slate-400 border border-white/10 uppercase">
                                                        {task.deadline || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Proposed Assignments */}
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined">group</span>
                                        Proposed Team Assignments ({simulationData.proposed_assignments?.length || 0} Members)
                                    </h3>
                                    <div className="space-y-3">
                                        {simulationData.proposed_assignments?.map((assignment, idx) => (
                                            <div key={idx} className="glass-panel border border-white/5 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 overflow-hidden">
                                                            {assignment.profile?.avatar_url ? (
                                                                <img src={assignment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                                                                    {assignment.profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white">{assignment.profile?.full_name || 'Unknown'}</div>
                                                            <div className="text-sm text-slate-400">{assignment.suggested_task}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-primary">{assignment.score}%</div>
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Match Score</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowSimulation(false)}
                                    className="px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyReplan}
                                    disabled={isApplying}
                                    className={`px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-primary hover:bg-primary/90 text-black transition-all shadow-lg shadow-primary/30 flex items-center gap-2 ${isApplying ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">{isApplying ? 'refresh' : 'check_circle'}</span>
                                    {isApplying ? 'Applying...' : 'Apply Neural Plan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Grid Layout */}
                <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                    {/* Left Column (8 units) */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-2">

                        {/* Work Remaining Analysis */}
                        <div className="shrink-0 glass-panel rounded-xl p-6 flex flex-col md:flex-row gap-8 items-center border border-white/10">
                            <div className="shrink-0 flex flex-col items-center justify-center py-2 px-4 border-r border-white/10 mr-4">
                                <span className="text-6xl font-black font-mono text-white leading-none tracking-tighter">{calculateDaysLeft()}</span>
                                <span className="text-[14px] text-slate-500 uppercase tracking-[0.3em] font-bold mt-1">Days</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-lg uppercase tracking-widest font-display text-white">Work Remaining Analysis</h4>
                                    <span className="text-emerald-500 text-[13px] font-bold flex items-center gap-1 uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-base">trending_up</span> +5.2% Velocity
                                    </span>
                                </div>
                                <p className="text-slate-400 text-base leading-relaxed mb-4">
                                    Project is currently <span className="text-primary font-bold">{progressPercent}% complete</span>. The AI engine predicts a stable velocity through the next cluster milestone.
                                </p>
                                <div className="grid grid-cols-4 gap-6">
                                    <div>
                                        <div className="text-[15px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Total Tasks</div>
                                        <div className="text-lg font-bold font-mono text-white">{totalTasks}</div>
                                    </div>
                                    <div>
                                        <div className="text-[15px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Completed</div>
                                        <div className="text-lg font-bold font-mono text-emerald-500">{completedTasks}</div>
                                    </div>
                                    <div>
                                        <div className="text-[15px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Active Nodes</div>
                                        <div className="text-lg font-bold font-mono text-white">{team.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-[15px] text-slate-500 uppercase mb-1 font-bold tracking-widest">Health</div>
                                        <div className={`text-lg font-bold font-mono uppercase ${healthData.health === 'critical' ? 'text-red-500' :
                                            healthData.health === 'warning' ? 'text-amber-500' :
                                                'text-primary'
                                            }`}>{healthData.health}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Tasks */}
                        <div className="shrink-0 glass-panel rounded-xl border border-white/10 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-xl uppercase tracking-widest flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined text-primary text-xl">assignment</span>
                                    Project Tasks
                                </h3>
                                <button className="text-[13px] font-bold text-primary px-3 py-1.5 rounded bg-primary/10 border border-primary/20 uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">add</span> Initialize Task
                                </button>
                            </div>
                            <div className="p-4 space-y-3">
                                {projectData?.tasks?.length > 0 ? [...projectData.tasks].sort((a, b) => {
                                    if (a.assigned_to && !b.assigned_to) return -1;
                                    if (!a.assigned_to && b.assigned_to) return 1;
                                    return 0;
                                }).map((task, idx) => {
                                    const assignee = team.find(m => String(m.profile?._id || m.profile?.id) === String(task.assigned_to));

                                    // Determine status label
                                    let statusLabel = "Not Assigned";
                                    let statusColor = "bg-slate-500/10 text-slate-500 border-slate-500/20";

                                    if (task.status === 'completed') {
                                        statusLabel = "Done";
                                        statusColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                                    } else if (task.status === 'in_progress' || task.status === 'ongoing') {
                                        statusLabel = "In Progress";
                                        statusColor = "bg-primary/10 text-primary border-primary/20";
                                    } else if (task.assigned_to) {
                                        statusLabel = "Assigned";
                                        statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
                                    }

                                    return (
                                        <div key={idx} className={`glass-panel border ${statusLabel === 'Done' ? 'border-emerald-500/30' : 'border-white/5'} rounded-lg p-5 hover:border-primary/40 transition-all group hover:bg-white/[0.02] relative overflow-hidden`}>
                                            {/* Status Badge */}
                                            <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border-l border-b border-white/10 rounded-bl-xl shadow-lg ${statusColor}`}>
                                                {statusLabel}
                                            </div>

                                            <div className="flex items-center justify-between mb-4 pr-32">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${statusLabel === 'Done' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                                        <span className="material-symbols-outlined text-xl">
                                                            {statusLabel === 'Done' ? 'verified' : 'deployed_code'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-xl tracking-tight uppercase group-hover:text-primary transition-colors text-white leading-tight">
                                                            {task.title}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                                                                {task.priority || 'MEDIUM'} IMPACT
                                                            </span>
                                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Load: {task.estimated_hours || 8} Units</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative group/avatar">
                                                        <img
                                                            alt="Assigned"
                                                            className={`w-12 h-12 rounded-full border-2 transition-all ${statusLabel === 'Not Assigned' ? 'border-slate-700 grayscale' : 'border-primary/40 group-hover/avatar:border-primary'} object-cover`}
                                                            src={(() => {
                                                                const avatar = assignee?.profile?.avatar_url || assignee?.profile?.profile_image;
                                                                if (avatar) {
                                                                    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
                                                                    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                                                                    return `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`;
                                                                }
                                                                return `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee?.profile?.full_name || 'User')}&background=8B7CFF&color=fff`;
                                                            })()}
                                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee?.profile?.full_name || 'User')}&background=8B7CFF&color=fff`; }}
                                                        />
                                                        {statusLabel === 'Done' && (
                                                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 border-2 border-[#120F26] flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                                                <span className="material-symbols-outlined text-[12px] text-white font-black">check</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] text-white font-bold uppercase tracking-tight group-hover:text-primary transition-colors">
                                                            {assignee?.profile?.full_name || 'NEURAL DISCONNECTION'}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-mono uppercase tracking-widest opacity-60">
                                                            {assignee?.profile?.specialization || 'AUTO-BALANCING PENDING'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 opacity-40">Baseline Target</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm text-primary">event</span>
                                                        <span className="text-lg font-mono text-white font-bold tracking-tighter">{task.deadline || 'SCHEDULED'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                                        <p className="text-[13px] font-black uppercase tracking-widest">No active tasks assigned to this core</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Performance */}
                        <div className="shrink-0 glass-panel rounded-xl border border-white/10 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-xl uppercase tracking-widest flex items-center gap-2 text-white">
                                    <span className="material-symbols-outlined text-primary text-xl">groups</span>
                                    Team Performance
                                </h3>
                                <button className="text-[13px] font-bold text-slate-400 px-3 py-1.5 rounded bg-white/5 border border-white/10 uppercase hover:bg-white/10 transition-all tracking-widest">Manage Hub</button>
                            </div>
                            <div className="p-4 space-y-6">
                                {team.length > 0 ? team.map((member, idx) => {
                                    const memberId = String(member.profile?._id || member.profile?.id || idx);
                                    const memberTasks = projectData?.tasks?.filter(t => String(t.assigned_to) === memberId) || [];
                                    const memberPerformance = memberTasks.length > 0 ? Math.round((memberTasks.filter(t => t.status === 'completed').length / memberTasks.length) * 100) : 0;

                                    return (
                                        <div key={idx} className="flex items-center gap-6 p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                            <div className="relative shrink-0">
                                                <img
                                                    alt="Team member"
                                                    className="w-12 h-12 rounded-full ring-2 ring-primary/20 p-0.5 bg-slate-800 object-cover"
                                                    src={member.profile?.avatar_url ? (member.profile.avatar_url.startsWith('http') ? member.profile.avatar_url : `${API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL}${member.profile.avatar_url.startsWith('/') ? member.profile.avatar_url : '/' + member.profile.avatar_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.profile?.full_name || 'User')}&background=8B7CFF&color=fff`}
                                                />
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background-dark flex items-center justify-center ${memberPerformance > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                    <span className="material-symbols-outlined text-[11px] text-white font-bold">
                                                        {memberPerformance > 50 ? 'check' : 'priority_high'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-white">{member.profile?.full_name || 'Disconnected Node'}</h4>
                                                        <div className="text-[15px] font-mono text-slate-500 uppercase tracking-widest">
                                                            {member.skills?.[0]?.skill_name || 'MODULE SPECIALIST'}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-[15px] text-slate-500 uppercase font-bold mb-1 tracking-widest flex gap-2">
                                                            Operational Load <span className="opacity-40">({memberTasks.filter(t => t.status === 'completed').length}/{memberTasks.length})</span>
                                                        </div>
                                                        <div className="w-40 sm:w-64 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${memberPerformance > 50 ? 'progress-gradient' : 'bg-primary'}`}
                                                                style={{ width: `${memberPerformance}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-[20px] font-mono font-black w-14 text-right transition-colors ${memberPerformance === 100 ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'text-primary'}`}>
                                                        {memberPerformance}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-20">group_off</span>
                                        <p className="text-[13px] font-black uppercase tracking-widest">No team members mapped to this project</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column (4 units) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
                        {/* Project Health Engine (Step 2 & 3) */}
                        <div className={`glass-panel p-6 rounded-xl border transition-all duration-500 flex flex-col gap-4 ${healthData.health === 'critical' ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]' :
                            healthData.health === 'warning' ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]' :
                                'border-emerald-500/20 bg-emerald-500/5'
                            }`}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-[15px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-xl ${healthData.health === 'critical' ? 'text-red-500 animate-pulse' :
                                        healthData.health === 'warning' ? 'text-amber-500' :
                                            'text-emerald-500'
                                        }`}>
                                        {healthData.health === 'critical' ? 'emergency_home' :
                                            healthData.health === 'warning' ? 'monitoring' :
                                                'verified_user'}
                                    </span>
                                    Project Health Core
                                </h3>
                                <div className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-widest border ${healthData.health === 'critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                    healthData.health === 'warning' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                                        'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                                    }`}>
                                    {healthData.health}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {healthData.health === 'stable' && (
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Neural synchronization is <span className="text-emerald-500 font-bold">Optimal</span>. All modules are tracking against baseline without detected drift.
                                    </p>
                                )}

                                {healthData.health !== 'stable' && (
                                    <div className="space-y-2">
                                        <p className="text-slate-300 text-sm font-bold uppercase tracking-widest mb-2">Detected Issues:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {healthData.issues.map((issue, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2 text-[11px] font-bold text-slate-300 uppercase">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {issue.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3 - Health States UI behavior */}
                                <div className="mt-2">
                                    {healthData.health === 'warning' && (
                                        <button
                                            onClick={handleSimulateReplan}
                                            disabled={isSimulating}
                                            className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black text-xs uppercase tracking-[0.2em] rounded-lg hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isSimulating ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">psychology</span>}
                                            Review Optimization
                                        </button>
                                    )}

                                    {healthData.health === 'critical' && (
                                        <button
                                            onClick={handleSimulateReplan}
                                            disabled={isSimulating}
                                            className="w-full py-3 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {isSimulating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">rocket_launch</span>}
                                            Run Replanning
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Stats Cards */}
                        <div className="shrink-0 grid grid-cols-2 gap-4">
                            <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all cursor-default">
                                <div className="text-[15px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Logged Hours</div>
                                <div className="text-4xl font-bold font-mono text-white">1,240</div>
                                <div className="text-[15px] text-emerald-500 font-bold mt-1 flex items-center gap-1 tracking-widest">
                                    <span className="material-symbols-outlined text-[13px] font-bold">arrow_upward</span> +5.2%
                                </div>
                            </div>
                            <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-default text-right">
                                <div className="text-[15px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Neural Load</div>
                                <div className="text-4xl font-bold font-mono text-primary">{progressPercent}%</div>
                                <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(139,124,255,0.6)]" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="h-16 shrink-0 glass-panel border-t border-white/10 px-6 z-50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <span className="material-symbols-outlined text-lg font-bold">verified</span>
                        <span className="text-[13px] font-bold uppercase tracking-widest">Tasks balanced</span>
                    </div>
                    <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                    <div className="flex items-center gap-6 hidden sm:flex">
                        <div className="flex items-center gap-2 text-accent-amber">
                            <span className="material-symbols-outlined text-lg font-bold">warning</span>
                            <span className="text-[15px] font-bold uppercase tracking-widest">2 tasks at risk</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-400">
                            <span className="material-symbols-outlined text-lg font-bold">error</span>
                            <span className="text-[15px] font-bold uppercase tracking-widest">1 resource overload</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[13px] font-black uppercase tracking-widest text-slate-600 mr-4">© Nexo 2026</span>
                    <button className="px-4 py-2 rounded text-slate-400 hover:text-white transition-colors text-[13px] font-bold uppercase tracking-widest">Save Draft</button>
                    <button className="px-6 py-2 rounded bg-primary hover:bg-primary/80 transition-all text-black font-black text-[18px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                        Confirm Deployment <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                    </button>
                    <button className="ml-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-center transition-all group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">terminal</span>
                    </button>
                </div>
            </footer>

            {/* Background Decorative Blurs */}
            <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none opacity-50"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-accent-amber/5 blur-[120px] pointer-events-none opacity-50"></div>

            {/* Replanning Simulation Drawer (Step 4 & 5) */}
            {showSimulation && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowSimulation(false)}></div>
                    <div className="w-full max-w-6xl glass-panel border-t border-white/10 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40">
                                    <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Neural Re-Optimization Simulator</h2>
                                    <p className="text-xs text-slate-500 font-mono tracking-widest">{simulationData?.summary}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSimulation(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-12 custom-scrollbar">
                            {/* Current Plan (Comparison) */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 pb-2">Active Plan (Legacy)</h3>
                                <div className="space-y-3 opacity-40">
                                    {projectData?.tasks.map((task, i) => (
                                        <div key={i} className="p-4 border border-white/5 rounded-lg flex items-center justify-between">
                                            <div className="text-left font-bold text-sm text-white uppercase">{task.title}</div>
                                            <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">NODE: {String(task.assigned_to).substring(0, 6)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Proposed Plan (Simulation) */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 border-b border-emerald-500/20 pb-2">Simulated Result (Optimized)</h3>
                                <div className="space-y-3">
                                    {simulationData?.proposed_assignments.map((assignment, i) => (
                                        <div key={i} className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex items-center justify-between animate-pulse-slow">
                                            <div className="text-left">
                                                <div className="font-bold text-sm text-white uppercase">{assignment.suggested_task}</div>
                                                <div className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase">{assignment.profile.full_name}</div>
                                            </div>
                                            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded uppercase">NEW ROUTE</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-slate-400 italic text-sm">
                                <span className="material-symbols-outlined text-emerald-500">info</span>
                                Proposing {simulationData?.proposed_tasks.length} module adjustments for optimal neural balance.
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowSimulation(false)}
                                    className="px-6 py-3 rounded-lg border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5"
                                >
                                    Cancel Adjustments
                                </button>
                                <button
                                    onClick={handleApplyReplan}
                                    disabled={isApplying}
                                    className="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
                                >
                                    {isApplying ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined">check_circle</span>}
                                    Apply Neural Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetailsPage;
