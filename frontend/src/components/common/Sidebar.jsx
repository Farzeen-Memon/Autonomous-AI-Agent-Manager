import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useUser } from '../../context/UserContext';

const Sidebar = ({ userRole = 'admin' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useUser();

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
        contextLogout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            {/* Branding */}
            <div className="sidebar-header">
                <div className="sidebar-brand flex flex-col items-start">
                    <Logo className="sidebar-logo-container" textClassName="sidebar-title" />
                    {userRole === 'admin' && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold ml-11">Admin Panel</p>
                    )}
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
                    <div className={`sidebar-avatar ${!user?.profile?.avatar_url ? 'bg-primary/20 flex items-center justify-center' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                        {user?.profile?.avatar_url ? (
                            <img src={user.profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        </aside>
    );
};

export default Sidebar;
