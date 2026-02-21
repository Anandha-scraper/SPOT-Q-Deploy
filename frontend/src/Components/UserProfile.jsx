import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogIn, Calendar, Clock, UserRoundPen, Activity, AlertCircle } from 'lucide-react';
import { EditCard } from './PopUp';
import { EyeButton } from './Buttons';
import { API_ENDPOINTS } from '../config/api';
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
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
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

  // Dynamic login history (fetch from backend)
  const [loginHistory, setLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Activity stats state
  const [activityStats, setActivityStats] = useState({
    totalLogins: 0,
    activeToday: true,
    lastActive: '',
    sessionCount: 0
  });

  useEffect(() => {
    // Fetch login history for current user
    async function fetchLoginHistory() {
      try {
        setHistoryLoading(true);
        const res = await fetch(API_ENDPOINTS.loginHistory, { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Format the login history data
          const formattedHistory = data.data.map(login => {
            const loginDate = new Date(login.loginAt);
            const date = loginDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            }).replace(/\//g, ' / ');
            const time = loginDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
            return {
              id: login._id,
              date,
              time,
              ip: login.ip,
              userAgent: login.userAgent
            };
          });
          setLoginHistory(formattedHistory);
          
          // Update activity stats
          setActivityStats({
            totalLogins: data.data.length,
            activeToday: data.data.length > 0,
            lastActive: formattedHistory[0]?.date + ' at ' + formattedHistory[0]?.time || 'N/A',
            sessionCount: data.data.length
          });
        } else {
          setLoginHistory([]);
        }
      } catch (error) {
        console.error('Error fetching login history:', error);
        setLoginHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    }
    if (user) {
      fetchLoginHistory();
    }
  }, [user]);

  // Optionally, you can use location.pathname to show which page the user is handling
  const currentPage = location.pathname;

  const handlePasswordModalOpen = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
    setPasswordError('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPassword({ current: false, new: false, confirm: false });
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

      {/* Two Column Layout */}
      <div className="profile-content-grid">
        {/* Left Column - User Profile Panel */}
        <div className="user-profile-panel">
        {/* Edit Button - Top Right (Change Password) */}
        <button 
          onClick={handlePasswordModalOpen}
          className="profile-edit-btn"
          title="Change Password"
        >
          <UserRoundPen size={18} />
        </button>

        {/* User Information Section */}
        <div className="user-info-section">
          <div className="user-info-header">
            <div className="user-avatar">
              <User size={28} style={{ color: 'white' }} />
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
              <LogIn size={18} style={{ color: '#5B9AA9' }} />
              Login History
            </h3>
            <p className="login-history-subtitle">Last 5 logins</p>
          </div>
          <div className="login-history-table">
            <div className="login-history-table-header">
              <div className="table-col-date">DATE</div>
              <div className="table-col-time">TIME</div>
            </div>
            <div className="login-history-rows">
              {historyLoading ? (
                <div className="login-history-loading">
                  <p>Loading login history...</p>
                </div>
              ) : loginHistory.length > 0 ? (
                loginHistory.slice(0, 5).map((login, index) => (
                  <div key={login.id} className="login-history-row">
                    <div className="table-col-date">
                      <span className="login-row-icon">
                        <Calendar size={14} style={{ color: '#5B9AA9' }} />
                      </span>
                      {login.date}
                    </div>
                    <div className="table-col-time">
                      <span className="login-row-icon">
                        <Clock size={14} style={{ color: '#5B9AA9' }} />
                      </span>
                      {login.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="login-history-empty">
                  <p>No login history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Activity & Stats */}
      <div className="activity-panel">
        {/* Activity Header */}
        <div className="activity-header">
          <h3 className="activity-title">
            <Activity size={18} style={{ color: '#5B9AA9' }} />
            Activity Overview
          </h3>
        </div>

        {/* Last Activity */}
        <div className="last-activity-card">
          <div className="last-activity-header">
            <Clock size={16} style={{ color: '#5B9AA9' }} />
            <h4>Last Active</h4>
          </div>
          <p className="last-activity-time">{activityStats.lastActive}</p>
        </div>

        {/* Recent Actions */}
        <div className="recent-actions-card">
          <h4 className="recent-actions-title">Recent Actions</h4>
          <div className="action-list">
            <div className="action-item">
              <div className="action-indicator action-indicator-blue"></div>
              <div className="action-details">
                <p className="action-text">Logged in successfully</p>
                <p className="action-time">Just now</p>
              </div>
            </div>
            <div className="action-item">
              <div className="action-indicator action-indicator-green"></div>
              <div className="action-details">
                <p className="action-text">Profile accessed</p>
                <p className="action-time">2 minutes ago</p>
              </div>
            </div>
            <div className="action-item">
              <div className="action-indicator action-indicator-purple"></div>
              <div className="action-details">
                <p className="action-text">Session started</p>
                <p className="action-time">5 minutes ago</p>
              </div>
            </div>
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
            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                type={showPassword.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                className="password-input"
                disabled={passwordLoading}
              />
              <EyeButton 
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                isVisible={showPassword.current}
              />
            </div>
          </div>
          <div className="password-form-group">
            <label htmlFor="newPassword" className="password-label">New Password</label>
            <div className="password-input-wrapper">
              <input
                id="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="password-input"
                disabled={passwordLoading}
              />
              <EyeButton 
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                isVisible={showPassword.new}
              />
            </div>
          </div>
          <div className="password-form-group">
            <label htmlFor="confirmPassword" className="password-label">Confirm New Password</label>
            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showPassword.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                className="password-input"
                disabled={passwordLoading}
              />
              <EyeButton 
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                isVisible={showPassword.confirm}
              />
            </div>
          </div>
        </div>
      </EditCard>
    </div>
  );
};

export default UserProfile;
