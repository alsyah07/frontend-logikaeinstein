import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    displayName: user?.displayName || user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    // Here you would typically make an API call to change the password
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      displayName: user?.displayName || user?.name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-info">
            <h2>{formData.displayName || formData.name}</h2>
            <p className="profile-role">Student</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">12</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat">
                <span className="stat-number">1,250</span>
                <span className="stat-label">Points</span>
              </div>
              <div className="stat">
                <span className="stat-number">85%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          {!isEditing ? (
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="How others see your name"
                />
                <small>This name will be shown in public areas</small>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Security</h3>
            {!showPasswordForm && (
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="password-actions">
                <button type="submit" className="save-password-btn">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="cancel-password-btn"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3>Account Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🎓</div>
              <div className="activity-content">
                <h4>Course Completed</h4>
                <p>You completed "Introduction to Data Science"</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⭐</div>
              <div className="activity-content">
                <h4>Points Earned</h4>
                <p>Earned 100 points for quiz completion</p>
                <span className="activity-time">1 week ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <h4>Profile Updated</h4>
                <p>You updated your profile information</p>
                <span className="activity-time">2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;