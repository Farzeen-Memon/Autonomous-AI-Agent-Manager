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
    const [showDeadlineModal, setShowDeadlineModal] = React.useState(false);
    const [extensionData, setExtensionData] = React.useState({ new_deadline: '', reason: '' });
    const [isStaged, setIsStaged] = React.useState(false);
    const [stagedData, setStagedData] = React.useState(null);
    const [showSuccessModal, setShowSuccessModal] = React.useState(false);

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

    const handleStageSimulation = () => {
        if (!simulationData) return;

        // "Apply" locally to states
        // Map simulation assignments to team format { profile, skills }
        const newTeam = simulationData.proposed_assignments.map(a => ({
            profile: a.profile,
            skills: a.skills
        }));

        setTeam(newTeam);
        // We don't update tasks in projectData directly yet, or we can if we want the UI to show them
        setProjectData(prev => ({
            ...prev,
            tasks: simulationData.proposed_tasks
        }));

        setStagedData(simulationData);
        setIsStaged(true);
        setShowSimulation(false);

        // Add a log for the staging
        setLogs(prev => [
            { id: Date.now(), type: 'ai', title: 'PLAN STAGED', desc: 'Neural optimization staged. Awaiting final deployment.', time: new Date().toLocaleTimeString() + ' UTC' },
            ...prev.slice(0, 4)
        ]);
    };

    const handleApplyReplan = async () => {
        const dataToApply = stagedData || simulationData;

        // If no replanning data (simulated or staged), simply navigate to dashboard
        if (!dataToApply) {
            navigate('/admin/dashboard');
            return;
        }

        setIsApplying(true);
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/replan-apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tasks: dataToApply.proposed_tasks,
                    assignments: dataToApply.proposed_assignments
                })
            });
            if (response.ok) {
                const result = await response.json();
                setShowSimulation(false);
                setSimulationData(null);
                setStagedData(null);
                setIsStaged(false);

                // Show Success Modal instead of immediate navigation
                setShowSuccessModal(true);
            } else {
                const errorData = await response.json();
                console.error('Replan failed:', errorData);
                alert(`Failed to apply replanning: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to apply replan:', error);
            alert(`Failed to apply replanning. Network or server error: ${error.message}`);
        } finally {
            setIsApplying(false);
        }
    };

    const handleExtendDeadline = async () => {
        if (!extensionData.new_deadline) {
            alert('Please select a new deadline.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/extend-deadline`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(extensionData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ ${result.message}\nNew Deadline: ${result.new_deadline}\nNotifications Sent: ${result.notifications_sent}`);
                setShowDeadlineModal(false);
                fetchProjectDetails(); // Refresh health and details
            } else {
                const error = await response.json();
                alert(`❌ Failed: ${error.detail}`);
            }
        } catch (error) {
            console.error('Failed to extend deadline:', error);
            alert('An error occurred while extending the deadline.');
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

                                {/* Optimization Cycles Counter & History */}
                                <div className="relative group cursor-help flex items-center gap-2 px-3 py-0.5 rounded text-[13px] font-bold text-slate-400 border border-white/10 hover:bg-white/5 transition-all uppercase tracking-widest ml-2">
                                    <span className="material-symbols-outlined text-base">history</span>
                                    <span>Opt. Cycles: {projectData?.optimization_cycles || 0}</span>

                                    {/* History Tooltip */}
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-[#120F26] border border-white/10 rounded-xl p-4 shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50 pointer-events-none group-hover:pointer-events-auto backdrop-blur-xl">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">tune</span>
                                                Neural History
                                            </h4>
                                            <span className="text-[9px] font-mono text-slate-500">{projectData?.optimization_history?.length || 0} EVENTS</span>
                                        </div>

                                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                            {(projectData?.optimization_history && projectData.optimization_history.length > 0) ? (
                                                [...projectData.optimization_history].reverse().map((h, i) => (
                                                    <div key={i} className="text-left relative pl-3 border-l border-white/10 pb-1">
                                                        <div className="absolute left-[-1.5px] top-[6px] w-[3px] h-[3px] bg-primary rounded-full"></div>
                                                        <div className="text-[11px] text-white font-bold tracking-tight mb-0.5">
                                                            Cycle {projectData.optimization_history.length - i} <span className="text-slate-500 font-normal mx-1">•</span> {h.reason || 'adjustments'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 leading-snug mb-1">
                                                            {h.changes_summary || 'Minor parameter tuning'}
                                                        </div>
                                                        <div className="text-[9px] font-mono text-slate-600 uppercase">
                                                            {new Date(h.date || Date.now()).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-4 text-slate-600">
                                                    <span className="material-symbols-outlined text-2xl mb-1 opacity-40">history_toggle_off</span>
                                                    <p className="text-[10px] uppercase tracking-widest">No structural optimizations recorded</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                {
                    healthData && (
                        <div className={`shrink-0 glass-panel border rounded-xl p-5 transition-all duration-500 ${healthData.health === 'critical'
                            ? 'border-red-500/40 bg-red-500/5'
                            : healthData.health === 'overdue'
                                ? 'border-rose-600/40 bg-rose-600/5'
                                : healthData.health === 'warning'
                                    ? 'border-amber-500/40 bg-amber-500/5'
                                    : 'border-emerald-500/40 bg-emerald-500/5'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Health Indicator */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${healthData.health === 'critical'
                                        ? 'bg-red-500/20 text-red-500'
                                        : healthData.health === 'overdue'
                                            ? 'bg-rose-600/20 text-rose-500 animate-pulse'
                                            : healthData.health === 'warning'
                                                ? 'bg-amber-500/20 text-amber-500'
                                                : 'bg-emerald-500/20 text-emerald-500'
                                        }`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {healthData.health === 'overdue' ? 'timelapse' : healthData.health === 'critical' ? 'error' : healthData.health === 'warning' ? 'warning' : 'check_circle'}
                                        </span>
                                    </div>

                                    {/* Health Info */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className={`text-lg font-black uppercase tracking-widest ${healthData.health === 'critical'
                                                ? 'text-red-500'
                                                : healthData.health === 'overdue'
                                                    ? 'text-rose-500'
                                                    : healthData.health === 'warning'
                                                        ? 'text-amber-500'
                                                        : 'text-emerald-500'
                                                }`}>
                                                {healthData.health === 'overdue' ? '🔴 PROJECT OVERDUE' : healthData.health === 'critical' ? '🔴 CRITICAL ALERT' : healthData.health === 'warning' ? '🟡 WARNING STATE' : '🟢 STABLE OPERATION'}
                                            </h3>
                                            {isStaged && (
                                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Replanning Successful
                                                </span>
                                            )}
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
                                                : healthData.health === 'overdue'
                                                    ? `Original deadline missed by ${Math.abs(healthData.metrics?.days_left || 0)} days. AI recommends timeline recovery.`
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

                                    {/* Action Buttons */}
                                    {(healthData.health === 'critical' || healthData.health === 'warning' || healthData.health === 'overdue') && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-px h-12 bg-white/10 mx-2"></div>
                                            <button
                                                onClick={handleSimulateReplan}
                                                disabled={isSimulating}
                                                className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all shadow-lg ${healthData.health === 'overdue'
                                                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                                                    : healthData.health === 'critical'
                                                        ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                                                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {healthData.health === 'overdue' ? 'history_toggle_off' : healthData.health === 'critical' ? 'rocket_launch' : 'psychology'}
                                                </span>
                                                {isSimulating ? 'Analyzing...' : healthData.health === 'overdue' ? 'Apply Recovery Plan' : healthData.health === 'critical' ? 'Run Replanning' : 'Review Optimization'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setExtensionData({
                                                        new_deadline: projectData?.deadline ? projectData.deadline.split('T')[0] : '',
                                                        reason: ''
                                                    });
                                                    setShowDeadlineModal(true);
                                                }}
                                                className="px-4 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 shadow-emerald-500/5"
                                            >
                                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                                Extend
                                            </button>
                                            {healthData.health === 'overdue' && (
                                                <button
                                                    className="px-4 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all border border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                                                    onClick={() => alert("Scope reduction wizard would open here.")}
                                                >
                                                    <span className="material-symbols-outlined text-lg">content_cut</span>
                                                    Reduce Scope
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }




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
                                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] border-l border-b border-white/10 rounded-bl-xl shadow-lg ${statusColor}`}>
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

                                    {healthData.health === 'overdue' && (
                                        <button
                                            onClick={handleSimulateReplan}
                                            disabled={isSimulating}
                                            className="w-full py-3 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-lg shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:bg-rose-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {isSimulating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-lg">history_toggle_off</span>}
                                            Apply Recovery Plan
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
            </main >

            {/* Footer */}
            < footer className="h-16 shrink-0 glass-panel border-t border-white/10 px-6 z-50 flex items-center justify-between" >
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
                    <button
                        onClick={handleApplyReplan}
                        disabled={isApplying}
                        className={`px-6 py-2 rounded transition-all text-black font-black text-[18px] uppercase tracking-widest shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${isStaged ? 'bg-primary shadow-primary/20' : 'bg-primary/60 shadow-primary/10'}`}
                    >
                        {isApplying ? 'Processing...' : 'Confirm Deployment'} <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                    </button>
                    <button className="ml-4 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-center transition-all group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">terminal</span>
                    </button>
                </div>
            </footer >

            {/* Background Decorative Blurs */}
            < div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 blur-[120px] pointer-events-none opacity-50" ></div >
            <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-accent-amber/5 blur-[120px] pointer-events-none opacity-50"></div>

            {/* Replanning Simulation Drawer (Step 4 & 5) */}
            {
                showSimulation && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setShowSimulation(false)}></div>
                        <div className="w-full max-w-6xl glass-panel border-t border-white/10 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto animate-slide-up flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${healthData?.health === 'overdue' ? 'bg-rose-600/20 border-rose-600/40 text-rose-500' : 'bg-primary/20 border-primary/40 text-primary'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {healthData?.health === 'overdue' ? 'history_toggle_off' : 'psychology'}
                                        </span>
                                    </div>
                                    <div className="text-left">
                                        <h2 className={`text-xl font-black uppercase tracking-widest ${healthData?.health === 'overdue' ? 'text-rose-500' : 'text-white'}`}>
                                            {healthData?.health === 'overdue' ? 'Neural Recovery Simulator' : 'Neural Re-Optimization Simulator'}
                                        </h2>
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
                                    <h3 className={`text-sm font-black uppercase tracking-[0.3em] border-b pb-2 ${healthData?.health === 'overdue' ? 'text-rose-500 border-rose-500/20' : 'text-emerald-500 border-emerald-500/20'}`}>
                                        {healthData?.health === 'overdue' ? 'Recovery Plan (Active)' : 'Simulated Result (Optimized)'}
                                    </h3>
                                    <div className="space-y-3">
                                        {simulationData?.proposed_assignments.map((assignment, i) => (
                                            <div key={i} className={`p-4 border rounded-lg flex items-center justify-between animate-pulse-slow ${healthData?.health === 'overdue' ? 'border-rose-500/20 bg-rose-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                                                <div className="text-left">
                                                    <div className="font-bold text-sm text-white uppercase">{assignment.suggested_task}</div>
                                                    <div className={`text-[10px] font-mono tracking-widest uppercase ${healthData?.health === 'overdue' ? 'text-rose-400' : 'text-emerald-400'}`}>{assignment.profile.full_name}</div>
                                                </div>
                                                <div className={`px-2 py-1 text-[10px] font-black rounded uppercase ${healthData?.health === 'overdue' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {healthData?.health === 'overdue' ? 'RECOVERY ACTION' : 'NEW ROUTE'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-8 border-t border-white/10 ${healthData?.health === 'overdue' ? 'bg-rose-900/10' : 'bg-white/5'} flex items-center justify-between pointer-events-auto`}>
                                <div className="flex items-center gap-4 text-slate-400 italic text-sm">
                                    <span className={`material-symbols-outlined ${healthData?.health === 'overdue' ? 'text-rose-500' : 'text-emerald-500'}`}>info</span>
                                    {healthData?.health === 'overdue'
                                        ? `Proposing ${simulationData?.proposed_tasks.length} critical recovery actions to restore timeline.`
                                        : `Proposing ${simulationData?.proposed_tasks.length} module adjustments for optimal neural balance.`}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowSimulation(false)}
                                        className="px-6 py-3 rounded-lg border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStageSimulation}
                                        className={`px-8 py-3 rounded-lg font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 ${healthData?.health === 'overdue'
                                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">check_circle</span>
                                        {healthData?.health === 'overdue' ? 'Stage Recovery Plan' : 'Stage Optimization'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showDeadlineModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                        <div className="glass-panel border border-primary/30 rounded-2xl max-w-md w-full p-8 flex flex-col gap-6 animate-in zoom-in duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                                    Extend Project Deadline
                                </h2>
                                <button onClick={() => setShowDeadlineModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">New Neural Deadline</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary/50 outline-none transition-all cursor-pointer [color-scheme:dark]"
                                            value={extensionData.new_deadline}
                                            onChange={(e) => setExtensionData({ ...extensionData, new_deadline: e.target.value })}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Extension Reason (Sent to Team)</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary/50 outline-none transition-all h-24 resize-none"
                                        placeholder="Enter reason for extension..."
                                        value={extensionData.reason}
                                        onChange={(e) => setExtensionData({ ...extensionData, reason: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={handleExtendDeadline}
                                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">verified</span>
                                    Confirm Extension
                                </button>
                                <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
                                    Confirming will notify all assigned team members and recalculate project health metrics.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Replanning Success Modal */}
            {
                showSuccessModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
                        <div className="glass-panel border border-emerald-500/30 rounded-2xl max-w-md w-full p-8 flex flex-col gap-6 animate-in zoom-in duration-300 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>

                            <div className="flex flex-col items-center text-center gap-4 py-4">
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-2 animate-bounce-slow">
                                    <span className="material-symbols-outlined text-6xl text-emerald-500">check_circle</span>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Re-Optimization Complete</h2>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        Project trajectory has been updated. New tasks assigned and deadlines synchronized across all neural nodes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => navigate('/admin/dashboard')}
                                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">dashboard</span>
                                    Return to Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        fetchProjectDetails(); // Refresh view
                                    }}
                                    className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-bold uppercase tracking-widest transition-all text-xs"
                                >
                                    Stay on Page
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProjectDetailsPage;
