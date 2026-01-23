import React from 'react';

const RobotIllustration = () => {
    return (
        <div className="neural-interface-container">
            <div className="neural-head-wrap">
                <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNucHy1tkcDHGSoMzhnW0kRBrk4h8Q5hJ1we8sMnnq1U7JYQZsoEmenHe7hzDcZ-kIY6x8i1hJFln8uC10efp4T5vq9Kngm5yM1bOJA2tYVXeUsONGqZpVIAV6h1OWpTA0teGlclPvXJTJ_y5QuyLQ_VjCSp1rfaAZ1EY_cVKpXwS5mP_VbIqGsPB0ow4aj8-VF5JfIgjsaSXq2VTJQwZAhK5DqQ2x6SD9dcUQhIugAmJtOZW0S_BU1MfpGA3se6BsgHxp3cU2PNY"
                    alt="High-Fidelity Wireframe Humanoid"
                    className="neural-head-img"
                />

                {/* Integrity Overlay */}
                <div className="glass-panel-ui integrity-overlay fade-in">
                    <div className="overlay-header">
                        <span>CORE_INTEGRITY</span>
                        <span style={{ color: 'var(--soft-cyan)' }}>99.8%</span>
                    </div>
                    <div className="integrity-bar">
                        <div className="integrity-fill"></div>
                    </div>
                </div>

                {/* Identity Matrix Overlay */}
                <div className="glass-panel-ui matrix-overlay fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="overlay-header">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--soft-cyan)' }}>monitoring</span>
                            IDENTITY MATRIX
                        </span>
                    </div>
                    <div className="matrix-bars">
                        <div className="matrix-bar" style={{ height: '40%', background: 'rgba(139, 124, 255, 0.2)' }}></div>
                        <div className="matrix-bar" style={{ height: '70%', background: 'rgba(93, 230, 255, 0.4)' }}></div>
                        <div className="matrix-bar" style={{ height: '90%', background: 'rgba(139, 124, 255, 0.6)' }}></div>
                        <div className="matrix-bar" style={{ height: '60%', background: 'rgba(93, 230, 255, 0.6)' }}></div>
                    </div>
                </div>

                {/* Task Queue Overlay */}
                <div className="glass-panel-ui queue-overlay fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="overlay-header" style={{ color: 'var(--soft-cyan)' }}>
                        PROJECT TASK QUEUE
                    </div>
                    <div className="queue-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(248, 247, 255, 0.7)' }}>
                            <span>Agent_01_Routine</span>
                            <span style={{ color: 'var(--soft-cyan)' }}>RUNNING</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(248, 247, 255, 0.7)' }}>
                            <span>Neural_Training</span>
                            <span style={{ color: 'var(--electric-purple)' }}>PENDING</span>
                        </div>
                    </div>
                </div>

                {/* Connection Threads (Abstract lines from the design) */}
                <div className="connection-thread" style={{ width: '128px', transform: 'rotate(-15deg)', top: '48%', left: '50%' }}></div>
                <div className="connection-thread" style={{ width: '160px', transform: 'rotate(10deg)', top: '45%', left: '48%', opacity: 0.4 }}></div>
            </div>
        </div>
    );
};

export default RobotIllustration;
