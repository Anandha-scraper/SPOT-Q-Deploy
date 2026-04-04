/*
 * =====================================================================================
 * DYNAMIC FORM VALIDATION SYSTEM - TECHNICAL REFERENCE
 * =====================================================================================
 *
 * This component implements a comprehensive dynamic validation system that can be
 * adapted to any form. The system consists of three core components working together:
 *
 * 1. VALIDATION RANGES - Configuration-driven field definitions
 * 2. FIELD MAPPING - Links display names to form data property names
 * 3. VALIDATION SETTERS - Maps form fields to their validation state setters
 * 4. DYNAMIC VALIDATION FUNCTION - Processes rules and validates fields
 *
 * =====================================================================================
 * IMPLEMENTATION GUIDE FOR OTHER PAGES:
 * =====================================================================================
 *
 * STEP 1: Define validationRanges array
 * -------------------------------------
 * const validationRanges = [
 *   {
 *     field: 'Display Name',        // Exact label shown to user
 *     required: true/false,         // Whether field is required
 *     type: 'Text|Number|Select|Integer|Date|Time Range|Number Range',
 *     min: 0,                      // Optional: minimum value for numbers
 *     max: 100,                    // Optional: maximum value for numbers
 *     unit: '%',                   // Optional: display unit
 *     pattern: 'regex or example', // Optional: validation pattern
 *     allowedValues: ['A','B','C'] // Required for Select type
 *   }
 * ];
 *
 * STEP 2: Create fieldMapping object
 * ----------------------------------
 * const fieldMapping = {
 *   'Display Name': 'formDataPropertyName',           // Single field
 *   'Temperature Range': ['minTemp', 'maxTemp']       // Range fields (array)
 * };
 *
 * STEP 3: Set up useState for all validation states
 * -----------------------------------------------
 * const [fieldNameValid, setFieldNameValid] = useState(null);
 * // null = neutral, false = invalid (red border), true = valid (not used)
 *
 * STEP 4: Create validationSetters mapping (AFTER useState declarations)
 * -------------------------------------------------------------------
 * const validationSetters = {
 *   'formDataPropertyName': setFieldNameValid,
 *   'anotherField': setAnotherFieldValid
 * };
 *
 * STEP 5: Implement validateField function (copy from this file)
 * ------------------------------------------------------------
 * This handles single fields, range fields, and different validation types.
 *
 * STEP 6: Add validation in submit handler
 * ---------------------------------------
 * for (const rule of validationRanges) {
 *   const mappedFields = fieldMapping[rule.field];
 *   const result = validateField(rule, mappedFields, formData);
 *   const setter = Array.isArray(mappedFields) ?
 *     setRangeFieldValid : validationSetters[mappedFields];
 *   if (setter) {
 *     setter(result.isValid ? null : false);
 *   }
 * }
 *
 * STEP 7: Add getInputClassName function
 * -------------------------------------
 * const getInputClassName = (fieldName, validationState) => {
 *   return validationState === false ? 'invalid-input' : '';
 * };
 *
 * STEP 8: Apply validation classes to inputs
 * ----------------------------------------
 * <input className={getInputClassName('fieldName', fieldNameValid)} />
 *
 * =====================================================================================
 * KEY PATTERNS:
 * =====================================================================================
 *
 * • Field names in validationRanges must EXACTLY match display labels
 * • validationSetters object must be defined AFTER all useState declarations
 * • Use null for neutral state, false for invalid (red border)
 * • Range fields use arrays in fieldMapping: ['minField', 'maxField']
 * • Always reset validation states to null when user starts typing
 * • Special cases (custom time/date fields) need separate handling in submit
 *
 * =====================================================================================
 * VALIDATION STATES:
 * =====================================================================================
 *
 * null  = Neutral/default state (no border color)
 * false = Invalid state (red border) - shown after submit when field fails validation
 * true  = Valid state (green border) - NOT USED, kept for backwards compatibility
 *
 * The validation state changes:
 * - On submit: Set to false if invalid, null if valid
 * - On user input: Reset to null (neutral) in handleChange
 * - On focus/blur: Remains null during input, only changes after submit attempts
 *
 * =====================================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { InfoIcon, InfoCard, useInfoModal } from '../../Components/Info';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Tensile/Tensile.css';

const Tensile = () => {
  // Info modal hook
  const { isOpen, openModal, closeModal } = useInfoModal();

  // ====================== Validation Ranges ======================
  // VALIDATION RANGES CONFIGURATION
  // ================================
  // Each field configuration supports:
  // - required: true/false (default: false if not specified)
  // - type: 'Text', 'Number', 'Integer', 'Select', 'Date', etc.
  // - min/max: for numeric validation
  // - unit: display unit for the field
  // - allowedValues: array for Select type fields
  //
  // DEFAULT VALUE BEHAVIOR:
  // - If required: true -> field must be filled, validation error if empty
  // - If required: false OR not specified -> empty fields are stored as "-" in database
  const validationRanges = [
    {
      field: 'Date Of Inspection',
      required: true,
      type: 'Date',
      pattern: 'YYYY-MM-DD'
    },
    {
      field: 'Item',
      required:true,
      type: 'Text',
      pattern: 'e.g., Cast Iron Bar'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: '5E04 (1 digit, 1 letter, 2 digits)'
    },
    {
      field: 'Heat Code',
      required: true,
      type: 'Number',
      pattern: 'e.g., 12345'
    },
    {
      field: 'Dia',
      type: 'Number',
      min: 0,
      max:10,
      unit: 'mm',
      pattern: 'e.g., 12.5'
    },
    {
      field: 'Lo',
      type: 'Number',
      min: 0,
      unit: 'mm',
      pattern: 'e.g., 50.0'
    },
    {
      field: 'Li',
      type: 'Number',
      min: 0,
      unit: 'mm',
      pattern: 'e.g., 58.0'
    },
    {
      field: 'Breaking Load',
      type: 'Number',
      min: 0,
      unit: 'kN',
      pattern: 'e.g., 48.5'
    },
    {
      field: 'Yield Load',
      type: 'Number',
      min: 0,
      unit: 'kN',
      pattern: 'e.g., 38.0'
    },
    {
      field: 'UTS',
      type: 'Number',
      min: 0,
      unit: 'N/mm²',
      pattern: 'e.g., 680.0'
    },
    {
      field: 'YS',
      type: 'Number',
      min: 0,
      unit: 'N/mm²',
      pattern: 'e.g., 460.0'
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
      field: 'Tested By',
      type: 'Text',
      pattern: 'e.g., John Doe'
    },
    {
      field: 'Remarks',
      type: 'Text'
    }
  ];

  // Field mapping - maps display names to form data property names
  const fieldMapping = {
    'Date Of Inspection': 'dateOfInspection',
    'Item': 'item',
    'Date Code': 'dateCode',
    'Heat Code': 'heatCode',
    'Dia': 'dia',
    'Lo': 'lo',
    'Li': 'li',
    'Breaking Load': 'breakingLoad',
    'Yield Load': 'yieldLoad',
    'UTS': 'uts',
    'YS': 'ys',
    'Elongation': 'elongation',
    'Tested By': 'testedBy',
    'Remarks': 'remarks'
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    dateOfInspection: getCurrentDate(),
    item: '',
    dateCode: '',
    heatCode: '',
    dia: '',
    lo: '',
    li: '',
    breakingLoad: '',
    yieldLoad: '',
    uts: '',
    ys: '',
    elongation: '',
    remarks: '',
    testedBy: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Check if date is selected (for locking other inputs)
  const isDateSelected = formData.dateOfInspection && formData.dateOfInspection.trim() !== '';

  /*
   * VALIDATION STATES
   * null = neutral/default (no border color)
   * false = invalid (red border) - shown after submit when field is empty/invalid
   * true = valid (green border) - NOT USED, kept for backwards compatibility
   *
   * The validation state changes:
   * - On submit: Set to false if invalid, null if valid
   * - On user input: Reset to null (neutral) in handleChange
   * - On focus/blur: Remains null during input, only changes after submit attempts
   */
  const [dateValid, setDateValid] = useState(null);
  const [itemValid, setItemValid] = useState(null);
  const [dateCodeValid, setDateCodeValid] = useState(null);
  const [heatCodeValid, setHeatCodeValid] = useState(null);
  const [diaValid, setDiaValid] = useState(null);
  const [loValid, setLoValid] = useState(null);
  const [liValid, setLiValid] = useState(null);
  const [breakingLoadValid, setBreakingLoadValid] = useState(null);
  const [yieldLoadValid, setYieldLoadValid] = useState(null);
  const [utsValid, setUtsValid] = useState(null);
  const [ysValid, setYsValid] = useState(null);
  const [elongationValid, setElongationValid] = useState(null);
  const [testedByValid, setTestedByValid] = useState(null);
  const [remarksValid, setRemarksValid] = useState(null);

  // Validation state setters mapping
  const validationSetters = {
    'dateOfInspection': setDateValid,
    'item': setItemValid,
    'dateCode': setDateCodeValid,
    'heatCode': setHeatCodeValid,
    'dia': setDiaValid,
    'lo': setLoValid,
    'li': setLiValid,
    'breakingLoad': setBreakingLoadValid,
    'yieldLoad': setYieldLoadValid,
    'uts': setUtsValid,
    'ys': setYsValid,
    'elongation': setElongationValid,
    'testedBy': setTestedByValid,
    'remarks': setRemarksValid
  };

  const inputRefs = useRef({});
  const submitButtonRef = useRef(null);

  // Field order for navigation (Enter key progression)
  const fieldOrder = ['dateOfInspection', 'item', 'dateCode', 'heatCode', 'dia', 'lo', 'li',
                     'breakingLoad', 'yieldLoad', 'uts', 'ys', 'elongation', 'testedBy', 'remarks'];

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   *
   * Flow:
   * 1. After submit, if invalid -> red border (invalid-input)
   * 2. When user starts typing/entering data -> resets to neutral via handleChange
   *
   * @param {string} fieldName - The name of the field
   * @param {boolean|null} validationState - null=neutral, false=invalid
   */
  const getInputClassName = (fieldName, validationState) => {
    // Show red border if invalid (validationState === false)
    if (validationState === false) return 'invalid-input';
    // Otherwise show neutral (no color)
    return '';
  };

  /**
   * Dynamic field validation function that supports multiple validation types
   * @param {Object} rule - Validation rule from validationRanges
   * @param {string|Array} mappedFields - Field name(s) from fieldMapping
   * @param {Object} formData - Current form data
   * @returns {Object} - { isValid: boolean, message?: string }
   */
  const validateField = (rule, mappedFields, formData) => {
    // Handle range fields (arrays) - not used in Tensile but kept for consistency
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

        if (min >= max) {
          return { isValid: false, message: `${rule.field} minimum must be less than maximum` };
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
        // Enhanced number validation to catch edge cases that type="number" allows
        const stringValue = String(value).trim();

        // Check for invalid characters that browsers allow in number inputs
        // but aren't valid for our use case
        const invalidNumberPattern = /[eE+]|\..*\.|--|\+\+/; // e, E, +, multiple dots, multiple signs
        if (invalidNumberPattern.test(stringValue)) {
          return { isValid: false, message: `${rule.field} must be a valid number` };
        }

        // Additional check for values ending with invalid characters
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

        // Special validation for Date Code pattern (1 digit, 1 letter, 2 digits)
        if (rule.field === 'Date Code') {
          const dateCodePattern = /^[0-9][A-Z][0-9]{2}$/;
          if (!dateCodePattern.test(textValue)) {
            return { isValid: false, message: `${rule.field} must be in format: 1 digit, 1 letter, 2 digits (e.g., 6F25)` };
          }
        }
        break;

      case 'Select':
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
          return { isValid: false, message: `${rule.field} must be one of: ${rule.allowedValues.join(', ')}` };
        }
        break;

      case 'Date':
        // Basic date validation - could be enhanced based on specific requirements
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

  // Format date for display
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d} / ${m} / ${y}`;
  };

  /*
   * Handle input change
   * When user starts typing, reset validation state to null (neutral)
   * This provides immediate feedback that they are addressing validation errors
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset validation to neutral when user starts typing using dynamic system
    const setter = validationSetters[name];
    if (setter) {
      setter(null);
    }

    // Clear any submit error message when user starts typing
    setSubmitErrorMessage('');

    // Auto-uppercase dateCode
    const finalValue = name === 'dateCode' ? value.toUpperCase() : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  /**
   * Find the nearest input field in a given direction using visual positioning
   * Calculates visual distance between element centers and directional alignment
   * @param {string} currentFieldName - The field name of the currently focused element
   * @param {string} direction - One of 'up', 'down', 'left', 'right'
   * @returns {string|null} - The field name of the nearest input, or null if none found
   */
  const findNearestInput = (currentFieldName, direction) => {
    const currentEl = inputRefs.current[currentFieldName];
    if (!currentEl) return null;

    const currentRect = currentEl.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    let nearest = null;
    let nearestScore = Infinity;

    // Check all input fields to find the nearest one
    for (const field of fieldOrder) {
      if (field === currentFieldName) continue;

      const el = inputRefs.current[field];
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      const deltaX = center.x - currentCenter.x;
      const deltaY = center.y - currentCenter.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      let score = Infinity;

      switch (direction) {
        case 'up':
          if (deltaY < -10) {
            score = distance + Math.abs(deltaX) * 0.5;
          }
          break;
        case 'down':
          if (deltaY > 10) {
            score = distance + Math.abs(deltaX) * 0.5;
          }
          break;
        case 'left':
          if (deltaX < -5) {
            const rowPenalty = Math.abs(deltaY) > 30 ? 10 * Math.abs(deltaY) : 0;
            score = distance + rowPenalty;
          }
          break;
        case 'right':
          if (deltaX > 5) {
            const rowPenalty = Math.abs(deltaY) > 30 ? 10 * Math.abs(deltaY) : 0;
            score = distance + rowPenalty;
          }
          break;
      }

      if (score < nearestScore) {
        nearestScore = score;
        nearest = field;
      }
    }

    return nearest;
  };

  const handleKeyDown = (e, fieldName) => {
    // Arrow key navigation - spatial movement through form
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const directionMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
      };
      const nextField = findNearestInput(fieldName, directionMap[e.key]);
      if (nextField) {
        inputRefs.current[nextField]?.focus();
      }
      return;
    }

    // Enter key - sequential navigation
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(fieldName);

      // If on last field (remarks), move to submit button
      if (fieldName === 'remarks') {
        submitButtonRef.current?.focus();
      } else if (idx < fieldOrder.length - 1) {
        inputRefs.current[fieldOrder[idx + 1]]?.focus();
      }
    }
  };

  // Format numeric fields to 1 decimal place on blur (for dia, lo, li, breakingLoad, yieldLoad, uts, ys, elongation)
  const handleNumericBlur = (e) => {
    const { name, value } = e.target;
    if (value && !isNaN(value)) {
      const numericValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue.toFixed(1)
      }));
    }
  };

  const handleSubmitKeyDown = (e) => {
    // Block arrow keys on submit button
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Handle Enter key for submit
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
    let hasErrors = false;
    let firstErrorField = null;

    // Clear any previous error messages
    setSubmitErrorMessage('');

    // Dynamic validation based on validationRanges
    for (const rule of validationRanges) {
      const mappedFields = fieldMapping[rule.field];

      // Skip if no field mapping found
      if (!mappedFields) continue;

      // Validate using dynamic system
      const result = validateField(rule, mappedFields, formData);

      // Get the setter for this field
      const setter = validationSetters[mappedFields];

      if (setter) {
        if (!result.isValid) {
          setter(false);
          hasErrors = true;
          if (!firstErrorField) firstErrorField = mappedFields;
        } else {
          setter(null);
        }
      }
    }

    // Handle error state
    if (hasErrors) {
      setSubmitErrorMessage('Fill required Field in Correct format');

      // AUTO-NAVIGATION: Focus on the first field that failed validation
      // This happens immediately (synchronously) because firstErrorField
      // is a plain variable, not state. Works on FIRST submit click.
      if (firstErrorField) {
        inputRefs.current[firstErrorField]?.focus();
      }

      return;
    }

    // Clear error message if validation passes
    setSubmitErrorMessage('');

    try {
      setSubmitLoading(true);

      const payload = {
        date: formData.dateOfInspection,
        item: formData.item,
        dateCode: formData.dateCode,
        heatCode: formData.heatCode,
        dia: formData.dia ? parseFloat(formData.dia) : '',
        lo: formData.lo ? parseFloat(formData.lo) : '',
        li: formData.li ? parseFloat(formData.li) : '',
        breakingLoad: formData.breakingLoad ? parseFloat(formData.breakingLoad) : '',
        yieldLoad: formData.yieldLoad ? parseFloat(formData.yieldLoad) : '',
        uts: formData.uts ? parseFloat(formData.uts) : '',
        ys: formData.ys ? parseFloat(formData.ys) : '',
        elongation: formData.elongation ? parseFloat(formData.elongation) : '',
        remarks: formData.remarks,
        testedBy: formData.testedBy
      };

      // Standard default value handling: non-required fields default to "-" when empty
      for (const rule of validationRanges) {
        const mappedField = fieldMapping[rule.field];
        if (!mappedField || Array.isArray(mappedField)) continue; // Skip range fields and unmapped fields

        // If field is not required (no required property OR required: false), set empty values to "-"
        const isRequired = rule.required === true; // Only true if explicitly set to true
        if (!isRequired && (!payload[mappedField] || payload[mappedField].toString().trim() === '')) {
          payload[mappedField] = '-';
        }
      }

      const response = await fetch(API_ENDPOINTS.tensile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const rawResponse = await response.text();
      let data = null;

      if (rawResponse) {
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          console.error('Failed to parse server response:', rawResponse);
          throw new Error('Invalid server response');
        }
      } else {
        data = { success: false, message: 'Empty response from server' };
      }

      // Enhanced error handling for HTTP errors
      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Response data:', data);
        console.error('Payload sent:', payload);

        if (response.status === 400) {
          const errorMessage = data?.message || `Bad Request (${response.status}): Please check your input data format`;
          throw new Error(errorMessage);
        } else {
          throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
        }
      }

      if (data.success) {
        // Show success popup
        setShowSuccessPopup(true);

        // Reset form
        setFormData({
          dateOfInspection: getCurrentDate(),
          item: '',
          dateCode: '',
          heatCode: '',
          dia: '',
          lo: '',
          li: '',
          breakingLoad: '',
          yieldLoad: '',
          uts: '',
          ys: '',
          elongation: '',
          remarks: '',
          testedBy: ''
        });

        // Reset validation states using dynamic system
        Object.values(validationSetters).forEach(setter => setter(null));
        setSubmitErrorMessage('');

        setTimeout(() => {
          inputRefs.current.dateOfInspection?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error creating tensile test:', error);

      // Show error message to user through the validation system
      setSubmitErrorMessage(error.message || 'Failed to save data. Please check your input and try again.');

      // Focus on first field if available
      if (inputRefs.current.dateOfInspection) {
        inputRefs.current.dateOfInspection.focus();
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <div className="tensile-header">
        <div className="tensile-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Tensile Test - Entry Form
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.dateOfInspection ? formatDisplayDate(formData.dateOfInspection) : '-'}
        </div>
      </div>

      <form className="tensile-form-grid">
        {/* DATE INPUT */}
        <div className="tensile-form-group">
          <label>Date Of Inspection</label>
          <CustomDatePicker
            ref={(el) => inputRefs.current.dateOfInspection = el}
            name="dateOfInspection"
            value={formData.dateOfInspection}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'dateOfInspection')}
            max={new Date().toISOString().split('T')[0]}
            style={{
              border: dateValid === false ? '2px solid #ef4444' : '2px solid #cbd5e1',
              width: '100%',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              backgroundColor: '#fff'
            }}
          />
        </div>

        <div className="tensile-form-group">
          <label>Item</label>
          <input
            ref={(el) => inputRefs.current.item = el}
            type="text"
            name="item"
            value={formData.item}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'item')}
            placeholder="e.g: Steel Rod"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('item', itemValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Date Code</label>
          <input
            ref={(el) => inputRefs.current.dateCode = el}
            type="text"
            name="dateCode"
            value={formData.dateCode}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'dateCode')}
            placeholder="e.g: 6F25"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('dateCode', dateCodeValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Heat Code</label>
          <input
            ref={(el) => inputRefs.current.heatCode = el}
            type="number"
            name="heatCode"
            value={formData.heatCode}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'heatCode')}
            placeholder="Enter number only"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('heatCode', heatCodeValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Dia (mm)</label>
          <input
            ref={(el) => inputRefs.current.dia = el}
            type="number"
            name="dia"
            value={formData.dia}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'dia')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 10.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('dia', diaValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Lo (mm)</label>
          <input
            ref={(el) => inputRefs.current.lo = el}
            type="number"
            name="lo"
            value={formData.lo}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'lo')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 50.0"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('lo', loValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Li (mm)</label>
          <input
            ref={(el) => inputRefs.current.li = el}
            type="number"
            name="li"
            value={formData.li}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'li')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 52.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('li', liValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Breaking Load (kN)</label>
          <input
            ref={(el) => inputRefs.current.breakingLoad = el}
            type="number"
            name="breakingLoad"
            value={formData.breakingLoad}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'breakingLoad')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 45.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('breakingLoad', breakingLoadValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Yield Load</label>
          <input
            ref={(el) => inputRefs.current.yieldLoad = el}
            type="number"
            name="yieldLoad"
            value={formData.yieldLoad}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'yieldLoad')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 38.2"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('yieldLoad', yieldLoadValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>UTS (N/mm²)</label>
          <input
            ref={(el) => inputRefs.current.uts = el}
            type="number"
            name="uts"
            value={formData.uts}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'uts')}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 550"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('uts', utsValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>YS (N/mm²)</label>
          <input
            ref={(el) => inputRefs.current.ys = el}
            type="number"
            name="ys"
            value={formData.ys}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'ys')}
            onBlur={handleNumericBlur}
            step="0.01"
            placeholder="e.g: 460"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('ys', ysValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Elongation (%)</label>
          <input
            ref={(el) => inputRefs.current.elongation = el}
            type="number"
            name="elongation"
            value={formData.elongation}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'elongation')}
            onBlur={handleNumericBlur}
            step="0.01"
            placeholder="e.g: 18.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('elongation', elongationValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Tested By</label>
          <input
            ref={(el) => inputRefs.current.testedBy = el}
            type="text"
            name="testedBy"
            value={formData.testedBy}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'testedBy')}
            placeholder="e.g: John Doe"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('testedBy', testedByValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Remarks</label>
          <input
            ref={(el) => inputRefs.current.remarks = el}
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onKeyDown={e => handleKeyDown(e, 'remarks')}
            placeholder="Enter any additional notes..."
            maxLength={200}
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName('remarks', remarksValid)}
          />
        </div>
      </form>

      <div className="tensile-submit-container">
        {submitErrorMessage && (
          <div style={{ flex: 1, marginRight: '0.5rem' }}>
            <InlineLoader
              message={submitErrorMessage}
              variant="danger"
              size="medium"
            />
          </div>
        )}
        <div className="tensile-submit-right">
          <SubmitButton
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={submitLoading}
            onKeyDown={handleSubmitKeyDown}
          >
            {submitLoading ? 'Saving...' : 'Submit Entry'}
          </SubmitButton>
        </div>
      </div>

      {/* Success Loader */}
      {showSuccessPopup && (
        <div className="sakthi-overlay">
          <Sakthi onComplete={() => setShowSuccessPopup(false)} />
        </div>
      )}

      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="Tensile Test Validation"
        validationRanges={validationRanges}
      />
    </>
  );
};

export default Tensile;