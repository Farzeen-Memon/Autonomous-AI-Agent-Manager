import React from 'react';

const AgentDecisions = () => {
    const logs = [
        {
            id: 1,
            time: "10:23 AM",
            type: "Analysis",
            message: "Analyzed project 'Nexo UI Update'",
            details: "Identified high-impact keywords: Dark Mode, Glassmorphism, Premium Design",
            agent: "Strategy Agent"
        },
        {
            id: 2,
            time: "10:24 AM",
            type: "Assignment",
            message: "Assigned task 'Create ThemeContext' to Frontend team",
            details: "Match score: 95% based on React and Context API skill tags",
            agent: "Assignment Agent"
        },
        {
            id: 3,
            time: "10:25 AM",
            type: "Alert",
            message: "Potential delay detected in Backend API development",
            details: "Missing database schema specification may cause 2-day delay",
            agent: "Monitor Agent"
        },
        {
            id: 4,
            time: "11:00 AM",
            type: "Optimization",
            message: "Re-prioritized Login Page to P0",
            details: "Blocks critical user onboarding flow affecting 3 downstream tasks",
            agent: "Planner Agent"
        },
    ];

    const getTypeColor = (type) => {
        switch (type) {
            case 'Analysis': return { bg: 'var(--accent-subtle)', text: 'var(--accent-primary)' };
            case 'Assignment': return { bg: 'var(--success-bg)', text: 'var(--success)' };
            case 'Alert': return { bg: 'var(--warning-bg)', text: 'var(--warning)' };
            case 'Optimization': return { bg: '#F3E8FF', text: '#9333EA' };
            default: return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
        }
    };

    return (
        <div className="agent-decisions fade-in">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">Agent Decision Log</h2>
                    <p className="dashboard-subtitle">Transparency audit trail of autonomous AI actions</p>
                </div>
                <button className="btn btn-secondary">
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>download</span>
                    Export CSV
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <div className="decisions-header">
                    <div className="decisions-filters">
                        <button className="filter-btn filter-btn-active">All Events</button>
                        <button className="filter-btn">Assignments</button>
                        <button className="filter-btn">Alerts</button>
                        <button className="filter-btn">Analysis</button>
                    </div>
                </div>

                <div className="decisions-list">
                    {logs.map(log => {
                        const colors = getTypeColor(log.type);
                        return (
                            <div key={log.id} className="decision-item">
                                <div className="decision-time">
                                    <span className="material-icons-outlined" style={{ fontSize: '16px' }}>schedule</span>
                                    {log.time}
                                </div>

                                <div className="decision-content">
                                    <div className="decision-header">
                                        <span
                                            className="decision-type-badge"
                                            style={{
                                                backgroundColor: colors.bg,
                                                color: colors.text
                                            }}
                                        >
                                            {log.type}
                                        </span>
                                        <span className="decision-agent">{log.agent}</span>
                                    </div>
                                    <h4 className="decision-message">{log.message}</h4>
                                    <p className="decision-details">{log.details}</p>
                                </div>

                                <button className="decision-action">
                                    <span className="material-icons-outlined">info</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="decisions-footer">
                    <button className="btn-ghost">Load more events</button>
                </div>
            </div>
        </div>
    );
};

export default AgentDecisions;
