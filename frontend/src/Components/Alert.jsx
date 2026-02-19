import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import '../styles/ComponentStyles/Alert.css';

// Deleting Employee Status Component
const DeletingStatus = () => {
  return (
    <div className="delete-alert-overlay">
      <div className="delete-alert-content">
        <div className="delete-loader">
          <div className="trash-lid"></div>
          <div className="trash-body">
            <div className="trash-line"></div>
            <div className="trash-line"></div>
          </div>
          <div className="deleting-item"></div>
        </div>

        <div className="delete-alert-text">
          <h2 className="delete-alert-title">
            Permanently removing employee...
          </h2>
        </div>
      </div>
    </div>
  );
};

// Creating Employee Status Component

const CreatingEmployeeStatus = () => {
  return (
    <div className="create-alert-overlay">
      <div className="create-alert-content">
        
        {/* The Animation Container */}
        <div className="employee-builder-loader">
          {/* The profile card getting built */}
          <div className="profile-card">
            <div className="profile-avatar"></div>
            <div className="profile-details">
              <div className="detail-line text-short"></div>
              <div className="detail-line text-long"></div>
            </div>
          </div>
          {/* The success indicator badge */}
          <div className="success-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Status Text */}
        <div className="create-alert-text">
          <h2 className="create-alert-title">
            Onboarding New Member
          </h2>
          <p className="create-alert-subtitle">
            Finalizing profile details...
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline Loader Component
export const InlineLoader = ({ 
  message = 'Loading...', 
  size = 'medium',
  variant = 'primary' 
}) => {
  // Icon mapping based on variant
  const iconMap = {
    primary: <Loader2 className="inline-loader-icon" />,
    success: <CheckCircle2 className="inline-loader-icon" />,
    warning: <AlertTriangle className="inline-loader-icon" />,
    danger: <AlertCircle className="inline-loader-icon" />
  };

  const Icon = iconMap[variant] || iconMap.primary;

  return (
    <div className={`inline-loader inline-loader-${size} inline-loader-variant-${variant}`}>
      <div className={`inline-loader-icon-wrapper inline-loader-${variant}`}>
        {Icon}
      </div>
      <span className="inline-loader-message">{message}</span>
    </div>
  );
};

export { CreatingEmployeeStatus };
export default DeletingStatus;