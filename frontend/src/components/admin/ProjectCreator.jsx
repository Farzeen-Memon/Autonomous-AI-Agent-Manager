
import React, { useState, useEffect } from 'react';

const mockEmployees = [
    { id: 1, name: "Alice Dev", role: "Frontend", skills: ["React", "CSS"] },
    { id: 2, name: "Bob Backend", role: "Backend", skills: ["Python", "FastAPI"] },
    { id: 3, name: "Charlie AI", role: "AI", skills: ["LLM", "Python"] },
    { id: 4, name: "Dave Data", role: "Data", skills: ["SQL", "Postgres"] },
];

const ProjectCreator = ({ onCancel, onComplete }) => {
    const [step, setStep] = useState(1);
    const [projectData, setProjectData] = useState({ name: '', description: '' });
    const [analysis, setAnalysis] = useState(null);
    const [team, setTeam] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // AI Analysis Simulation
    useEffect(() => {
        if (step === 2 && !analysis) {
            setIsAnalyzing(true);
            const timer = setTimeout(() => {
                setAnalysis({
                    recommendedRoles: { Frontend: 2, Backend: 1, AI: 1 },
                    suggestedTeam: mockEmployees.slice(0, 4)
                });
                setTeam(mockEmployees.slice(0, 4));
                setIsAnalyzing(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [step, analysis]);

    // Task Generation Simulation
    useEffect(() => {
        if (step === 3 && tasks.length === 0) {
            setIsAnalyzing(true);
            const timer = setTimeout(() => {
                setTasks([
                    { id: 101, title: "Initialize Repo", role: "Backend", assignee: "Bob Backend" },
                    { id: 102, title: "Design System Setup", role: "Frontend", assignee: "Alice Dev" },
                    { id: 103, title: "AI Model Selection", role: "AI", assignee: "Charlie AI" },
                ]);
                setIsAnalyzing(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, tasks]);

    const handleNext = () => setStep(prev => prev + 1);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Stepper Header */}
            <div className="mb-8 border-b border-[var(--border-subtle)] padding-b-4">
                <div className="flex items-center space-x-2 text-sm">
                    <span className={`font-medium ${step === 1 ? 'text-[var(--primary-base)]' : 'text-[var(--text-secondary)]'}`}>1. Details</span>
                    <span className="text-[var(--text-tertiary)]">/</span>
                    <span className={`font-medium ${step === 2 ? 'text-[var(--primary-base)]' : 'text-[var(--text-secondary)]'}`}>2. Team Strategy</span>
                    <span className="text-[var(--text-tertiary)]">/</span>
                    <span className={`font-medium ${step === 3 ? 'text-[var(--primary-base)]' : 'text-[var(--text-secondary)]'}`}>3. Tasks</span>
                </div>
            </div>

            <div className="card bg-white p-0 overflow-hidden shadow-sm border border-[var(--border-subtle)]">
                {/* Step 1: Project Details */}
                {step === 1 && (
                    <div className="p-6 space-y-6">
                        <h2 className="text-xl font-semibold">New Project</h2>
                        <div>
                            <label className="label">Project Name</label>
                            <input
                                className="input"
                                placeholder="e.g. Finance Dashboard"
                                value={projectData.name}
                                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="label">Prompt / Requirements</label>
                            <textarea
                                className="input min-h-[120px]"
                                placeholder="Describe the application you want to build..."
                                value={projectData.description}
                                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                            />
                            <p className="text-xs text-[var(--text-secondary)] mt-2">
                                Our AI will analyze this prompt to determine roles and tasks.
                            </p>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] mt-6 bg-[var(--bg-surface-hover)] p-4 -m-6 -mt-0">
                            <button onClick={onCancel} className="btn btn-secondary mr-2">Cancel</button>
                            <button onClick={handleNext} className="btn btn-primary" disabled={!projectData.name}>Continue</button>
                        </div>
                    </div>
                )}

                {/* Step 2: Analysis & Team */}
                {step === 2 && (
                    <div className="p-6">
                        {isAnalyzing ? (
                            <div className="py-12 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-2 border-[var(--border-subtle)] border-t-[var(--primary-base)] rounded-full animate-spin mb-4"></div>
                                <p className="text-[var(--text-secondary)]">Analyzing requirements...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Suggested Team Structure</h2>
                                    <span className="badge badge-neutral">AI Response</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-[var(--border-subtle)] rounded-lg p-4 bg-[var(--bg-page)]">
                                        <h3 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">Roles Needed</h3>
                                        <ul className="space-y-2">
                                            {Object.entries(analysis?.recommendedRoles || {}).map(([role, count]) => (
                                                <li key={role} className="flex justify-between text-sm">
                                                    <span>{role}</span>
                                                    <span className="font-semibold">{count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Recommended Employees</h3>
                                    <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] font-medium">
                                                <tr>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2">Role</th>
                                                    <th className="px-4 py-2">Skills</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border-subtle)]">
                                                {team.map(emp => (
                                                    <tr key={emp.id} className="bg-white">
                                                        <td className="px-4 py-3 font-medium">{emp.name}</td>
                                                        <td className="px-4 py-3 text-[var(--text-secondary)]">{emp.role}</td>
                                                        <td className="px-4 py-3 text-[var(--text-tertiary)]">{emp.skills.join(', ')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] mt-6 -mx-6 -mb-6 bg-[var(--bg-surface-hover)] p-6">
                                    <button onClick={() => setStep(1)} className="btn btn-secondary mr-2">Back</button>
                                    <button onClick={handleNext} className="btn btn-primary">Approve & Plan Tasks</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Tasks */}
                {step === 3 && (
                    <div className="p-6">
                        {isAnalyzing ? (
                            <div className="py-12 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-2 border-[var(--border-subtle)] border-t-[var(--primary-base)] rounded-full animate-spin mb-4"></div>
                                <p className="text-[var(--text-secondary)]">Generating project plan...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Initial Task Plan</h2>
                                <div className="space-y-2">
                                    {tasks.map(task => (
                                        <div key={task.id} className="flex items-center justify-between p-3 border border-[var(--border-subtle)] rounded-md hover:bg-[var(--bg-surface-hover)] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]"></div>
                                                <span className="font-medium text-sm">{task.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                                                <span>{task.role}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-[var(--text-secondary)]">
                                                        <span className="material-icons-outlined" style={{ fontSize: '12px' }}>person</span>
                                                    </span>
                                                    <span>{task.assignee}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)] mt-6 -mx-6 -mb-6 bg-[var(--bg-surface-hover)] p-6">
                                    <button onClick={() => onComplete({ ...projectData, team, tasks })} className="btn btn-primary">Create Workspace</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCreator;
