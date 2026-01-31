import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
// Triggering re-build for real-time matching support
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { API_BASE_URL } from '../utils/constants';
import '../styles/ProjectMatching.css';

const ProjectMatchingPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [teamSize, setTeamSize] = useState(8);
    const [selectionMode, setSelectionMode] = useState('auto'); // 'auto' or 'manual'
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Standard');
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [experienceRequired, setExperienceRequired] = useState(2);
    const [description, setDescription] = useState('');

    const [employees, setEmployees] = useState([]);
    const [isMatching, setIsMatching] = useState(false);


    const fetchEmployees = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token'); // Simplistic token retrieval
            const response = await fetch(`${API_BASE_URL}/employees/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('📋 Fetched all employees (no scoring):', data.length, 'employees');
                setEmployees(data);
            } else {
                console.error("Failed to fetch employees");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    }, []);

    const handleAutoDistribute = React.useCallback(async () => {
        setSelectionMode('auto');
        setIsMatching(true);

        // Prepare project data for matching
        const projectData = {
            title: title || "Untitled Project",
            description: description,
            required_skills: skills.map(s => ({ skill_name: s, level: 'mid' })),
            experience_required: parseFloat(experienceRequired),
            team_size: parseInt(teamSize),
            assigned_team: []
        };

        console.log('🚀 Sending match request:', projectData);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/projects/match-preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const matches = await response.json();
                console.log('✅ Received match results:', matches);

                // Merge matches into the full employee list
                setEmployees(prevEmployees => {
                    const updated = prevEmployees.map(emp => {
                        // Extract ID robustly
                        const getEmpId = (e) => {
                            if (!e) return null;
                            const p = e.profile || e;
                            return p.id || p._id || (typeof p === 'string' ? p : null);
                        };

                        const empId = getEmpId(emp);

                        const match = matches.find(m => {
                            const matchId = getEmpId(m) || m.employee_id;
                            return String(matchId) === String(empId);
                        });

                        if (match) {
                            return {
                                ...emp,
                                score: match.score !== undefined ? match.score : match.match_score,
                                matched_skills: match.matched_skills,
                                reasoning: match.reasoning,
                                suggested_task: match.suggested_task
                            };
                        }
                        return {
                            ...emp,
                            score: 0,
                            matched_skills: [],
                            reasoning: null
                        };
                    });

                    const sorted = [...updated].sort((a, b) => (b.score || 0) - (a.score || 0));
                    return sorted;
                });
            } else {
                const errorText = await response.text();
                console.error("❌ Match failed:", errorText);
            }
        } catch (error) {
            console.error("💥 Error during matching:", error);
        } finally {
            setIsMatching(false);
        }
    }, [title, description, skills, experienceRequired, teamSize]);

    // Initial fetch of all employees
    React.useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Real-time matching (triggers whenever skills/title change)
    // Removed automatic trigger on skills change to allow manual control via button for clearer flow,
    // or we can keep it but we need to include teamSize in dependency.
    // Keeping it but throttling is fine, but adding teamSize to dependency might cycle too much while sliding.
    // Let's rely on the button for explicit "Distribute" action as implied by user.
    // But existing code had it. Let's keep it but maybe increase timeout?
    // Actually, user said "select agent must work". Often implies a button click. 
    // I'll keep the button as the primary driver but update the effect too.
    React.useEffect(() => {
        if (skills.length > 0) {
            const timer = setTimeout(() => {
                handleAutoDistribute();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [skills, title, teamSize, handleAutoDistribute]);


    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            if (!skills.includes(newSkill.trim())) {
                setSkills([...skills, newSkill.trim()]);
            }
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async () => {
        try {
            // Filter employees that are "selected". 
            // We take employees with a match score > 0.
            // AND we limit it to the teamSize to respect the "number of people needed".
            const selectedEmployeeIds = employees
                .filter(e => {
                    const s = parseFloat(e.score || e.match_score || 0);
                    return s > 0;
                })
                .slice(0, parseInt(teamSize)) // Limit to teamSize
                .map(e => e.profile?.id || e.profile?._id || e.employee_id);

            const projectData = {
                title: title || "Untitled Project",
                description: description,
                required_skills: skills.map(s => ({ skill_name: s, level: 'mid' })),
                experience_required: parseFloat(experienceRequired),
                team_size: parseInt(teamSize),
                status: 'draft',
                assigned_team: selectedEmployeeIds
            };

            const response = await fetch(`${API_BASE_URL}/projects/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const data = await response.json();
                const actualProjectId = data.id || data._id;
                // Pass the selected employees themselves to avoid refetching/rematching if possible, or just the ID.
                // We'll pass the ID and let the next page handle it, but we really should use the saved team.
                navigate('/admin/neural-mapping', { state: { projectId: actualProjectId, title: title || "Untitled Project" } });
            } else {
                console.error('Failed to create project');
                navigate('/admin/neural-mapping');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            navigate('/admin/neural-mapping');
        }
    };

    return (
        <div className="project-matching-container min-h-screen">
            <header className="border-b border-[#352e6b] bg-[#0F0C1D]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Logo />
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <a className="text-sm font-medium text-slate-400 hover:text-white transition-opacity" href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}>Dashboard</a>
                            <a className="text-sm font-medium text-primary" href="#" onClick={(e) => e.preventDefault()}>Projects</a>
                            <a className="text-sm font-medium text-slate-400 hover:text-white transition-opacity" href="#" onClick={(e) => { e.preventDefault(); navigate('/admin/employees'); }}>Employees</a>
                            <a className="text-sm font-medium text-slate-400 hover:text-white transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Settings</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input className="bg-[#1b1736] border-[#352e6b] rounded-lg pl-10 pr-4 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary outline-none w-64" placeholder="Search talent..." type="text" />
                        </div>
                        <button className="p-2 rounded-lg bg-[#1b1736] border border-[#352e6b] text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                        </button>
                        <div className={`w-8 h-8 rounded-full ${!user?.profile?.avatar_url ? 'bg-primary/20 border border-primary/40 flex items-center justify-center' : 'overflow-hidden border border-primary/40'}`}>
                            {user?.profile?.avatar_url ? (
                                <img src={user.profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="p-2 rounded-lg border border-[#352e6b] text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                            title="Logout"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[2200px] mx-auto px-6 py-8">
                <div className="flex items-center gap-2 mb-6 text-sm">
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Dashboard
                    </button>
                    <span className="material-symbols-outlined text-slate-600 text-xs">chevron_right</span>
                    <span className="text-primary font-medium">Human-Centric Project Matching</span>
                </div>

                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-white font-display">Project Definition & Matching</h1>
                    <p className="text-slate-400 max-w-2xl">Leverage AI-Assisted Human Orchestration to synchronize high-performance engineering teams with complex project requirements.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column: Project Identity */}
                    <div className="lg:col-span-5 flex flex-col">
                        <section className="bg-[#1b1736]/40 border border-[#352e6b] rounded-xl p-8 backdrop-blur-sm flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="material-symbols-outlined text-primary">person_search</span>
                                <h3 className="text-[38] font-bold text-white">Define Project Identity</h3>
                            </div>
                            <div className="space-y-8 flex-1">
                                <div>
                                    <label className="block text-xl font-medium text-slate-300 mb-3">Project Title</label>
                                    <input
                                        className="w-full bg-[#1b1736] border-[#352e6b] rounded-lg px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Next-Gen Infrastructure Migration"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xl font-medium text-slate-300 mb-3">Deadline</label>
                                        <div className="relative cursor-pointer" onClick={(e) => {
                                            const input = e.currentTarget.querySelector('input');
                                            if (input && 'showPicker' in input) input.showPicker();
                                        }}>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">calendar_today</span>
                                            <input
                                                className="w-full bg-[#1b1736] border-[#352e6b] rounded-lg px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                                                type="date"
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xl font-medium text-slate-300 mb-3">Priority Level</label>
                                        <select
                                            className="w-full bg-[#1b1736] border-[#352e6b] rounded-lg px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option>Standard</option>
                                            <option>High Priority</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xl font-medium text-slate-300 mb-3">Expertise Required</label>
                                    <div className="relative flex flex-wrap gap-2 p-4 bg-[#1b1736] border border-[#352e6b] rounded-lg min-h-[140px]">
                                        {skills.length === 0 && !newSkill && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-slate-600 text-lg italic opacity-40">Add required skills (e.g. Python, AWS)...</span>
                                            </div>
                                        )}
                                        {skills.map((skill, index) => (
                                            <span key={index} className="bg-primary/20 text-primary px-3 py-1.5 rounded-full text-base font-semibold flex items-center gap-1 border border-primary/30 z-10">
                                                {skill}
                                                <span
                                                    className="material-symbols-outlined text-base cursor-pointer hover:text-white"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                >
                                                    close
                                                </span>
                                            </span>
                                        ))}
                                        <input
                                            className="bg-transparent border-none focus:ring-0 text-sm py-1.5 px-2 w-32 text-white outline-none z-10"
                                            placeholder="+ Add skill"
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={handleAddSkill}
                                        />
                                    </div>
                                    <p className="text-[20px] text-slate-500 mt-3 italic">Personnel recommendations update in real-time based on tags.</p>
                                </div>
                                <div>
                                    <label className="block text-xl font-medium text-slate-300 mb-3">Avg. Experience Required (Years)</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">history_edu</span>
                                        <input
                                            className="w-full bg-[#1b1736] border-[#352e6b] rounded-lg px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            placeholder="e.g. 5"
                                            type="number"
                                            value={experienceRequired}
                                            onChange={(e) => setExperienceRequired(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-5">
                                        <label className="text-xl font-medium text-slate-300">Target Team Size</label>
                                        <span className="text-primary font-bold text-xl">{teamSize} Engineers</span>
                                    </div>
                                    <input
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer custom-slider accent-primary"
                                        max="24"
                                        min="1"
                                        type="range"
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(e.target.value)}
                                    />
                                    <div className="flex justify-between text-[20px] text-slate-500 mt-3 font-mono">
                                        <span>MIN (1)</span>
                                        <span>MAX (24)</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Recommended Personnel */}
                    <div className="lg:col-span-7 flex flex-col">
                        <section className="bg-[#1b1736]/40 border border-[#5DE6FF]/30 rounded-xl p-8 neural-glow flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="material-symbols-outlined text-neural-cyan text-3xl">groups</span>
                                        <div className="absolute inset-0 bg-[#5DE6FF]/20 blur-lg rounded-full"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-[30px] font-bold text-white">Recommended Personnel</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[15px] text-neural-cyan/70 font-mono uppercase tracking-widest">
                                                {isMatching ? "Scanning Human Potential..." : "Status: AI-Assisted Matching Active"}
                                            </p>
                                            {isMatching && <div className="w-2 h-2 rounded-full bg-neural-cyan animate-pulse"></div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center bg-[#0F0C1D]/80 p-1 rounded-lg border border-[#352e6b]">
                                    <button
                                        onClick={() => setSelectionMode('manual')}
                                        className={`px-6 py-2 text-base font-bold rounded-md transition-colors ${selectionMode === 'manual' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Manual Select
                                    </button>
                                    <button
                                        onClick={handleAutoDistribute}
                                        className={`px-6 py-2 text-base font-bold rounded-md transition-colors ${selectionMode === 'auto' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Auto Select
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between px-1 mb-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Top Employee Candidates</p>
                                    {isMatching && <div className="text-[10px] text-primary animate-pulse font-mono font-bold">CALIBRATING NEURAL WEIGHTS...</div>}
                                </div>

                                {isMatching && employees.length === 0 ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-32 bg-[#0F0C1D]/40 rounded-xl border border-[#352e6b] animate-pulse relative overflow-hidden">
                                                <div className="absolute inset-0 loading-bar opacity-20"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        {employees.map((emp, index) => (
                                            <div
                                                key={emp.profile?.id || emp.profile?._id || index}
                                                className="relative group animate-slide-up"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                <CandidateCard
                                                    name={emp.profile?.full_name || emp.employee_name}
                                                    role={emp.profile?.specialization || "Unassigned"}
                                                    score={emp.score !== undefined ? emp.score : (emp.match_score !== undefined ? emp.match_score : "N/A")}
                                                    img={emp.profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (emp.profile?.full_name || emp.employee_name)}
                                                    status="online"
                                                    defaultChecked={false}
                                                    matchedSkills={emp.matched_skills || []}
                                                />
                                                {emp.reasoning && (
                                                    <div className="absolute top-full left-0 right-0 z-10 p-4 bg-[#1b1736] text-sm text-slate-300 rounded-b-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 border border-[#352e6b] -translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-primary text-base">psychology</span>
                                                            <span className="text-primary font-bold uppercase text-xs tracking-wider">AI Matching Reasoning</span>
                                                        </div>
                                                        {emp.reasoning}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isMatching && employees.length === 0 && (
                                    <div className="p-12 text-center bg-[#0F0C1D]/20 rounded-xl border border-dashed border-[#352e6b]">
                                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">group_off</span>
                                        <p className="text-slate-400">No personnel matches identified for current criteria.</p>
                                        <button onClick={fetchEmployees} className="mt-4 text-primary text-sm hover:underline font-medium">Clear filters and show all talent</button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#352e6b] flex justify-between items-center">
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    Orchestration confidence: 0.9982 (Verified Human Profiles)
                                </div>
                                <button onClick={fetchEmployees} className="text-base font-bold text-primary hover:underline underline-offset-4 transition-all">Refresh Talent Pool</button>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0F0C1D] via-[#0F0C1D]/95 to-transparent z-40 pointer-events-none">
                    <div className="max-w-[1440px] mx-auto flex justify-center pointer-events-auto">
                        <button
                            onClick={handleSubmit}
                            className="bg-primary hover:bg-primary/90 text-background-dark font-bold text-xl px-16 py-5 rounded-xl shadow-2xl shadow-primary/30 flex items-center gap-4 transition-all transform hover:scale-[1.02] active:scale-95 group"
                        >
                            <span className="text-white">Initialize Project Mapping</span>
                            <span className="material-symbols-outlined text-white group-hover:rotate-12 transition-transform">account_tree</span>
                        </button>
                    </div>
                </div>
                <div className="h-32"></div>
            </main>
        </div>
    );
};

const CandidateCard = ({ name, role, score, img, status, defaultChecked, matchedSkills }) => {
    // Determine status dot color based on score
    const getStatusColor = () => {
        if (score === "N/A" || score === undefined || score === null) return 'bg-gray-500';
        const numScore = parseFloat(score);
        if (numScore >= 15) return 'bg-green-500';
        if (numScore >= 10) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getScoreColor = () => {
        if (score === "N/A" || score === undefined || score === null) return 'text-slate-400';
        const numScore = parseFloat(score);
        if (numScore >= 15) return 'text-green-500';
        if (numScore >= 10) return 'text-yellow-500';
        return 'text-red-400';
    };

    return (
        <div className="flex flex-col p-5 bg-[#0F0C1D]/60 rounded-xl border border-[#352e6b] group hover:border-primary/50 transition-all candidate-card-hover">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <img alt={name} className="w-14 h-14 rounded-lg bg-slate-800 object-cover border border-white/5" src={img} />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} border-2 border-[#0F0C1D] rounded-full`}></div>
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg">{name}</p>
                        <p className="text-sm text-slate-400 font-mono tracking-tight uppercase">{role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right group-hover:scale-110 transition-transform">
                        <div className={`${getScoreColor()} font-bold text-3xl leading-none`}>
                            {(score !== undefined && score !== null && score !== "N/A") ? Number(score).toFixed(1) : "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">Match Score</div>
                    </div>
                    <div className="w-px h-10 bg-[#352e6b]"></div>
                    <Toggle defaultChecked={defaultChecked} />
                </div>
            </div>

            {matchedSkills && matchedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                    {matchedSkills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-primary/5 text-primary/80 border border-primary/20 rounded-md uppercase font-mono flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-primary"></span>
                            {skill}
                        </span>
                    ))}
                    {matchedSkills.length > 4 && (
                        <span className="text-[9px] px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-md uppercase font-mono">
                            +{matchedSkills.length - 4} More
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

const Toggle = ({ defaultChecked }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                className="sr-only peer"
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
            />
            <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    );
};

export default ProjectMatchingPage;
