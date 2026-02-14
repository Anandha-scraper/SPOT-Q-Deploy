import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { Settings, Filter, X, Pencil, Trash2, Plus, Minus, Save, RefreshCw } from 'lucide-react';
import { TimeInput } from '@heroui/react';
import { Time } from '@internationalized/date';
import '../styles/ComponentStyles/Buttons.css';

// Action Buttons
export const EditButton = ({ onClick }) => (
  <button
    onClick={onClick}
    type="button"
    title="Edit"
    className="action-button edit"
  >
    <Pencil size={16} />
  </button>
);

export const DeleteButton = ({ onClick }) => (
  <button
    onClick={onClick}
    type="button"
    title="Delete"
    className="action-button delete"
  >
    <Trash2 size={16} />
  </button>
);

export const DeleteUserButton = ({ onClick }) => (
  <div className="delete-button-wrapper">
    <button onClick={onClick}>Delete User</button>
  </div>
);


// Filter & Clear Buttons

export const FilterButton = ({ onClick, disabled = false, children }) => (
  <div className="filter-button-wrapper">
    <button onClick={onClick} type="button" disabled={disabled} title="Filter">
      <Filter size={18} />
      {children || 'Filter'}
    </button>
  </div>
);

export const ClearButton = ({ onClick, disabled = false, children }) => (
  <div className="filter-button-wrapper">
    <button onClick={onClick} type="button" disabled={disabled} title="Clear Filter" className="clear-btn">
      <X size={18} />
      {children || 'Clear'}
    </button>
  </div>
);

// Icon Buttons

export const EyeButton = ({ onClick, isVisible = false }) => (
  <div className="eye-button-wrapper">
    <button
      onClick={onClick}
      type="button"
      title={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )}
    </button>
  </div>
);

export const SettingsButton = ({ onClick }) => (
  <div className="settings-button-wrapper">
    <button onClick={onClick} type="button" title="Settings">
      <Settings size={18} />
    </button>
  </div>
);

export const PlusButton = ({ onClick, disabled = false, title = "Add entry" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="plus-button"
    title={title}
  >
    <Plus size={14} />
  </button>
);

export const MinusButton = ({ onClick, disabled = false, title = "Remove entry" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="minus-button"
    title={title}
  >
    <Minus size={14} />
  </button>
);


// Submit , Reset , Lock Primary Buttons

export const SubmitButton = forwardRef(({ onClick, disabled = false, children, type = 'button' }, ref) => (
  <div className="submit-button-wrapper">
    <button ref={ref} onClick={onClick} type={type} disabled={disabled} title={children || 'Submit'}>
      <Save size={18} />
      {children || 'Submit'}
    </button>
  </div>
));
SubmitButton.displayName = 'SubmitButton';

export const ResetButton = forwardRef(({ onClick, disabled = false, children }, ref) => (
  <div className="reset-button-wrapper">
    <button ref={ref} onClick={onClick} type="button" disabled={disabled} title={children || 'Reset'}>
      <RefreshCw size={18} />
      {children || 'Reset'}
    </button>
  </div>
));
ResetButton.displayName = 'ResetButton';

export const LockPrimaryButton = ({ onClick, disabled = false, isLocked = false }) => (
  <div className="lock-primary-button-wrapper">
    <button onClick={onClick} type="button" disabled={disabled} title={isLocked ? 'Unlock Primary' : 'Lock Primary'}>
      {isLocked ? 'Unlock Primary' : 'Lock Primary'}
    </button>
  </div>
);

 // DISA Dropdown Component

export const DisaDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, className = '' }, ref) => {
  const disaOptions = ['DISA 1', 'DISA 2', 'DISA 3', 'DISA 4'];

  return (
    <div className={`disa-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        <option value="">Select DISA</option>
        {disaOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});
DisaDropdown.displayName = 'DisaDropdown';

// Machine Dropdown Component

export const MachineDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, className = '', style = {}, id }, ref) => {
  const machineOptions = ['1', '2', '3', '4'];

  return (
    <div className={`machine-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        style={style}
      >
        <option value="">Select Machine</option>
        {machineOptions.map((option) => (
          <option key={option} value={option}>
            Machine {option}
          </option>
        ))}
      </select>
    </div>
  );
});
MachineDropdown.displayName = 'MachineDropdown';

// Shift Dropdown Component

export const ShiftDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, onMouseDown, className = '' }, ref) => {
  const shiftOptions = ['Shift 1', 'Shift 2', 'Shift 3'];

  return (
    <div className={`shift-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        tabIndex={disabled ? -1 : 0}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">Select Shift</option>
        {shiftOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});
ShiftDropdown.displayName = 'ShiftDropdown';

// Furnace Number Dropdown Component

export const FurnaceDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, onMouseDown, className = '' }, ref) => {
  const furnaceOptions = ['1', '2', '3', '4'];

  return (
    <div className={`shift-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        tabIndex={disabled ? -1 : 0}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">Select Furnace</option>
        {furnaceOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});
FurnaceDropdown.displayName = 'FurnaceDropdown';

// Holder Number Dropdown Component

export const HolderDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, className = '' }, ref) => {
  const holderOptions = ['1', '2', '3', '4'];

  return (
    <div className={`shift-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
      >
        <option value="">Select Holder</option>
        {holderOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});
HolderDropdown.displayName = 'HolderDropdown';

// Panel Dropdown Component

export const PanelDropdown = forwardRef(({ value, onChange, name, disabled, onKeyDown, onMouseDown, className = '' }, ref) => {
  const panelOptions = ['A', 'B', 'C', 'D'];

  return (
    <div className={`shift-dropdown-wrapper ${className}`}>
      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        tabIndex={disabled ? -1 : 0}
        style={{
          pointerEvents: disabled ? 'none' : 'auto',
          opacity: disabled ? 0.6 : 1,
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">Select Panel</option>
        {panelOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});
PanelDropdown.displayName = 'PanelDropdown';

export { Time };
export const CustomTimeInput = forwardRef(({ value, onChange, className = '', hasError = false, onFocus, onBlur, onEnterPress, disabled = false, style = {}, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  
  const handleFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    if (onFocus) onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };
  
  const getClassName = () => {
    let classes = `cus-time-input ${className}`;
    if (isFocused) {
      classes += ' valid-input';
    } else if (hasError) {
      classes += ' invalid-input';
    }
    return classes;
  };

  // Handle Enter key press - navigate within segments, then exit on last segment
  useEffect(() => {
    if (!containerRef.current || disabled) return;
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Enter') return;
      
      e.preventDefault();
      e.stopPropagation();
      
      // Find all spinbutton segments inside this time container
      const segments = Array.from(containerRef.current.querySelectorAll('[role="spinbutton"]'));
      const currentIdx = segments.indexOf(e.target);
      
      if (currentIdx > -1 && currentIdx < segments.length - 1) {
        // Not the last segment - move to next segment within time input
        segments[currentIdx + 1].focus();
      } else {
        // Last segment - navigate to next focusable element outside this container
        const allFocusables = Array.from(document.querySelectorAll(
          'input:not([type="hidden"]), select, textarea, [role="spinbutton"]'
        )).filter(el => !el.disabled && el.offsetParent !== null);
        
        const lastSegment = segments[segments.length - 1] || e.target;
        const idx = allFocusables.indexOf(lastSegment);
        if (idx > -1 && idx < allFocusables.length - 1) {
          allFocusables[idx + 1].focus();
        }
      }
    };
    
    const container = containerRef.current;
    const elements = container.querySelectorAll('[role="spinbutton"], input');
    
    elements.forEach(el => {
      el.addEventListener('keydown', handleKeyDown);
    });
    
    return () => {
      elements.forEach(el => {
        el.removeEventListener('keydown', handleKeyDown);
      });
    };
  }, [disabled]);

  return (
    <div 
      ref={containerRef} 
      className={getClassName()}
      style={{
        ...style,
        pointerEvents: disabled ? 'none' : style.pointerEvents || 'auto',
        opacity: disabled ? 0.6 : style.opacity || 1
      }}
    >
      <TimeInput
        ref={ref}
        value={value}
        onChange={onChange}
        hourCycle={12}
        onFocus={handleFocus}
        onBlur={handleBlur}
        isDisabled={disabled}
        {...props}
      />
    </div>
  );
});
CustomTimeInput.displayName = 'CustomTimeInput';

// Pagination Component

export const CustomPagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5; // Number of pages to show around current page
    const halfShow = Math.floor(showPages / 2);
    
    let startPage = Math.max(1, currentPage - halfShow);
    let endPage = Math.min(totalPages, currentPage + halfShow);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < showPages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + showPages - 1);
      } else {
        startPage = Math.max(1, endPage - showPages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  const showLeftEllipsis = pageNumbers[0] > 2;
  const showRightEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1;
  
  return (
    <div className={`custom-pagination-wrapper ${className}`}>
      <div className="custom-pagination">
        {/* Previous */}
        <button 
          className="pagination-nav pagination-prev" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        
        {/* First page if not in range */}
        {pageNumbers[0] > 1 && (
          <>
            <button 
              className="pagination-item" 
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {showLeftEllipsis && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {/* Page Numbers */}
        {pageNumbers.map(page => (
          <button
            key={page}
            className={`pagination-item ${page === currentPage ? 'pagination-active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {/* Next */}
        <button 
          className="pagination-nav pagination-next" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};
