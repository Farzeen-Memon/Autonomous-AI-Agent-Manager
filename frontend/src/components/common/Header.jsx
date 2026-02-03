import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';


const Header = ({ title }) => {
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useUser();

  const handleLogout = () => {
    contextLogout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="header-action-btn"
            aria-label="Go Back"
            style={{ marginRight: '0.5rem' }}
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest">{title}</span>
            </div>
          </div>
        </div>

        <div className="header-actions flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 mr-2 border-r border-slate-200 dark:border-slate-700 pr-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                  {user.profile?.full_name || 'Admin User'}
                </div>
                <div className="text-xs text-slate-500 font-medium leading-none">
                  {user.role || 'Administrator'}
                </div>
              </div>
              <div className="size-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
                <div className="size-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  {user.profile?.avatar_url ? (
                    <img src={user.profile.avatar_url} alt="Profile" className="size-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {(user.profile?.full_name || 'AD').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          <button className="header-action-btn" aria-label="Notifications">
            <span className="material-icons-outlined">notifications</span>
          </button>

          <button
            onClick={handleLogout}
            className="header-action-btn hover:text-red-500 transition-colors"
            title="Logout"
          >
            <span className="material-icons-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

