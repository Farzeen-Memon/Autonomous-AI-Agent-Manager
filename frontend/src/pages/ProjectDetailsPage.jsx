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

    const getProfileImage = () => {
        const avatar = user?.profile?.avatar_url;
        if (typeof avatar === 'string' && avatar.length > 0) {
            if (avatar.startsWith('http')) return avatar;
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            return `${baseUrl}${avatar.startsWith('/') ? avatar : '/' + avatar}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || 'Admin')}&background=8B7CFF&color=fff`;
    };

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    React.useEffect(() => {
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
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
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

    return (
        <div className="project-details-container bg-[#0F0C1D] text-white h-screen flex flex-col font-display overflow-hidden w-full">
            <header className="shrink-0 border-b border-white/5 px-6 md:px-10 py-4 bg-[#0F0C1D]/80 backdrop-blur-xl z-50 w-full">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <Logo />
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link to="/admin/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">Portal</Link>
                            <Link to="/admin/dashboard" className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Project Core</Link>
                            <Link to="/admin/employees" className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all">Team Meta</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right block">
                            <p className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                                {user?.profile?.full_name || 'System Admin'}
                            </p>
                            <p className="text-[10px] text-primary uppercase tracking-[0.15em] font-bold opacity-80">
                                Admin
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/40 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(139,124,255,0.2)]">
                            <img
                                alt="Admin Profile"
                                className="w-full h-full object-cover rounded-full"
                                src={getProfileImage()}
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || 'Admin')}&background=8B7CFF&color=fff`; }}
                            />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5"
                            title="Deauthorize"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent w-full">
                <div className="w-full px-6 md:px-10 py-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Link to="/admin/dashboard" className="flex items-center gap-1 text-primary hover:underline text-sm font-medium">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Back to Portfolio
                            </Link>
                            <span className="text-white/20 text-sm">/</span>
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Active Project Core</span>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
                                    {loading ? 'Initializing Interface...' : projectData?.title || 'Project Neural Core'}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 ${projectData?.status === 'finalized' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'} rounded-full text-[10px] font-black uppercase tracking-wider`}>
                                        <span className={`w-1.5 h-1.5 ${projectData?.status === 'finalized' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'} rounded-full`}></span>
                                        Link Status: {projectData?.status || 'Active'}
                                    </span>
                                    <span className="text-white/30 text-[10px] font-black uppercase tracking-widest font-mono">NODE ID: {projectData?._id?.substring(0, 12)}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all rounded-xl font-black text-xs text-primary uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(139,124,255,0.05)]">
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Export Core
                                </button>
                                <button
                                    onClick={() => navigate('/admin/project-matching', { state: { projectId } })}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/30 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Edit Neural
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            {/* Alert Section */}
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
                                        <span className="material-symbols-outlined text-3xl">warning</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-orange-500 uppercase tracking-widest text-sm leading-none">Nexo AI: Replanning Required</h4>
                                        <p className="text-xs text-orange-500/70 font-bold leading-relaxed">A resource shift has invalidated current timeline modules. Manual re-mapping suggested for Node #402.</p>
                                    </div>
                                </div>
                                <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/30 transition-all flex items-center gap-2 whitespace-nowrap">
                                    <span className="material-symbols-outlined text-lg">route</span>
                                    Execute Re-route
                                </button>
                            </div>

                            {/* Analysis Card */}
                            <div className="bg-[#110E23]/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 flex flex-col md:flex-row items-center gap-10 shadow-2xl">
                                <div className="relative w-48 h-48 shrink-0">
                                    <svg className="gauge-svg w-full h-full" viewBox="0 0 160 160">
                                        <circle className="text-white/5" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                                        <circle
                                            className="gauge-circle drop-shadow-[0_0_15px_rgba(139,124,255,0.6)]"
                                            cx="80" cy="80" fill="transparent" r="70" stroke="#8B7CFF" strokeLinecap="round" strokeWidth="12"
                                            style={{ strokeDashoffset: 440 - (440 * progressPercent / 100) }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-4xl font-black leading-none text-white tracking-tighter">{calculateDaysLeft()}</span>
                                        <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mt-1">Days Left</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/90">Work Remaining Analysis</h3>
                                    <p className="text-slate-400 leading-relaxed font-bold text-sm">
                                        Project is currently <span className="text-primary">{progressPercent}% complete</span>. {progressPercent > 50 ? 'Deployment operations are in optimized final phase.' : 'System initialization and logic mapping underway.'} The AI engine predicts a stable velocity through the next cluster milestone.
                                    </p>
                                    <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/5">
                                        <div>
                                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1.5">Total Tasks</p>
                                            <p className="text-2xl font-black text-white leading-none">{totalTasks}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-emerald-500/40 uppercase font-black tracking-widest mb-1.5">Completed</p>
                                            <p className="text-2xl font-black text-emerald-500 leading-none">{completedTasks}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-primary uppercase font-black tracking-widest mb-1.5">Active Nodes</p>
                                            <p className="text-2xl font-black text-primary leading-none">{team.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team Performance Section */}
                            <div className="bg-[#110E23]/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">Assigned Team Performance</h3>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-sm">groups</span>
                                        Manage Team
                                    </button>
                                </div>
                                <div className="p-8 space-y-6">
                                    {loading ? (
                                        <div className="py-10 text-center text-slate-500 animate-pulse font-mono text-xs uppercase tracking-widest">
                                            Fetching Team profiles...
                                        </div>
                                    ) : (
                                        team.map((member, idx) => {
                                            const memberId = String(member.profile._id || member.profile.id);
                                            const memberTasks = projectData?.tasks?.filter(t => String(t.assigned_to) === memberId) || [];
                                            const totalMemberTasks = memberTasks.length;
                                            const completedMemberTasks = memberTasks.filter(t => t.status === 'completed').length;
                                            const performancePercent = totalMemberTasks > 0 ? Math.round((completedMemberTasks / totalMemberTasks) * 100) : 0;

                                            return (
                                                <div key={idx} className="employee-row group flex flex-col sm:flex-row sm:items-center gap-6 relative p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                                                    <div className="flex items-center gap-4 min-w-[220px]">
                                                        <div className="size-12 rounded-full border-2 border-primary/20 p-0.5 shadow-lg overflow-hidden">
                                                            <img
                                                                alt={`${member.profile.full_name} avatar`}
                                                                className="size-full rounded-full object-cover"
                                                                src={member.profile?.avatar_url ? (member.profile.avatar_url.startsWith('http') ? member.profile.avatar_url : `${API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL}${member.profile.avatar_url.startsWith('/') ? member.profile.avatar_url : '/' + member.profile.avatar_url}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.profile?.full_name || 'User')}&background=8B7CFF&color=fff`}
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white/90 tracking-tight">{member.profile.full_name}</p>
                                                            <p className="text-[10px] text-primary uppercase font-black tracking-widest">
                                                                {member.skills[0]?.skill_name || 'Neural Specialist'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                                Operational Load ({completedMemberTasks}/{totalMemberTasks})
                                                            </span>
                                                            <span className="text-[10px] font-black text-primary">{performancePercent}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(139,124,255,0.5)] transition-all duration-1000" style={{ width: `${performancePercent}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Tasks Section */}
                            <div className="bg-[#110E23]/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden mt-8 shadow-2xl">
                                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">Project Tasks</h3>
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-sm">add_task</span>
                                        Initialize Task
                                    </button>
                                </div>
                                <div className="p-8 space-y-4">
                                    {projectData?.tasks?.length === 0 ? (
                                        <p className="text-center text-slate-500 italic py-4">No tasks initialized for this core.</p>
                                    ) : (
                                        projectData?.tasks?.map((task, idx) => {
                                            const assignee = team.find(m => String(m.profile._id || m.profile.id) === String(task.assigned_to));
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-primary/40 transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                            <span className="material-symbols-outlined">{task.status === 'completed' ? 'check_circle' : 'pending'}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-base tracking-tight text-white/90 group-hover:text-white uppercase">{task.title}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                                                                Node Assigned: <span className="text-primary">{assignee?.profile.full_name || 'AUTO'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-[0.2em] ${task.priority === 'high' ? 'border-red-500/30 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-primary/30 text-primary bg-primary/5 shadow-[0_0_15px_rgba(139,124,255,0.1)]'}`}>
                                                            {task.priority || 'Medium'}
                                                        </span>
                                                        <span className="text-xs font-mono font-bold text-slate-500">DUE: {task.deadline || 'TBD'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar / Aside */}
                        <aside className="lg:col-span-4 space-y-8">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_15px_rgba(139,124,255,0.2)]">
                                            <span className="material-symbols-outlined text-xl font-bold">lock</span>
                                        </div>
                                        <h4 className="font-black uppercase tracking-widest text-white/90">Resource Lock</h4>
                                    </div>
                                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(139,124,255,0.4)]">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 relative z-10">
                                    <div className="flex items-center gap-2 mb-3 text-primary font-black text-[10px] uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        STATUS: ACTIVE ENCRYPTION
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-bold">Current project resources are locked to prevent cross-allocation until Cluster Milestone #4.</p>
                                </div>
                            </div>

                            <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <h4 className="font-black flex items-center gap-3 uppercase tracking-widest text-xs text-white/80">
                                        <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                                        Neural Logs
                                    </h4>
                                    <span className="text-[9px] font-black uppercase text-emerald-500 animate-pulse tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        Live Pulse
                                    </span>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 border border-orange-500/30">
                                            <span className="material-symbols-outlined text-sm font-bold">psychology</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-orange-500 mb-1 uppercase tracking-widest">AI RE-OPTIMIZATION</p>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">Member departure detected. Awaiting manual trigger to re-map <span className="text-white">14 operational modules</span>.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                            <span className="material-symbols-outlined text-sm font-bold">smart_toy</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">10:42 AM - REASSIGNMENT</p>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">Task <span className="text-primary font-mono font-black tracking-tight">#402-B</span> moved from <span className="text-white">Felix</span> to <span className="text-primary">Aria</span>.</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:bg-white/[0.02] transition-colors border-t border-white/5">
                                    View Complete Global Audit
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                                    <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-4">Logged Hours</p>
                                    <div>
                                        <p className="text-2xl font-black text-white leading-none">1,240</p>
                                        <p className="text-[9px] text-emerald-500 font-bold mt-2 uppercase tracking-widest">+5.2% VELOCITY</p>
                                    </div>
                                </div>
                                <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                                    <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-4">Neural Load</p>
                                    <div>
                                        <p className="text-2xl font-black text-white leading-none">{progressPercent}%</p>
                                        <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary shadow-[0_0_10px_rgba(139,124,255,1)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <footer className="mt-12 py-12 border-t border-white/5 bg-[#0F0C1D]/50 w-full">
                    <div className="w-full px-10 flex justify-between items-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        <p>© Nexo 2026</p>
                        <div className="flex gap-8">
                            <a className="hover:text-primary transition-colors" href="#">Documentation</a>
                            <a className="hover:text-primary transition-colors" href="#">System Status</a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ProjectDetailsPage;
