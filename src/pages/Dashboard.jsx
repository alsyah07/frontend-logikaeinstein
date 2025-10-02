import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'courses', label: 'Enrolled Courses', icon: '📚' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'membership', label: 'Membership', icon: '🏆' },
    { id: 'points', label: 'My Points', icon: '⭐' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'courses':
        return (
          <div className="dashboard-content">
            <h2>Enrolled Courses</h2>
            <div className="courses-grid">
              <div className="course-card">
                <div className="course-image">📊</div>
                <h3>Data Science Fundamentals</h3>
                <p>Progress: 75%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="course-card">
                <div className="course-image">🤖</div>
                <h3>Machine Learning Basics</h3>
                <p>Progress: 45%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-content">
            <h2>Settings</h2>
            <div className="settings-section">
              <h3>Notifications</h3>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Email notifications
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  Course updates
                </label>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="dashboard-content">
            <h2>Messages</h2>
            <div className="messages-list">
              <div className="message-item">
                <div className="message-avatar">👨‍🏫</div>
                <div className="message-content">
                  <h4>Instructor John</h4>
                  <p>Great progress on your latest assignment!</p>
                  <span className="message-time">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'membership':
        return (
          <div className="dashboard-content">
            <h2>Membership</h2>
            <div className="membership-card">
              <h3>Premium Member</h3>
              <p>Access to all courses and premium features</p>
              <div className="membership-benefits">
                <div className="benefit">✓ Unlimited course access</div>
                <div className="benefit">✓ Priority support</div>
                <div className="benefit">✓ Certificates</div>
              </div>
            </div>
          </div>
        );
      case 'points':
        return (
          <div className="dashboard-content">
            <h2>My Points</h2>
            <div className="points-summary">
              <div className="points-card">
                <h3>1,250</h3>
                <p>Total Points</p>
              </div>
              <div className="points-history">
                <h4>Recent Activity</h4>
                <div className="point-item">
                  <span>Completed Quiz: Data Analysis</span>
                  <span className="points-earned">+50 points</span>
                </div>
                <div className="point-item">
                  <span>Course Completion: Python Basics</span>
                  <span className="points-earned">+100 points</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Profile />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span>Welcome, {user?.name || 'User'}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="dashboard-main">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;