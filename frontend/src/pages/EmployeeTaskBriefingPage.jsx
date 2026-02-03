import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/EmployeeTaskBriefing.css';

const EmployeeTaskBriefingPage = () => {
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useUser();
    const [tasks, setTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchMyTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const projects = await response.json();
                const myProfileId = user?.profile?.id || user?.profile?._id;

                // Extract all tasks assigned to this employee across all projects
                const allMyTasks = [];
                projects.forEach(project => {
                    if (project.tasks) {
                        project.tasks.forEach(task => {
                            // Backend uses string or ObjectId, normalize for comparison
                            if (task.assigned_to === myProfileId || String(task.assigned_to) === String(myProfileId)) {
                                allMyTasks.push({
                                    ...task,
                                    projectName: project.title,
                                    projectId: project.id || project._id
                                });
                            }
                        });
                    }
                });
                setTasks(allMyTasks);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchMyTasks();
        }
    }, [user]);

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    // Fallbacks
    const userName = user?.profile?.full_name || user?.email || 'Nexo Agent';
    const userRole = user?.profile?.specialization || user?.skills?.[0]?.skill_name || 'Neural Node';
    const userAvatar = user?.profile?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNaS-V8YMeBLMNMvhRxHjG5WbeYFnRUaErcDsblIA0iFAkPoySK8-NMialzcQAWv2Wa3AvMCKULSLGxG9yk6aXXuAW7LfKZzcQd4GcTKU7xs8g660ZaZ7-dZ18wFrLooQyzE-ov6iUou_7SBewXc3gxYtRbduy1mrUI-o0GOeh1FY2k9Nj8HrbAu75z_z0FWxT8HE1Jd6HtXI8OxnZ_hdD8ccsJ_SFAAKiz0UGviYD9UV7p_siYxsCexAxNA4I948Mx3NhaqLu9pY';

    return (
        <div className="employee-briefing-container flex h-screen overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-primary/10 bg-panel flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <Logo textClassName="text-xl font-bold tracking-tight text-white uppercase" />
                </div>
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-medium" href="#">
                        <span className="material-symbols-outlined">assignment</span>
                        Execution Briefing
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-lavender hover:bg-white/5 transition-colors" href="#">
                        <span className="material-symbols-outlined">analytics</span>
                        My Metrics
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-lavender hover:bg-white/5 transition-colors" href="#">
                        <span className="material-symbols-outlined">history</span>
                        Task Archive
                    </a>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-lavender hover:bg-white/5 transition-colors" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        Settings
                    </a>
                </nav>
                <div className="p-4 mt-auto">
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan animate-pulse"></div>
                            <p className="text-xs text-lavender">Connected to NEXO-Core</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-[#0F0C1D] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                {/* Header - Matching Image */}
                <header className="sticky top-0 z-20 bg-[#0F0C1D]/80 backdrop-blur-xl border-b border-primary/20 px-8 py-4 flex justify-between items-center shadow-2xl shadow-primary/5">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary to-cyan flex items-center justify-center text-white font-black shadow-lg shadow-primary/50">
                            <span className="material-symbols-outlined text-sm">check</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white tracking-tight uppercase">NEXO <span className="text-slate-500 font-medium normal-case tracking-normal ml-2 text-sm">Employee Control</span></h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-12 text-sm font-bold text-lavender/80">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-400 text-lg">bolt</span>
                            <span>Focus: <span className="text-white">92%</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                            <span>Efficiency: <span className="text-white">94%</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-lg">emoji_events</span>
                            <span>Streak: <span className="text-white">3 days</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-white">{userName}</p>
                            <p className="text-[10px] text-cyan uppercase tracking-wider">{userRole}</p>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary via-cyan to-white">
                                <img alt="Profile" className="w-full h-full object-cover rounded-full" src={userAvatar} />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0F0C1D] rounded-full"></div>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-lavender hover:text-red-400 transition-all ml-2">
                            <span className="material-symbols-outlined text-lg">power_settings_new</span>
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] w-full mx-auto space-y-8 flex-1">

                    {/* Top Section: Hero Mission & Insights */}
                    <div className="flex items-center gap-3 mb-1">
                        <span className="material-symbols-outlined text-primary animate-pulse">target</span>
                        <h2 className="text-2xl font-bold text-white">Your Primary Mission Today</h2>
                    </div>
                    <p className="text-lavender text-sm -mt-6 mb-6 pl-9">Your tasks, momentum, and AI guided execution — in one place.</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Primary Mission Card */}
                        <div className="lg:col-span-2 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-[#151226]/80 backdrop-blur-sm border border-primary/30 rounded-3xl p-8 h-full shadow-2xl shadow-primary/10 overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-lavender hover:bg-white/10 cursor-pointer transition-colors">
                                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        Start Task
                                    </span>
                                </div>

                                {tasks.length > 0 ? (
                                    <>
                                        <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{tasks[0].title}</h3>
                                        <p className="text-lavender mb-6 text-sm font-medium opacity-80 uppercase tracking-widest">{tasks[0].projectName} <span className="mx-2 text-primary/40">•</span> PRJ-{tasks[0].projectId?.substring(0, 4)}</p>

                                        <div className="flex flex-wrap items-center gap-4 mb-10">
                                            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                                <span className="material-symbols-outlined text-base">hourglass_top</span>
                                                Due in {tasks[0].deadline || "6 hours"}
                                            </div>
                                            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                                <span className="material-symbols-outlined text-base">headphones</span>
                                                High Impact
                                            </div>
                                            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                                <span className="material-symbols-outlined text-base">verified</span>
                                                95% Skill Match
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <button className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-primary/30 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 group/btn">
                                                <span className="material-symbols-outlined filled">play_circle</span>
                                                Start Task
                                            </button>
                                            <button className="px-6 py-4 bg-[#1F1B33] hover:bg-[#282245] border border-primary/30 hover:border-primary/60 text-lavender hover:text-white font-bold rounded-2xl flex items-center gap-3 transition-all">
                                                <span className="material-symbols-outlined text-cyan">auto_awesome</span>
                                                Break into Subtasks (AI)
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                        <span className="material-symbols-outlined text-6xl text-primary/20 mb-4">inbox</span>
                                        <h3 className="text-xl font-bold text-white mb-2">All Clear, Operative.</h3>
                                        <p className="text-lavender text-sm">No primary missions assigned currently.</p>
                                    </div>
                                )}

                                {/* Decorative Background Elements */}
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20"></div>
                            </div>
                        </div>

                        {/* Insights Card */}
                        <div className="bg-[#151226]/80 backdrop-blur-sm border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-cyan">psychology</span>
                                    NEXO Insights
                                </h3>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative group hover:border-amber-500/40 transition-colors">
                                    <div className="absolute top-4 left-3 w-1 h-8 bg-amber-500 rounded-full opacity-50"></div>
                                    <p className="text-xs text-amber-200 leading-relaxed pl-4">
                                        Completing <b className="text-white">Backend API Migration</b> within 6 hours boosts your Efficiency to <b className="text-white">96%</b>.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan/10 to-transparent border border-cyan/20 relative group hover:border-cyan/40 transition-colors">
                                    <div className="absolute top-4 left-3 w-1 h-8 bg-cyan rounded-full opacity-50"></div>
                                    <div className="flex gap-3 pl-2">
                                        <span className="material-symbols-outlined text-cyan text-xl">recommend</span>
                                        <p className="text-xs text-cyan-100 leading-relaxed">
                                            This task matches your <b className="text-white">ML skill set</b> best.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative group hover:border-primary/40 transition-colors">
                                    <div className="absolute top-4 left-3 w-1 h-8 bg-primary rounded-full opacity-50"></div>
                                    <div className="flex gap-3 pl-2">
                                        <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
                                        <p className="text-xs text-indigo-200 leading-relaxed">
                                            You're ahead of schedule today! Great momentum.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Flow Board & Progress */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Flow Board */}
                        <div className="lg:col-span-2 bg-[#151226]/80 backdrop-blur-sm border border-primary/20 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    Mission Flow Board
                                </h3>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                    <span className="text-lavender flex items-center gap-2"><span className="material-symbols-outlined text-base">notifications</span> In Progress</span>
                                    <span className="text-primary flex items-center gap-2"><span className="material-symbols-outlined text-base">done_all</span> Completed</span>
                                    <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span> Add Task
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
                                {/* In Progress Column */}
                                <div className="bg-[#0F0C1D]/60 rounded-2xl p-4 border border-primary/10 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm animate-spin">refresh</span>
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">In Progress</span>
                                        </div>
                                    </div>
                                    {tasks.length > 0 ? (
                                        <div className="bg-[#1F1B33] rounded-xl p-4 border border-primary/30 shadow-lg relative overflow-hidden group hover:border-primary/60 transition-colors cursor-pointer">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-cyan"></div>
                                            <h4 className="font-bold text-white text-sm mb-1">{tasks[0].title}</h4>
                                            <p className="text-[10px] text-lavender/60 mb-3">{tasks[0].projectName}</p>

                                            <div className="space-y-2 mb-3">
                                                <div className="flex items-center gap-2 text-[10px] text-lavender">
                                                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_box</span>
                                                    <span>Setup endpoints</span>
                                                    <div className="ml-auto w-5 h-5 rounded-full bg-slate-700 text-[8px] flex items-center justify-center text-white">CH</div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-lavender">
                                                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_box</span>
                                                    <span>Migrate auth</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-lavender opacity-50">
                                                    <span className="material-symbols-outlined text-sm">check_box_outline_blank</span>
                                                    <span>Write tests</span>
                                                    <span className="ml-auto px-1.5 py-0.5 bg-white/5 rounded text-white">2 days</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-lavender/30 text-xs font-mono uppercase">Empty Slot</div>
                                    )}
                                </div>

                                {/* Completed Column */}
                                <div className="bg-[#0F0C1D]/60 rounded-2xl p-4 border border-primary/10 flex flex-col gap-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                            <span className="text-xs font-bold text-white uppercase tracking-wider">Completed</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#1F1B33]/50 rounded-xl p-3 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500">
                                                <span className="material-symbols-outlined text-sm">database</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white">Database Schema Update</h4>
                                                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">check</span> Completed today
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#1F1B33]/50 rounded-xl p-3 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                                                <span className="material-symbols-outlined text-sm">dashboard</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white">React Dashboard Redesign</h4>
                                                <span className="text-[10px] font-bold text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded bg-orange-500/10">High Priority</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress & Momentum */}
                        <div className="bg-gradient-to-b from-[#151226] to-[#0F0C1D] border border-primary/20 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400">verified</span>
                                    Progress & Momentum
                                </h3>
                                <span className="text-primary text-xl">•••</span>
                            </div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    {/* Conic Gradient for Progress */}
                                    <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(#5B6FE8 90%, transparent 90%)', maskImage: 'radial-gradient(transparent 55%, black 60%)', WebkitMaskImage: 'radial-gradient(transparent 55%, black 60%)' }}></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                                    <div className="text-center z-10">
                                        <span className="text-3xl font-black text-white block leading-none">90%</span>
                                        <span className="text-[10px] text-lavender uppercase tracking-wide">Weekly Goal</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-base">check</span> Weekly Goal
                                    </h4>
                                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[90%] bg-primary"></div>
                                    </div>

                                    <div className="p-3 bg-[#1F1B33] rounded-xl border border-primary/20 mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1 h-4 bg-cyan rounded-full"></div>
                                            <span className="text-[10px] font-bold text-white uppercase">Skill Valuation</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex">
                                            <div className="w-[40%] bg-cyan"></div>
                                            <div className="w-[30%] bg-primary"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                        </div>
                                        <span className="text-sm text-lavender font-medium">Focus Streak</span>
                                    </div>
                                    <span className="text-white font-bold">3 Days <span className="text-white/20 ml-2">›</span></span>
                                </div>

                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-yellow-400/10 text-yellow-400 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-all">
                                            <span className="material-symbols-outlined text-sm">bolt</span>
                                        </div>
                                        <span className="text-sm text-lavender font-medium">Efficiency Boost</span>
                                    </div>
                                    <span className="text-emerald-400 font-bold text-xs uppercase">Active <span className="text-white/20 ml-2 text-sm">›</span></span>
                                </div>

                                <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                                            <span className="material-symbols-outlined text-sm">school</span>
                                        </div>
                                        <span className="text-sm text-lavender font-medium">Skill Mastery</span>
                                    </div>
                                    <span className="text-white font-bold text-xs">ML Level 2 <span className="text-white/20 ml-2 text-sm">›</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Week at a Glance */}
                    <div className="relative mt-12 pt-8 border-t border-primary/10">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F0C1D] px-4 text-xs font-bold text-lavender/50 uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calendar_view_week</span> Your Week at a Glance <span className="material-symbols-outlined text-sm">add</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex flex-col items-start gap-1 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-cyan text-sm">token</span>
                                    <span className="text-white font-bold text-sm">Backend API Migration</span>
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">3 Days</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[60%] bg-cyan"></div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-white uppercase px-4">Today</div>
                            <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-transparent to-primary/5 border border-white/5 flex flex-col items-end gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-bold text-sm">Fraud Detection Enhancement</span>
                                    <span className="material-symbols-outlined text-primary text-sm">security</span>
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-white text-[10px]">Peak</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[20%] bg-primary ml-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6">
                <button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-[#0F0C1D] shadow-xl shadow-primary/30 ring-4 ring-primary/10 hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
                </button>
            </div>
        </div>
    );
};

const TaskRow = ({ name, projectName, status, date, deadline, skills, statusColor }) => (
    <tr className="hover:bg-white/5 transition-colors group">
        <td className="px-6 py-5">
            <p className="font-semibold text-sm text-white">{name}</p>
            <p className="text-[10px] text-lavender/60 mt-0.5 font-mono uppercase tracking-tighter">Project: {projectName}</p>
        </td>
        <td className="px-6 py-5">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColor}`}>
                {status}
            </span>
        </td>
        <td className="px-6 py-5">
            <p className="text-sm text-lavender">{date}</p>
        </td>
        <td className="px-6 py-5">
            <p className="text-sm text-white font-medium">{deadline}</p>
        </td>
        <td className="px-6 py-5">
            <div className="flex flex-wrap gap-1">
                {skills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight bg-white/5 text-lavender border border-primary/10">
                        {skill}
                    </span>
                ))}
            </div>
        </td>
        <td className="px-6 py-5 text-right">
            <button className="text-lavender hover:text-white transition-colors">
                <span className="material-symbols-outlined">open_in_new</span>
            </button>
        </td>
    </tr>
);

const DeadlineItem = ({ icon, name, deadline, type }) => {
    const iconColors = {
        urgent: 'bg-red-500/10 border-red-500/20 text-red-400',
        normal: 'bg-primary/10 border-primary/20 text-primary',
        future: 'bg-white/5 border-white/10 text-lavender'
    };

    return (
        <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg border ${iconColors[type]}`}>
                <span className="material-symbols-outlined text-sm">{icon}</span>
            </div>
            <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-xs text-lavender">{deadline}</p>
            </div>
        </div>
    );
};

export default EmployeeTaskBriefingPage;
