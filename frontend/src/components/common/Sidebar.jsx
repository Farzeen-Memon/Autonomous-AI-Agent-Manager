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
            <nav className="sidebar-nav flex-1 px-4 py-6 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3 mb-2">Workspace</div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(139,124,255,0.1)]'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[13px] font-bold uppercase tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="sidebar-footer">
                <div className="sidebar-user flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white/10 group-hover:ring-primary/50 transition-all ${!user?.profile?.avatar_url ? 'bg-primary/20 text-primary' : ''}`} style={{ overflow: 'hidden' }}>
                        {user?.profile?.avatar_url ? (
                            <img
                                src={user.profile.avatar_url.startsWith('http') || user.profile.avatar_url.startsWith('data:') ? user.profile.avatar_url : `${API_BASE_URL}${user.profile.avatar_url.startsWith('/') ? '' : '/'}${user.profile.avatar_url}`}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-sm">person</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-white truncate group-hover:text-primary transition-colors">
                            {user?.profile?.full_name || (userRole === 'admin' ? 'Admin Node' : 'Employee')}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                            {user?.role || (userRole === 'admin' ? 'Administrator' : 'Personnel')}
                        </div>
                    </div>
                </div>
            </div>
        </aside >
    );
};

export default Sidebar;
