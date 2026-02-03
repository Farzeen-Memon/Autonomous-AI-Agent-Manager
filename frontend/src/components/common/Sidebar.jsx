import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useUser } from '../../context/UserContext';
import { API_BASE_URL } from '../../utils/constants';

const Sidebar = ({ userRole = 'admin' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useUser();

    // Menu items based on role
    const adminMenuItems = [
        { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
        { name: 'Decisions', path: '/admin/decisions', icon: 'psychology' },
        { name: 'Employees', path: '/admin/employees', icon: 'people' },
        { name: 'Profile', path: '/admin/profile', icon: 'person' },
    ];

    const employeeMenuItems = [
        { name: 'Dashboard', path: '/employee', icon: 'dashboard' },
        { name: 'Tasks', path: '/employee/tasks', icon: 'task_alt' },
        { name: 'Profile', path: '/employee/profile', icon: 'person' },
    ];

    const menuItems = userRole === 'admin' ? adminMenuItems : employeeMenuItems;

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Branding */}
            <div className="sidebar-header">
                <div className="sidebar-brand flex items-center justify-start">
                    <Logo className="sidebar-logo-container flex items-center gap-3" textClassName="sidebar-title" />
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
            </nav>

            {/* Footer / User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className={`sidebar-avatar ${!user?.profile?.avatar_url ? 'bg-primary/20 flex items-center justify-center' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                        {user?.profile?.avatar_url ? (
                            <img
                                src={user.profile.avatar_url.startsWith('http') || user.profile.avatar_url.startsWith('data:') ? user.profile.avatar_url : `${API_BASE_URL}${user.profile.avatar_url.startsWith('/') ? '' : '/'}${user.profile.avatar_url}`}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>person</span>
                        )}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">
                            {user?.profile?.full_name || (userRole === 'admin' ? 'Admin Node' : 'Employee')}
                        </div>
                        <div className="sidebar-user-email">
                            {user?.role || (userRole === 'admin' ? 'Administrator' : 'Personnel')}
                        </div>
                    </div>
                </div>
            </div>
        </aside >
    );
};

export default Sidebar;
