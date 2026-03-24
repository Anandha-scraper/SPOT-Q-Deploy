import React, { useState, useRef, useEffect } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { InlineLoader } from '../../Components/Alert';
import Sakthi from '../../Components/Sakthi';
import { useInfoModal, InfoIcon, InfoCard } from '../../Components/Info';
import { useQcProductionContext } from '../../../app.jsx';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/QcProduction/QcProductionDetails.css';

const QcProductionDetails = () => {
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
      field: 'Part Name',
      required: true,
      type: 'Text',
      pattern: 'e.g., Brake Disc'
    },
    {
      field: 'No. of Moulds',
      required: true,
      type: 'Number',
      min: 1
    },
    {
      field: 'C % (Carbon)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Si % (Silicon)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Mn % (Manganese)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'P % (Phosphorus)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'S % (Sulfur)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Mg % (Magnesium)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Cu % (Copper)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Cr % (Chromium)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Nodularity',
      required: true,
      type: 'Number Range',
      min: 0
    },
    {
      field: 'Graphite Type',
      required: true,
      type: 'Number Range',
      min: 0
    },
    {
      field: 'Pearlite Ferrite',
      required: true,
      type: 'Number Range',
      min: 0
    },
    {
      field: 'Hardness BHN',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'BHN'
    },
    {
      field: 'TS (Tensile Strength)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'MPa'
    },
    {
      field: 'YS (Yield Strength)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'MPa'
    },
    {
      field: 'EL (Elongation)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: '%'
    }
  ];

  // Helper: display DD/MM/YYYY
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d} / ${m} / ${y}`;
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ====================== Context State ======================
  const {
    formData,
    setFormData,
    validationStates,
    setValidation,
    resetValidation,
    submitErrorMessage,
    setSubmitErrorMessage,
    resetFormData
  } = useQcProductionContext();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [showSakthi, setShowSakthi] = useState(false);

  // ====================== Autocomplete States ======================
  const [partNames, setPartNames] = useState([]); // All part names from database
  const [showPartDropdown, setShowPartDropdown] = useState(false); // Show/hide dropdown
  const [filteredPartNames, setFilteredPartNames] = useState([]); // Filtered suggestions

  // ====================== Field Mapping ======================
  // Maps display field names from validationRanges to formData property names
  const fieldMapping = {
    'Date': 'date',
    'Part Name': 'partName',
    'No. of Moulds': 'noOfMoulds',
    'C % (Carbon)': ['cPercentMin', 'cPercentMax'],
    'Si % (Silicon)': ['siPercentMin', 'siPercentMax'],
    'Mn % (Manganese)': ['mnPercentMin', 'mnPercentMax'],
    'P % (Phosphorus)': ['pPercentMin', 'pPercentMax'],
    'S % (Sulfur)': ['sPercentMin', 'sPercentMax'],
    'Mg % (Magnesium)': ['mgPercentMin', 'mgPercentMax'],
    'Cu % (Copper)': ['cuPercentMin', 'cuPercentMax'],
    'Cr % (Chromium)': ['crPercentMin', 'crPercentMax'],
    'Nodularity': ['nodularityMin', 'nodularityMax'],
    'Graphite Type': ['graphiteTypeMin', 'graphiteTypeMax'],
    'Pearlite Ferrite': ['pearliteFertiteMin', 'pearliteFertiteMax'],
    'Hardness BHN': ['hardnessBHNMin', 'hardnessBHNMax'],
    'TS (Tensile Strength)': ['tsMin', 'tsMax'],
    'YS (Yield Strength)': ['ysMin', 'ysMax'],
    'EL (Elongation)': ['elMin', 'elMax']
  };

  // ====================== Validation Setters ======================
  // Maps formData property names to their validation state setters
  const validationSetters = {
    'date': (val) => setValidation('date', val),
    'partName': (val) => setValidation('partName', val),
    'noOfMoulds': (val) => setValidation('noOfMoulds', val),
    'cPercentMin': (val) => setValidation('cPercentMin', val),
    'cPercentMax': (val) => setValidation('cPercentMax', val),
    'siPercentMin': (val) => setValidation('siPercentMin', val),
    'siPercentMax': (val) => setValidation('siPercentMax', val),
    'mnPercentMin': (val) => setValidation('mnPercentMin', val),
    'mnPercentMax': (val) => setValidation('mnPercentMax', val),
    'pPercentMin': (val) => setValidation('pPercentMin', val),
    'pPercentMax': (val) => setValidation('pPercentMax', val),
    'sPercentMin': (val) => setValidation('sPercentMin', val),
    'sPercentMax': (val) => setValidation('sPercentMax', val),
    'mgPercentMin': (val) => setValidation('mgPercentMin', val),
    'mgPercentMax': (val) => setValidation('mgPercentMax', val),
    'cuPercentMin': (val) => setValidation('cuPercentMin', val),
    'cuPercentMax': (val) => setValidation('cuPercentMax', val),
    'crPercentMin': (val) => setValidation('crPercentMin', val),
    'crPercentMax': (val) => setValidation('crPercentMax', val),
    'nodularityMin': (val) => setValidation('nodularityMin', val),
    'nodularityMax': (val) => setValidation('nodularityMax', val),
    'graphiteTypeMin': (val) => setValidation('graphiteTypeMin', val),
    'graphiteTypeMax': (val) => setValidation('graphiteTypeMax', val),
    'pearliteFertiteMin': (val) => setValidation('pearliteFertiteMin', val),
    'pearliteFertiteMax': (val) => setValidation('pearliteFertiteMax', val),
    'hardnessBHNMin': (val) => setValidation('hardnessBHNMin', val),
    'hardnessBHNMax': (val) => setValidation('hardnessBHNMax', val),
    'tsMin': (val) => setValidation('tsMin', val),
    'tsMax': (val) => setValidation('tsMax', val),
    'ysMin': (val) => setValidation('ysMin', val),
    'ysMax': (val) => setValidation('ysMax', val),
    'elMin': (val) => setValidation('elMin', val),
    'elMax': (val) => setValidation('elMax', val)
  };

  // Refs for navigation and auto-focus on first error
  const submitButtonRef = useRef(null);
  const inputRefs = useRef({});

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   */
  const getInputClassName = (validationState) => {
    if (validationState === false) return 'invalid-input';
    return '';
  };

  // Helper function to validate number input
  const isValidNumber = (value) => {
    if (!value || value.trim() === '') return false;
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  // ====================== Dynamic Validation Function ======================
  /**
   * Validates a single field or range field based on its validation rule
   * @param {Object} rule - Validation rule from validationRanges
   * @param {string|Array} mappedFields - Single field name or array of [minField, maxField]
   * @param {Object} formData - Current form data
   * @returns {Object} { isValid: boolean, message: string }
   */
  const validateField = (rule, mappedFields, formData) => {
    // Handle range fields (arrays)
    if (Array.isArray(mappedFields)) {
      const [minField, maxField] = mappedFields;
      const minValue = formData[minField];
      const maxValue = formData[maxField];

      // For range fields, check if both values exist when required
      if (rule.required) {
        if (!minValue || !maxValue) {
          return { isValid: false, message: `${rule.field} is required` };
        }
      }

      // Validate range values if they exist
      if (minValue && maxValue) {
        const min = parseFloat(minValue);
        const max = parseFloat(maxValue);

        if (isNaN(min) || isNaN(max)) {
          return { isValid: false, message: `${rule.field} must contain valid numbers` };
        }

        // Allow max to be 0 (special case - means single value)
        if (max !== 0 && min >= max) {
          return { isValid: false, message: `${rule.field} minimum must be less than maximum` };
        }

        // Check min/max constraints from rule
        if (rule.min !== undefined && (min < rule.min || max < rule.min)) {
          return { isValid: false, message: `${rule.field} values must be at least ${rule.min}` };
        }
        if (rule.max !== undefined && (min > rule.max || max > rule.max)) {
          return { isValid: false, message: `${rule.field} values must be no more than ${rule.max}` };
        }
      }

      return { isValid: true };
    }

    // Handle single fields
    const fieldName = mappedFields;
    const value = formData[fieldName];

    // Check required fields
    if (rule.required) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return { isValid: false, message: `${rule.field} is required` };
      }
    }

    // If field is empty and not required, it's valid
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: true };
    }

    // Type-specific validation
    switch (rule.type) {
      case 'Number':
      case 'Integer':
        // Enhanced number validation
        const stringValue = String(value).trim();

        // Check for invalid characters
        const invalidNumberPattern = /[eE+]|\..*\.|--|\+\+/;
        if (invalidNumberPattern.test(stringValue)) {
          return { isValid: false, message: `${rule.field} must be a valid number` };
        }

        if (/[eE.+-]$/.test(stringValue)) {
          return { isValid: false, message: `${rule.field} must be a valid number` };
        }

        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) {
          return { isValid: false, message: `${rule.field} must be a valid number` };
        }

        // Check min/max constraints
        if (rule.min !== undefined && num < rule.min) {
          return { isValid: false, message: `${rule.field} must be at least ${rule.min}` };
        }
        if (rule.max !== undefined && num > rule.max) {
          return { isValid: false, message: `${rule.field} must be no more than ${rule.max}` };
        }

        // For Integer type, check if it's actually an integer
        if (rule.type === 'Integer' && !Number.isInteger(num)) {
          return { isValid: false, message: `${rule.field} must be a whole number` };
        }
        break;

      case 'Text':
        const textValue = String(value).trim();
        if (textValue === '') {
          return rule.required ? { isValid: false, message: `${rule.field} is required` } : { isValid: true };
        }
        break;

      case 'Date':
        // Basic date validation
        if (value && typeof value === 'string' && value.trim() !== '') {
          const dateValue = new Date(value);
          if (isNaN(dateValue.getTime())) {
            return { isValid: false, message: `${rule.field} must be a valid date` };
          }
        }
        break;

      default:
        // For any other types, just check if it's not empty when required
        break;
    }

    return { isValid: true };
  };

  // ====================== Fetch Part Names from Database ======================
  useEffect(() => {
    const fetchPartNames = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.qcReports}/part-names`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.partNames) {
          setPartNames(data.partNames);
        }
      } catch (error) {
        console.error('Error fetching part names:', error);
      }
    };

    fetchPartNames();
  }, []);

  /*
   * Handle input change
   * When user starts typing, reset validation state to null (neutral)
   * This removes the red border as user begins correcting the field
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error message when user starts typing
    if (submitErrorMessage) {
      setSubmitErrorMessage('');
    }

    // List of numeric fields that should only accept numbers
    const numericFields = [
      'noOfMoulds',
      'cPercentMin', 'cPercentMax',
      'siPercentMin', 'siPercentMax',
      'mnPercentMin', 'mnPercentMax',
      'pPercentMin', 'pPercentMax',
      'sPercentMin', 'sPercentMax',
      'mgPercentMin', 'mgPercentMax',
      'cuPercentMin', 'cuPercentMax',
      'crPercentMin', 'crPercentMax',
      'nodularityMin', 'nodularityMax',
      'graphiteTypeMin', 'graphiteTypeMax',
      'pearliteFertiteMin', 'pearliteFertiteMax',
      'hardnessBHNMin', 'hardnessBHNMax',
      'tsMin', 'tsMax',
      'ysMin', 'ysMax',
      'elMin', 'elMax'
    ];

    // Filter numeric input - allow only numbers and decimal point
    let filteredValue = value;
    if (numericFields.includes(name)) {
      // Allow only digits and one decimal point
      filteredValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = filteredValue.split('.');
      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    // Handle Part Name - uppercase letters, numbers and spaces only
    if (name === 'partName') {
      // Filter to allow only letters, numbers, and spaces, then convert to uppercase
      filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();

      // Filter part names for autocomplete dropdown
      if (filteredValue.trim() === '') {
        setFilteredPartNames([]);
        setShowPartDropdown(false);
      } else {
        const filtered = partNames.filter(part =>
          part.toUpperCase().includes(filteredValue.toUpperCase())
        );
        setFilteredPartNames(filtered);
        setShowPartDropdown(filtered.length > 0);
      }
    }

    // Reset validation to neutral when user starts typing
    // For min/max pairs, clear both when either is edited
    const minMaxPairs = {
      'cPercentMin': 'cPercentMax', 'cPercentMax': 'cPercentMin',
      'siPercentMin': 'siPercentMax', 'siPercentMax': 'siPercentMin',
      'mnPercentMin': 'mnPercentMax', 'mnPercentMax': 'mnPercentMin',
      'pPercentMin': 'pPercentMax', 'pPercentMax': 'pPercentMin',
      'sPercentMin': 'sPercentMax', 'sPercentMax': 'sPercentMin',
      'mgPercentMin': 'mgPercentMax', 'mgPercentMax': 'mgPercentMin',
      'cuPercentMin': 'cuPercentMax', 'cuPercentMax': 'cuPercentMin',
      'crPercentMin': 'crPercentMax', 'crPercentMax': 'crPercentMin',
      'nodularityMin': 'nodularityMax', 'nodularityMax': 'nodularityMin',
      'graphiteTypeMin': 'graphiteTypeMax', 'graphiteTypeMax': 'graphiteTypeMin',
      'pearliteFertiteMin': 'pearliteFertiteMax', 'pearliteFertiteMax': 'pearliteFertiteMin',
      'hardnessBHNMin': 'hardnessBHNMax', 'hardnessBHNMax': 'hardnessBHNMin',
      'tsMin': 'tsMax', 'tsMax': 'tsMin',
      'ysMin': 'ysMax', 'ysMax': 'ysMin',
      'elMin': 'elMax', 'elMax': 'elMin'
    };

    setValidation(name, null);
    if (minMaxPairs[name]) {
      setValidation(minMaxPairs[name], null);
    }

    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));

    // Dynamic validation removal for from/to pairs
    if (name.endsWith('From') || name.endsWith('To')) {
      const isFromField = name.endsWith('From');
      const fromField = isFromField ? name : name.replace('To', 'From');
      const toField = isFromField ? name.replace('From', 'To') : name;
      
      const fromValue = isFromField ? parseFloat(value) : parseFloat(formData[fromField]);
      const toValue = isFromField ? parseFloat(formData[toField]) : parseFloat(value);

      // If the range is now valid, remove red borders from both
      if (!isNaN(fromValue) && !isNaN(toValue) && (toValue === 0 || fromValue <= toValue)) {
        // Clear validation errors for both from and to fields
        const baseField = fromField.replace('From', '');
        
        switch(baseField) {
          case 'cPercent':
            setCPercentFromValid(null);
            setCPercentToValid(null);
            break;
          case 'siPercent':
            setSiPercentFromValid(null);
            setSiPercentToValid(null);
            break;
          case 'mnPercent':
            setMnPercentFromValid(null);
            setMnPercentToValid(null);
            break;
          case 'pPercent':
            setPPercentFromValid(null);
            setPPercentToValid(null);
            break;
          case 'sPercent':
            setSPercentFromValid(null);
            setSPercentToValid(null);
            break;
          case 'mgPercent':
            setMgPercentFromValid(null);
            setMgPercentToValid(null);
            break;
          case 'cuPercent':
            setCuPercentFromValid(null);
            setCuPercentToValid(null);
            break;
          case 'crPercent':
            setCrPercentFromValid(null);
            setCrPercentToValid(null);
            break;
          case 'graphiteType':
            setGraphiteTypeFromValid(null);
            setGraphiteTypeToValid(null);
            break;
          case 'hardnessBHN':
            setHardnessBHNFromValid(null);
            setHardnessBHNToValid(null);
            break;
        }
      }
    }
  };

  // ====================== Autocomplete Handlers ======================
  const handlePartNameSelect = (selectedPart) => {
    setFormData(prev => ({
      ...prev,
      partName: selectedPart
    }));
    setShowPartDropdown(false);
    setFilteredPartNames([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPartDropdown && !event.target.closest('.part-name-autocomplete')) {
        setShowPartDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPartDropdown]);

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Convert integer to decimal (e.g., "3" → "3.0")
    if (value && value.trim() !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Check if it's a whole number without decimal
        if (!value.includes('.')) {
          setFormData(prev => ({
            ...prev,
            [name]: numValue.toFixed(1)
          }));
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const inputs = Array.from(form.querySelectorAll('input, textarea'));
      const currentIndex = inputs.indexOf(e.target);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        nextInput.focus();
      } else {
        // Last input - focus submit button
        if (submitButtonRef.current) {
          submitButtonRef.current.focus();
        }
      }
    }
  };

  const handleSubmitButtonKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
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
    // ====================== Dynamic Validation Loop ======================
    // Uses validationRanges, fieldMapping, and validationSetters for clean validation
    let hasErrors = false;
    let firstErrorField = null;

    // Loop through each validation rule
    for (const rule of validationRanges) {
      const mappedFields = fieldMapping[rule.field];

      // Skip if no field mapping found
      if (!mappedFields) continue;

      // Validate using dynamic system
      const result = validateField(rule, mappedFields, formData);

      // Handle setter for range fields vs single fields
      if (Array.isArray(mappedFields)) {
        // For range fields, set both min and max validation states
        const [minField, maxField] = mappedFields;
        const minSetter = validationSetters[minField];
        const maxSetter = validationSetters[maxField];

        if (!result.isValid) {
          if (minSetter) minSetter(false);
          if (maxSetter) maxSetter(false);
          hasErrors = true;
          if (!firstErrorField) firstErrorField = minField;
          if (result.message) setSubmitErrorMessage(result.message);
        } else {
          if (minSetter) minSetter(null);
          if (maxSetter) maxSetter(null);
        }
      } else {
        // For single fields
        const setter = validationSetters[mappedFields];
        if (setter) {
          if (!result.isValid) {
            setter(false);
            hasErrors = true;
            if (!firstErrorField) firstErrorField = mappedFields;
            if (result.message) setSubmitErrorMessage(result.message);
          } else {
            setter(null);
          }
        }
      }
    }

    // Handle error state
    if (hasErrors) {
      if (!submitErrorMessage) {
        setSubmitErrorMessage('Enter data in correct Format');
      }

      // AUTO-NAVIGATION: Focus on the first field that failed validation
      if (firstErrorField) {
        inputRefs.current[firstErrorField]?.focus();
      }

      return;
    }

    setSubmitErrorMessage('');

    // Helper: save entry locally if backend fails
    const saveLocalEntry = () => {
      try {
        const existingRaw = localStorage.getItem('qcProductionLocalEntries');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const localEntry = {
          ...formData,
          _id: `local-${Date.now()}`,
          local: true
        };
        const updated = [...existing, localEntry];
        localStorage.setItem('qcProductionLocalEntries', JSON.stringify(updated));
      } catch (storageError) {
        console.error('Error saving QC entry to localStorage:', storageError);
      }
    };

    try {
      setSubmitLoading(true);
      
      // Helper function to format range - if max is 0, return only min value
      const formatRange = (min, max) => {
        if (max === '0' || max === '0.0' || parseFloat(max) === 0) {
          return min;
        }
        return `${min} - ${max}`;
      };
      
      // Transform min/max fields into single range strings for backend
      const payload = {
        date: formData.date,
        partName: formData.partName,
        noOfMoulds: formData.noOfMoulds,
        cPercent: formatRange(formData.cPercentMin, formData.cPercentMax),
        siPercent: formatRange(formData.siPercentMin, formData.siPercentMax),
        mnPercent: formatRange(formData.mnPercentMin, formData.mnPercentMax),
        pPercent: formatRange(formData.pPercentMin, formData.pPercentMax),
        sPercent: formatRange(formData.sPercentMin, formData.sPercentMax),
        mgPercent: formatRange(formData.mgPercentMin, formData.mgPercentMax),
        cuPercent: formatRange(formData.cuPercentMin, formData.cuPercentMax),
        crPercent: formatRange(formData.crPercentMin, formData.crPercentMax),
        nodularity: formatRange(formData.nodularityMin, formData.nodularityMax),
        graphiteType: formatRange(formData.graphiteTypeMin, formData.graphiteTypeMax),
        pearliteFerrite: formatRange(formData.pearliteFertiteMin, formData.pearliteFertiteMax),
        hardnessBHN: formatRange(formData.hardnessBHNMin, formData.hardnessBHNMax),
        ts: formatRange(formData.tsMin, formData.tsMax),
        ys: formatRange(formData.ysMin, formData.ysMax),
        el: formatRange(formData.elMin, formData.elMax)
      };
      
      const response = await fetch(API_ENDPOINTS.qcReports, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(payload) 
      });
      
      const data = await response.json();
      setSubmitLoading(false);

      if (data.success) {
        // Show Sakthi loader
        setShowSakthi(true);

        // Reset form and validation states using context
        resetFormData();

        // Focus first input after Sakthi animation completes
        setTimeout(() => {
          inputRefs.current.date?.focus();
        }, 1600);
      } else {
        // Show error message
        alert(data.message || 'Failed to create QC Production report');
      }
    } catch (error) {
      console.error('Error creating QC report:', error);
      setSubmitLoading(false);
      saveLocalEntry();
      alert('Network error. Entry saved locally.');
    }
  };

  // Helper to get current date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSakthiComplete = () => {
    setShowSakthi(false);
  };

  return (
    <>
      {showSakthi && (
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
          <Sakthi onComplete={handleSakthiComplete} />
        </div>
      )}
      <div className="qcproduction-header">
        <div className="qcproduction-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            QC Production Details - Entry Form
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? formatDisplayDate(formData.date) : '-'}
        </div>
      </div>

      <form className="qcproduction-form-grid">

            <div className="qcproduction-form-group">
              <label>Date</label>
              <CustomDatePicker
                ref={(el) => inputRefs.current.date = el}
                name="date"
                value={formData.date}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  border: validationStates.date === false ? '2px solid #ef4444' : '2px solid #cbd5e1',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div className="qcproduction-form-group part-name-autocomplete" style={{ position: 'relative' }}>
              <label>Part Name</label>
              <input
                ref={(el) => inputRefs.current.partName = el}
                type="text"
                name="partName"
                value={formData.partName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: BRAKE DISC 123"
                className={getInputClassName(validationStates.partName)}
                autoComplete="off"
              />
              {showPartDropdown && filteredPartNames.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  marginTop: '2px'
                }}>
                  {filteredPartNames.map((part, index) => (
                    <div
                      key={index}
                      onClick={() => handlePartNameSelect(part)}
                      style={{
                        padding: '0.625rem 0.875rem',
                        cursor: 'pointer',
                        borderBottom: index < filteredPartNames.length - 1 ? '1px solid #e2e8f0' : 'none',
                        fontSize: '0.875rem',
                        color: '#334155',
                        backgroundColor: '#fff',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                    >
                      {part}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="qcproduction-form-group">
              <label>No. of Moulds</label>
              <input
                ref={(el) => inputRefs.current.noOfMoulds = el}
                type="text"
                name="noOfMoulds"
                value={formData.noOfMoulds}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 5"
                className={getInputClassName(validationStates.noOfMoulds)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>C %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.cPercentMin = el}
                  type="text"
                  name="cPercentMin"
                  value={formData.cPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.cPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.cPercentMax = el}
                  type="text"
                  name="cPercentMax"
                  value={formData.cPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.cPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Si %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.siPercentMin = el}
                  type="text"
                  name="siPercentMin"
                  value={formData.siPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.siPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.siPercentMax = el}
                  type="text"
                  name="siPercentMax"
                  value={formData.siPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.siPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Mn %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.mnPercentMin = el}
                  type="text"
                  name="mnPercentMin"
                  value={formData.mnPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.mnPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.mnPercentMax = el}
                  type="text"
                  name="mnPercentMax"
                  value={formData.mnPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.mnPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>P %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.pPercentMin = el}
                  type="text"
                  name="pPercentMin"
                  value={formData.pPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.pPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.pPercentMax = el}
                  type="text"
                  name="pPercentMax"
                  value={formData.pPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.pPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>S %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.sPercentMin = el}
                  type="text"
                  name="sPercentMin"
                  value={formData.sPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.sPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.sPercentMax = el}
                  type="text"
                  name="sPercentMax"
                  value={formData.sPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.sPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Mg %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.mgPercentMin = el}
                  type="text"
                  name="mgPercentMin"
                  value={formData.mgPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.mgPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.mgPercentMax = el}
                  type="text"
                  name="mgPercentMax"
                  value={formData.mgPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.mgPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Cu %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.cuPercentMin = el}
                  type="text"
                  name="cuPercentMin"
                  value={formData.cuPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.cuPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.cuPercentMax = el}
                  type="text"
                  name="cuPercentMax"
                  value={formData.cuPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.cuPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Cr %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.crPercentMin = el}
                  type="text"
                  name="crPercentMin"
                  value={formData.crPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.crPercentMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.crPercentMax = el}
                  type="text"
                  name="crPercentMax"
                  value={formData.crPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.crPercentMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Nodularity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.nodularityMin = el}
                  type="text"
                  name="nodularityMin"
                  value={formData.nodularityMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.nodularityMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.nodularityMax = el}
                  type="text"
                  name="nodularityMax"
                  value={formData.nodularityMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.nodularityMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Graphite Type</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.graphiteTypeMin = el}
                  type="text"
                  name="graphiteTypeMin"
                  value={formData.graphiteTypeMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.graphiteTypeMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.graphiteTypeMax = el}
                  type="text"
                  name="graphiteTypeMax"
                  value={formData.graphiteTypeMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.graphiteTypeMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Pearlite Ferrite</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.pearliteFertiteMin = el}
                  type="text"
                  name="pearliteFertiteMin"
                  value={formData.pearliteFertiteMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.pearliteFertiteMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.pearliteFertiteMax = el}
                  type="text"
                  name="pearliteFertiteMax"
                  value={formData.pearliteFertiteMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.pearliteFertiteMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Hardness BHN</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.hardnessBHNMin = el}
                  type="text"
                  name="hardnessBHNMin"
                  value={formData.hardnessBHNMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.hardnessBHNMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.hardnessBHNMax = el}
                  type="text"
                  name="hardnessBHNMax"
                  value={formData.hardnessBHNMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.hardnessBHNMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>TS (Tensile Strength)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.tsMin = el}
                  type="text"
                  name="tsMin"
                  value={formData.tsMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.tsMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.tsMax = el}
                  type="text"
                  name="tsMax"
                  value={formData.tsMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.tsMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>YS (Yield Strength)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.ysMin = el}
                  type="text"
                  name="ysMin"
                  value={formData.ysMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.ysMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.ysMax = el}
                  type="text"
                  name="ysMax"
                  value={formData.ysMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.ysMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>EL (Elongation)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.elMin = el}
                  type="text"
                  name="elMin"
                  value={formData.elMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(validationStates.elMin)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.elMax = el}
                  type="text"
                  name="elMax"
                  value={formData.elMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(validationStates.elMax)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>
      </form>

      <div className="qcproduction-submit-container" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {/* Error message display near submit button */}
        {submitErrorMessage && (
          <InlineLoader 
            message={submitErrorMessage}
            variant="danger"
            size="medium"
          />
        )}
        <SubmitButton
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={submitLoading}
            type="button"
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
        title="QC Production Details Validation"
        validationRanges={validationRanges}
      />
    </>
  );
};

export default QcProductionDetails;

