import React, { useState } from 'react';

const TaskDashboard = () => {
    const tasks = [
        { id: 1, title: 'Setup Auth0 Integration', project: 'Legacy Migration', priority: 'High', status: 'todo', dueDate: 'Tomorrow' },
        { id: 2, title: 'Review PR #402', project: 'Legacy Migration', priority: 'Medium', status: 'todo', dueDate: 'Friday' },
        { id: 3, title: 'Implement Dashboard Charts', project: 'Nexo Analytics', priority: 'High', status: 'in-progress', dueDate: 'Today' },
        { id: 4, title: 'API Schema Design', project: 'Nexo Analytics', priority: 'Low', status: 'done', dueDate: 'Yesterday' },
    ];

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
                {/* To Do Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <span className="kanban-column-indicator" style={{ backgroundColor: '#F59E0B' }}></span>
                            To Do
                        </div>
                        <span className="kanban-column-count">{tasks.filter(t => t.status === 'todo').length}</span>
                    </div>
                    <div className="kanban-column-content">
                        {tasks.filter(t => t.status === 'todo').map(task => (
                            <div key={task.id} className="task-card card">
                                <div className="task-card-header">
                                    <span className={`badge badge-${task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'neutral'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <h4 className="task-card-title">{task.title}</h4>
                                <p className="task-card-project">{task.project}</p>
                                <div className="task-card-footer">
                                    <div className="task-card-due">
                                        <span className="material-icons-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                        {task.dueDate}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <span className="kanban-column-indicator" style={{ backgroundColor: 'var(--accent-primary)' }}></span>
                            In Progress
                        </div>
                        <span className="kanban-column-count">{tasks.filter(t => t.status === 'in-progress').length}</span>
                    </div>
                    <div className="kanban-column-content">
                        {tasks.filter(t => t.status === 'in-progress').map(task => (
                            <div key={task.id} className="task-card card card-active">
                                <div className="task-card-header">
                                    <span className={`badge badge-${task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'neutral'}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <h4 className="task-card-title">{task.title}</h4>
                                <p className="task-card-project">{task.project}</p>
                                <div className="task-card-progress">
                                    <div className="progress-bar" style={{ maxWidth: '100%' }}>
                                        <div className="progress-fill" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Done Column */}
                <div className="kanban-column">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <span className="kanban-column-indicator" style={{ backgroundColor: 'var(--success)' }}></span>
                            Done
                        </div>
                        <span className="kanban-column-count">{tasks.filter(t => t.status === 'done').length}</span>
                    </div>
                    <div className="kanban-column-content">
                        {tasks.filter(t => t.status === 'done').map(task => (
                            <div key={task.id} className="task-card card task-card-done">
                                <h4 className="task-card-title">{task.title}</h4>
                                <p className="task-card-project">{task.project}</p>
                                <div className="task-card-footer">
                                    <span className="material-icons-outlined" style={{ fontSize: '16px', color: 'var(--success)' }}>check_circle</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDashboard;
