import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/NeuralMapping.css';

const NeuralMappingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Prioritize location state, fallback to localStorage if missing (for refreshes)
    const [projectId, setProjectIdState] = useState(() => {
        if (location.state?.projectId) return location.state.projectId;
        const draft = localStorage.getItem('nexo_project_draft');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                return parsed.projectId || parsed.id || parsed._id;
            } catch (e) { return null; }
        }
        return null;
    });

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({
        active: true,
        teamOptimized: true,
        tasksBalanced: true,
        score: 92
    });

    const [error, setError] = useState(null);
    const [isDecomposing, setIsDecomposing] = useState(false);
    const [isDistributing, setIsDistributing] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // { type: 'pool' | 'team', index, data }
    const [editForm, setEditForm] = useState({ title: '', description: '', estimated_hours: 0 });
    const [showTalentPanel, setShowTalentPanel] = useState(false);
    const [talentPool, setTalentPool] = useState([]);

    const fetchProjectDetails = useCallback(async (idToFetch) => {
        const id = idToFetch || projectId;
        console.log('Neural Mapping: Initializing fetch for ID:', id);

        if (!id) {
            console.error('Neural Mapping: Project ID missing.');
            setLoading(false);
            setError("PROJECT_ID_MISSING: Access link invalid. Return to Dashboard.");
            return;
        }

        try {
            setLoading(true);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                console.log('Neural Mapping: Data received successfully', data);

                if (data.project) {
                    setProject(data.project);
                    setTasks(data.project.tasks || []);
                }
                if (data.team && Array.isArray(data.team)) {
                    // Normalize team data from API specifically for orchestration
                    const normalizedTeam = data.team.filter(m => m && m.profile).map(m => ({
                        ...m,
                        // If it doesn't have assigned_task, we'll let handleDistribute handle it
                        assigned_task: m.assigned_task || m.suggested_task || null,
                        reasoning: m.reasoning || m.suggested_description || ""
                    }));
                    setTeam(normalizedTeam);
                }
                setError(null);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Neural Mapping: API Error:', errorData);
                setError(`Project Fetch Failed: ${errorData.detail || 'Access denied'}`);
            }
        } catch (error) {
            console.error('Neural Mapping: Connection Error:', error);
            setError('Neural Network Connection Error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, projectId]);

    const fetchAvailableEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/employees/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter out already selected team members
                const currentTeamIds = team.map(m => String(m.profile?._id || m.profile?.id));
                const available = data.filter(emp => {
                    const empId = String(emp.id || emp._id);
                    return !currentTeamIds.includes(empId);
                });
                setTalentPool(available);
            }
        } catch (error) {
            console.error("Failed to fetch talent pool:", error);
        }
    };

    const handleAddTeamMember = async (employee) => {
        try {
            const currentTeamIds = team.map(m => m.profile?._id || m.profile?.id);
            const updatedTeamIds = [...currentTeamIds, employee.id || employee._id];

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ assigned_team: updatedTeamIds })
            });

            if (response.ok) {
                setShowTalentPanel(false);
                fetchProjectDetails(); // Refresh everything
            }
        } catch (error) {
            console.error("Failed to add team member:", error);
        }
    };

    useEffect(() => {
        const incomingId = location.state?.projectId;
        if (incomingId && incomingId !== projectId) {
            setProjectIdState(incomingId);
        }
    }, [location.state?.projectId]);

    useEffect(() => {
        // Reset state ONLY when we definitely have a new valid ID to fetch
        setProject(null);
        setTasks([]);
        setTeam([]);
        fetchProjectDetails(projectId);
    }, [projectId, fetchProjectDetails]);

    const handleDecompose = async () => {
        setIsDecomposing(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/decompose`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks || []);
                setStatus(prev => ({ ...prev, tasksBalanced: false }));
            } else {
                const data = await response.json();
                setError(`Neural Decomposition Failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Decomposition failed:', error);
            setError('Neural Network Connection Lost: Backend unreachable.');
        } finally {
            setIsDecomposing(false);
        }
    };

    const handleDistribute = async () => {
        setIsDistributing(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}/match`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Map the matches to the team format
                const formattedTeam = data
                    .filter(m => m.score > 0) // Extra guard
                    .map(m => ({
                        profile: m.profile,
                        skills: m.skills,
                        assigned_task: m.suggested_task,
                        suggested_description: m.suggested_description,
                        suggested_deadline: m.suggested_deadline,
                        suggested_hours: m.suggested_hours || 8,
                        match_score: m.score,
                        reasoning: m.reasoning
                    }));
                setTeam(formattedTeam);

                // Filter the task pool: only keep tasks that were NOT assigned to anyone
                const assignedTitles = formattedTeam.map(m => m.assigned_task);
                setTasks(prevTasks => prevTasks.filter(t => !assignedTitles.includes(t.title)));

                setStatus(prev => ({
                    ...prev,
                    teamOptimized: true,
                    tasksBalanced: true
                }));
            } else {
                const data = await response.json();
                setError(`Neural Distribution Failed: ${data.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Distribution failed:', error);
            setError('Neural Network Connection Lost: API handshake failed.');
        } finally {
            setIsDistributing(false);
        }
    };

    // Auto-trigger decomposition if project is loaded but has no tasks
    useEffect(() => {
        if (project && tasks.length === 0 && !isDecomposing && !loading && !error) {
            handleDecompose();
        }
    }, [project, tasks.length, isDecomposing, loading, error]);

    // Auto-trigger distribution if we have tasks and a team from the project matching page but no assignments
    useEffect(() => {
        if (tasks.length > 0 && team.length > 0 && team.every(m => !m.assigned_task) && !isDistributing && !error) {
            const timer = setTimeout(() => {
                handleDistribute();
            }, 1000); // Give user a moment to see the tasks
            return () => clearTimeout(timer);
        }
    }, [tasks.length, team, isDistributing, error, handleDistribute]);


    const handleFinalize = async () => {
        setIsFinalizing(true);
        setError(null);
        try {
            // Sync assigned tasks into the project model
            // Ensure every team member has a unique task object
            const assignedTasks = team.map(m => ({
                title: m.assigned_task || "Project Implementation",
                description: m.suggested_description || m.reasoning || "Implementation of assigned module.",
                estimated_hours: 8,
                required_skills: m.matched_skills || [],
                priority: 'high',
                deadline: m.suggested_deadline || 'TBD',
                assigned_to: m.profile?._id || m.profile?.id
            }));

            const unassignedTasks = tasks.map(t => ({ ...t, assigned_to: null }));
            const allProjectTasks = [...unassignedTasks, ...assignedTasks];

            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'finalized',
                    assigned_team: team.map(m => m.profile?._id || m.profile?.id),
                    tasks: allProjectTasks
                })
            });

            if (response.ok) {
                localStorage.removeItem('nexo_project_draft');
                setIsFinalized(true);
                navigate('/admin/dashboard');
            } else {
                const data = await response.json();
                setError(`Deployment Failed: ${data.detail || 'Access denied'}`);
            }
        } catch (error) {
            console.error('Finalization failed:', error);
            setError('Neural Link Broken: Finalization could not be completed.');
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleEditTask = (type, index, data) => {
        setEditingTask({ type, index, data });
        setEditForm({
            title: data.title || data.assigned_task || '',
            description: data.description || data.reasoning || '',
            estimated_hours: data.estimated_hours || 0
        });
    };

    const handleSaveTaskEdit = async () => {
        if (!editingTask) return;

        const { type, index, data } = editingTask;
        let updatedTasks = [...tasks];
        let updatedTeam = [...team];

        if (type === 'pool') {
            updatedTasks[index] = { ...data, ...editForm };
            setTasks(updatedTasks);
        } else {
            updatedTeam[index] = {
                ...data,
                assigned_task: editForm.title,
                reasoning: editForm.description, // Store original reasoning or update with new desc
                estimated_hours: editForm.estimated_hours // Ensure it's in the profile or task data
            };
            setTeam(updatedTeam);
        }

        // Persist to backend
        try {
            await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tasks: updatedTasks,
                    // Note: full team updates might need more logic depending on sync but this works for local state
                })
            });
        } catch (err) {
            console.error('Failed to persist task edit:', err);
        }

        setEditingTask(null);
    };

    // Global Error Guard for the entire component logic
    if (error && !project && !loading) {
        return (
            <div className="orchestration-container min-h-screen flex items-center justify-center bg-[#0F0C1D]">
                <div className="text-center p-12 glass-panel border-red-500/30 max-w-2xl">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-6">dynamic_feed</span>
                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tighter">Neural Synchronization Failed</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed font-mono">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition-all">
                            Manual Re-Sync
                        </button>
                        <button onClick={() => navigate('/admin/dashboard')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all">
                            Abort to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orchestration-container min-h-screen flex items-center justify-center bg-[#0F0C1D]">
                <div className="text-center">
                    <div className="core-orb animate-pulse mb-8 mx-auto">
                        <span className="material-symbols-outlined text-3xl">hub</span>
                    </div>
                    <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Neural Core...</p>
                    <div className="mt-8 w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                        <div className="h-full bg-primary loading-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    // If we've reached here and still don't have a project, it's an unexpected state
    if (!project) {
        return (
            <div className="orchestration-container min-h-screen flex items-center justify-center bg-[#0F0C1D]">
                <div className="text-center glass-panel p-12 border-slate-800">
                    <span className="material-symbols-outlined text-slate-700 text-6xl mb-6">database_off</span>
                    <h3 className="text-white text-xl font-bold uppercase tracking-widest mb-4">Neural Data Missing</h3>
                    <p className="text-slate-500 font-mono text-sm max-w-md mx-auto mb-8">
                        The requested project identity could not be retrieved from the neural vault.
                        This may happen if the project was deleted or the session expired.
                    </p>
                    <button onClick={() => navigate('/admin/dashboard')} className="px-8 py-4 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] transition-all">
                        Return to Portfolio Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orchestration-container min-h-screen relative bg-grid">
            {/* Header / HUD */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <div className="flex items-center gap-8 pointer-events-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                        title="Back to Matching"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <Logo />
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">AI Orchestration status:</span>
                            <span className="agent-status-tag flex items-center gap-2 py-1.5 px-3 text-xs">
                                <div className="active-pulse w-2 h-2"></div>
                                Active
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-soft-cyan shadow-[0_0_5px_#5DE6FF]"></span>
                                <span>{team.filter(m => m.assigned_task).length} TASKS BALANCED</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`${status.tasksBalanced ? 'text-emerald-400' : 'text-amber-400'} material-symbols-outlined text-lg`}>
                                    {status.tasksBalanced ? 'check_circle' : 'warning'}
                                </span>
                                {status.tasksBalanced ? `${tasks.length || 0} Tasks Balanced` : 'Tasks Unbalanced'}
                            </div>
                            <div className="flex items-center gap-2">
                                Score: <span className="text-primary text-sm">{status.score}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    {error && (
                        <div className="mr-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 animate-shake">
                            <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</span>
                            <button onClick={() => setError(null)} className="ml-2 hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                        </div>
                    )}
                    <button className="px-4 py-2 bg-[#1b1736] border border-white/10 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        AI Lock ON
                    </button>
                    <button className="px-4 py-2 bg-[#1b1736] border border-white/10 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-white/5 transition-colors">
                        Agent Status
                    </button>
                </div>
            </header>

            <main className="pt-24 px-8 pb-32 grid grid-cols-12 gap-8 h-screen overflow-hidden">
                {/* Left Panel: Task Pool */}
                <section className="col-span-3 flex flex-col gap-6 overflow-hidden">
                    <div className="glass-panel p-6 flex-1 flex flex-col overflow-hidden neural-glow">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold uppercase tracking-widest text-slate-400">Task Pool <span className="text-sm text-slate-600 font-normal">(Unassigned Tasks)</span></h3>
                            {!status.tasksBalanced && <span className="material-symbols-outlined text-amber-400 text-sm">warning</span>}
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {tasks.length > 0 ? (
                                tasks.map((task, idx) => (
                                    <div key={idx} className="task-card">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-base font-bold text-white">{task.title}</h4>
                                            <button
                                                onClick={() => handleEditTask('pool', idx, task)}
                                                className="material-symbols-outlined text-sm text-primary hover:scale-110 transition-transform"
                                            >
                                                edit
                                            </button>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            {task.required_skills?.slice(0, 2).map((s, i) => (
                                                <span key={i} className="text-[11px] px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded uppercase font-bold">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>Deadline: <span className="text-red-400 font-bold uppercase">{task.deadline || 'TBD'}</span></span>
                                            <span className="flex items-center gap-1.5 font-bold">
                                                <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                                                {task.estimated_hours}h
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : team.length > 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <span className="material-symbols-outlined text-emerald-400 text-4xl mb-3">check_circle</span>
                                    <p className="text-sm font-bold text-white mb-1">Optimized Distribution</p>
                                    <p className="text-xs text-slate-400 line-clamp-3 px-4">All tasks have been rerouted optimally to the selected team members.</p>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <p className="text-xs text-slate-500 mb-4">No tasks generated. Use the Decomposition Agent to start.</p>
                                    <button
                                        onClick={handleDecompose}
                                        disabled={isDecomposing}
                                        className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all flex items-center gap-2"
                                    >
                                        {isDecomposing ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">psychology</span>}
                                        Task Decomposition Agent
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
                            <button
                                onClick={() => {
                                    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
                                    recognition.onresult = (event) => {
                                        const transcript = event.results[0][0].transcript;
                                        setTasks(prev => [...prev, { title: transcript, description: 'Added via Neural Voice.', estimated_hours: 4, required_skills: [] }]);
                                    };
                                    recognition.start();
                                }}
                                className="p-3 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 text-primary transition-all"
                                title="Neural Voice Task Injector"
                            >
                                <span className="material-symbols-outlined text-sm">mic</span>
                            </button>
                            <button className="p-3 bg-[#1b1736] border border-white/10 rounded-lg hover:bg-white/5">
                                <span className="material-symbols-outlined text-sm">sort</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Center: Core & Agent Actions */}
                <section className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative">
                    {/* Orb & Title */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="core-orb mb-[-10px] z-20">
                            {isDecomposing || isDistributing ? (
                                <div className="relative">
                                    <span className="material-symbols-outlined text-3xl animate-spin text-white opacity-40">settings</span>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">psychology</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="material-symbols-outlined text-3xl">hub</span>
                            )}
                        </div>
                        <div className="title-card flex flex-col items-center">
                            <h2 className="text-3xl font-bold tracking-tight mb-3 text-white">{project?.title || "Project Orchestration"}</h2>
                            <p className="text-xs font-mono text-slate-500 tracking-[0.3em] uppercase mb-4">
                                {project?.id || project?._id || "PRJ-IDENTITY"} - Neural Synchronization Active
                            </p>

                            {/* Deadline Indicator Moved to Center */}
                            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-6 shadow-[0_0_15px_rgba(139,124,255,0.1)]">
                                <span className={`material-symbols-outlined text-base ${project?.deadline ? 'text-primary' : 'text-slate-600'}`}>
                                    {project?.deadline ? 'event_upcoming' : 'event_busy'}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Deadline</span>
                                    <span className="h-3 w-px bg-white/10"></span>
                                    {project?.deadline ? (() => {
                                        const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                                        return (
                                            <span
                                                onClick={() => {
                                                    const newDate = prompt("Calibrate Baseline (YYYY-MM-DD):", project.deadline);
                                                    if (newDate) {
                                                        // Update local and remote
                                                        fetch(`${API_BASE_URL}/projects/${projectId}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                            },
                                                            body: JSON.stringify({ deadline: newDate })
                                                        }).then(() => fetchProjectDetails());
                                                    }
                                                }}
                                                className={`text-xs font-bold uppercase tracking-[0.1em] cursor-pointer hover:underline ${daysLeft < 3 ? 'text-red-400 animate-pulse' : 'text-white'}`}
                                            >
                                                {daysLeft <= 0 ? "Final Phase / Overdue" : `${daysLeft} Units (Days) Remaining`}
                                            </span>
                                        );
                                    })() : (
                                        <button
                                            onClick={() => {
                                                const newDate = prompt("Set Project Baseline (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
                                                if (newDate) {
                                                    fetch(`${API_BASE_URL}/projects/${projectId}`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                                        },
                                                        body: JSON.stringify({ deadline: newDate })
                                                    }).then(() => fetchProjectDetails());
                                                }
                                            }}
                                            className="text-xs font-bold text-primary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit_calendar</span>
                                            Set Baseline
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selected Team Members in Center */}
                            {team.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-4 mt-2">
                                    {team.map((member, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 group">
                                            <div className="relative">
                                                <img
                                                    src={(() => {
                                                        const url = member.profile?.avatar_url;
                                                        const name = member.profile?.full_name || 'User';
                                                        if (url) {
                                                            if (url.startsWith('http') || url.startsWith('data:')) return url;
                                                            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                                                            return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
                                                        }
                                                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B7CFF&color=fff`;
                                                    })()}
                                                    className="w-12 h-12 rounded-full border-2 border-primary/30 group-hover:border-primary transition-all object-cover"
                                                    alt={member.profile?.full_name}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#120F26] rounded-full"></div>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">{member.profile?.full_name?.split(' ')[0] || 'Member'}</span>
                                        </div>
                                    ))}

                                    {/* Add Employee Symbol */}
                                    <button
                                        onClick={() => {
                                            fetchAvailableEmployees();
                                            setShowTalentPanel(true);
                                        }}
                                        className="flex flex-col items-center gap-2 group transition-all"
                                        title="Neural Talent Selection"
                                    >
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 group-hover:border-primary group-hover:bg-primary/10 transition-all flex items-center justify-center text-primary/60 group-hover:text-primary">
                                            <span className="material-symbols-outlined text-xl">person_add</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-primary transition-colors">Add</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Connection Filaments (Visual) */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                            {/* In a real implementation, we would draw lines to each employee node */}
                        </div>
                    </div>


                    {team.length === 0 && tasks.length > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Workflow Ready for Distribution</p>
                            <button
                                onClick={handleDistribute}
                                disabled={isDistributing}
                                className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-10 py-5 rounded-xl shadow-[0_0_30px_rgba(139,124,255,0.4)] flex items-center gap-4 transition-all group"
                            >
                                <span>Task Distribution Agent</span>
                                <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">rocket_launch</span>
                            </button>
                        </div>
                    )}
                </section>

                {/* Right Panel: Selected Team */}
                <section className="col-span-3 flex flex-col gap-6 overflow-hidden">
                    <div className="glass-panel p-6 flex-1 flex flex-col overflow-hidden neural-glow">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold uppercase tracking-widest text-slate-400">Selected Team</h3>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold uppercase">
                                    <span className="material-symbols-outlined text-sm">bolt</span> Balanced
                                </span>
                                <span className="flex items-center gap-1 text-xs text-red-400 font-bold uppercase">
                                    <span className="material-symbols-outlined text-sm">warning</span> Conflicts X2
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {team.length > 0 ? team.map((member, idx) => (
                                <div key={idx} className="flex flex-col gap-3 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img
                                                    src={(() => {
                                                        const url = member.profile?.avatar_url;
                                                        const name = member.profile?.full_name || 'User';
                                                        if (url) {
                                                            if (url.startsWith('http') || url.startsWith('data:')) return url;
                                                            const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                                                            return `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
                                                        }
                                                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8B7CFF&color=fff`;
                                                    })()}
                                                    className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                                    alt={member.profile?.full_name}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#120F26] rounded-full"></div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">{member.profile?.full_name?.split(' ')[0] || 'Member'}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase">{member.profile?.specialization || 'Engineer'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">{member.match_score || 75}%</div>
                                            <div className="text-[10px] text-slate-600 uppercase font-mono tracking-tighter">Capacity</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 group-hover:border-primary/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-[10px] font-mono text-primary mb-1 uppercase tracking-widest opacity-70">Assigned Task</p>
                                                <p className="text-base font-bold text-white leading-tight">{member.assigned_task || 'Implementation'}</p>
                                            </div>
                                            <div className="flex flex-col items-end bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px] text-amber-400">hourglass_empty</span>
                                                    <span className="text-[10px] font-bold text-amber-400 uppercase leading-none">{member.suggested_hours || 0}h</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex gap-2">
                                                {(member.matched_skills || member.skills)?.slice(0, 2).map((s, i) => (
                                                    <span key={i} className="text-[10px] px-2.5 py-1 bg-white/10 text-slate-300 rounded uppercase font-bold border border-white/5">{s.skill_name || s}</span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleEditTask('team', idx, member)}
                                                className="text-xs font-bold text-primary hover:text-white px-3 py-1.5 bg-primary/10 rounded-lg transition-all flex items-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit_square</span>
                                                Calibrate
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-600">person_add</span>
                                    <p className="text-sm font-bold">Inert Team</p>
                                    <p className="text-xs text-slate-500">Wait for neural distribution.</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => handleEditTask('pool', tasks.length, { title: 'New Core Task', description: '', estimated_hours: 8 })}
                            className="mt-6 w-full py-4 border border-dashed border-primary/30 rounded-xl text-sm font-bold text-primary hover:text-white hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 bg-primary/5"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            <span>Sync New Task</span>
                        </button>
                    </div>
                </section>
            </main>

            {/* Bottom Orchestration Status */}
            <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#0F0C1D] via-[#0F0C1D]/90 to-transparent">
                <div className="max-w-[1440px] mx-auto glass-panel p-4 flex items-center justify-between border-white/10 bg-[#120F26]/80">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-6">
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Orchestration Status</span>
                            <div className="flex items-center gap-6 text-sm font-bold">
                                <span className="flex items-center gap-2 text-emerald-400">
                                    <span className="material-symbols-outlined text-base">done</span> Tasks Balanced
                                </span>
                                <span className="flex items-center gap-6 flex-1">
                                    <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500/50 w-3/4"></div>
                                    </div>
                                </span>
                                <span className="flex items-center gap-2 text-red-500">
                                    Conflicts X2
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
                            <span className="text-xs font-mono text-slate-400">Tasks redistribution successful.</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
                            Undo Changes
                        </button>
                        <button
                            onClick={handleFinalize}
                            disabled={team.length === 0 || isFinalizing || isFinalized}
                            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-primary/20 ${isFinalized ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:scale-[1.02]'}`}
                        >
                            {isFinalizing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Synchronizing...
                                </>
                            ) : isFinalized ? (
                                <>
                                    <span className="material-symbols-outlined">verified</span>
                                    Added to Portfolio
                                </>
                            ) : (
                                'Confirm Deployment'
                            )}
                        </button>
                    </div>
                </div>
            </footer>

            {/* Talent Selection Panel Modal */}
            {showTalentPanel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setShowTalentPanel(false)}></div>
                    <div className="relative w-full max-w-2xl glass-panel p-8 border-primary/30 shadow-[0_0_50px_rgba(139,124,255,0.2)] animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Neural Talent Discovery</h3>
                                <p className="text-xs text-slate-500 font-mono tracking-widest mt-1">SELECT PERSONNEL FOR CORE INTEGRATION</p>
                            </div>
                            <button onClick={() => setShowTalentPanel(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {talentPool.length > 0 ? talentPool.map((emp, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={emp.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.full_name}`}
                                                className="w-12 h-12 rounded-full border border-white/10"
                                                alt={emp.full_name}
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#120F26] rounded-full"></div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{emp.full_name}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{emp.specialization || 'Engineer'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddTeamMember(emp)}
                                        className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                        Integrate
                                    </button>
                                </div>
                            )) : (
                                <div className="py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">group_off</span>
                                    <p className="text-sm text-slate-500">No additional talent found in secure database.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Task Edit Modal */}
            {editingTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel p-8 w-full max-w-lg border-primary/30 relative overflow-hidden bg-[#120F26]">
                        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
                            <div className="absolute top-0 right-0 w-px h-12 bg-primary"></div>
                            <div className="absolute top-0 right-0 w-12 h-px bg-primary"></div>
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Calibration: Neural Task</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Task Objective</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all"
                                    placeholder="Enter specific task title..."
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Implementation Details</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-primary outline-none transition-all min-h-[120px] resize-none"
                                    placeholder="Brief technical description of task requirements..."
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 block">Neural Load (Estimated Hours)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="40"
                                        value={editForm.estimated_hours}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) }))}
                                        className="flex-1 accent-primary"
                                    />
                                    <span className="text-sm font-bold text-primary w-12 text-right">{editForm.estimated_hours}h</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setEditingTask(null)}
                                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTaskEdit}
                                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:scale-[1.02] shadow-lg shadow-primary/20 transition-all"
                            >
                                Update Core Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuralMappingPage;
