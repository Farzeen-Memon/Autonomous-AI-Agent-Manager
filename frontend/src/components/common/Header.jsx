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

