import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Sidebar = ({ userRole = 'admin' }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Menu items based on role
    const adminMenuItems = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { name: 'Employees', path: '/admin/employees', icon: 'people' },
        { name: 'Decisions', path: '/admin/decisions', icon: 'psychology' },
        { name: 'Profile', path: '/admin/profile', icon: 'person' },
        { name: 'Settings', path: '/admin/settings', icon: 'settings' },
    ];

    const employeeMenuItems = [
        { name: 'Dashboard', path: '/employee', icon: 'dashboard' },
        { name: 'Tasks', path: '/employee/tasks', icon: 'task_alt' },
        { name: 'Profile', path: '/employee/profile', icon: 'person' },
        { name: 'Settings', path: '/employee/settings', icon: 'settings' },
    ];

    const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

    const handleLogout = () => {
        // Clear any auth tokens/session data here
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Branding */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <Logo className="sidebar-logo-container" textClassName="sidebar-title" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Workspace</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                        >
                            <span className="material-icons-outlined sidebar-icon">
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="sidebar-item sidebar-logout"
                >
                    <span className="material-icons-outlined sidebar-icon">
                        logout
                    </span>
                    <span>Logout</span>
                </button>
            </nav>

            {/* Footer / User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        <span className="material-icons-outlined">person</span>
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">
                            {userRole === 'admin' ? 'Admin User' : 'Employee'}
                        </div>
                        <div className="sidebar-user-email">
                            {userRole === 'admin' ? 'admin@nexo.ai' : 'employee@nexo.ai'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
