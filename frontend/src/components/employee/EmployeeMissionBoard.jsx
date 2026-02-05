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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', project_id: '' });
    const [projects, setProjects] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);

    const getProfileImage = () => {
        const avatar = user?.profile?.avatar_url;
        if (typeof avatar === 'string' && avatar.length > 0) {
            if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
            // Ensure single slash between base URL and avatar path
            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
            const avatarPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
            return `${baseUrl}${avatarPath}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || user?.name || 'User')}&background=8B7CFF&color=fff`;
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
                const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                    const profileId = user.profile?.id || user.profile?._id || user.id;

                    const backlog = [];
                    const inProgress = [];
                    const completed = [];

                    data.forEach(project => {
                        if (project.tasks && Array.isArray(project.tasks)) {
                            project.tasks.forEach(task => {
                                // Robust ID normalization and comparison
                                const taskAssignedId = task.assigned_to
                                    ? (typeof task.assigned_to === 'object' ? task.assigned_to.id || task.assigned_to._id || task.assigned_to : String(task.assigned_to))
                                    : null;

                                const myId = String(profileId);
                                const isAssignedToMe = taskAssignedId && taskAssignedId === myId;

                                if (isAssignedToMe || showAllTasks) {
                                    const taskWithMeta = {
                                        ...task,
                                        projectTitle: project.title,
                                        projectId: project.id || project._id,
                                        deadline: task.deadline && task.deadline !== 'TBD' ? task.deadline : project.deadline,
                                        isMyTask: isAssignedToMe
                                    };

                                    if (task.status === 'completed') {
                                        completed.push(taskWithMeta);
                                    } else if (task.status === 'in_progress') {
                                        inProgress.push(taskWithMeta);
                                    } else {
                                        backlog.push(taskWithMeta);
                                    }
                                }
                            });
                        }
                    });

                    setTasks({ backlog, inProgress, completed });
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        };

        fetchTasks();
        // Set up interval for "real-time" updates (every 10 seconds)
        const interval = setInterval(fetchTasks, 3000);
        return () => clearInterval(interval);
    }, [user, showAllTasks]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.project_id) {
            alert("Please select a project for the task.");
            return;
        }

        try {
            // Find the project to update
            const project = projects.find(p => p.id === newTask.project_id || p._id === newTask.project_id);
            if (!project) return;

            const profileId = user.profile?.id || user.profile?._id;
            const updatedTasks = [...(project.tasks || []), {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                status: 'backlog',
                assigned_to: profileId,
                estimated_hours: 2,
                required_skills: [],
                deadline: 'TBD'
            }];

            const response = await fetch(`${API_BASE_URL}/projects/${newTask.project_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tasks: updatedTasks })
            });

            if (response.ok) {
                setIsModalOpen(false);
                setNewTask({ title: '', description: '', priority: 'medium', project_id: '' });
                // Refresh tasks
                window.location.reload(); // Quick way to refresh for now
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleUpdateTaskStatus = async (task, newStatus) => {
        try {
            const projectId = task.projectId || task.project_id;
            const project = projects.find(p => p.id === projectId || p._id === projectId);
            if (!project) return;

            const updatedTasks = project.tasks.map(t => {
                if (t.title === task.title && t.description === task.description) {
                    return { ...t, status: newStatus };
                }
                return t;
            });

            const response = await fetch(`${API_BASE_URL}/projects/${project.id || project._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tasks: updatedTasks })
            });

            if (response.ok) {
                // Refresh local state without full reload
                setTasks(prev => {
                    const newTasks = { ...prev };
                    // Remove from old status
                    Object.keys(newTasks).forEach(status => {
                        newTasks[status] = newTasks[status].filter(t => t.title !== task.title);
                    });
                    // Add to new status
                    const internalStatus = newStatus === 'in_progress' ? 'inProgress' : newStatus;
                    newTasks[internalStatus] = [...newTasks[internalStatus], { ...task, status: newStatus }];
                    return newTasks;
                });
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const myBacklog = tasks.backlog.filter(t => t.isMyTask !== false);
    const myInProgress = tasks.inProgress.filter(t => t.isMyTask !== false);
    const myCompleted = tasks.completed.filter(t => t.isMyTask !== false);

    const totalTasks = myBacklog.length + myInProgress.length + myCompleted.length;
    const efficiency = totalTasks > 0 ? Math.round((myCompleted.length / totalTasks) * 100) : 0;
    const dashOffset = 628.3 - (628.3 * efficiency) / 100;

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
                    border: 1px solid transparent !important;
                }
                .task-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 15px 40px rgba(139, 124, 255, 0.4);
                    border-color: var(--electric-purple) !important;
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
                .modal-backdrop {
                    background: rgba(15, 12, 29, 0.8);
                    backdrop-filter: blur(8px);
                }
                .input-cyber {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(139, 124, 255, 0.2);
                    color: white;
                    transition: all 0.3s ease;
                }
                .input-cyber:focus {
                    border-color: var(--electric-purple);
                    box-shadow: 0 0 10px rgba(139, 124, 255, 0.2);
                    outline: none;
                }
            `}</style>

            <div className="antialiased flex overflow-hidden h-screen bg-[var(--carbon-black)] text-[#E2E8F0] font-['Plus_Jakarta_Sans']">
                <div className="fixed inset-0 bg-grid pointer-events-none"></div>

                {/* Sidebar */}
                <nav className="w-16 h-full flex flex-col items-center py-6 border-r border-white/5 bg-[var(--carbon-black)] z-50">
                    <div className="w-10 h-10 mb-8 shrink-0"></div>

                    <button
                        onClick={() => navigate('/employee/settings')}
                        className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white transition-colors mt-auto"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>
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
                            <div className="flex items-center gap-3">
                                <Logo className="flex items-center gap-2" textClassName="font-display font-bold text-xl tracking-tight text-white uppercase whitespace-nowrap" />
                                <span className="text-white/40 font-light text-xs tracking-[0.2em] hidden sm:inline uppercase border-l border-white/10 pl-3">Employee Dashboard</span>
                            </div>
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

                        <div className="flex items-center gap-6 shrink-0 ml-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white tracking-tight leading-none mb-1">
                                    {user?.profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Mission Agent'}
                                </p>
                                <p className="text-[10px] text-[var(--soft-cyan)] uppercase tracking-[0.15em] font-bold opacity-80">
                                    {user?.profile?.specialization || user?.role || 'Operative'}
                                </p>
                            </div>
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl border-2 border-[var(--electric-purple)]/40 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(139,124,255,0.2)]">
                                    <img
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-lg"
                                        src={getProfileImage()}
                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || 'User')}&background=8B7CFF&color=fff`; }}
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[var(--soft-cyan)] border-2 border-[var(--carbon-black)] rounded-full shadow-[0_0_10px_rgba(93,230,255,0.5)]"></div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-white/5"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 overflow-hidden relative p-8 px-20 pb-4 gap-12">
                        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
                            <div className="flex justify-between items-end mb-8 flex-wrap gap-4 shrink-0">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-2xl font-display font-bold text-white tracking-tight uppercase leading-none">Mission Control</h2>
                                    <span className="text-[10px] text-[var(--electric-purple)] font-mono uppercase tracking-[0.3em] opacity-60">
                                        System Protocol: Active | {projects.length} Projects | ID: {user.profile?.id || user.profile?._id || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowAllTasks(!showAllTasks)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${showAllTasks ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}
                                    >
                                        DEBUG: {showAllTasks ? 'SHOWING ALL' : 'MY TASKS'}
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="bg-[var(--electric-purple)] hover:bg-[#7a6bed] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(139,124,255,0.4)] z-10 whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_task</span> ADD NEW TASK
                                    </button>
                                </div>
                            </div>

                            {showAllTasks && (
                                <div className="mb-8 bg-black/40 border border-amber-500/30 p-6 rounded-2xl text-[11px] font-mono shadow-2xl backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-amber-500 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">terminal</span>
                                            Diagnostic Terminal
                                        </div>
                                        <div className="text-white/20 text-[9px] uppercase tracking-widest">Neural Link Debuggery</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mb-6 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-white/30 text-[9px] uppercase font-bold text-pink-500/50">My Identity Matrix</p>
                                            <p className="text-white truncate">ID: <span className="text-primary">{String(user.profile?.id || user.profile?._id || 'N/A')}</span></p>
                                            <p className="text-white truncate">EMAIL: <span className="text-white/70">{user.email}</span></p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white/30 text-[9px] uppercase font-bold text-cyan-500/50">Neural Sync Status</p>
                                            <p className="text-white">PROJECTS: <span className="text-cyan-400 font-bold">{projects.length}</span></p>
                                            <p className="text-white">RAW TASKS: <span className="text-cyan-400 font-bold">{projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-4">
                                        {projects.map((p, i) => (
                                            <div key={i} className="border-l-2 border-white/10 pl-4 py-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-primary font-bold uppercase tracking-tighter text-xs">{p.title}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${p.status === 'finalized' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {p.tasks?.map((t, ti) => {
                                                        const targetId = String(user.profile?.id || user.profile?._id || '');
                                                        const assigneeId = String(t.assigned_to || '');
                                                        const isMatch = assigneeId === targetId;
                                                        return (
                                                            <div key={ti} className={`flex items-center justify-between p-2 rounded ${isMatch ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.02]'}`}>
                                                                <div className="flex flex-col">
                                                                    <span className="text-white/80 font-medium">{t.title}</span>
                                                                    <span className="text-[9px] text-white/30 font-mono">Assignee: {assigneeId || 'UNASSIGNED'}</span>
                                                                </div>
                                                                {isMatch && (
                                                                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[9px] tracking-widest animate-pulse">
                                                                        <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                                        ID MATCH
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kanban Columns - Full Height Filling */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                                {/* BACKLOG Column */}
                                <div className="flex flex-col h-full min-h-0 bg-white/[0.01] rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                                        <span className="text-[17px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-3">
                                            BACKLOG <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-[12px] font-mono text-white/80">{String(tasks.backlog.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-xl text-white/20">terminal</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.backlog.map((task, index) => (
                                            <div
                                                key={index}
                                                className="task-card bg-[var(--card-bg)] p-5 rounded-2xl shadow-xl cursor-pointer"
                                                onClick={() => handleUpdateTaskStatus(task, 'in_progress')}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[12px] px-3 py-1.5 font-bold rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority || 'Medium'} Priority
                                                    </span>
                                                    <span className="material-symbols-outlined text-xl opacity-20 hover:opacity-100 cursor-grab">drag_handle</span>
                                                </div>
                                                <h4 className="font-bold text-lg mb-2 text-white/90 break-words">{task.title}</h4>
                                                <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2 break-words">{task.description}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--soft-cyan)]/50 font-mono border-t border-white/5 pt-3">
                                                    <span className="material-symbols-outlined text-xs">work_outline</span>
                                                    <span>PROJECT: {task.projectTitle}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-[var(--soft-cyan)]/50 font-mono mt-1">
                                                    <span className="material-symbols-outlined text-xs">event_upcoming</span>
                                                    <span>DUE: {formatDate(task.deadline)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* IN PROGRESS Column */}
                                <div className="flex flex-col h-full min-h-0 bg-white/[0.01] rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                                        <span className="text-[17px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center gap-3">
                                            IN PROGRESS <span className="w-6 h-6 flex items-center justify-center bg-white/5 rounded text-[12px] font-mono text-white/80">{String(tasks.inProgress.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-xl text-white/20">terminal</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.inProgress.map((task, index) => (
                                            <div
                                                key={index}
                                                className="task-card bg-[var(--card-bg)] p-5 rounded-2xl shadow-xl cursor-pointer"
                                                onClick={() => handleUpdateTaskStatus(task, 'completed')}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className={`text-[12px] px-3 py-1.5 font-bold rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                                                        {task.priority || 'High'} Priority
                                                    </span>
                                                    <span className="material-symbols-outlined text-xl text-[var(--electric-purple)]">radar</span>
                                                </div>
                                                <h4 className="font-bold text-lg mb-2 text-white break-words">{task.title}</h4>
                                                <p className="text-sm text-white/60 leading-relaxed mb-5 line-clamp-2 break-words">{task.description}</p>
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
                                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                                        <span className="text-[17px] font-bold uppercase tracking-[0.2em] text-[var(--soft-cyan)] flex items-center gap-3">
                                            COMPLETED <span className="w-6 h-6 flex items-center justify-center bg-[var(--soft-cyan)]/20 rounded text-[12px] font-mono text-[var(--soft-cyan)]">{String(tasks.completed.length).padStart(2, '0')}</span>
                                        </span>
                                        <span className="material-symbols-outlined text-xl text-[var(--soft-cyan)]">verified</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                                        {tasks.completed.map((task, index) => (
                                            <div
                                                key={index}
                                                className="task-card bg-[var(--card-bg)]/40 p-4 rounded-xl opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                                                onClick={() => handleUpdateTaskStatus(task, 'backlog')}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[11px] px-2 py-0.5 bg-[var(--soft-cyan)]/10 text-[var(--soft-cyan)] font-bold rounded border border-[var(--soft-cyan)]/20 uppercase tracking-wider">Archived</span>
                                                    <span className="material-symbols-outlined text-[var(--soft-cyan)] text-sm">check_circle</span>
                                                </div>
                                                <h4 className="font-bold text-base mb-1 text-white/80 break-words">{task.title}</h4>
                                                <p className="text-[13px] text-white/30 leading-tight mb-2 line-clamp-2 break-words">{task.description}</p>
                                                <div className="flex items-center gap-2 text-[9px] text-white/20 font-mono border-t border-white/5 pt-2">
                                                    <span className="material-symbols-outlined text-[10px]">done_all</span>
                                                    <span>PROJECT: {task.projectTitle}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Stats */}
                        <aside className="w-[450px] flex flex-col gap-6 shrink-0 relative z-30 hidden xl:flex">
                            <div className="h-full flex flex-col bg-[var(--card-bg)] rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
                                {/* Top accent line */}
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--soft-cyan)] to-transparent opacity-50"></div>

                                <div className="p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                                    <h3 className="text-[16px] font-bold uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/5 pb-4">Weekly Progress</h3>

                                    {/* Circular Chart */}
                                    <div className="relative flex items-center justify-center mb-10 w-64 h-64 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                                            <circle className="text-[#151125]" cx="128" cy="128" fill="transparent" r="100" stroke="currentColor" strokeWidth="14"></circle>
                                            <circle className="text-[var(--electric-purple)] drop-shadow-[0_0_20px_rgba(139,124,255,0.4)] transition-all duration-1000 ease-out" cx="128" cy="128" fill="transparent" r="100" stroke="currentColor" strokeDasharray="628.3" strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="14"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <div className="text-center group-hover:scale-110 transition-transform duration-500">
                                                <span className="text-6xl font-display font-bold text-white tracking-tighter drop-shadow-[0_4px_15px_rgba(139,124,255,0.6)] leading-none block">{efficiency}%</span>
                                                <span className="text-[14px] uppercase text-[var(--soft-cyan)] font-bold tracking-[0.3em] opacity-90 mt-2 block">Efficiency Peak</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="bg-[#151125] p-6 rounded-xl border border-white/5 text-center group hover:border-[var(--electric-purple)]/50 transition-all hover:scale-105 cursor-pointer hover:shadow-[0_0_30px_rgba(139,124,255,0.3)]">
                                            <p className="text-[15px] text-white/30 uppercase tracking-widest mb-2">Missions</p>
                                            <p className="text-4xl font-display font-medium text-white group-hover:scale-110 transition-transform">
                                                {myCompleted.length + myInProgress.length}
                                                <span className="text-[18px] text-white/20 ml-1">/{totalTasks || 15}</span>
                                            </p>
                                        </div>
                                        <div className="bg-[#151125] p-6 rounded-xl border border-white/5 text-center group hover:border-[var(--soft-cyan)]/50 transition-all hover:scale-105 cursor-pointer hover:shadow-[0_0_30px_rgba(93,230,255,0.3)]">
                                            <p className="text-[15px] text-white/30 uppercase tracking-widest mb-2">XP Earned</p>
                                            <p className="text-4xl font-display font-medium text-[var(--soft-cyan)] group-hover:scale-110 transition-transform">2.4k</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        <h3 className="text-[16px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4 border-b border-white/5 pb-2">Momentum Metrics</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between group hover:translate-x-3 transition-all cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-orange-400 text-2xl group-hover:scale-125 transition-transform duration-300">local_fire_department</span>
                                                    <span className="text-[18px] text-white/70 font-medium tracking-tight">Focus Streak</span>
                                                </div>
                                                <span className="text-[18px] font-mono font-bold text-white group-hover:text-orange-400 transition-colors">3 DAYS</span>
                                            </div>
                                            <div className="flex items-center justify-between group hover:translate-x-3 transition-all cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]">
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-[var(--soft-cyan)] text-2xl group-hover:scale-125 transition-transform duration-300">auto_graph</span>
                                                    <span className="text-[18px] text-white/70 font-medium tracking-tight">Velocity Delta</span>
                                                </div>
                                                <span className="text-[18px] font-mono font-bold text-[var(--soft-cyan)] shadow-[0_0_10px_rgba(93,230,255,0.3)]">+12.4%</span>
                                            </div>
                                            <div className="flex items-center justify-between group hover:translate-x-3 transition-all cursor-pointer p-2 rounded-lg hover:bg-white/[0.02]">
                                                <div className="flex items-center gap-4">
                                                    <span className="material-symbols-outlined text-[var(--electric-purple)] text-2xl group-hover:scale-125 transition-transform duration-300">memory</span>
                                                    <span className="text-[18px] text-white/70 font-medium tracking-tight">Neural Load</span>
                                                </div>
                                                <span className="text-[18px] font-mono font-bold text-white group-hover:text-[var(--electric-purple)] transition-colors">MID-RANGE</span>
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

                {/* Add Task Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop">
                        <div className="bg-[#1B1730] border border-[var(--electric-purple)]/30 w-full max-w-md rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300 relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>

                            <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                                <span className="material-symbols-outlined text-[var(--electric-purple)]">add_circle</span>
                                Initialize New Task
                            </h3>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Project Assignment</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl input-cyber text-sm"
                                        value={newTask.project_id}
                                        onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(p => {
                                            const projectId = p.id || p._id;
                                            return <option key={projectId} value={projectId}>{p.title}</option>
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl input-cyber text-sm"
                                        placeholder="Enter task name..."
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Mission Parameters (Description)</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl input-cyber text-sm h-24"
                                        placeholder="Define task objectives..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Priority</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-xl input-cyber text-sm"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="w-full bg-[var(--electric-purple)] hover:bg-[#7a6bed] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(139,124,255,0.2)]"
                                        >
                                            DEPLOY TASK
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 font-bold pt-4 transition-colors"
                                >
                                    Abort Mission (Cancel)
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default EmployeeMissionBoard;
