import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, RefreshCw, FileText, Loader2, RotateCcw, Info } from "lucide-react";
import CustomDatePicker from '../../Components/CustomDatePicker';
import { CustomTimeInput, Time, MachineDropdown } from '../../Components/Buttons';
import Sakthi from '../../Components/Sakthi';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Moulding/DmmSettingParameters.css';

const initialRow = {
  customer: "",
  itemDescription: "",
  time: "",
  ppThickness: "",
  ppHeight: "",
  spThickness: "",
  spHeight: "",
  coreMaskThickness: "",
  coreMaskHeightOutside: "",
  coreMaskHeightInside: "",
  sandShotPressureBar: "",
  correctionShotTime: "",
  squeezePressure: "",
  ppStrippingAcceleration: "",
  ppStrippingDistance: "",
  spStrippingAcceleration: "",
  spStrippingDistance: "",
  mouldThicknessPlus10: "",
  closeUpForceMouldCloseUpPressure: "",
  remarks: "",
};


// Get today's date in YYYY-MM-DD format
const getTodaysDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to create Time object from time string (e.g., "08:30 AM")
const createTimeFromString = (timeStr) => {
  if (!timeStr) return null;
  try {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return new Time(hour, minute);
  } catch {
    return null;
  }
};

// Helper function to convert Time object to string format (e.g., "08:30 AM")
const formatTimeToString = (timeObj) => {
  if (!timeObj) return '';
  let hour = timeObj.hour;
  const minute = timeObj.minute;
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

const DmmSettingParameters = () => {
  const navigate = useNavigate();
  const [primaryData, setPrimaryData] = useState({
    date: getTodaysDate(), // Set today's date by default
    machine: '',
    shift: '',
    operatorName: '',
    operatedBy: ''
  });
  const [isPrimaryLocked, setIsPrimaryLocked] = useState(false);
  const [checkingData, setCheckingData] = useState(false);
  const [shiftSubmitLoading, setShiftSubmitLoading] = useState(false);
  const [primaryFieldLocked, setPrimaryFieldLocked] = useState({
    operatorName: false,
    operatedBy: false
  }); // Lock operator fields if they have existing data
  const [shift1Row, setShift1Row] = useState({ ...initialRow });
  const [shift2Row, setShift2Row] = useState({ ...initialRow });
  const [shift3Row, setShift3Row] = useState({ ...initialRow });
  const [currentRow, setCurrentRow] = useState({ ...initialRow }); // Current form data
  const [loadingStates, setLoadingStates] = useState({
    primary: false,
    shift: false
  });
  const [allSubmitting, setAllSubmitting] = useState(false);
  const [shiftCounts, setShiftCounts] = useState({
    shift1: 0,
    shift2: 0,
    shift3: 0
  });
  
  // Validation states for real-time feedback
  const [validationErrors, setValidationErrors] = useState({
    date: false,
    machine: false,
    shift: false,
    operatorName: false,
    operatedBy: false
  });

  // Sequential validation highlighting (red shake animation)
  const [dateErrorHighlight, setDateErrorHighlight] = useState(false);
  const [machineErrorHighlight, setMachineErrorHighlight] = useState(false);
  const [shiftErrorHighlight, setShiftErrorHighlight] = useState(false);
  const [operatorNameErrorHighlight, setOperatorNameErrorHighlight] = useState(false);
  const [operatedByErrorHighlight, setOperatedByErrorHighlight] = useState(false);
  const [primaryValidationErrors, setPrimaryValidationErrors] = useState({
    date: false,
    machine: false,
    shift: false,
    operatorName: false,
    operatedBy: false
  });
  const [primaryErrorMessage, setPrimaryErrorMessage] = useState('');
  const [dynamicCheckAlert, setDynamicCheckAlert] = useState(false);
  
  // Track focused field for visual feedback
  const [focusedField, setFocusedField] = useState(null);
  const [shiftValidationErrors, setShiftValidationErrors] = useState({});
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [shiftErrorMessage, setShiftErrorMessage] = useState('');
  
  // Refs for submit button and first input
  const shiftSubmitRef = useRef(null);
  const shiftFirstInputRef = useRef(null);
  
  // Clear primary validation errors after 3 seconds
  useEffect(() => {
    if (primaryErrorMessage) {
      const timer = setTimeout(() => {
        setPrimaryErrorMessage('');
        setPrimaryValidationErrors({
          date: false,
          machine: false,
          shift: false,
          operatorName: false,
          operatedBy: false
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [primaryErrorMessage]);
  
  // Clear dynamic check alert after 3 seconds
  useEffect(() => {
    if (dynamicCheckAlert) {
      const timer = setTimeout(() => {
        setDynamicCheckAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dynamicCheckAlert]);
  
  // Clear shift error message after 5 seconds
  useEffect(() => {
    if (shiftErrorMessage) {
      const timer = setTimeout(() => {
        setShiftErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shiftErrorMessage]);
  
  // Helper function to get border color based on validation
  const getBorderColor = (value, isNumeric = false, fieldName = '') => {
    // Primary validation errors (for primary section only)
    if (primaryValidationErrors[fieldName]) {
      return '#ef4444'; // Red for primary errors
    }
    
    // Currently focused → green (active highlight)
    if (fieldName && focusedField === fieldName) {
      return '#22c55e'; // Green for focused field
    }
    
    // Has validation error → red (invalid data)
    if (shiftValidationErrors[fieldName]) {
      return '#ef4444'; // Red for validation error
    }
    
    // Default state → grey (unfocused and valid)
    return '#cbd5e1';
  };
  
  // Validate field in real-time
  const validateField = (field, value) => {
    let isValid = false;
    
    switch(field) {
      case 'date':
        isValid = value && String(value).trim() !== '';
        break;
      case 'machine':
        isValid = value && String(value).trim() !== '';
        break;
      case 'shift':
        isValid = value && String(value).trim() !== '';
        break;
      case 'operatorName':
        isValid = value && String(value).trim() !== '';
        break;
      case 'operatedBy':
        isValid = value && String(value).trim() !== '';
        break;
      default:
        isValid = true;
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: !isValid }));
    return isValid;
  };

  // Handle Enter key navigation for form fields
  const handleEnterKeyNavigation = (e, nextFieldId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextField = document.getElementById(nextFieldId);
      if (nextField) {
        nextField.focus();
      }
    }
  };

  const handlePrimaryChange = (field, value) => {
    // Clear error highlight when field gets a value
    if (field === 'date' && value && value.trim() !== '') {
      setDateErrorHighlight(false);
    }
    if (field === 'machine' && value && value.trim() !== '') {
      setMachineErrorHighlight(false);
    }
    if (field === 'shift' && value && value.trim() !== '') {
      setShiftErrorHighlight(false);
    }
    if (field === 'operatorName' && value && value.trim() !== '') {
      setOperatorNameErrorHighlight(false);
    }
    if (field === 'operatedBy' && value && value.trim() !== '') {
      setOperatedByErrorHighlight(false);
    }

    // If date, machine, or shift is cleared, also clear operator fields and unlock
    if (['date', 'machine', 'shift'].includes(field) && (!value || value.trim() === '')) {
      setPrimaryData((prev) => ({
        ...prev,
        [field]: value,
        operatorName: '',
        operatedBy: ''
      }));
      setPrimaryFieldLocked({ operatorName: false, operatedBy: false });
      setIsPrimaryLocked(false);
    } else {
      setPrimaryData((prev) => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Validate on change for real-time feedback
    if (['date', 'machine', 'shift', 'operatorName', 'operatedBy'].includes(field)) {
      validateField(field, value);
    }
  };

  // Check if primary data exists when date/machine/shift changes
  useEffect(() => {
    const checkExistingPrimaryData = async () => {
      if (!primaryData.date || !primaryData.machine || !primaryData.shift) {
        // Clear locks if incomplete
        setPrimaryFieldLocked({ operatorName: false, operatedBy: false });
        setIsPrimaryLocked(false);
        return;
      }

      try {
        const resp = await fetch(`${API_ENDPOINTS.mouldingDmm}/search/primary?date=${encodeURIComponent(primaryData.date)}&machine=${encodeURIComponent(primaryData.machine)}&shift=${encodeURIComponent(primaryData.shift)}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        const response = await resp.json();
        
        if (response.success && response.data && response.data.length > 0) {
          const record = response.data[0];
          const entry = record.entries?.[0]; // First entry for this machine+shift
          
          // Check if operator fields have existing data
          const hasOperatorName = entry?.operatorName && String(entry.operatorName).trim() !== '';
          const hasOperatedBy = entry?.checkedBy && String(entry.checkedBy).trim() !== '';
          
          // Lock only the fields that have existing data
          setPrimaryFieldLocked({
            operatorName: hasOperatorName,
            operatedBy: hasOperatedBy
          });
          
          // Populate operator fields if they exist
          setPrimaryData(prev => ({
            ...prev,
            operatorName: hasOperatorName ? String(entry.operatorName).trim() : '',
            operatedBy: hasOperatedBy ? String(entry.checkedBy).trim() : ''
          }));
          
          // Set primary as locked if all fields have data
          setIsPrimaryLocked(hasOperatorName && hasOperatedBy);
        } else {
          // No existing data - unlock all and clear operator fields
          setPrimaryFieldLocked({ operatorName: false, operatedBy: false });
          setIsPrimaryLocked(false);
          setPrimaryData(prev => ({
            ...prev,
            operatorName: '',
            operatedBy: ''
          }));
        }
        
        // Show success alert after data check
        setDynamicCheckAlert(true);
      } catch (error) {
        console.error('Error checking primary data:', error);
        setPrimaryFieldLocked({ operatorName: false, operatedBy: false });
        setIsPrimaryLocked(false);
        setPrimaryData(prev => ({
          ...prev,
          operatorName: '',
          operatedBy: ''
        }));
      }
    };

    checkExistingPrimaryData();
  }, [primaryData.date, primaryData.machine, primaryData.shift]);

  // Handle primary data submission
  const handlePrimarySubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Prevent submission if both operator fields are locked
    if (primaryFieldLocked.operatorName && primaryFieldLocked.operatedBy) {
      return;
    }
    
    // Validate all required fields
    const dateValid = validateField('date', primaryData.date);
    const machineValid = validateField('machine', primaryData.machine);
    const shiftValid = validateField('shift', primaryData.shift);
    const operatorNameValid = validateField('operatorName', primaryData.operatorName);
    const operatedByValid = validateField('operatedBy', primaryData.operatedBy);
    
    if (!dateValid || !machineValid || !shiftValid || !operatorNameValid || !operatedByValid) {
      // Set validation errors for visual feedback
      setPrimaryValidationErrors({
        date: !dateValid,
        machine: !machineValid,
        shift: !shiftValid,
        operatorName: !operatorNameValid,
        operatedBy: !operatedByValid
      });
      setPrimaryErrorMessage('Enter all primary data');
      
      // Focus first invalid field
      if (!dateValid) {
        document.getElementById('date-field')?.focus();
      } else if (!machineValid) {
        document.getElementById('machine-field')?.focus();
      } else if (!shiftValid) {
        document.getElementById('shift-field')?.focus();
      } else if (!operatorNameValid) {
        document.getElementById('operatorName-field')?.focus();
      } else if (!operatedByValid) {
        document.getElementById('operatedBy-field')?.focus();
      }
      return;
    }

    // Always send machine & operator info; backend requires machine/date each time
    // Section must be 'operation' for operatorName/checkedBy persistence

    try {
      setLoadingStates(prev => ({ ...prev, primary: true }));
      
      // Build payload
      const payload = {
        date: primaryData.date,
        machine: primaryData.machine.trim(),
        section: 'operation',
        shifts: {}
      };
      // Send operator data for selected shift always (validated already)
      const shiftKey = `shift${primaryData.shift}`;
      const shiftPayload = {};
      shiftPayload.operatorName = primaryData.operatorName.trim();
      shiftPayload.checkedBy = primaryData.operatedBy.trim();
      
      if (Object.keys(shiftPayload).length > 0) {
        payload.shifts[shiftKey] = shiftPayload;
      }

      const resp = await fetch(API_ENDPOINTS.mouldingDmm, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      
      if (data.success) {
        // Lock operator fields after save
        setPrimaryFieldLocked({
          operatorName: true,
          operatedBy: true
        });
        setIsPrimaryLocked(true);
        
        // Refresh shift counts
        await fetchShiftCounts();
        
        // Focus on first shift parameter input
        setTimeout(() => {
          if (shiftFirstInputRef.current) {
            shiftFirstInputRef.current.focus();
          }
        }, 100);
      } else {
        alert('Failed to save: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert('Failed to save primary data: ' + errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, primary: false }));
    }
  };

  // Real-time validation for shift parameter fields
  const validateShiftField = (fieldName, value) => {
    // Required fields list
    const requiredFields = [
      'customer', 'itemDescription', 'time', 'ppThickness', 'ppHeight',
      'spThickness', 'spHeight', 'coreMaskThickness', 'coreMaskHeightOutside',
      'coreMaskHeightInside', 'sandShotPressureBar', 'correctionShotTime',
      'squeezePressure', 'ppStrippingAcceleration', 'ppStrippingDistance',
      'spStrippingAcceleration', 'spStrippingDistance', 'mouldThicknessPlus10',
      'closeUpForceMouldCloseUpPressure', 'remarks'
    ];
    
    if (!requiredFields.includes(fieldName)) {
      return true;
    }
    
    // Check for empty value
    const isEmpty = value === undefined || value === null || String(value).trim() === '';
    if (isEmpty) {
      return false;
    }
    
    // Numeric fields - check datatype and format
    const numericFields = [
      'ppThickness', 'ppHeight', 'spThickness', 'spHeight',
      'coreMaskThickness', 'coreMaskHeightOutside', 'coreMaskHeightInside',
      'sandShotPressureBar', 'correctionShotTime', 'squeezePressure',
      'ppStrippingAcceleration', 'ppStrippingDistance',
      'spStrippingAcceleration', 'spStrippingDistance', 'mouldThicknessPlus10'
    ];
    
    if (numericFields.includes(fieldName)) {
      const num = parseFloat(value);
      // Invalid if not a number or not finite
      if (isNaN(num) || !isFinite(num)) {
        return false;
      }
    }
    
    return true;
  };

  const handleInputChange = (field, value) => {
    setCurrentRow((prev) => ({ ...prev, [field]: value }));
    
    // Real-time validation: validate as user types
    const isValid = validateShiftField(field, value);
    
    if (isValid) {
      // Clear error if field becomes valid (dynamic validation)
      setShiftValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      // Clear error message if all fields are now valid
      if (Object.keys(shiftValidationErrors).length <= 1) {
        setShiftErrorMessage('');
      }
    } else if (saveAttempted) {
      // Set error only if save was already attempted
      setShiftValidationErrors(prev => ({ ...prev, [field]: true }));
    }
  };

  // Helper function to check if Shift parameters have at least one field with data
  const hasShiftParameterData = () => {
    // Check if any of the main fields (not remarks) have data
    return (currentRow.customer && currentRow.customer.trim() !== '') ||
           (currentRow.itemDescription && currentRow.itemDescription.trim() !== '') ||
           (currentRow.time && currentRow.time.trim() !== '') ||
           (currentRow.ppThickness && currentRow.ppThickness.toString().trim() !== '') ||
           (currentRow.ppHeight && currentRow.ppHeight.toString().trim() !== '') ||
           (currentRow.spThickness && currentRow.spThickness.toString().trim() !== '') ||
           (currentRow.spHeight && currentRow.spHeight.toString().trim() !== '');
  };

  // Fetch shift counts from database
  const fetchShiftCounts = async () => {
    if (!primaryData.date || !primaryData.machine) {
      setShiftCounts({ shift1: 0, shift2: 0, shift3: 0 });
      return;
    }

    try {
      const resp = await fetch(`${API_ENDPOINTS.mouldingDmm}/search/primary?date=${encodeURIComponent(primaryData.date)}&machine=${encodeURIComponent(primaryData.machine)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const response = await resp.json();
      
      if (response.success && response.data && response.data.length > 0) {
        const record = response.data[0];
        const counts = { shift1: 0, shift2: 0, shift3: 0 };
        
        // Count parameters for each shift entry
        if (record.entries && Array.isArray(record.entries)) {
          record.entries.forEach(entry => {
            const shiftKey = `shift${entry.shift}`;
            if (counts.hasOwnProperty(shiftKey) && entry.parameters && Array.isArray(entry.parameters)) {
              counts[shiftKey] = entry.parameters.length;
            }
          });
        }
        
        setShiftCounts(counts);
      } else {
        setShiftCounts({ shift1: 0, shift2: 0, shift3: 0 });
      }
    } catch (error) {
      console.error('Error fetching shift counts:', error);
      setShiftCounts({ shift1: 0, shift2: 0, shift3: 0 });
    }
  };

  // Update shift counts when date/machine changes
  useEffect(() => {
    if (primaryData.date && primaryData.machine) {
      fetchShiftCounts();
    } else {
      setShiftCounts({ shift1: 0, shift2: 0, shift3: 0 });
    }
  }, [primaryData.date, primaryData.machine]);

  const handleShiftSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Set save attempted flag for validation display
    setSaveAttempted(true);
    
    // Ensure a shift is selected in primary
    if (!primaryData.shift) {
      return;
    }
    
    // Primary data must be saved first
    if (!isPrimaryLocked) {
      return;
    }
    
    if (!primaryData.date || !primaryData.machine) {
      return;
    }
    
    // Validate shift row before saving
    if (!validateShiftRowBeforeSave()) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, shift: true }));
      
      // Send row data directly - backend will map field names correctly
      const rowForSave = { ...currentRow };

      const payload = {
        date: primaryData.date,
        machine: primaryData.machine,
        section: `shift${primaryData.shift}`,
        parameters: {
          [`shift${primaryData.shift}`]: rowForSave
        }
      };

      const resp = await fetch(API_ENDPOINTS.mouldingDmm, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      
      if (data.success) {
        // Clear validation states
        setSaveAttempted(false);
        setShiftValidationErrors({});
        
        // Clear current row for next entry
        setCurrentRow({ ...initialRow });
        
        // Fetch updated counts from database
        await fetchShiftCounts();
        
        // Focus customer input (first input)
        setTimeout(() => {
          if (shiftFirstInputRef.current) {
            shiftFirstInputRef.current.focus();
          }
        }, 100);
        
      }
    } catch (error) {
      console.error(`Error saving shift ${primaryData.shift} data:`, error);
      alert('Failed to save: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingStates(prev => ({ ...prev, shift: false }));
    }
  };

  // Handle Enter key navigation for shift parameter inputs
  const handleShiftKeyDown = (e, fieldName = '') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Validate current field has data before moving
      const value = e.target.value;
      const isNumeric = e.target.type === 'number';
      const isEmpty = value === undefined || value === null || String(value).trim() === '';
      const invalidNumeric = isNumeric && (isEmpty || isNaN(parseFloat(value)) || !isFinite(parseFloat(value)));
      if (isEmpty || invalidNumeric) {
        e.target.style.borderColor = '#ef4444';
        setTimeout(() => { e.target.style.borderColor = ''; }, 1000);
        return;
      }

      // Get all inputs in the current shift section
      const shiftSection = e.target.closest('.dmm-section');
      if (!shiftSection) return;
      
      const inputs = Array.from(shiftSection.querySelectorAll('input:not([type="button"]):not([disabled]), select:not([disabled])'));
      const currentIndex = inputs.indexOf(e.target);
      
      // If not the last input, move to next
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else {
        // Last input - focus Submit Entry button
        const submitBtn = document.querySelector('button:has-text("Submit Entry")') || 
                         Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Submit Entry'));
        if (submitBtn) {
          submitBtn.focus();
        }
      }
    }
  };

  // Validate entire shift parameter row before saving
  const validateShiftRowBeforeSave = () => {
    const errors = {};
    let isValid = true;
    
    // List of required fields
    const requiredFields = [
      'customer', 'itemDescription', 'time', 'ppThickness', 'ppHeight', 
      'spThickness', 'spHeight', 'coreMaskThickness', 'coreMaskHeightOutside',
      'coreMaskHeightInside', 'sandShotPressureBar', 'correctionShotTime',
      'squeezePressure', 'ppStrippingAcceleration', 'ppStrippingDistance',
      'spStrippingAcceleration', 'spStrippingDistance', 'mouldThicknessPlus10',
      'closeUpForceMouldCloseUpPressure', 'remarks'
    ];
    
    // Validate each required field using the validation function
    requiredFields.forEach(field => {
      if (!validateShiftField(field, currentRow[field])) {
        errors[field] = true;
        isValid = false;
      }
    });
    
    setShiftValidationErrors(errors);
    
    // Set error message if validation fails
    if (!isValid) {
      setShiftErrorMessage('Correct Data format or Enter Empty Field');
    } else {
      setShiftErrorMessage('');
    }
    
    return isValid;
  };

  // Handle Enter key on submit button
  const handleSubmitButtonKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleShiftSubmit(e);
    }
  };

  // Separate reset functions for each section
  const resetPrimaryData = () => {
    if (!window.confirm('Are you sure you want to unlock and reset Primary data?')) return;
    const today = getTodaysDate();
    setPrimaryData({ date: today, machine: '', shift: '', operatorName: '', operatedBy: '' });
    setIsPrimaryLocked(false);
    setPrimaryFieldLocked({ operatorName: false, operatedBy: false });
    setCheckingData(false);
  };

  const resetShiftRow = () => {
    if (!primaryData.shift) {
      return;
    }
    if (!window.confirm(`Are you sure you want to reset Shift ${primaryData.shift} Parameters?`)) return;
    setCurrentRow({ ...initialRow });
  };

  const handleViewReport = () => {
    navigate('/moulding/dmm-setting-parameters/report');
  };

  // Combined Save All for DMM page (backend-compat: operation then shift append)
  const handleSubmitAll = async () => {
    if (!primaryData.date || !primaryData.machine || !primaryData.shift) {
      return;
    }

    // Ensure all shift fields are filled and valid before saving
    if (!validateShiftRowBeforeSave()) {
      return;
    }

    const startTime = Date.now();
    const MIN_LOADER_DURATION = 1500; // 1.5 seconds minimum (matches Sakthi component timing)
    setAllSubmitting(true);
    setShiftSubmitLoading(true);
    try {
      const shiftKey = `shift${primaryData.shift}`;

      // 1) Save operation info for selected shift
      const opPayload = {
        date: primaryData.date,
        machine: primaryData.machine,
        section: 'operation',
        shifts: {
          [shiftKey]: {
            operatorName: primaryData.operatorName || '',
            checkedBy: primaryData.operatedBy || ''
          }
        }
      };
      const opResp = await fetch(API_ENDPOINTS.mouldingDmm, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(opPayload)
      });
      const opRes = await opResp.json();
      
      if (!opRes.success) throw new Error(opRes.message || 'Failed to save operation');

      // 2) Save parameters row (send all fields directly)
      if (hasShiftParameterData()) {
        const rowForSave = { ...currentRow };

        const paramsPayload = {
          date: primaryData.date,
          machine: primaryData.machine,
          section: shiftKey,
          parameters: {
            [shiftKey]: rowForSave
          }
        };
        const paramsResp = await fetch(API_ENDPOINTS.mouldingDmm, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(paramsPayload)
        });
        const paramsRes = await paramsResp.json();
        
        if (!paramsRes.success) throw new Error(paramsRes.message || 'Failed to save parameters');
      }
      
      // Ensure minimum loader display time has passed before proceeding
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADER_DURATION - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setCurrentRow({ ...initialRow });
      await fetchShiftCounts();
      setTimeout(() => {
        if (shiftFirstInputRef.current) {
          shiftFirstInputRef.current.focus();
        }
      }, 100);
    } catch (err) {
      console.error('Save All error:', err);
      alert('Failed to Save All: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setAllSubmitting(false);
      setShiftSubmitLoading(false);
    }
  };

  const renderRow = () => {
    return (
    <div style={{
      pointerEvents: !isPrimaryLocked ? 'none' : 'auto',
      opacity: !isPrimaryLocked ? 0.6 : 1,
      position: 'relative'
    }}>
    <div className="dmm-form-grid dmm-shift-form-grid">
      <div className="dmm-form-group full-width">
        <label>Customer</label>
        <input
          type="text"
          ref={shiftFirstInputRef}
          value={currentRow.customer}
          onChange={(e) => handleInputChange("customer", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('customer')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., ABC Industries"
          style={{
            border: `2px solid ${getBorderColor(currentRow.customer, false, 'customer')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Item Description</label>
        <input
          type="text"
          value={currentRow.itemDescription}
          onChange={(e) => handleInputChange("itemDescription", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('itemDescription')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., Engine Block Casting"
          style={{
            border: `2px solid ${getBorderColor(currentRow.itemDescription, false, 'itemDescription')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Time</label>
        <CustomTimeInput
          value={createTimeFromString(currentRow.time)}
          onChange={(timeObj) => handleInputChange("time", formatTimeToString(timeObj))}
          disabled={!isPrimaryLocked}
          onFocus={() => setFocusedField('time')}
          onBlur={() => setFocusedField(null)}
          style={{
            border: `2px solid ${getBorderColor(currentRow.time, false, 'time')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>PP Thickness (mm)</label>
        <input
          type="number"
          value={currentRow.ppThickness}
          onChange={(e) => handleInputChange("ppThickness", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('ppThickness')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 25.5"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.ppThickness, true, 'ppThickness')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>PP Height (mm)</label>
        <input
          type="number"
          value={currentRow.ppHeight}
          onChange={(e) => handleInputChange("ppHeight", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('ppHeight')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 150.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.ppHeight, true, 'ppHeight')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>SP Thickness (mm)</label>
        <input
          type="number"
          value={currentRow.spThickness}
          onChange={(e) => handleInputChange("spThickness", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('spThickness')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 30.2"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.spThickness, true, 'spThickness')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>SP Height (mm)</label>
        <input
          type="number"
          value={currentRow.spHeight}
          onChange={(e) => handleInputChange("spHeight", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('spHeight')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 180.5"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.spHeight, true, 'spHeight')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Core Mask Thickness (mm)</label>
        <input
          type="number"
          value={currentRow.coreMaskThickness}
          onChange={(e) => handleInputChange("coreMaskThickness", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('coreMaskThickness')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 12.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.coreMaskThickness, true, 'coreMaskThickness')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Core Mask Height Outside (mm)</label>
        <input
          type="number"
          value={currentRow.coreMaskHeightOutside}
          onChange={(e) => handleInputChange("coreMaskHeightOutside", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('coreMaskHeightOutside')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 95.5"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.coreMaskHeightOutside, true, 'coreMaskHeightOutside')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Core Mask Height Inside (mm)</label>
        <input
          type="number"
          value={currentRow.coreMaskHeightInside}
          onChange={(e) => handleInputChange("coreMaskHeightInside", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('coreMaskHeightInside')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 85.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.coreMaskHeightInside, true, 'coreMaskHeightInside')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Sand Shot Pressure (Bar)</label>
        <input
          type="number"
          value={currentRow.sandShotPressureBar}
          onChange={(e) => handleInputChange("sandShotPressureBar", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('sandShotPressureBar')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 6.5"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.sandShotPressureBar, true, 'sandShotPressureBar')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Correction Shot Time (s)</label>
        <input
          type="number"
          value={currentRow.correctionShotTime}
          onChange={(e) => handleInputChange("correctionShotTime", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('correctionShotTime')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 2.5"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.correctionShotTime, true, 'correctionShotTime')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Squeeze Pressure (Kg/cm²)</label>
        <input
          type="number"
          value={currentRow.squeezePressure}
          onChange={(e) => handleInputChange("squeezePressure", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('squeezePressure')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 45.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.squeezePressure, true, 'squeezePressure')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>PP Stripping Acceleration</label>
        <input
          type="number"
          value={currentRow.ppStrippingAcceleration}
          onChange={(e) => handleInputChange("ppStrippingAcceleration", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('ppStrippingAcceleration')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 3.2"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.ppStrippingAcceleration, true, 'ppStrippingAcceleration')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>PP Stripping Distance</label>
        <input
          type="number"
          value={currentRow.ppStrippingDistance}
          onChange={(e) => handleInputChange("ppStrippingDistance", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('ppStrippingDistance')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 120.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.ppStrippingDistance, true, 'ppStrippingDistance')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>SP Stripping Acceleration</label>
        <input
          type="number"
          value={currentRow.spStrippingAcceleration}
          onChange={(e) => handleInputChange("spStrippingAcceleration", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('spStrippingAcceleration')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 2.8"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.spStrippingAcceleration, true, 'spStrippingAcceleration')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>SP Stripping Distance</label>
        <input
          type="number"
          value={currentRow.spStrippingDistance}
          onChange={(e) => handleInputChange("spStrippingDistance", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('spStrippingDistance')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 140.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.spStrippingDistance, true, 'spStrippingDistance')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Mould Thickness ±10mm</label>
        <input
          type="number"
          value={currentRow.mouldThicknessPlus10}
          onChange={(e) => handleInputChange("mouldThicknessPlus10", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('mouldThicknessPlus10')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 250.0"
          step="any"
          style={{
            border: `2px solid ${getBorderColor(currentRow.mouldThicknessPlus10, true, 'mouldThicknessPlus10')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>
          <span>Close-Up Force / Pressure</span>
          <span className="dmm-info" title="Close Up Force / Mould Close Up Pressure" style={{ marginLeft: '0.5rem' }}>
            <Info size={14} />
          </span>
        </label>
        <input
          type="text"
          value={currentRow.closeUpForceMouldCloseUpPressure}
          onChange={(e) => handleInputChange("closeUpForceMouldCloseUpPressure", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('closeUpForceMouldCloseUpPressure')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., 800 kN / 55 bar"
          style={{
            border: `2px solid ${getBorderColor(currentRow.closeUpForceMouldCloseUpPressure, false, 'closeUpForceMouldCloseUpPressure')}`
          }}
        />
      </div>
      <div className="dmm-form-group">
        <label>Remarks</label>
        <input
          type="text"
          value={currentRow.remarks}
          onChange={(e) => handleInputChange("remarks", e.target.value)}
          onKeyDown={handleShiftKeyDown}
          onFocus={() => setFocusedField('remarks')}
          onBlur={() => setFocusedField(null)}
          placeholder="e.g., All parameters OK"
          maxLength={60}
          style={{
            border: `2px solid ${getBorderColor(currentRow.remarks, false, 'remarks')}`,
            resize: 'none'
          }}
        />
      </div>
    </div>
    </div>
    );
  };

  return (
    <div className="page-wrapper">
      {shiftSubmitLoading && (
        <div className="dmm-loader-overlay">
          <Sakthi onComplete={() => {}} />
        </div>
      )}
      {/* Header */}
      <div className="dmm-header">
        <div className="dmm-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            DMM Setting Parameters Check Sheet
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {primaryData.date ? (() => {
            const [y, m, d] = primaryData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      <form>
        {/* Primary Information Section */}
        <div className="dmm-section primary-section">
          <div className="primary-header-container">
            <h3 className="primary-section-title">PRIMARY</h3>
          </div>
          {/* Primary Data Fields */}
          <div className="primary-fields-row">
            <div className={`dmm-form-group ${dateErrorHighlight ? 'dmm-error-highlight' : ''}`}>
              <label>Date <span style={{ color: '#ef4444' }}>*</span></label>
              <CustomDatePicker
                id="date-field"
                name="date"
                value={primaryData.date}
                onChange={(e) => handlePrimaryChange('date', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (primaryData.date && primaryData.date.trim() !== '') {
                      document.getElementById('machine-field')?.focus();
                    } else {
                      validateField('date', primaryData.date);
                    }
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: `2px solid ${getBorderColor(primaryData.date, false, 'date')}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>
            <div 
              className={`dmm-form-group ${machineErrorHighlight ? 'dmm-error-highlight' : ''}`}
              onMouseDownCapture={(e) => {
                if (e.target.tagName !== 'SELECT') {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setMachineErrorHighlight(true);
                    setTimeout(() => setMachineErrorHighlight(false), 600);
                  }
                }
              }}
            >
              <label>Machine <span style={{ color: '#ef4444' }}>*</span></label>
              <MachineDropdown
                id="machine-field"
                value={primaryData.machine}
                onChange={(e) => handlePrimaryChange("machine", e.target.value)}
                disabled={!primaryData.date}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (primaryData.machine && primaryData.machine.trim() !== '') {
                      document.getElementById('shift-field')?.focus();
                    } else {
                      validateField('machine', primaryData.machine);
                    }
                  }
                }}
                onMouseDown={(e) => {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setMachineErrorHighlight(true);
                    setTimeout(() => setMachineErrorHighlight(false), 600);
                  }
                }}
                className=""
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: `2px solid ${getBorderColor(primaryData.machine, false, 'machine')}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
            <div 
              className={`dmm-form-group ${shiftErrorHighlight ? 'dmm-error-highlight' : ''}`}
              onMouseDownCapture={(e) => {
                if (e.target.tagName !== 'SELECT') {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setShiftErrorHighlight(true);
                    setTimeout(() => setShiftErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setShiftErrorHighlight(true);
                    setTimeout(() => setShiftErrorHighlight(false), 600);
                  }
                }
              }}
            >
              <label>Shift <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                id="shift-field"
                value={primaryData.shift}
                onChange={(e) => {
                  handlePrimaryChange("shift", e.target.value);
                }}
                disabled={!primaryData.date || !primaryData.machine}
                onBlur={() => validateField('shift', primaryData.shift)}
                onMouseDown={(e) => {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setShiftErrorHighlight(true);
                    setTimeout(() => setShiftErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setShiftErrorHighlight(true);
                    setTimeout(() => setShiftErrorHighlight(false), 600);
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (primaryData.shift && primaryData.shift.trim() !== '') {
                      document.getElementById('operatorName-field')?.focus();
                    } else {
                      validateField('shift', primaryData.shift);
                      e.target.style.borderColor = '#ef4444';
                      setTimeout(() => { e.target.style.borderColor = ''; }, 1000);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: `2px solid ${getBorderColor(primaryData.shift, false, 'shift')}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                required
              >
                <option value="">Select Shift</option>
                <option value="1">Shift 1</option>
                <option value="2">Shift 2</option>
                <option value="3">Shift 3</option>
              </select>
            </div>
          </div>
          
          {/* Operator Fields Row */}
          <div className="primary-fields-row" style={{ marginTop: '1rem' }}>
            <div 
              className={`dmm-form-group ${operatorNameErrorHighlight ? 'dmm-error-highlight' : ''}`}
              onMouseDownCapture={(e) => {
                if (e.target.tagName !== 'INPUT') {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  } else if (!primaryData.shift) {
                    setShiftErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  }
                }
              }}
            >
              <label>Operator Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="operatorName-field"
                type="text"
                value={primaryData.operatorName}
                onChange={(e) => handlePrimaryChange("operatorName", e.target.value)}
                onBlur={() => validateField('operatorName', primaryData.operatorName)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (primaryData.operatorName && primaryData.operatorName.trim() !== '') {
                      document.getElementById('operatedBy-field')?.focus();
                    } else {
                      validateField('operatorName', primaryData.operatorName);
                      e.target.style.borderColor = '#ef4444';
                      setTimeout(() => { e.target.style.borderColor = ''; }, 1000);
                    }
                  }
                }}
                onMouseDown={(e) => {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  } else if (!primaryData.shift) {
                    setShiftErrorHighlight(true);
                    setOperatorNameErrorHighlight(true);
                    setTimeout(() => setOperatorNameErrorHighlight(false), 600);
                  }
                }}
                disabled={primaryFieldLocked.operatorName || !primaryData.date || !primaryData.machine || !primaryData.shift}
                readOnly={primaryFieldLocked.operatorName}
                placeholder="Enter operator name"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: `2px solid ${getBorderColor(primaryData.operatorName, false, 'operatorName')}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: primaryFieldLocked.operatorName ? '#f1f5f9' : '#ffffff',
                  cursor: primaryFieldLocked.operatorName ? 'not-allowed' : 'text',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>
            <div 
              className={`dmm-form-group ${operatedByErrorHighlight ? 'dmm-error-highlight' : ''}`}
              onMouseDownCapture={(e) => {
                if (e.target.tagName !== 'INPUT') {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  } else if (!primaryData.shift) {
                    setShiftErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  }
                }
              }}
            >
              <label>Operated By <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                id="operatedBy-field"
                type="text"
                value={primaryData.operatedBy}
                onChange={(e) => handlePrimaryChange("operatedBy", e.target.value)}
                onBlur={() => validateField('operatedBy', primaryData.operatedBy)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Move to save button or trigger save
                    const saveButton = document.getElementById('primary-save-btn');
                    if (saveButton) {
                      saveButton.focus();
                    }
                  }
                }}
                onMouseDown={(e) => {
                  if (!primaryData.date) {
                    setDateErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  } else if (!primaryData.machine) {
                    setMachineErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  } else if (!primaryData.shift) {
                    setShiftErrorHighlight(true);
                    setOperatedByErrorHighlight(true);
                    setTimeout(() => setOperatedByErrorHighlight(false), 600);
                  }
                }}
                disabled={primaryFieldLocked.operatedBy || !primaryData.date || !primaryData.machine || !primaryData.shift}
                readOnly={primaryFieldLocked.operatedBy}
                placeholder="Enter name"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: `2px solid ${getBorderColor(primaryData.operatedBy, false, 'operatedBy')}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: primaryFieldLocked.operatedBy ? '#f1f5f9' : '#ffffff',
                  cursor: primaryFieldLocked.operatedBy ? 'not-allowed' : 'text',
                  transition: 'border-color 0.2s ease'
                }}
                required
              />
            </div>
          </div>
          
          {/* Primary Submit Button */}
          <div style={{ marginTop: '1rem', gap: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {loadingStates.primary ? (
                <div style={{ padding: '0.75rem 1.5rem', color: '#64748b', fontWeight: 500 }}>
                  Saving...
                </div>
              ) : (
                <button
                  id="primary-save-btn"
                  type="button"
                  onClick={handlePrimarySubmit}
                  disabled={primaryFieldLocked.operatorName && primaryFieldLocked.operatedBy}
                  className="dmm-submit-btn"
                  style={{
                    backgroundColor: (primaryFieldLocked.operatorName && primaryFieldLocked.operatedBy) ? '#94a3b8' : '#3b82f6',
                    cursor: (primaryFieldLocked.operatorName && primaryFieldLocked.operatedBy) ? 'not-allowed' : 'pointer',
                    opacity: (primaryFieldLocked.operatorName && primaryFieldLocked.operatedBy) ? 0.6 : 1
                  }}
                >
                  <Save size={18} />
                  Save Primary Data
                </button>
              )}
              {primaryErrorMessage && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  animation: 'fadeIn 0.3s ease'
                }}>
                  {primaryErrorMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider line to separate primary data from other inputs */}
        <div style={{ width: '100%', marginTop: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

        {/* Shift Parameters Section */}
        <div className="dmm-section">
            <h3 className="dmm-section-title">
              DMM Shift Parameters Information
              {primaryData.machine && primaryData.shift && (
                <span style={{ fontWeight: 400, color: '#64748b' }}>
                  {` - Machine: ${primaryData.machine}, Shift: ${primaryData.shift}`}
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}> Count: {shiftCounts[`shift${primaryData.shift}`] || 0}</span>
                </span>
              )}
            </h3>
            {renderRow()}
            <div className="dmm-section-submit" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* No reset button for shift parameters section */}
            </div>
          </div>
        </form>

        {/* Save All button only enabled after primary is locked */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {shiftErrorMessage && (
            <div style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              animation: 'fadeIn 0.3s ease'
            }}>
              {shiftErrorMessage}
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={allSubmitting || !isPrimaryLocked}
            className="dmm-submit-btn"
            title={!isPrimaryLocked ? 'Please save Primary Data first' : 'Save shift parameters'}
            style={{
              opacity: (!isPrimaryLocked || allSubmitting) ? 0.6 : 1,
              cursor: (!isPrimaryLocked || allSubmitting) ? 'not-allowed' : 'pointer'
            }}
          >
            {allSubmitting ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
            {allSubmitting ? 'Saving...' : 'Submit Entry'}
        </button>
      </div>
    </div>
  );
};

export default DmmSettingParameters;