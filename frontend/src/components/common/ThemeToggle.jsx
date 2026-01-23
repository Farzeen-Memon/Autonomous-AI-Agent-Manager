import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle Theme"
        >
            <span className="theme-toggle-option" data-active={theme === 'light'}>
                Light
            </span>
            <span className="theme-toggle-divider">/</span>
            <span className="theme-toggle-option" data-active={theme === 'dark'}>
                Dark
            </span>
        </button>
    );
};

export default ThemeToggle;
