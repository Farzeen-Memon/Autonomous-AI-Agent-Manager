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
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="header-action-btn"
            aria-label="Go Back"
            style={{ marginRight: '0.5rem' }}
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="header-title">{title}</h1>
        </div>

        <div className="header-actions">
          <button className="header-action-btn" aria-label="Notifications">
            <span className="material-icons-outlined">notifications</span>
          </button>

          <div className="header-divider"></div>

          <div className="header-profile-mini">
            <div className="header-info-text text-right mr-3 hidden sm:block">
              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">{user?.profile?.full_name || 'Neural Node'}</p>
              <p className="text-[10px] uppercase text-slate-500">{user?.role || 'Guest'}</p>
            </div>
            <div className={`header-avatar ${!user?.profile?.avatar_url ? 'bg-primary/20 flex items-center justify-center' : ''}`} style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
              {user?.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
              ) : (
                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>person</span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="header-action-btn"
            style={{ marginLeft: '1rem', color: '#ff4d4d' }}
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
