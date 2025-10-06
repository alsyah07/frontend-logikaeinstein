import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeMenu from './HomeMenu';
import ServicesMenu from './ServicesMenu';
import PortfolioMenu from './PortfolioMenu';
import ContactMenu from './ContactMenu';
import './NavigationMenu.css';

const NavigationMenu = ({ onMenuItemClick }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleAuth = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'login') {
      window.location.href = '/login';
    } else {
      logout();
      window.location.href = '/';
    }
    
    if (onMenuItemClick) onMenuItemClick();
  };

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();

    if (location.pathname !== '/') {
      window.location.href = `/#${targetId}`;
      return;
    }

    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (onMenuItemClick) onMenuItemClick();
  };

  const menuProps = {
    isActive,
    onScrollToSection: handleScrollToSection,
    onMenuItemClick
  };

  return (
    <ul className="nav">
      <HomeMenu {...menuProps} />
      <ServicesMenu {...menuProps} />
      <PortfolioMenu {...menuProps} />
      <ContactMenu {...menuProps} />

      <li className="scroll-to-section">
        <div className="main-white-button">
          {isAuthenticated && user ? (
            <div className="user-menu">
              <button
                type="button" 
                className="user-name-btn"
                onClick={() => window.location.href = '/dashboard'}
              >
                <i className="fa fa-user" />
                {user.name || user.username || 'User'}
              </button>
              {/* <button
                type="button"
                className="logout-btn" 
                onClick={(e) => handleAuth(e, 'logout')}
              >
                <i className="fa fa-sign-out" />
                Logout
              </button> */}
            </div>
          ) : (
            <button
              type="button"
              className="login-btn"
              onClick={(e) => handleAuth(e, 'login')}
            >
              <i className="fa fa-sign-in" />
              Login
            </button>
          )}
        </div>
      </li>
    </ul>
  );
};

export default NavigationMenu;