import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { API_BASE_URL } from '../utils/constants';
import '../styles/AdminDashboard.css';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/projects/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
                setError(null);
            } else {
                setError("Core Link Synchronization Failed. Check credentials.");
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError("Neural Network Connection Error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };


    React.useEffect(() => {
        fetchProjects();
    }, []);

    const handleDeleteProject = async (e, projectId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                setProjects(projects.filter(p => (p._id || p.id) !== projectId));
            } else {
                alert('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project');
        }
    };

    const allTasks = projects.flatMap(p => p.tasks || []);
    const totalMissions = allTasks.length;
    const completedMissions = allTasks.filter(t => t.status === 'completed').length;
    const inProgressMissions = allTasks.filter(t => t.status === 'in_progress').length;
    const projectEfficiency = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

    const inventory = projects.slice(0, 5).map(p => {
        const pTasks = p.tasks || [];
        const pCompleted = pTasks.filter(t => t.status === 'completed').length;
        const pEff = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;

        return {
            name: p.title,
            status: p.status === 'finalized' ? "Active" : "Draft",
            statusColor: p.status === 'finalized' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20",
            progress: pEff,
            members: p.assigned_team?.length || 0,
            icon: p.status === 'finalized' ? "terminal" : "pending_actions"
        };
    });

    return (
        <AdminLayout title="Project Portfolio">
            <div className="p-8 relative technical-grid">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black tracking-tighter uppercase">Project Portfolio</h1>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black border border-emerald-500/20 rounded uppercase tracking-widest">Live System</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end w-full md:w-auto">
                        <div className="relative max-w-sm w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('nexo_project_draft');
                                navigate('/admin/project-matching');
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/30"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            <span>Create New Project</span>
                        </button>
                    </div>
                </div>

                {/* Meta-Data Report Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl">account_tree</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Project Load</p>
                        <h4 className="text-3xl font-black text-white leading-none mb-4">{projects.length} <span className="text-xs text-slate-600">Active Links</span></h4>
                        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            System Health: 100%
                        </div>
                    </div>

                    <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl">task_alt</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Completed Missions</p>
                        <h4 className="text-3xl font-black text-emerald-500 leading-none mb-4">{completedMissions} <span className="text-xs text-slate-600">Tasks</span></h4>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${projectEfficiency}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl">bolt</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Operational Velocity</p>
                        <h4 className="text-3xl font-black text-primary leading-none mb-4">{inProgressMissions} <span className="text-xs text-slate-600">In Motion</span></h4>
                        <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm animate-pulse">radar</span>
                            Live Execution Trace
                        </div>
                    </div>

                    <div className="bg-[#110E23]/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl">monitoring</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Neural Efficiency</p>
                        <h4 className="text-4xl font-black text-white leading-none mb-2">{projectEfficiency}%</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate Score</p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 animate-shake">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <span className="material-symbols-outlined text-red-500">link_off</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tighter">{error}</p>
                            <p className="text-xs text-slate-500">The neural core could not be reached. Attempts to re-sync automatable...</p>
                        </div>
                        <button
                            onClick={fetchProjects}
                            className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 text-xs font-bold rounded-lg transition-all"
                        >
                            Retry Sync
                        </button>
                    </div>
                )}

                {/* Project Grid - Active (Finalized/Deployed) */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight mb-1">Active Projects</h3>
                        <p className="text-sm text-slate-500 font-medium">Monitoring {projects.filter(p => p.status === 'finalized').length} enterprise-grade deployments across 4 clusters.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span>Sort by:</span>
                        <div className="flex items-center gap-1 text-primary cursor-pointer">
                            <span>Recently Modified</span>
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-500">
                            <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
                            <p className="font-mono uppercase tracking-widest text-xs">Syncing Portfolio Data...</p>
                        </div>
                    ) : projects.filter(p => p.status === 'finalized').length === 0 ? (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-60">
                            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inventory_2</span>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No Active Deployments Found</p>
                        </div>
                    ) : (
                        projects.filter(p => p.status === 'finalized').map(project => (
                            <ProjectCard
                                key={project._id || project.id}
                                project={project}
                                navigate={navigate}
                                onDelete={handleDeleteProject}
                                isPortfolio={true}
                            />
                        ))
                    )}
                </div>

                {/* Project Grid - PENDING (Drafts) */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">pending_actions</span>
                        Neural Drafts
                    </h3>
                    <span className="text-xs font-mono text-slate-500">{projects.filter(p => !p.status || p.status === 'draft').length} Pending Link</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {loading ? null : projects.filter(p => !p.status || p.status === 'draft').length === 0 ? (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-60">
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No Pending Drafts Found</p>
                        </div>
                    ) : (
                        projects.filter(p => !p.status || p.status === 'draft').map(project => (
                            <ProjectCard
                                key={project._id || project.id}
                                project={project}
                                navigate={navigate}
                                onDelete={handleDeleteProject}
                                isPortfolio={false}
                                isDraft={true}
                            />
                        ))
                    )}
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold">Inventory Baseline</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                    <th className="px-6 py-4">Project Identity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Efficiency</th>
                                    <th className="px-6 py-4">Scale</th>
                                    <th className="px-6 py-4 text-right">Admin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {inventory.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                                                </div>
                                                <span className="text-sm font-semibold">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${item.statusColor}`}>{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-800">
                                                    <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold">{item.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{item.members} Nodes</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter">Calibrate</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const ProjectCard = ({ project, navigate, onDelete, isPortfolio = false, isDraft = false }) => {
    const projId = project._id || project.id;
    return (
        <div
            onClick={() => {
                if (isDraft) {
                    navigate('/admin/neural-mapping', { state: { projectId: projId } });
                } else {
                    navigate('/admin/project-details', { state: { projectId: projId } });
                }
            }}
            className={`bg-[#110E23]/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-primary transition-all group p-6 cursor-pointer relative shadow-2xl ${isPortfolio ? 'neural-portfolio-card' : ''}`}
        >
            <div className="flex items-start justify-between mb-8">
                <div className={`p-3 rounded-xl ${project.status === 'finalized' ? 'text-primary bg-primary/10' : 'text-slate-500 bg-slate-800'}`}>
                    <span className="material-symbols-outlined text-2xl">{isPortfolio ? 'psychology' : 'hub'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase tracking-widest ${project.status === 'finalized' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-800/50 border-slate-700'}`}>
                        {project.status || 'Draft'}
                    </span>
                    <button
                        onClick={(e) => onDelete(e, projId)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all z-20 group/del"
                        title="Delete Project"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>

            <h3 className="text-xl font-black mb-1 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{project.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium line-clamp-2 h-8 leading-relaxed italic">
                {project.description || "Leveraging AI-Assisted Human Orchestration to synchronize high-performance engineering teams with..."}
            </p>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="text-slate-500">Mission Progress</span>
                        <span className="text-primary">{project.tasks?.length || 0} Tasks Assigned</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        {(() => {
                            const pTasks = project.tasks || [];
                            const pCompleted = pTasks.filter(t => t.status === 'completed').length;
                            const pEff = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;
                            return (
                                <div className={`h-full ${pEff === 100 ? 'bg-emerald-500' : 'bg-primary'} glow-bar transition-all duration-1000`} style={{ width: `${pEff || (isPortfolio ? 100 : 0)}%` }}></div>
                            );
                        })()}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <div className="flex -space-x-3">
                        {project.team_previews && project.team_previews.length > 0 ? (
                            project.team_previews.slice(0, 3).map((member, idx) => (
                                <div key={idx} className="size-9 rounded-full border-2 border-[#110E23] bg-slate-800 overflow-hidden ring-1 ring-white/5 group-hover:ring-primary/40 transition-all shadow-lg">
                                    {member.avatar_url ? (
                                        <img
                                            src={member.avatar_url.startsWith('http') || member.avatar_url.startsWith('data:') ? member.avatar_url : `${API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL}${member.avatar_url.startsWith('/') ? member.avatar_url : '/' + member.avatar_url}`}
                                            alt={member.full_name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-[10px] font-black text-white uppercase bg-slate-700">
                                            {member.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600">AI</div>
                                <div className="size-8 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600">CH</div>
                            </div>
                        )}
                    </div>
                    <button className="text-[10px] font-black px-4 py-2 rounded border border-slate-800 hover:border-primary hover:text-primary transition-all uppercase tracking-widest text-slate-400 bg-slate-900/50">
                        {isPortfolio ? 'Details' : 'Sync'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default AdminDashboardPage;
