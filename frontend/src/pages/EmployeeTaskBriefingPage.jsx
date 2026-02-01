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
            <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-primary/10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Employee Execution Briefing</h2>
                        <p className="text-lavender text-sm mt-1">Review and manage your personalized task assignments</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-lavender">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-primary/20">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-white">{userName}</p>
                                <p className="text-xs text-lavender">{userRole}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-primary/30 overflow-hidden">
                                <img alt="Profile" className="w-full h-full object-cover" src={userAvatar} />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 px-4 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-panel p-6 rounded-2xl panel-border">
                            <p className="text-lavender text-xs font-bold uppercase tracking-wider mb-1">Active Tasks</p>
                            <h3 className="text-3xl font-bold text-white">12</h3>
                        </div>
                        <div className="bg-panel p-6 rounded-2xl panel-border">
                            <p className="text-lavender text-xs font-bold uppercase tracking-wider mb-1">Completed (Week)</p>
                            <h3 className="text-3xl font-bold text-white">48</h3>
                        </div>
                        <div className="bg-panel p-6 rounded-2xl panel-border">
                            <p className="text-lavender text-xs font-bold uppercase tracking-wider mb-1">Urgent Briefs</p>
                            <h3 className="text-3xl font-bold text-white text-cyan">3</h3>
                        </div>
                        <div className="bg-panel p-6 rounded-2xl panel-border">
                            <p className="text-lavender text-xs font-bold uppercase tracking-wider mb-1">Efficiency Score</p>
                            <h3 className="text-3xl font-bold text-white">94%</h3>
                        </div>
                    </div>

                    {/* Task List Table */}
                    <div className="bg-panel rounded-2xl panel-border overflow-hidden">
                        <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-white/5">
                            <h3 className="font-bold text-lg text-white">Task Execution List</h3>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-primary/10 text-sm font-medium text-lavender hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined text-sm">filter_list</span>
                                Sort By Priority
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-lavender text-xs font-bold uppercase tracking-widest">
                                        <th className="px-6 py-4">Task Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Assigned Date</th>
                                        <th className="px-6 py-4">Deadline</th>
                                        <th className="px-6 py-4">Skill Relevance</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-lavender opacity-50">
                                                <span className="material-symbols-outlined animate-spin mb-2">refresh</span>
                                                <p className="text-xs uppercase tracking-widest">Scanning Neural Links...</p>
                                            </td>
                                        </tr>
                                    ) : tasks.length > 0 ? (
                                        tasks.map((task, idx) => (
                                            <TaskRow
                                                key={idx}
                                                name={task.title}
                                                projectName={task.projectName}
                                                status="Assigned"
                                                date="Oct 12, 2023" // Could use project.created_at
                                                deadline={task.deadline || "TBD"}
                                                skills={task.required_skills || []}
                                                statusColor="bg-primary/20 text-primary border-primary/30"
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-lavender opacity-50">
                                                <p className="text-xs uppercase tracking-widest">No Active Assignments Foundation</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Productivity Insight */}
                        <div className="lg:col-span-2 bg-panel p-8 rounded-2xl panel-border flex items-center justify-between">
                            <div className="space-y-4">
                                <h4 className="text-xl font-bold text-white">Productivity Insight</h4>
                                <p className="text-lavender leading-relaxed max-w-md">Your task completion rate is 15% higher than last month. NEXO suggests focusing on <b>Machine Learning</b> tasks this afternoon for peak flow.</p>
                                <button className="px-6 py-2.5 bg-primary text-[#0F0C1D] font-bold rounded-xl hover:opacity-90 transition-all">View Performance Report</button>
                            </div>
                            <div className="hidden md:block">
                                <span className="material-symbols-outlined text-[100px] text-primary/20">psychology</span>
                            </div>
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="bg-panel rounded-2xl panel-border p-6">
                            <h4 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">event</span>
                                Upcoming Deadlines
                            </h4>
                            <div className="space-y-5">
                                <DeadlineItem icon="priority_high" name="Market Sentiment Analysis" deadline="Due in 4 hours" type="urgent" />
                                <DeadlineItem icon="schedule" name="API Integration Testing" deadline="Due Tomorrow" type="normal" />
                                <DeadlineItem icon="calendar_today" name="Neural Net Optimization" deadline="Due Oct 18" type="future" />
                            </div>
                            <button className="w-full mt-8 py-3 bg-white/5 border border-primary/10 rounded-xl text-xs font-bold text-lavender hover:bg-white/10 transition-all uppercase tracking-widest">
                                Open Schedule
                            </button>
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
