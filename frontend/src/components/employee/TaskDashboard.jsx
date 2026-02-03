import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import '../../styles/EmployeeDashboard.css';

const TaskDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('in_progress');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');

                // 1. Fetch Profile
                const profileRes = await fetch(`${API_BASE_URL}/employees/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileRes.json();
                setProfile(profileData.profile);

                // 2. Fetch Projects and filter tasks
                const projectsRes = await fetch(`${API_BASE_URL}/projects/my-projects`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (projectsRes.ok) {
                    const projects = await projectsRes.json();
                    let allTasks = [];

                    projects.forEach(project => {
                        if (project.tasks) {
                            project.tasks.forEach(task => {
                                // Match tasks assigned to this employee's ID
                                // task.assigned_to might be a string or object depending on serialization
                                const assignedToId = task.assigned_to?.$oid || task.assigned_to;
                                const profileId = profileData.profile._id?.$oid || profileData.profile._id;

                                if (assignedToId === profileId) {
                                    allTasks.push({
                                        ...task,
                                        projectId: project._id,
                                        projectTitle: project.title
                                    });
                                }
                            });
                        }
                    });

                    // Mock data if empty for demo purposes (to match the aesthetic request)
                    if (allTasks.length === 0) {
                        allTasks = [
                            {
                                title: "Backend API Migration – Phase 2",
                                description: "Migrate legacy endpoints to the new microservices architecture.",
                                priority: "high",
                                status: "in_progress",
                                deadline: "Due in 6 hours",
                                projectTitle: "Payment Platform Revamp",
                                projectId: "mock-1"
                            },
                            {
                                title: "Database Schema Update",
                                description: "Refactor user profiles for better indexing.",
                                priority: "medium",
                                status: "completed",
                                deadline: "Completed today",
                                projectTitle: "Data Resilience",
                                projectId: "mock-2"
                            },
                            {
                                title: "Fraud Detection Enhancement",
                                description: "Implement real-time analysis for transaction patterns.",
                                priority: "low",
                                status: "backlog",
                                deadline: "May 1",
                                projectTitle: "Security Suite",
                                projectId: "mock-3"
                            },
                            {
                                title: "API Authentication Module",
                                description: "Secure token exchange endpoints.",
                                priority: "medium",
                                status: "backlog",
                                deadline: "May 13",
                                projectTitle: "Security Suite",
                                projectId: "mock-4"
                            },
                            {
                                title: "React Dashboard Redesign",
                                description: "High impact UI overhaul.",
                                priority: "high",
                                status: "completed",
                                deadline: "Completed",
                                projectTitle: "Dashboard UX",
                                projectId: "mock-5"
                            }
                        ];
                    }

                    setTasks(allTasks);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

    // Find first in_progress task for hero, fallback to first in list
    const heroTask = tasks.find(t => t.status === 'in_progress') || tasks[0];

    if (loading) {
        return (
            <div className="employee-dashboard flex items-center justify-center h-screen bg-[#07020d]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl font-mono text-purple-400 animate-pulse tracking-widest">INITIALIZING NEURAL INTERFACE...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="employee-dashboard">
            <div className="glowing-bg-lines">
                <div className="line-1"></div>
                <div className="line-2"></div>
            </div>
            {/* Navigation */}
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <div className="nexo-logo-container">
                        <div className="nexo-brand">
                            NEXO
                        </div>
                        <div className="nexo-tagline">AI Connected</div>
                    </div>
                    <div className="stat-label border-l border-white/10 pl-6 ml-4 hidden md:block">
                        <span className="text-white/80 font-medium tracking-wide">Emplonien Control</span>
                    </div>
                    <div className="nav-stats ml-8 hidden lg:flex">
                        <div className="stat-item">
                            <span className="stat-label">Focus:</span>
                            <span className="stat-value highlight-yellow">92%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Efficiency:</span>
                            <span className="stat-value highlight-green">94%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Streak:</span>
                            <span className="stat-value">3 days</span>
                        </div>
                    </div>
                </div>
                <div className="nav-right">
                    <div className="user-profile-summary">
                        <div className="user-info-text text-right mr-3">
                            <span className="user-name">{profile?.full_name || 'Swapnil Patade'}</span>
                            <span className="user-role font-mono opacity-60">{profile?.specialization || 'ML ENGINEER'}</span>
                        </div>
                        <img
                            src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Swapnil'}
                            alt="Profile"
                            className="user-avatar-small"
                        />
                    </div>
                </div>
            </nav>

            <div className="dashboard-grid">
                <div className="main-content">
                    {/* Hero Section */}
                    {heroTask && (
                        <section className="hero-mission-section">
                            <div className="section-header">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                                        <i className="fas fa-bullseye text-purple-400 text-sm"></i>
                                    </div>
                                    <h2 className="text-2xl tracking-tight">Your Primary Mission Today</h2>
                                </div>
                                <p className="opacity-60 ml-11">Your tasks, momentum, and AI guided execution – in one place.</p>
                            </div>
                            <div className="mission-card mt-6">
                                <div className="mission-content">
                                    <div className="mission-top">
                                        <div className="mission-title-group">
                                            <h3 className="text-2xl font-bold mb-1">{heroTask.title}</h3>
                                            <div className="mission-project-info">
                                                <span className="opacity-80">{heroTask.projectTitle}</span>
                                                <span className="project-tag">PRJ-{heroTask.projectId?.toString().substring(0, 4).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <button className="btn-outline text-[10px] uppercase tracking-tighter py-1 px-3">
                                            <i className="fas fa-arrow-right mr-2"></i> Start Task
                                        </button>
                                    </div>
                                    <div className="mission-stats-row mt-6">
                                        <div className="mission-stat">
                                            <i className="fas fa-hourglass-start opacity-70"></i>
                                            <span className="text-orange-400 font-medium">{heroTask.deadline || 'Due in 6 hours'}</span>
                                        </div>
                                        <div className="mission-stat">
                                            <i className="fas fa-headphones opacity-70"></i>
                                            <span>High impact on team</span>
                                        </div>
                                        <div className="mission-stat">
                                            <i className="fas fa-check-circle opacity-70 text-green-400"></i>
                                            <span>95% Skill Match</span>
                                        </div>
                                    </div>
                                    <div className="mission-actions mt-8">
                                        <button className="btn-primary-glow flex items-center justify-center">
                                            <i className="fas fa-play mr-3"></i> Start Task
                                        </button>
                                        <button className="btn-outline flex items-center justify-center">
                                            <i className="fas fa-paper-plane mr-3 opacity-70"></i> Break into Subtasks (AI)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Kanban Board */}
                    <div className="mission-flow-board mt-4">
                        <div className="board-header border-b border-white/5 pb-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold tracking-wide">Mission Flow Board</h3>
                                <div className="flex gap-1 ml-4">
                                    <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                                    <div className="w-1 h-1 rounded-full bg-purple-500/40"></div>
                                    <div className="w-1 h-1 rounded-full bg-purple-500/20"></div>
                                </div>
                            </div>
                            <div className="board-tabs">
                                <span className={`board-tab ${activeTab === 'backlog' ? 'active' : ''}`} onClick={() => setActiveTab('backlog')}>
                                    <i className="fas fa-list-ul mr-2 text-[10px]"></i> Backlog
                                </span>
                                <span className={`board-tab ${activeTab === 'in_progress' ? 'active' : ''}`} onClick={() => setActiveTab('in_progress')}>
                                    <i className="fas fa-spinner fa-spin mr-2 text-[10px]"></i> In Progress
                                </span>
                                <span className={`board-tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                                    <i className="fas fa-check-double mr-2 text-[10px]"></i> Completed
                                </span>
                            </div>
                            <button className="btn-outline text-[10px] uppercase font-bold tracking-widest">+ Add Task</button>
                        </div>
                        <div className="kanban-columns">
                            {/* Backlog */}
                            <div className="kanban-col">
                                <div className="column-header mb-4 flex items-center justify-between">
                                    <span>Backlog</span>
                                    <span className="opacity-30">{getTasksByStatus('backlog').length}</span>
                                </div>
                                <div className="task-list">
                                    {getTasksByStatus('backlog').map((t, i) => (
                                        <TaskCard key={i} task={t} />
                                    ))}
                                    {getTasksByStatus('backlog').length === 0 && (
                                        <div className="text-[10px] text-center opacity-30 py-8 border border-dashed border-white/10 rounded-xl">Empty Backlog</div>
                                    )}
                                </div>
                            </div>
                            {/* In Progress */}
                            <div className="kanban-col">
                                <div className="column-header mb-4 flex items-center justify-between">
                                    <span>In Progress</span>
                                    <span className="opacity-30">{getTasksByStatus('in_progress').length}</span>
                                </div>
                                <div className="task-list">
                                    {getTasksByStatus('in_progress').map((t, i) => (
                                        <TaskCard key={i} task={t} />
                                    ))}
                                </div>
                            </div>
                            {/* Completed */}
                            <div className="kanban-col">
                                <div className="column-header mb-4 flex items-center justify-between">
                                    <span>Completed</span>
                                    <span className="opacity-30">{getTasksByStatus('completed').length}</span>
                                </div>
                                <div className="task-list">
                                    {getTasksByStatus('completed').map((t, i) => (
                                        <TaskCard key={i} task={t} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-content">
                    {/* Insights */}
                    <div className="glass-panel">
                        <div className="panel-title flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="fas fa-robot text-blue-400"></i>
                                <span>NEXO Insights</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                            </div>
                        </div>
                        <div className="insight-item mt-4">
                            <div className="insight-icon"><i className="fas fa-clock text-orange-400"></i></div>
                            <div className="insight-text">
                                <p className="text-[13px] leading-relaxed">Completing <strong>Backend API Migration</strong> within 6 hours boosts your Efficiency to <strong className="text-green-400">96%</strong></p>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-icon"><i className="fas fa-key text-blue-400"></i></div>
                            <div className="insight-text">
                                <p className="text-[13px] leading-relaxed">This task matches your <strong>ML skill set</strong> best</p>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-icon"><i className="fas fa-rocket text-purple-400"></i></div>
                            <div className="insight-text">
                                <p className="text-[13px] leading-relaxed">You're ahead of schedule today! <br />Great momentum.</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress & Momentum */}
                    <div className="glass-panel">
                        <div className="panel-title border-b border-white/5 pb-3">
                            <i className="fas fa-chart-pie text-purple-400 mr-2"></i>
                            <span>Progress & Momentum</span>
                        </div>
                        <div className="momentum-meter mt-6">
                            <div className="circular-progress">
                                <svg className="progress-circle-svg" viewBox="0 0 100 100" width="150" height="150">
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" style={{ stopColor: '#8a2be2', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#00d2ff', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <circle className="progress-bg" cx="50" cy="50" r="42"></circle>
                                    <circle className="progress-bar-path" cx="50" cy="50" r="42"
                                        style={{ strokeDasharray: 264, strokeDashoffset: 264 - (264 * 0.9) }}>
                                    </circle>
                                </svg>
                                <div className="progress-text">
                                    <span className="progress-percent text-3xl font-black">90%</span>
                                    <span className="progress-label font-bold text-[8px] opacity-60">Weekly Goal</span>
                                </div>
                            </div>
                            <div className="mini-stats-grid mt-6">
                                <div className="mini-stat-card border-none bg-white/5">
                                    <div className="mini-stat-info">
                                        <i className="fas fa-fire text-orange-500"></i>
                                        <span className="text-[11px] opacity-80">Focus Streak</span>
                                    </div>
                                    <span className="mini-stat-value text-white">3 Days</span>
                                </div>
                                <div className="mini-stat-card border-none bg-white/5">
                                    <div className="mini-stat-info">
                                        <i className="fas fa-bolt text-yellow-500"></i>
                                        <span className="text-[11px] opacity-80">Efficiency Boost</span>
                                    </div>
                                    <span className="mini-stat-value text-green-400">Active</span>
                                </div>
                                <div className="mini-stat-card border-none bg-white/5">
                                    <div className="mini-stat-info">
                                        <i className="fas fa-shield-alt text-blue-500"></i>
                                        <span className="text-[11px] opacity-80">Skill Mastery</span>
                                    </div>
                                    <span className="mini-stat-value">ML Level 2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Timeline */}
            <footer className="timeline-section mt-8">
                <div className="timeline-header flex items-center justify-center gap-4">
                    <span className="w-12 h-[1px] bg-white/10"></span>
                    <span className="tracking-[4px]">YOUR WEEK AT A GLANCE</span>
                    <span className="w-12 h-[1px] bg-white/10"></span>
                </div>
                <div className="timeline-track mt-8">
                    <div className="timeline-line"></div>
                    <div className="timeline-item">
                        <div className="timeline-task-preview opacity-60">Backend Migration</div>
                        <div className="timeline-point active"></div>
                        <div className="timeline-label opacity-40">Mon</div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-point active"></div>
                        <div className="timeline-label opacity-40">Tue</div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-point active scale-150 shadow-[0_0_15px_rgba(138,43,226,0.8)]"></div>
                        <div className="timeline-label font-bold text-white">Today</div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-task-preview opacity-0">...</div>
                        <div className="timeline-point"></div>
                        <div className="timeline-label opacity-40">Thu</div>
                    </div>
                    <div className="timeline-item">
                        <div className="timeline-point text-white/20">+?</div>
                        <div className="timeline-label opacity-40">Fri</div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const TaskCard = ({ task }) => (
    <div className="small-task-card group">
        <div className="task-card-top mb-3">
            <span className={`priority-badge priority-${task.priority} font-mono uppercase text-[9px] font-bold`}>{task.priority}</span>
            <span className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors uppercase">{task.deadline || 'May 1'}</span>
        </div>
        <h4 className="text-[13px] font-semibold mb-1 group-hover:text-purple-400 transition-colors">{task.title}</h4>
        <p className="text-[10px] text-white/40 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
        <div className="task-meta flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-[9px] opacity-40 font-mono">NODE-001</span>
            <div className="flex -space-x-2">
                <div className="w-4 h-4 rounded-full bg-white/10 border border-white/20 text-[8px] flex items-center justify-center">AI</div>
            </div>
        </div>
    </div>
);

export default TaskDashboard;
