import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogIn, Calendar, Clock, UserRoundPen } from 'lucide-react';
import { EditCard } from './PopUp';
import '../styles/ComponentStyles/UserProfile.css';

const UserProfile = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Get current user from AuthContext
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Dynamic user data
  const userData = user || {
    name: 'Unknown',
    role: '',
    department: '',
    employeeId: ''
  };

  // Dynamic login history (fetch from backend if needed)
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    // Example: fetch login history for current user
    async function fetchLoginHistory() {
      if (!userData.employeeId) return;
      try {
        const res = await fetch(`/api/v1/auth/login-history?employeeId=${userData.employeeId}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setLoginHistory(data.data.slice(0, 5));
        } else {
          setLoginHistory([]);
        }
      } catch {
        setLoginHistory([]);
      }
    }
    fetchLoginHistory();
  }, [userData.employeeId]);

  // Optionally, you can use location.pathname to show which page the user is handling
  const currentPage = location.pathname;

  const handlePasswordModalOpen = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordError('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSave = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      // Add API call here to change password
      // await fetch('/api/v1/auth/change-password', {
      //   method: 'POST',
      //   credentials: 'include',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword
      //   })
      // });
      
      setTimeout(() => {
        setPasswordLoading(false);
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully');
      }, 1000);
    } catch (error) {
      setPasswordError('Failed to change password');
      setPasswordLoading(false);
    }
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="user-profile-header-text">
          <h2>
            <User size={28} style={{ color: '#5B9AA9' }} />
            User Profile
          </h2>
        </div>
      </div>

      {/* Single Combined Panel */}
      <div className="user-profile-panel">
        {/* Edit Button - Top Right (Change Password) */}
        <button 
          onClick={handlePasswordModalOpen}
          className="profile-edit-btn"
          title="Change Password"
        >
          <UserRoundPen size={20} />
        </button>

        {/* User Information Section */}
        <div className="user-info-section">
          <div className="user-info-header">
            <div className="user-avatar">
              <User size={40} style={{ color: 'white' }} />
            </div>
            <div className="user-info-main">
              <h3 className="user-name">{userData.name}</h3>
              <p className="user-role">{userData.role}</p>
            </div>
          </div>
          <div className="user-info-details">
            <div className="detail-item">
              <label className="detail-label">Department</label>
              <p className="detail-value">{userData.department}</p>
            </div>
            <div className="detail-item">
              <label className="detail-label">Employee ID</label>
              <p className="detail-value">{userData.employeeId}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="panel-divider"></div>

        {/* Login History Section */}
        <div className="login-history-section">
          <div className="login-history-header">
            <h3 className="login-history-title">
              <LogIn size={24} style={{ color: '#5B9AA9' }} />
              Login History
            </h3>
            <p className="login-history-subtitle">Last 5 logins</p>
          </div>
          <div className="login-history-table">
            <div className="login-history-table-header">
              <div className="table-col-date">Date</div>
              <div className="table-col-time">Time</div>
            </div>
            <div className="login-history-rows">
              {loginHistory.map((login, index) => (
                <div key={login.id} className="login-history-row">
                  <div className="table-col-date">
                    <span className="login-row-icon">
                      <Calendar size={16} style={{ color: '#5B9AA9' }} />
                    </span>
                    {login.date}
                  </div>
                  <div className="table-col-time">
                    <span className="login-row-icon">
                      <Clock size={16} style={{ color: '#5B9AA9' }} />
                    </span>
                    {login.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <EditCard
        isOpen={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        departmentName="Password"
        onSave={handlePasswordSave}
        onCancel={handlePasswordModalClose}
        saveText="Change Password"
        loading={passwordLoading}
        error={passwordError}
      >
        <div className="password-change-form">
          <div className="password-form-group">
            <label htmlFor="currentPassword" className="password-label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              className="password-input"
              disabled={passwordLoading}
            />
          </div>
          <div className="password-form-group">
            <label htmlFor="newPassword" className="password-label">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              className="password-input"
              disabled={passwordLoading}
            />
          </div>
          <div className="password-form-group">
            <label htmlFor="confirmPassword" className="password-label">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className="password-input"
              disabled={passwordLoading}
            />
          </div>
        </div>
      </EditCard>
    </div>
  );
};

export default UserProfile;
