import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/AdminDashboard.css';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useUser();
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
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
                setProjects(projects.filter(p => p._id !== projectId));
            } else {
                alert('Failed to delete project');
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project');
        }
    };

    const inventory = [
        {
            name: "Legacy API Bridge",
            status: "Active",
            statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            progress: 92,
            members: 14,
            icon: "terminal"
        },
        {
            name: "OAuth Integration",
            status: "Pending",
            statusColor: "bg-primary/10 text-primary border-primary/20",
            progress: 15,
            members: 3,
            icon: "security"
        }
    ];

    return (
        <div className="admin-dashboard-container dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark z-20">
                <div className="p-6">
                    <div className="mb-8">
                        <Logo />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest font-semibold ml-11">Admin Panel</p>
                    </div>
                    <nav className="space-y-2">
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg nav-link-active transition-all">
                            <span className="material-symbols-outlined fill-1">dashboard</span>
                            <span className="font-medium text-sm">Dashboard</span>
                        </Link>
                        <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <span className="material-symbols-outlined">analytics</span>
                            <span className="font-medium text-sm">Analytics</span>
                        </Link>
                        <Link to="/admin/employees" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <span className="material-symbols-outlined">group</span>
                            <span className="font-medium text-sm">Team Members</span>
                        </Link>
                        <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="font-medium text-sm">Settings</span>
                        </Link>
                    </nav>
                </div>
                <div className="mt-auto p-6">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Workspace Usage</p>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-primary" style={{ width: '72%' }}></div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">7.2 GB of 10 GB used</p>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                            {user?.profile?.avatar_url ? (
                                <img alt="Avatar" className="w-full h-full object-cover" src={user.profile.avatar_url} />
                            ) : (
                                <span className="material-symbols-outlined text-slate-400">person</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{user?.profile?.full_name || 'Admin Node'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative technical-grid custom-scrollbar overflow-y-auto">
                {/* Top Navbar */}
                <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-bold tracking-tight">Project Portfolio</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-tighter">Live System</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-primary focus:border-primary outline-none" placeholder="Search projects..." type="text" />
                        </div>
                        <button
                            onClick={() => navigate('/admin/project-matching')}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            <span>Create New Project</span>
                        </button>
                        <button
                            onClick={() => {
                                contextLogout();
                                navigate('/login');
                            }}
                            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </header>

                {/* Content Padding */}
                <div className="p-8">
                    {/* Project Grid - Active */}
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Active Neural Deployments</h1>
                            <p className="text-slate-500 dark:text-slate-400">Synchronizing resources for {projects.filter(p => !p.status || p.status === 'draft').length} active drafts.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {loading ? (
                            <div className="col-span-full py-10 text-center text-slate-500">
                                <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
                            </div>
                        ) : projects.filter(p => !p.status || p.status === 'draft').length === 0 ? (
                            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-60">
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">No Active Drafts Detected</p>
                            </div>
                        ) : (
                            projects.filter(p => !p.status || p.status === 'draft').map(project => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    navigate={navigate}
                                    onDelete={handleDeleteProject}
                                />
                            ))
                        )}
                    </div>

                    {/* Project Grid - Portfolio */}
                    <div className="mb-8 flex items-end justify-between">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-3xl">folder_managed</span>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">Neural Portfolio</h1>
                                <p className="text-slate-500 dark:text-slate-400">Repository of {projects.filter(p => p.status === 'finalized').length} architectural achievements.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {loading ? null : projects.filter(p => p.status === 'finalized').length === 0 ? (
                            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl opacity-60">
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Neural Portfolio Offline (0 Finalized)</p>
                            </div>
                        ) : (
                            projects.filter(p => p.status === 'finalized').map(project => (
                                <ProjectCard
                                    key={project._id}
                                    project={project}
                                    navigate={navigate}
                                    onDelete={handleDeleteProject}
                                    isPortfolio={true}
                                />
                            ))
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold">Detailed Inventory</h3>
                            <div className="flex gap-2">
                                <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined text-lg">filter_list</span>
                                </button>
                                <button className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <span className="material-symbols-outlined text-lg">download</span>
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                                        <th className="px-6 py-4">Project Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Progress</th>
                                        <th className="px-6 py-4">Team</th>
                                        <th className="px-6 py-4 text-right">Action</th>
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
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${item.statusColor}`}>{item.status}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1 rounded-full bg-slate-200 dark:bg-slate-800">
                                                        <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-bold">{item.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{item.members} Members</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-bold text-primary hover:underline">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const ProjectCard = ({ project, navigate, onDelete, isPortfolio = false }) => (
    <div
        onClick={() => navigate('/admin/project-details', { state: { projectId: project._id } })}
        className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-primary/50 transition-all group p-5 cursor-pointer relative ${isPortfolio ? 'neural-portfolio-card' : ''}`}
    >
        <button
            onClick={(e) => onDelete(e, project._id)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            title="Delete Project"
        >
            <span className="material-symbols-outlined text-sm">delete</span>
        </button>
        <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-lg ${project.status === 'finalized' ? 'text-primary bg-primary/10' : 'text-slate-500 bg-slate-100'}`}>
                <span className="material-symbols-outlined">{isPortfolio ? 'verified' : 'hub'}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${project.status === 'finalized' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
                {project.status || 'Draft'}
            </span>
        </div>
        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium line-clamp-2">{project.description}</p>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">Resources</span>
                    <span className="text-primary">{project.required_skills?.length || 0} Specialties</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${isPortfolio ? 'bg-emerald-500' : 'bg-primary'} glow-bar transition-all`} style={{ width: isPortfolio ? '100%' : '45%' }}></div>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex -space-x-2">
                    <div className="size-7 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                    <div className="size-7 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white">CH</div>
                </div>
                <button className="text-xs font-bold px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest">
                    {isPortfolio ? 'View Archive' : 'Open Neural Hub'}
                </button>
            </div>
        </div>
    </div>
);

export default AdminDashboardPage;
