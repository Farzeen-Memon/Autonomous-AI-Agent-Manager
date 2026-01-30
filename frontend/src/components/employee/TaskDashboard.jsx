import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const TaskDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchMyProjects = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/projects/my-projects`, {
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
        fetchMyProjects();
    }, []);

    // Helper to map tasks (if we had them)
    // For now, let's treat projects as "active deployments"

    return (
        <div className="task-dashboard fade-in">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">My Tasks</h2>
                    <p className="dashboard-subtitle">Manage your assigned work</p>
                </div>
                <div className="task-header-actions">
                    {/* Actions can go here if needed */}
                </div>
            </div>

            <div className="kanban-board">
                {/* Active Deployments Column */}
                <div className="kanban-column" style={{ flex: '1 1 100%' }}>
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <span className="kanban-column-indicator" style={{ backgroundColor: 'var(--accent-primary)' }}></span>
                            Assigned Neural Deployments
                        </div>
                        <span className="kanban-column-count">{loading ? '...' : projects.length}</span>
                    </div>
                    <div className="kanban-column-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {loading ? (
                            <div className="p-10 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                                Synchronizing Neural Links...
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 italic">
                                No active neural deployments assigned to your node.
                            </div>
                        ) : (
                            projects.map(project => (
                                <div key={project._id} className="task-card card card-active hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="task-card-header">
                                        <span className="badge badge-success uppercase tracking-wider text-[10px]">Active</span>
                                        <span className="text-[10px] text-slate-500 font-mono">ID: {project._id.substring(0, 8)}</span>
                                    </div>
                                    <h4 className="task-card-title">{project.title}</h4>
                                    <p className="task-card-project line-clamp-2">{project.description}</p>
                                    <div className="task-card-progress mt-4">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold uppercase text-primary">Neural Optimization</span>
                                            <span className="text-[10px] font-bold text-primary">85%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: '85%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDashboard;
