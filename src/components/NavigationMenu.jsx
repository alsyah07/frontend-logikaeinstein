import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HomeMenu from './HomeMenu';
import ServicesMenu from './ServicesMenu';
import PortfolioMenu from './PortfolioMenu';
import ContactMenu from './ContactMenu';

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

      <style>{`
        /* Base Styles */
        .user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        /* Button Styles */
        .user-name-btn,
        .logout-btn,
        .login-btn {
          border: none;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 25px;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          white-space: nowrap;
          min-width: fit-content;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Button Variants */
        .user-name-btn {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }
        
        .user-name-btn:hover {
          background: linear-gradient(135deg, #218838, #1aa085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        
        .logout-btn {
          background: linear-gradient(135deg, #dc3545, #e74c3c);
          color: white;
        }
        
        .logout-btn:hover {
          background: linear-gradient(135deg, #c82333, #c0392b);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }
        
        .login-btn {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }
        
        .login-btn:hover {
          background: linear-gradient(135deg, #0056b3, #004085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .main-white-button {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Responsive Styles */
        @media (max-width: 992px) {
          .user-menu {
            gap: 12px;
            justify-content: center;
            margin-top: 10px;
          }
          
          .user-name-btn,
          .logout-btn,
          .login-btn {
            padding: 8px 16px;
            font-size: 13px;
          }
        }
        
        @media (max-width: 768px) {
          .user-menu {
            gap: 10px;
            margin-top: 15px;
            width: 100%;
          }
          
          .user-name-btn,
          .logout-btn,
          .login-btn {
            padding: 8px 14px;
            font-size: 12px;
            min-width: 80px;
            margin: 0;
          }
          
          .main-white-button {
            width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .user-menu {
            gap: 8px;
            margin-top: 10px;
            padding: 0 10px;
          }
          
          .user-name-btn,
          .logout-btn,
          .login-btn {
            padding: 6px 12px;
            font-size: 11px;
            min-width: 70px;
            max-width: 120px;
          }
        }
      `}</style>
    </ul>
  );
};

export default NavigationMenu;
