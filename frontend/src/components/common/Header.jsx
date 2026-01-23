import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ title }) => {
  const navigate = useNavigate();
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
            <div className="header-avatar">
              <span className="material-icons-outlined">person</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/login')}
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
