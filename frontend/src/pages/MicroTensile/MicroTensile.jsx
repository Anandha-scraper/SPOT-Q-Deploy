import React, { useState, useRef, useEffect } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { SubmitButton, DisaDropdown, LockPrimaryButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { useInfoModal, InfoIcon, InfoCard } from '../../Components/Info';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/MicroTensile/MicroTensile.css';

const MicroTensile = () => {
  // Info modal hook
  const { isOpen, openModal, closeModal } = useInfoModal();

  // ====================== Validation Ranges ======================
  const validationRanges = [
    {
      field: 'Date',
      required: true,
      type: 'Date',
      pattern: 'DD/MM/YYYY'
    },
    {
      field: 'DISA',
      required: true,
      type: 'Select',
      allowedValues: ['DISA 1', 'DISA 2', 'DISA 3', 'DISA 4']
    },
    {
      field: 'Item',
      required: true,
      type: 'Text',
      pattern: 'e.g., Volvo Bkt 234'
    },
    {
      field: 'Item (Optional)',
      type: 'Text',
      pattern: 'e.g., 343/34/56'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: 'e.g., 5E04'
    },
    {
      field: 'Heat Code',
      required: true,
      type: 'Number',
      pattern: 'e.g., 1'
    },
    {
      field: 'Bar Dia',
      type: 'Number',
      unit: 'mm',
      pattern: 'e.g., 6.0'
    },
    {
      field: 'Gauge Length',
      type: 'Number',
      unit: 'mm',
      pattern: 'e.g., 30.0'
    },
    {
      field: 'Max Load',
      type: 'Number',
      min: 0,
      unit: 'Kgs or KN',
      pattern: 'e.g., 1560'
    },
    {
      field: 'Yield Load',
      type: 'Number',
      min: 0,
      unit: 'Kgs or KN',
      pattern: 'e.g., 1290'
    },
    {
      field: 'Tensile Strength',
      type: 'Number',
      min: 0,
      unit: 'Kg/mm² or MPa',
      pattern: 'e.g., 550'
    },
    {
      field: 'Yield Strength',
      type: 'Number',
      min: 0,
      unit: 'Kg/mm² or MPa',
      pattern: 'e.g., 455'
    },
    {
      field: 'Elongation',
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%',
      pattern: 'e.g., 18.5'
    },
    {
      field: 'Remarks',
      type: 'Text'
    },
    {
      field: 'Tested By',
      type: 'Text',
      pattern: 'e.g., John Smith'
    }
  ];

  // ====================== Field Mapping ======================
  const fieldMapping = {
    'Date': 'date',
    'DISA': 'disa',
    'Item': 'item',
    'Item (Optional)': 'itemSecond',
    'Date Code': 'dateCode',
    'Heat Code': 'heatCode',
    'Bar Dia': 'barDia',
    'Gauge Length': 'gaugeLength',
    'Max Load': 'maxLoad',
    'Yield Load': 'yieldLoad',
    'Tensile Strength': 'tensileStrength',
    'Yield Strength': 'yieldStrength',
    'Elongation': 'elongation',
    'Remarks': 'remarks',
    'Tested By': 'testedBy'
  };

  const inputRefs = useRef({});
  const primarySectionRef = useRef(null);
  const [formData, setFormData] = useState({
    date: '',
    disa: '',
    item: '',
    itemSecond: '',
    dateCode: '',
    heatCode: '',
    barDia: '',
    gaugeLength: '',
    maxLoad: '',
    yieldLoad: '',
    tensileStrength: '',
    yieldStrength: '',
    elongation: '',
    remarks: '',
    testedBy: ''
  });

  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Primary save states
  const [isPrimarySaved, setIsPrimarySaved] = useState(false);
  const [savePrimaryLoading, setSavePrimaryLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [showCombinationFound, setShowCombinationFound] = useState(false);
  const [showCombinationAdded, setShowCombinationAdded] = useState(false);
  const [showPrimaryWarning, setShowPrimaryWarning] = useState(false);
  const [highlightPrimaryFields, setHighlightPrimaryFields] = useState(false);

  // VALIDATION STATES
  const [itemValid, setItemValid] = useState(null);
  const [itemSecondValid, setItemSecondValid] = useState(null);
  const [dateCodeValid, setDateCodeValid] = useState(null);
  const [heatCodeValid, setHeatCodeValid] = useState(null);
  const [barDiaValid, setBarDiaValid] = useState(null);
  const [gaugeLengthValid, setGaugeLengthValid] = useState(null);
  const [maxLoadValid, setMaxLoadValid] = useState(null);
  const [yieldLoadValid, setYieldLoadValid] = useState(null);
  const [tensileStrengthValid, setTensileStrengthValid] = useState(null);
  const [yieldStrengthValid, setYieldStrengthValid] = useState(null);
  const [elongationValid, setElongationValid] = useState(null);
  const [remarksValid, setRemarksValid] = useState(null);
  const [testedByValid, setTestedByValid] = useState(null);

  const validationSetters = {
    'item': setItemValid,
    'itemSecond': setItemSecondValid,
    'dateCode': setDateCodeValid,
    'heatCode': setHeatCodeValid,
    'barDia': setBarDiaValid,
    'gaugeLength': setGaugeLengthValid,
    'maxLoad': setMaxLoadValid,
    'yieldLoad': setYieldLoadValid,
    'tensileStrength': setTensileStrengthValid,
    'yieldStrength': setYieldStrengthValid,
    'elongation': setElongationValid,
    'remarks': setRemarksValid,
    'testedBy': setTestedByValid
  };

  const validateField = (rule, mappedFields, formData) => {
    if (Array.isArray(mappedFields)) return { isValid: true };
    const fieldName = mappedFields;
    const value = formData[fieldName];
    const inputElement = inputRefs?.current?.[fieldName];

    if (inputElement && inputElement.validity && inputElement.validity.badInput) {
      return { isValid: false, message: `${rule.field} must be a valid ${rule.type.toLowerCase()}` };
    }

    if (rule.required) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, message: `${rule.field} is required` };
      }
    }

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: true };
    }

    switch (rule.type) {
      case 'Number':
        const stringValue = String(value).trim();
        const invalidNumberPattern = /[eE+]|\..*\.|--|\+\+/;
        if (invalidNumberPattern.test(stringValue)) return { isValid: false };
        if (/[eE.+-]$/.test(stringValue)) return { isValid: false };
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) return { isValid: false };
        if (rule.min !== undefined && num <= rule.min && rule.field !== 'Elongation') {
          // Micro tensile originally required > 0 for most number fields, some strictly > 0 and elongation >= 0.
          if (rule.min === 0 && num === 0) return { isValid: false }; // Strict > 0 previously implemented
          if (num < rule.min) return { isValid: false };
        } else if (rule.min !== undefined && num < rule.min) {
           return { isValid: false }; // For elongation
        }
        if (rule.max !== undefined && num > rule.max) return { isValid: false };
        break;

      case 'Text':
        const textValue = String(value).trim();
        if (rule.field === 'Date Code') {
          const dateCodePattern = /^[0-9][A-Z][0-9]{2}$/;
          if (!dateCodePattern.test(textValue)) return { isValid: false };
        }
        break;
      default:
        break;
    }
    return { isValid: true };
  };

  // Field order for keyboard navigation
  const fieldOrder = ['date', 'disa', 'item', 'itemSecond', 'dateCode', 'heatCode', 'barDia', 'gaugeLength',
                     'maxLoad', 'yieldLoad', 'tensileStrength', 'yieldStrength', 'elongation', 'remarks', 'testedBy'];

  // Only these fields must be filled before moving on Enter
  const requiredFields = ['date', 'disa', 'item', 'dateCode', 'heatCode', 'barDia', 'gaugeLength',
                          'maxLoad', 'yieldLoad', 'tensileStrength', 'yieldStrength', 'elongation'];

  // Set current date on mount
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      date: `${y}-${m}-${d}`
    }));
  }, []);

  // Check if date+disa combination exists in database
  useEffect(() => {
    const checkDateDisaExists = async () => {
      if (!formData.date || !formData.disa) {
        setIsPrimarySaved(false);
        setEntryCount(0);
        setSavePrimaryLoading(false);
        setShowCombinationFound(false);
        setShowCombinationAdded(false);
        return;
      }

      try {
        setSavePrimaryLoading(true);
        setShowCombinationFound(false);
        
        const startTime = Date.now();
        
        const response = await fetch(`${API_ENDPOINTS.microTensile}/check?date=${formData.date}&disa=${encodeURIComponent(formData.disa)}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        
        // Ensure minimum 1 second loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setSavePrimaryLoading(false);
        
        if (data.success && data.exists) {
          setShowCombinationFound(true);
          
          // Hide "Combination found" message after 1.5 seconds
          setTimeout(() => {
            setShowCombinationFound(false);
            setIsPrimarySaved(true);
            setEntryCount(data.count || 0);
          }, 1500);
        } else {
          // Combination not found, just update states
          setIsPrimarySaved(false);
          setEntryCount(0);
        }
      } catch (error) {
        console.error('Error checking date+disa:', error);
        setSavePrimaryLoading(false);
      }
    };

    checkDateDisaExists();
  }, [formData.date, formData.disa]);

  // Add click listeners to all disabled fields to show warning
  useEffect(() => {
    const handleDisabledClick = (e) => {
      const target = e.target;

      // Check if clicked element is a disabled input or select
      if ((target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') && target.disabled) {
        handleDisabledFieldClick(e);
        return;
      }

      // Check if clicked on a label that's associated with a disabled field
      if (target.tagName === 'LABEL') {
        let formGroup = target.closest('.microtensile-form-group');
        if (formGroup) {
          const input = formGroup.querySelector('input, select, textarea');
          if (input && input.disabled) {
            handleDisabledFieldClick(e);
            return;
          }
        }
      }

      // Check if clicked on microtensile-form-grid (the main grid container)
      if (target.classList && target.classList.contains('microtensile-form-grid') && !isPrimarySaved) {
        handleDisabledFieldClick(e);
        return;
      }

      // Check if clicked on a form-group div that contains a disabled field
      let formGroup = null;
      if (target.classList && target.classList.contains('microtensile-form-group')) {
        formGroup = target;
      } else {
        formGroup = target.closest('.microtensile-form-group');
      }

      if (formGroup) {
        const input = formGroup.querySelector('input, select, textarea');
        if (input && input.disabled) {
          handleDisabledFieldClick(e);
          return;
        }
      }

      // Handle clicks on any child elements of a form group with disabled fields
      if (!isPrimarySaved) {
        const closestFormGroup = target.closest('.microtensile-form-group');
        if (closestFormGroup) {
          const input = closestFormGroup.querySelector('input, select, textarea');
          if (input && input.disabled) {
            handleDisabledFieldClick(e);
            return;
          }
        }
      }
    };

    // Add event listener to document to catch all clicks
    document.addEventListener('mousedown', handleDisabledClick, true);

    return () => {
      document.removeEventListener('mousedown', handleDisabledClick, true);
    };
  }, [isPrimarySaved]);

  const handleDisabledFieldClick = (e) => {
    if (!isPrimarySaved) {
      e.preventDefault();
      e.stopPropagation();
      
      // Show warning
      setShowPrimaryWarning(true);
      setHighlightPrimaryFields(true);
      
      // Scroll to primary section
      if (primarySectionRef.current) {
        primarySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Hide warning and remove highlight after 3 seconds
      setTimeout(() => {
        setShowPrimaryWarning(false);
        setHighlightPrimaryFields(false);
      }, 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset primary saved state and clear all fields when date or disa changes
    if (name === 'date' || name === 'disa') {
      setIsPrimarySaved(false);

      // Clear all form fields except date and disa
      setFormData(prev => ({
        date: name === 'date' ? value : prev.date,
        disa: name === 'disa' ? value : prev.disa,
        item: '',
        itemSecond: '',
        dateCode: '',
        heatCode: '',
        barDia: '',
        gaugeLength: '',
        maxLoad: '',
        yieldLoad: '',
        tensileStrength: '',
        yieldStrength: '',
        elongation: '',
        remarks: '',
        testedBy: ''
      }));

      // Reset all validation states
      setItemValid(null);
      setItemSecondValid(null);
      setDateCodeValid(null);
      setHeatCodeValid(null);
      setBarDiaValid(null);
      setGaugeLengthValid(null);
      setMaxLoadValid(null);
      setYieldLoadValid(null);
      setTensileStrengthValid(null);
      setYieldStrengthValid(null);
      setElongationValid(null);
      setRemarksValid(null);
      setTestedByValid(null);
      setErrors({});
      setSubmitError('');
      return;
    }

    // --- RESET ITEM VALIDATION ---
    if (name === 'item') {
      setItemValid(null);
    }

    // --- RESET DATE CODE VALIDATION ---
    if (name === 'dateCode') {
      setDateCodeValid(null);
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase()
      }));
      setErrors(prev => ({ ...prev, [name]: false }));
      return;
    }

    // --- VALIDATE HEAT CODE: allow only digits in frontend ---
    if (name === 'heatCode') {
      // strip any non-digit characters so the field contains only numbers
      const cleaned = String(value).replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      setHeatCodeValid(null);
      setErrors(prev => ({ ...prev, [name]: false }));
      return;
    }

    // --- RESET VALIDATION for numeric fields ---
    if (name === 'barDia') {
      setBarDiaValid(null);
    }

    if (name === 'gaugeLength') {
      setGaugeLengthValid(null);
    }

    if (name === 'maxLoad') {
      setMaxLoadValid(null);
    }

    if (name === 'yieldLoad') {
      setYieldLoadValid(null);
    }

    if (name === 'tensileStrength') {
      setTensileStrengthValid(null);
    }

    if (name === 'yieldStrength') {
      setYieldStrengthValid(null);
    }

    if (name === 'elongation') {
      setElongationValid(null);
    }

    // --- VALIDATE REMARKS: reset to neutral ---
    if (name === 'remarks') {
      setRemarksValid(null);
    }

    // --- VALIDATE TESTED BY: reset to neutral ---
    if (name === 'testedBy') {
      setTestedByValid(null);
    }

    // Handle itemSecond field
    if (name === 'itemSecond') {
      // Handle slash-separated input for itemSecond
      // Backend expects format: number/number/number (exactly 3 numbers, 2 slashes)
      const slashCount = (value.match(/\//g) || []).length;

      // Only allow numbers and slashes, max 2 slashes
      if (slashCount <= 2) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));

        // Validate fo  mat if value is not empty
        if (value.trim() !== '') {
          const parts = value.split('/');
          const isValid = parts.length === 3 && parts.every(p => p.trim() !== '' && !isNaN(p));
          setItemSecondValid(isValid);
        } else {
          setItemSecondValid(null); // Empty is okay (optional field)
        }
      }
      setErrors(prev => ({ ...prev, [name]: false }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  // Find the nearest input in a given direction based on visual position
  const findNearestInput = (currentInput, inputs, direction) => {
    const currentRect = currentInput.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    let bestMatch = null;
    let bestScore = Infinity;

    inputs.forEach((input) => {
      if (input === currentInput) return;

      const rect = input.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = centerX - currentCenterX;
      const deltaY = centerY - currentCenterY;

      let isValidDirection = false;
      let score = Infinity;

      switch (direction) {
        case 'ArrowUp':
          // Must be above (negative Y) and prioritize closest X alignment
          if (deltaY < -10) {
            isValidDirection = true;
            score = Math.abs(deltaY) + Math.abs(deltaX) * 0.5;
          }
          break;
        case 'ArrowDown':
          // Must be below (positive Y) and prioritize closest X alignment
          if (deltaY > 10) {
            isValidDirection = true;
            score = Math.abs(deltaY) + Math.abs(deltaX) * 0.5;
          }
          break;
        case 'ArrowLeft':
          // Must be to the left, prefer same row (small deltaY)
          if (deltaX < -5) {
            isValidDirection = true;
            // Heavily penalize different rows to prefer same-row navigation
            const rowPenalty = Math.abs(deltaY) > 30 ? Math.abs(deltaY) * 10 : 0;
            score = Math.abs(deltaX) + rowPenalty;
          }
          break;
        case 'ArrowRight':
          // Must be to the right, prefer same row (small deltaY)
          if (deltaX > 5) {
            isValidDirection = true;
            // Heavily penalize different rows to prefer same-row navigation
            const rowPenalty = Math.abs(deltaY) > 30 ? Math.abs(deltaY) * 10 : 0;
            score = Math.abs(deltaX) + rowPenalty;
          }
          break;
      }

      if (isValidDirection && score < bestScore) {
        bestScore = score;
        bestMatch = input;
      }
    });

    return bestMatch;
  };

  // Format decimal values for numeric fields
  const formatDecimalValue = (fieldName) => {
    const value = formData[fieldName];
    if (value && !isNaN(value) && value.trim() !== '') {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: num.toFixed(1)
        }));
      }
    }
  };

  // Handle blur event for numeric fields with decimal formatting
  const handleNumericBlur = (fieldName) => {
    formatDecimalValue(fieldName);
  };

  const handlePrimarySubmit = async () => {
    if (!formData.date || !formData.disa) {
      alert('Please fill in Date and DISA');
      return;
    }

    // If already processing, don't submit again
    if (savePrimaryLoading || showCombinationFound || showCombinationAdded) {
      return;
    }

    try {
      setSavePrimaryLoading(true);
      
      const startTime = Date.now();
      
      const response = await fetch(`${API_ENDPOINTS.microTensile}/save-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date: formData.date, disa: formData.disa })
      });
      
      const data = await response.json();
      
      // Ensure minimum 1 second for consistent UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setSavePrimaryLoading(false);
      
      if (data.success) {
        setShowCombinationAdded(true);
        
        // Hide "Combination Added" message after 1.5 seconds
        setTimeout(() => {
          setShowCombinationAdded(false);
          setIsPrimarySaved(true);
          setEntryCount(data.count || 0);
          
          // Focus on first input field
          setTimeout(() => {
            inputRefs.current.item?.focus();
          }, 100);
        }, 1500);
      } else {
        alert('Failed to save primary: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving primary:', error);
      setSavePrimaryLoading(false);
      alert('Failed to save primary: ' + error.message);
    }
  };

  const handleKeyDown = (e, field) => {
    const form = document.querySelector('.microtensile-form-grid');
    const inputs = form ? Array.from(form.querySelectorAll('input, textarea, select')) : [];
    const currentIndex = inputs.indexOf(e.target);

    if (e.key === 'Enter') {
      e.preventDefault();

      // Special handling for itemSecond field
      if (field === 'itemSecond') {
        const currentValue = formData.itemSecond;
        const slashCount = (currentValue.match(/\//g) || []).length;

        // If empty, move to next field
        if (!currentValue || currentValue.trim() === '') {
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
          } else if (inputRefs.current.submitBtn) {
            inputRefs.current.submitBtn.focus();
          }
          return;
        }

        // Backend expects format: (number/number/number) - exactly 3 numbers, 2 slashes
        const parts = currentValue.split('/');
        const isValid = parts.length === 3 && parts.every(p => p.trim() !== '' && !isNaN(p));

        // If has content and less than 2 slashes, add slash
        if (slashCount < 2 && !currentValue.endsWith('/')) {
          setFormData(prev => ({
            ...prev,
            itemSecond: currentValue + '/'
          }));
          return;
        }

        // If has 2 slashes and valid format, or ends with slash after 2nd number, move to next field
        if (isValid || (slashCount === 2 && parts.length === 3)) {
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
          } else if (inputRefs.current.submitBtn) {
            inputRefs.current.submitBtn.focus();
          }
          return;
        }
      }

      // Format decimal for numeric fields before moving to next
      const decimalFields = ['barDia', 'gaugeLength', 'maxLoad', 'yieldLoad', 'tensileStrength', 'yieldStrength', 'elongation'];
      if (decimalFields.includes(field)) {
        formatDecimalValue(field);
      }

      // If the current field is required, only proceed when it has a value
      if (requiredFields.includes(field)) {
        const isFilled = field === 'disa'
          ? (Array.isArray(formData.disa) && formData.disa.length > 0)
          : Boolean(formData[field]);

        if (!isFilled) {
          setErrors(prev => ({ ...prev, [field]: true }));
          return;
        }
      }

      const nextInput = inputs[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        // Last input - focus submit button
        if (inputRefs.current.submitBtn) {
          inputRefs.current.submitBtn.focus();
        }
      }
      return;
    }

    // Arrow key navigation using visual position
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      const targetInput = findNearestInput(e.target, inputs, e.key);

      if (targetInput) {
        targetInput.focus();
      } else if (e.key === 'ArrowDown') {
        // If no input below, focus submit button
        if (inputRefs.current.submitBtn) {
          inputRefs.current.submitBtn.focus();
        }
      }
    }
  };

  /*
   * Handle form submission with validation
   * 
   * Validation Flow:
   * 1. Check each required field for empty/invalid values
   * 2. If invalid, set validation state to false (shows red border)
   * 3. If valid, set validation state to null (neutral, no color)
   * 4. If any errors exist, show error message and stop submission
   * 5. On successful submission, reset all validation states to null
   * 
   * ============================================================
   * AUTO-NAVIGATION TO FIRST ERROR PATTERN:
   * ============================================================
   * This pattern ensures the cursor automatically focuses on the 
   * FIRST error field immediately when the user clicks Submit.
   * 
   * HOW IT WORKS:
   * 1. Initialize a tracking variable BEFORE validation loop:
   *    let firstErrorField = null;
   * 
   * 2. In EACH validation check, set firstErrorField ONLY if it's 
   *    still null (this captures only the first error):
   *    if (!formData.fieldName || validation_fails) {
   *      setFieldValid(false);
   *      hasErrors = true;
   *      if (!firstErrorField) firstErrorField = 'fieldName'; // Capture first error
   *    }
   * 
   * 3. AFTER all validations, focus immediately using the tracking variable:
   *    if (hasErrors) {
   *      if (firstErrorField) {
   *        inputRefs.current[firstErrorField]?.focus();
   *      }
   *      return;
   *    }
   * 
   * WHY THIS WORKS ON FIRST CLICK:
   * - Uses a plain variable (not state) to track synchronously
   * - Doesn't depend on state updates (which are async)
   * - Focus happens immediately in the same execution cycle
   * 
   * TO IMPLEMENT IN ANOTHER PAGE:
   * - Add: let firstErrorField = null; at start of submit handler
   * - Add: if (!firstErrorField) firstErrorField = 'refName'; in each validation
   * - Add: if (firstErrorField) inputRefs.current[firstErrorField]?.focus(); before return
   * ============================================================
   */
  const handleSubmit = async () => {
    // Clear any previous error
    setSubmitError('');

    let hasErrors = false;
    let firstErrorField = null;

    for (const rule of validationRanges) {
      if (rule.field === 'Date' || rule.field === 'DISA') continue; // Handled by primary save

      const mappedField = fieldMapping[rule.field];
      const validationSetter = validationSetters[mappedField];

      if (!mappedField || !validationSetter) continue;

      const result = validateField(rule, mappedField, formData);

      if (!result.isValid) {
        validationSetter(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = mappedField;
      } else {
        validationSetter(null);
      }
    }

    if (hasErrors) {
      setSubmitError('Enter data in correct Format');
      
      if (firstErrorField) {
        inputRefs.current[firstErrorField]?.focus();
      }
      return;
    }

    setSubmitError('');

    // Validate itemSecond format if provided
    if (formData.itemSecond && formData.itemSecond.trim() !== '') {
      const parts = formData.itemSecond.split('/');
      const isValidFormat = parts.length === 3 && parts.every(p => p.trim() !== '' && !isNaN(p));

      if (!isValidFormat) {
        setItemSecondValid(false);
        setSubmitError('Item (Optional) must be in format: number/number/number (e.g., 343/34/56)');
        setTimeout(() => setSubmitError(''), 3000);
        inputRefs.current.itemSecond?.focus();
        return;
      }
    }

    try {
      setSubmitLoading(true);

      // Build item object expected by backend: { it1: string, it2?: '(234/345/456)' }
      const itemObj = {
        it1: formData.item
      };
      if (formData.itemSecond && formData.itemSecond.trim() !== '') {
        // Ensure itemSecond is wrapped in parentheses to match backend schema
        const cleaned = formData.itemSecond.trim();
        itemObj.it2 = cleaned.startsWith('(') && cleaned.endsWith(')') ? cleaned : `(${cleaned})`;
      }

      // Create payload with item object and remove itemSecond
      const payload = {
        ...formData,
        item: itemObj
      };
      delete payload.itemSecond;

      const resp = await fetch(API_ENDPOINTS.microTensile, {
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
        // Show success animation
        setShowSuccessAnimation(true);

        // Reset all fields except DISA checklist and date
        setFormData({
          date: formData.date,
          disa: formData.disa,
          item: '',
          itemSecond: '',
          dateCode: '',
          heatCode: '',
          barDia: '',
          gaugeLength: '',
          maxLoad: '',
          yieldLoad: '',
          tensileStrength: '',
          yieldStrength: '',
          elongation: '',
          remarks: '',
          testedBy: ''
        });
        setErrors({});

        // Reset validation states
        setItemValid(null);
        setItemSecondValid(null);
        setDateCodeValid(null);
        setHeatCodeValid(null);
        setBarDiaValid(null);
        setGaugeLengthValid(null);
        setMaxLoadValid(null);
        setYieldLoadValid(null);
        setTensileStrengthValid(null);
        setYieldStrengthValid(null);
        setElongationValid(null);
        setRemarksValid(null);
        setTestedByValid(null);

        // Increment entry count
        setEntryCount(prev => prev + 1);

        // Focus on Item for next entry
        setTimeout(() => {
          inputRefs.current.item?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error creating micro tensile test:', error);
      alert('Failed to create entry: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitButtonKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
      return;
    }

    // Block all arrow keys on submit button
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  const getInputClassName = (fieldName, validationState) => {
    // Show red border if invalid (validationState === false)
    if (validationState === false) return 'invalid-input';
    // Otherwise show neutral (no color)
    return '';
  };

  return (
    <>
      {showSuccessAnimation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Sakthi onComplete={() => setShowSuccessAnimation(false)} />
        </div>
      )}
      <div className="microtensile-header">
        <div className="microtensile-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Micro Tensile Test - Entry Form
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? (() => {
            const [y, m, d] = formData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      {/* Primary Data Section */}
      <div ref={primarySectionRef}>
        <h3 style={{ marginTop: '1rem', marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600, color: '#25424c' }}>
          Primary Data {isPrimarySaved && <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#5B9AA9' }}>(Entries: {entryCount})</span>}
        </h3>
      </div>

      <div className="microtensile-form-grid">
            <div className="microtensile-form-group">
              <label>Date</label>
              <CustomDatePicker
                ref={el => inputRefs.current.date = el}
                name="date"
                value={formData.date}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'date')}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  border: highlightPrimaryFields ? '2px solid #ef4444' : undefined,
                  backgroundColor: highlightPrimaryFields ? '#fee2e2' : undefined,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div className="microtensile-form-group">
              <label>DISA</label>
              <DisaDropdown
                ref={el => inputRefs.current.disa = el}
                name="disa"
                value={formData.disa}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'disa')}
                style={{
                  border: highlightPrimaryFields ? '2px solid #ef4444' : undefined,
                  backgroundColor: highlightPrimaryFields ? '#fee2e2' : undefined,
                  transition: 'all 0.3s ease'
                }}
              />
              {(savePrimaryLoading || showCombinationFound || showCombinationAdded || showPrimaryWarning) && (
                <div style={{ 
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  {savePrimaryLoading && (
                    <InlineLoader 
                      message="Fetching Date, Disa" 
                      size="medium" 
                      variant="primary" 
                    />
                  )}
                  {showCombinationFound && (
                    <InlineLoader 
                      message="Combination found" 
                      size="medium" 
                      variant="success" 
                    />
                  )}
                  {showCombinationAdded && (
                    <InlineLoader 
                      message="Combination Added" 
                      size="medium" 
                      variant="success" 
                    />
                  )}
                  {showPrimaryWarning && (
                    <InlineLoader 
                      message="Save Date, Disa" 
                      size="medium" 
                      variant="danger" 
                    />
                  )}
                </div>
              )}
            </div>

            <div className="microtensile-form-group">
              <label>&nbsp;</label>
              <LockPrimaryButton
                onClick={handlePrimarySubmit}
                disabled={savePrimaryLoading || showCombinationFound || showCombinationAdded || !formData.date || !formData.disa || isPrimarySaved}
                isLocked={isPrimarySaved}
              />
            </div>

            {/* Divider line */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className={`microtensile-form-group ${errors.item ? 'microtensile-error-outline' : ''}`}>
              <label>Item</label>
              <input
                ref={el => inputRefs.current.item = el}
                type="text"
                name="item"
                value={formData.item}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'item')}
                placeholder="e.g: Volvo Bkt 234"
                disabled={!isPrimarySaved}
                className={getInputClassName('item', itemValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.itemSecond ? 'microtensile-error-outline' : ''}`}>
              <label>Item (Optional)</label>
              <input
                ref={el => inputRefs.current.itemSecond = el}
                type="text"
                name="itemSecond"
                value={formData.itemSecond}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'itemSecond')}
                placeholder="(Optional) e.g: 343/34/56"
                disabled={!isPrimarySaved}
                className={getInputClassName('itemSecond', itemSecondValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.dateCode ? 'microtensile-error-outline' : ''}`}>
              <label>Date Code</label>
              <input
                ref={el => inputRefs.current.dateCode = el}
                type="text"
                name="dateCode"
                value={formData.dateCode}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'dateCode')}
                placeholder="e.g: 5E04"
                disabled={!isPrimarySaved}
                className={getInputClassName('dateCode', dateCodeValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.heatCode ? 'microtensile-error-outline' : ''}`}>
              <label>Heat Code</label>
              <input
                ref={el => inputRefs.current.heatCode = el}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                name="heatCode"
                value={formData.heatCode}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'heatCode')}
                placeholder="e.g: 1"
                disabled={!isPrimarySaved}
                className={getInputClassName('heatCode', heatCodeValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.barDia ? 'microtensile-error-outline' : ''}`}>
              <label>Bar Dia (mm)</label>
              <input
                ref={el => inputRefs.current.barDia = el}
                type="number"
                name="barDia"
                value={formData.barDia}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'barDia')}
                onBlur={() => handleNumericBlur('barDia')}
                step="0.01"
                placeholder="e.g: 6.0"
                disabled={!isPrimarySaved}
                className={getInputClassName('barDia', barDiaValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.gaugeLength ? 'microtensile-error-outline' : ''}`}>
              <label>Gauge Length (mm)</label>
              <input
                ref={el => inputRefs.current.gaugeLength = el}
                type="number"
                name="gaugeLength"
                value={formData.gaugeLength}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'gaugeLength')}
                onBlur={() => handleNumericBlur('gaugeLength')}
                step="0.01"
                placeholder="e.g: 30.0"
                disabled={!isPrimarySaved}
                className={getInputClassName('gaugeLength', gaugeLengthValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.maxLoad ? 'microtensile-error-outline' : ''}`}>
              <label>Max Load (Kgs) or KN</label>
              <input
                ref={el => inputRefs.current.maxLoad = el}
                type="number"
                name="maxLoad"
                value={formData.maxLoad}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'maxLoad')}
                onBlur={() => handleNumericBlur('maxLoad')}
                step="0.01"
                placeholder="e.g: 1560"
                disabled={!isPrimarySaved}
                className={getInputClassName('maxLoad', maxLoadValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.yieldLoad ? 'microtensile-error-outline' : ''}`}>
              <label>Yield Load (Kgs) or KN</label>
              <input
                ref={el => inputRefs.current.yieldLoad = el}
                type="number"
                name="yieldLoad"
                value={formData.yieldLoad}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'yieldLoad')}
                onBlur={() => handleNumericBlur('yieldLoad')}
                step="0.01"
                placeholder="e.g: 1290"
                disabled={!isPrimarySaved}
                className={getInputClassName('yieldLoad', yieldLoadValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.tensileStrength ? 'microtensile-error-outline' : ''}`}>
              <label>Tensile Strength (Kg/mm² or Mpa)</label>
              <input
                ref={el => inputRefs.current.tensileStrength = el}
                type="number"
                name="tensileStrength"
                value={formData.tensileStrength}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'tensileStrength')}
                onBlur={() => handleNumericBlur('tensileStrength')}
                step="0.01"
                placeholder="e.g: 550"
                disabled={!isPrimarySaved}
                className={getInputClassName('tensileStrength', tensileStrengthValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.yieldStrength ? 'microtensile-error-outline' : ''}`}>
              <label>Yield Strength (Kg/mm² or Mpa)</label>
              <input
                ref={el => inputRefs.current.yieldStrength = el}
                type="number"
                name="yieldStrength"
                value={formData.yieldStrength}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'yieldStrength')}
                onBlur={() => handleNumericBlur('yieldStrength')}
                step="0.01"
                placeholder="e.g: 455"
                disabled={!isPrimarySaved}
                className={getInputClassName('yieldStrength', yieldStrengthValid)}
              />
            </div>

            <div className={`microtensile-form-group ${errors.elongation ? 'microtensile-error-outline' : ''}`}>
              <label>Elongation %</label>
              <input
                ref={el => inputRefs.current.elongation = el}
                type="number"
                name="elongation"
                value={formData.elongation}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'elongation')}
                onBlur={() => handleNumericBlur('elongation')}
                step="0.01"
                placeholder="e.g: 18.5"
                disabled={!isPrimarySaved}
                className={getInputClassName('elongation', elongationValid)}
              />
            </div>

            <div className="microtensile-form-group" style={{ gridColumn: 'span 2' }}>
              <label>Remarks</label>
              <input
                type="text"
                ref={el => inputRefs.current.remarks = el}
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'remarks')}
                placeholder="Enter any additional notes or observations..."
                maxLength={80}
                disabled={!isPrimarySaved}
                className={getInputClassName('remarks', remarksValid)}
              />
            </div>

            <div className="microtensile-form-group">
              <label>Tested By</label>
              <input
                ref={el => inputRefs.current.testedBy = el}
                type="text"
                name="testedBy"
                value={formData.testedBy}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'testedBy')}
                placeholder="e.g: John Smith"
                disabled={!isPrimarySaved}
                className={getInputClassName('testedBy', testedByValid)}
              />
            </div>
          </div>

      <div className="microtensile-submit-container" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {submitError && (
          <InlineLoader 
            message={submitError} 
            size="medium" 
            variant="danger" 
          />
        )}
        <SubmitButton
            ref={el => inputRefs.current.submitBtn = el}
            onClick={handleSubmit}
            disabled={!isPrimarySaved || submitLoading}
            onKeyDown={handleSubmitButtonKeyDown}
          >
            {submitLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Submit Entry'
            )}
          </SubmitButton>
      </div>

      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="Micro Tensile Test Validation"
        validationRanges={validationRanges}
      />
    </>
  );
};

export default MicroTensile;
