import React, { useState } from 'react';
import ProjectCreator from './ProjectCreator';

const WorkspaceDashboard = () => {
    const [view, setView] = useState('list');
    const [projects, setProjects] = useState([
        {
            id: 1,
            name: "Legacy System Migration",
            status: "In Progress",
            progress: 65,
            activeTasks: 12,
            teamSize: 4,
            updatedAt: '2h ago',
            priority: 'high'
        },
        {
            id: 2,
            name: "Q3 Analytics Dashboard",
            status: "Planning",
            progress: 10,
            activeTasks: 3,
            teamSize: 3,
            updatedAt: '1d ago',
            priority: 'medium'
        },
    ]);

    const handleCreateProject = (newProject) => {
        const project = {
            id: projects.length + 1,
            name: newProject.name,
            status: "Active",
            progress: 0,
            activeTasks: newProject.tasks.length,
            teamSize: newProject.team.length,
            updatedAt: 'Just now',
            priority: 'high'
        };
        setProjects([...projects, project]);
        setView('list');
    };

    if (view === 'create') {
        return (
            <div className="workspace-creator-view">
                <button
                    onClick={() => setView('list')}
                    className="btn-ghost back-button"
                >
                    <span className="material-icons-outlined">arrow_back</span>
                    Back to Dashboard
                </button>
                <ProjectCreator onCancel={() => setView('list')} onComplete={handleCreateProject} />
            </div>
        );
    }

    return (
        <div className="workspace-dashboard fade-in">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">Workspaces</h2>
                    <p className="dashboard-subtitle">Manage your AI-driven projects</p>
                </div>
                <button onClick={() => setView('create')} className="btn btn-primary">
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>add</span>
                    New Project
                </button>
            </div>

            {/* Metrics */}
            <div className="metrics-grid">
                <div className="metric-card card">
                    <div className="metric-content">
                        <div className="metric-label">Total Projects</div>
                        <div className="metric-value">{projects.length}</div>
                        <div className="metric-change positive">+2 this month</div>
                    </div>
                    <div className="metric-icon" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>
                        <span className="material-icons-outlined">folder</span>
                    </div>
                </div>

                <div className="metric-card card">
                    <div className="metric-content">
                        <div className="metric-label">Active Tasks</div>
                        <div className="metric-value">15</div>
                        <div className="metric-change positive">+5 today</div>
                    </div>
                    <div className="metric-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                        <span className="material-icons-outlined">task_alt</span>
                    </div>
                </div>

                <div className="metric-card card">
                    <div className="metric-content">
                        <div className="metric-label">Team Members</div>
                        <div className="metric-value">12</div>
                        <div className="metric-change neutral">No change</div>
                    </div>
                    <div className="metric-icon" style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
                        <span className="material-icons-outlined">groups</span>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="projects-section">
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Project Name</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Tasks</th>
                                    <th>Team</th>
                                    <th style={{ textAlign: 'right' }}>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(project => (
                                    <tr key={project.id} className="table-row-interactive">
                                        <td>
                                            <div className="project-name">
                                                <span className="material-icons-outlined project-icon">folder_open</span>
                                                {project.name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${project.status === 'Active' || project.status === 'In Progress' ? 'badge-success' :
                                                    project.status === 'Planning' ? 'badge-neutral' : 'badge-warning'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-cell">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: `${project.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="progress-text">{project.progress}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-secondary">{project.activeTasks}</span>
                                        </td>
                                        <td>
                                            <div className="avatar-group">
                                                {[...Array(Math.min(3, project.teamSize))].map((_, i) => (
                                                    <div key={i} className="avatar avatar-sm">
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                                {project.teamSize > 3 && (
                                                    <div className="avatar avatar-sm avatar-more">
                                                        +{project.teamSize - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className="text-tertiary" style={{ fontSize: '0.8125rem' }}>
                                                {project.updatedAt}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDashboard;
