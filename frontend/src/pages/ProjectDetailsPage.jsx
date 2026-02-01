import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/ProjectDetails.css';

const ProjectDetailsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = location.state || {};
    const [projectData, setProjectData] = React.useState(null);
    const [team, setTeam] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

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

    return (
        <div className="project-details-container bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen font-display">
            <header className="border-b border-solid border-slate-200 dark:border-border-dark px-6 md:px-10 py-3 bg-white dark:bg-background-dark sticky top-0 z-50">
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <Logo />
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/admin/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-slate-500 dark:text-[#948dce]">Dashboard</Link>
                            <Link to="/admin/dashboard" className="text-primary text-sm font-semibold border-b-2 border-primary pb-1">Projects</Link>
                            <Link to="/admin/employees" className="text-sm font-medium hover:text-primary transition-colors text-slate-500 dark:text-[#948dce]">Employees</Link>
                            <Link to="/admin/settings" className="text-sm font-medium hover:text-primary transition-colors text-slate-500 dark:text-[#948dce]">Settings</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#948dce] text-xl">search</span>
                            <input className="w-64 bg-slate-100 dark:bg-border-dark border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary placeholder:text-slate-400 dark:placeholder:text-[#948dce] outline-none" placeholder="Search metrics..." type="text" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJo6cD5JAOXTuo8RqJR0vODY2PZ40xR2JqcXnVmT1kjm-z9k6ikW3q4HuSouPJDLGq0CqBZjXjgAKoX9volkeQEcmP13AlUXUGMssYtQ7gJ_aBbNrd8rvzS7V-aQyf0t7FPD06GBm-JHk0_EgOtJaU5voVsFLBjw0nHqvDmahfvRNCC-wCxcxap0gmr_hEVjDM1S5P78OzKLXD25TiqlBVjNSnRj5K_EIFmeTxgZbLzXB4KQFzLyVkiO3KOSnoEnYKBhWXLqIFFOg')" }}></div>
                        <button
                            onClick={() => navigate('/login')}
                            className="p-2 rounded-lg border border-slate-200 dark:border-border-dark text-slate-500 hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Link to="/admin/dashboard" className="flex items-center gap-1 text-primary hover:underline text-sm font-medium">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Portfolio
                        </Link>
                        <span className="text-slate-400 dark:text-[#948dce] text-sm">/</span>
                        <span className="text-slate-400 dark:text-[#948dce] text-sm font-medium">Active Projects</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-2">
                                {loading ? 'Initializing Interface...' : projectData?.title || 'Project Neural Core'}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className={`flex items-center gap-1.5 px-3 py-1 ${projectData?.status === 'finalized' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'} rounded-full text-xs font-bold uppercase tracking-wider`}>
                                    <span className={`w-2 h-2 ${projectData?.status === 'finalized' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'} rounded-full`}></span>
                                    Status: {projectData?.status || 'Active'}
                                </span>
                                <span className="text-slate-500 dark:text-[#948dce] text-sm font-mono uppercase">ID: {projectData?._id?.substring(0, 12)}...</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-border-dark hover:bg-slate-300 dark:hover:bg-primary/20 transition-all rounded-lg font-bold text-sm">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Export Data
                            </button>
                            <button
                                onClick={() => navigate('/admin/project-matching', { state: { projectId } })}
                                className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Edit Project
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Alert Section */}
                        <div className="bg-crimson-alert/15 border border-crimson-alert rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-crimson-alert flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-crimson-alert">Nexo AI: Replanning Required</h4>
                                    <p className="text-xs text-crimson-alert/80">A resource shift has invalidated the current timeline modules.</p>
                                </div>
                            </div>
                            <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">route</span>
                                Execute Re-route
                            </button>
                        </div>

                        {/* Analysis Card */}
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark p-8 flex flex-col md:flex-row items-center gap-10">
                            <div className="relative w-48 h-48 shrink-0">
                                <svg className="gauge-svg w-full h-full" viewBox="0 0 160 160">
                                    <circle className="text-slate-100 dark:text-border-dark" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12" />
                                    <circle className="gauge-circle shadow-lg" cx="80" cy="80" fill="transparent" r="70" stroke="#8B7CFF" strokeLinecap="round" strokeWidth="12" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl font-black leading-none">14</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#948dce] tracking-widest">Days Left</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-bold">Work Remaining Analysis</h3>
                                <p className="text-slate-500 dark:text-[#948dce] leading-relaxed">
                                    Project is currently <span className="text-primary font-bold">75% complete</span>. Based on current velocity, deployment is ahead of schedule by 2 days. The AI engine predicts a low risk of bottleneck in the final sprint phase.
                                </p>
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-border-dark">
                                    <div>
                                        <p className="text-xs text-slate-400 dark:text-[#948dce] uppercase font-bold tracking-tighter">Total Tasks</p>
                                        <p className="text-lg font-bold">142</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 dark:text-[#948dce] uppercase font-bold tracking-tighter">Completed</p>
                                        <p className="text-lg font-bold">106</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 dark:text-[#948dce] uppercase font-bold tracking-tighter">Resources</p>
                                        <p className="text-lg font-bold">8 Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team Performance Section */}
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                                <h3 className="text-xl font-bold">Assigned Team Performance</h3>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors">
                                        <span className="material-symbols-outlined text-sm">groups</span>
                                        Manage Team
                                    </button>
                                    <span className="text-sm font-medium text-[#948dce] cursor-pointer hover:text-primary transition-colors">View Full Team</span>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                {loading ? (
                                    <div className="py-10 text-center text-slate-500 animate-pulse font-mono text-xs uppercase tracking-widest">
                                        Fetching Team Profiles...
                                    </div>
                                ) : team.length === 0 ? (
                                    <div className="py-10 text-center text-slate-500 italic">
                                        No team members assigned to this neural core.
                                    </div>
                                ) : (
                                    team.map((member, idx) => (
                                        <div key={idx} className="employee-row group flex flex-col sm:flex-row sm:items-center gap-4 relative">
                                            <div className="flex items-center gap-4 min-w-[200px]">
                                                <img
                                                    alt={`${member.profile.full_name} avatar`}
                                                    className="w-10 h-10 rounded-full object-cover grayscale"
                                                    src={member.profile.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAaOZf7n7G1HMD5clSidK04vMqgB31u5IonIUlUo9FKjMHYO80Ztal1uJ7g1_jZtAqe7rEhytZ_pmfsx64eS3Mvr--vNDLVdgVm1YSo84VEfvfzFxfQL7rkf7R949hyiDDq7B9AJQgVZDonf9LROj1BxiIThwsmGRIO5PUVdd5pNyuR6RAO81YDtYHRErMpO8tTpqeM4jMuDFe_d-4WWR2cnWeLQGNNijksvaUk3zi1fejNMmGmCzYkzaruZju7Tbj3Xd-LJ41HijI"}
                                                />
                                                <div>
                                                    <p className="font-bold">{member.profile.full_name}</p>
                                                    <p className="text-xs text-slate-400 dark:text-[#948dce]">
                                                        {member.skills[0]?.skill_name || 'Neural Specialist'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#948dce]">
                                                        Operational Capability
                                                    </span>
                                                    <span className="text-xs font-bold text-secondary-cyan">100%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                                                    <div className="h-full bg-secondary-cyan rounded-full" style={{ width: `100%` }}></div>
                                                </div>
                                            </div>
                                            <button className="remove-trigger opacity-0 absolute -right-2 top-0 sm:relative sm:top-auto sm:right-auto p-1.5 text-slate-400 hover:text-crimson-alert transition-all">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                                <button className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-border-dark flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">person_add</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-400 dark:text-[#948dce] group-hover:text-primary">Add Member</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Aside */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">lock</span>
                                    <h4 className="font-bold text-lg">Resource Lock</h4>
                                </div>
                                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 dark:bg-black/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    Status: Locked
                                </div>
                                <p className="text-xs text-slate-500 dark:text-[#948dce]">Current project resources are locked to prevent cross-allocation until Milestone 4 is reached.</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-border-dark flex items-center justify-between">
                                <h4 className="font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                                    System Logs
                                </h4>
                                <span className="text-[10px] font-black uppercase text-slate-400">Live</span>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded bg-crimson-alert/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-crimson-alert text-sm">psychology</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-crimson-alert mb-1 uppercase tracking-tighter">Pending - AI Re-optimization</p>
                                        <p className="text-sm text-slate-300">Member departure detected. Awaiting manual trigger to re-map <span className="font-bold">14 operational modules</span>.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">10:42 AM - AI REASSIGNMENT</p>
                                        <p className="text-sm">Task <span className="text-primary font-mono">#402-B</span> moved from <span className="font-bold">Felix</span> to <span className="font-bold text-secondary-cyan">Aria</span> to optimize visual sprint.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded bg-green-500/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">09:15 AM - MILESTONE REACHED</p>
                                        <p className="text-sm">Database schema validation successful for <span className="italic text-slate-300">Alpha Core</span>.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-sm">lock</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">08:00 AM - SECURITY</p>
                                        <p className="text-sm">Resource Lock <span className="font-bold text-primary">Enabled</span> by System Admin.</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#948dce] hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors border-t border-slate-100 dark:border-border-dark">
                                View Complete Audit Trail
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-4 rounded-xl">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Logged Hours</p>
                                <p className="text-xl font-bold">1,240</p>
                                <p className="text-[10px] text-green-500 font-bold">+5% vs avg</p>
                            </div>
                            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-4 rounded-xl">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Burn Rate</p>
                                <p className="text-xl font-bold">68%</p>
                                <div className="w-full h-1 bg-slate-100 dark:bg-border-dark mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '68%' }}></div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="mt-20 py-10 border-t border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark/50">
                <div className="max-w-[1440px] mx-auto px-10 flex justify-between items-center text-slate-400 dark:text-[#948dce] text-sm">
                    <p>© 2024 Nexo Analytics Engine. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-primary transition-colors" href="#">Documentation</a>
                        <a className="hover:text-primary transition-colors" href="#">API Status</a>
                        <a className="hover:text-primary transition-colors" href="#">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ProjectDetailsPage;
