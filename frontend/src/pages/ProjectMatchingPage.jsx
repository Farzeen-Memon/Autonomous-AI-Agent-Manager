import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import '../styles/ProjectMatching.css';

const ProjectMatchingPage = () => {
    const navigate = useNavigate();
    const [teamSize, setTeamSize] = useState(8);
    const [selectionMode, setSelectionMode] = useState('auto'); // 'auto' or 'manual'
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Standard');
    const [skills, setSkills] = useState(['Systems Architecture', 'Full-Stack Engineering', 'Cloud Security']);
    const [newSkill, setNewSkill] = useState('');
    const [experienceRequired, setExperienceRequired] = useState(5);
    const [description, setDescription] = useState('Leveraging AI-Assisted Human Orchestration to synchronize high-performance engineering teams with complex project requirements.');

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
            const projectData = {
                title: title || "Untitled Project",
                description: description,
                required_skills: skills.map(s => ({ skill_name: s, level: 'mid' })),
                experience_required: parseFloat(experienceRequired),
                status: 'draft'
            };

            const response = await fetch('http://localhost:8000/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const data = await response.json();
                navigate('/admin/neural-mapping', { state: { projectId: data._id, title: title || "Untitled Project" } });
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
                            <a className="text-sm font-medium text-slate-400 hover:text-white transition-opacity" href="#" onClick={(e) => e.preventDefault()}>Engineers</a>
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
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
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
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">calendar_today</span>
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
                                    <div className="flex flex-wrap gap-2 p-4 bg-[#1b1736] border border-[#352e6b] rounded-lg min-h-[140px]">
                                        {skills.map((skill, index) => (
                                            <span key={index} className="bg-primary/20 text-primary px-3 py-1.5 rounded-full text-base font-semibold flex items-center gap-1 border border-primary/30">
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
                                            className="bg-transparent border-none focus:ring-0 text-sm py-1.5 px-2 w-32 text-white outline-none"
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
                                        <p className="text-[15px] text-neural-cyan/70 font-mono uppercase tracking-widest">Status: AI-Assisted Matching Active</p>
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
                                        onClick={() => setSelectionMode('auto')}
                                        className={`px-6 py-2 text-base font-bold rounded-md transition-colors ${selectionMode === 'auto' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Auto-Distribute
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5 flex-1">
                                <p className="text-base font-semibold text-slate-500 uppercase tracking-widest px-1">Top Engineering Candidates</p>

                                <CandidateCard
                                    name="Felix Chen"
                                    role="Senior Systems Architect"
                                    score="98.4%"
                                    img="https://lh3.googleusercontent.com/aida-public/AB6AXuAaOZf7n7G1HMD5clSidK04vMqgB31u5IonIUlUo9FKjMHYO80Ztal1uJ7g1_jZtAqe7rEhytZ_pmfsx64eS3Mvr--vNDLVdgVm1YSo84VEfvfzFxfQL7rkf7R949hyiDDq7B9AJQgVZDonf9LROj1BxiIThwsmGRIO5PUVdd5pNyuR6RAO81YDtYHRErMpO8tTpqeM4jMuDFe_d-4WWR2cnWeLQGNNijksvaUk3zi1fejNMmGmCzYkzaruZju7Tbj3Xd-LJ41HijI"
                                    status="online"
                                    defaultChecked={true}
                                />

                                <CandidateCard
                                    name="Aria Volkov"
                                    role="Lead Full-Stack Engineer"
                                    score="94.1%"
                                    img="https://lh3.googleusercontent.com/aida-public/AB6AXuBUfD6CIXhWjgj7zvMg2TvuCXa6r5yRiX-pYjpZeO5iYHxqjrhMfmT2e4LIsM4OSULrJrgVeOJhgQN4pcYdHiPv1V7H05h-6Ev5smrzUpyagaQj6AOedZb34gWa24voQW-66-1N_pmIGPk7SXRrOxOVUPjKl2xs36cLEXo9CfK1D_PcTKJkHKfss5PA9xcZ0mPfpEEB-XIjZ1VA3aVY1Icy5gIMLZs-EiEHkZIsjkBaqQcdJA-OkAfvy5-PoHXej0c4pZtXfU36ae4"
                                    status="online"
                                    defaultChecked={true}
                                />

                                <CandidateCard
                                    name="Xavier Thorne"
                                    role="Cybersecurity Lead"
                                    score="87.5%"
                                    img="https://lh3.googleusercontent.com/aida-public/AB6AXuDLtIqED_GoRiDeLf9LXQSzvrmPscI2CnATcwuss7-9yoikYjc35Sy3eQsja62VVACS0iUoIfA2sbLZbCPzFpN-ADTDZ7kb9X-zR2e3wFvYYFMlxbf-PehrE_Oj-w1RTpTrDdY-Vtdfs6kFeqMA_CB6dsbGMvTJZcWLBEaFaKRgkdCWvRGbfpq9RPPKY9N7f0_8eodCgWgrgC_-Ywse9pVsa9QpLonJb0VhM_S7BcQ7Rru3FE313ylovBQZ1_0tR_Z3w4D79zLjASY"
                                    status="away"
                                    defaultChecked={false}
                                />

                                <div className="p-8 bg-[#0F0C1D]/20 rounded-xl border border-dashed border-[#352e6b]/60 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-3 py-6">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#5DE6FF]/50 animate-pulse"></div>
                                            <div className="w-2 h-2 rounded-full bg-[#5DE6FF]/50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-[#5DE6FF]/50 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                        <p className="text-base text-slate-500 uppercase tracking-[0.25em] font-mono">Analyzing personnel availability...</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-[#352e6b] flex justify-between items-center">
                                <div className="text-xs text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    Orchestration confidence: 0.9982 (Verified Human Profiles)
                                </div>
                                <button className="text-base font-bold text-primary hover:underline underline-offset-4 transition-all">Refresh Talent Pool</button>
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

const CandidateCard = ({ name, role, score, img, status, defaultChecked }) => (
    <div className="flex items-center justify-between p-5 bg-[#0F0C1D]/60 rounded-xl border border-[#352e6b] group hover:border-[#5DE6FF]/50 transition-all">
        <div className="flex items-center gap-5">
            <div className="relative">
                <img alt={name} className="w-14 h-14 rounded-lg bg-slate-800 object-cover border border-white/5" src={img} />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${status === 'online' ? 'bg-green-500' : 'bg-amber-500'} border-2 border-[#0F0C1D] rounded-full`}></div>
            </div>
            <div>
                <p className="font-bold text-white text-lg">{name}</p>
                <p className="text-sm text-slate-400">{role}</p>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <div className="text-right">
                <div className="text-neural-cyan font-bold text-2xl leading-none">{score}</div>
                <div className="text-[15px] text-neural-cyan/60 uppercase font-mono tracking-tighter">Match Score</div>
            </div>
            <div className="w-px h-10 bg-[#352e6b]"></div>
            <Toggle defaultChecked={defaultChecked} />
        </div>
    </div>
);

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
