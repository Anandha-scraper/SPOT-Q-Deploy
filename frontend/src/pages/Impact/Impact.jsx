import { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SubmitButton, PlusButton, MinusButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { InfoIcon, InfoCard, useInfoModal } from '../../Components/Info';
import { useImpactContext } from '../../../app.jsx';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Impact/Impact.css';

const Impact = () => {
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
      pattern: 'Alphanumeric'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: 'e.g., 6F25'
    },
    {
      field: 'Specification',
      type: 'Text',
      pattern: 'e.g., 12.5 J, 30° unnotch'
    },
    {
      field: 'Observed Value',
      type: 'NumberArray',
      pattern: 'Individual number inputs (e.g., 12.5 each)',
      min: 0,
      max: 100
    },
    {
      field: 'Remarks',
      type: 'Text',
      maxLength: 200
    }
  ];

  // ====================== Field Mapping ======================
  // Maps display field names to formData property names
  const fieldMapping = {
    'Date': 'date',
    'Part Name': 'partName',
    'Date Code': 'dateCode',
    'Specification': 'specification',
    'Observed Value': 'observedValues', // Note: now maps to array field
    'Remarks': 'remarks'
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
  } = useImpactContext();

  // Check if date is selected (for locking other inputs)
  const isDateSelected = formData.date && formData.date.trim() !== '';

  const [submitLoading, setSubmitLoading] = useState(false);

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Refs
  const submitButtonRef = useRef(null);
  const inputRefs = useRef({});

  // ====================== OBSERVED VALUES STATE MANAGEMENT ======================
  // State for managing dynamic observed value inputs
  const [observedValues, setObservedValues] = useState([{ id: 1, value: '' }]);

  // Add new observed value input
  const addObservedValue = () => {
    const newId = observedValues.length > 0 ? Math.max(...observedValues.map(ov => ov.id)) + 1 : 1;
    const newValues = [...observedValues, { id: newId, value: '' }];
    setObservedValues(newValues);
    setFormData(prev => ({
      ...prev,
      observedValues: newValues.map(ov => ov.value)
    }));
  };

  // Remove observed value input
  const removeObservedValue = (id) => {
    setObservedValues(prev => {
      const filtered = prev.filter(ov => ov.id !== id);
      // Ensure at least one input remains
      const finalValues = filtered.length > 0 ? filtered : [{ id: 1, value: '' }];
      
      setFormData(prevForm => ({
        ...prevForm,
        observedValues: finalValues.map(ov => ov.value)
      }));
      
      return finalValues;
    });
  };

  // Update specific observed value
  const updateObservedValue = (id, value) => {
    setObservedValues(prev => {
      const updatedValues = prev.map(ov => ov.id === id ? { ...ov, value } : ov);
      
      // Also update the form data context with the complete array (without filtering empty values)
      setFormData(prevForm => ({
        ...prevForm,
        observedValues: updatedValues.map(ov => ov.value)
      }));
      
      return updatedValues;
    });
  };

  // Sync observed values with context form data ONLY when context changes externally
  // For example, when resetFormData() is called.
  useEffect(() => {
    if (formData.observedValues && Array.isArray(formData.observedValues)) {
      // Check if context length is 0 (like after a reset)
      if (formData.observedValues.length === 0) {
        setObservedValues([{ id: 1, value: '' }]);
      } else {
        // If the context differs significantly, do a sync to prevent overriding active IDs
        // Usually, internal updates will match the lengths
        if (formData.observedValues.length !== observedValues.length) {
          const syncedValues = formData.observedValues.map((val, index) => ({
            id: index + 1,
            value: val || ''
          }));
          setObservedValues(syncedValues);
        }
      }
    }
  }, [formData.observedValues, observedValues.length]);

  // ====================== Validation Setters Mapping ======================
  // Maps formData field names to their validation state setters
  const validationSetters = {
    'date': (val) => setValidation('date', val),
    'partName': (val) => setValidation('partName', val),
    'dateCode': (val) => setValidation('dateCode', val),
    'specification': (val) => setValidation('specification', val),
    'observedValues': (val) => setValidation('observedValues', val), // Updated for array
    'remarks': (val) => setValidation('remarks', val)
  };

  /*
   * ====================== ENHANCED DYNAMIC VALIDATION FUNCTION ======================
   *
   * VALIDATION ARCHITECTURE OVERVIEW:
   * This implements a comprehensive validation engine using the Strategy Pattern
   * with enhanced browser compatibility and edge case handling.
   *
   * CORE DESIGN PATTERNS:
   * 1. STRATEGY PATTERN - validateField() delegates to type-specific validation strategies
   * 2. FAIL-FAST APPROACH - Return first validation error encountered
   * 3. BROWSER VALIDITY API - Leverage native input validation for edge cases
   * 4. ENHANCED ERROR HANDLING - Comprehensive edge case detection and messaging
   *
   * @param {Object} rule - The validation rule from validationRanges
   * @param {string|Array} mappedFields - The formData field name(s) from fieldMapping
   * @param {Object} formData - The current form data
   * @returns {Object} - { isValid: boolean, message: string }
   */
  const validateField = (rule, mappedFields, formData) => {
    // Handle range fields (arrays) - for future use with min/max fields
    if (Array.isArray(mappedFields)) {
      const [minField, maxField] = mappedFields;
      const minValue = formData[minField];
      const maxValue = formData[maxField];
      const minInput = inputRefs?.current?.[minField];
      const maxInput = inputRefs?.current?.[maxField];

      // Check if browser considers input intuitively invalid (e.g. typing 'e' in type "number")
      if ((minInput && minInput.validity && minInput.validity.badInput) ||
          (maxInput && maxInput.validity && maxInput.validity.badInput)) {
        return { isValid: false, message: `${rule.field} must contain valid numbers` };
      }

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
    const inputElement = inputRefs?.current?.[fieldName];

    // Check if the browser considers the input intuitively invalid (e.g. 'e' pushed to type "number")
    // This catches invalid strings that are reflected as empty in 'value'
    if (inputElement && inputElement.validity && inputElement.validity.badInput) {
      return { isValid: false, message: `${rule.field} must be a valid ${rule.type.toLowerCase()}` };
    }

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

    // Type-specific validation with enhanced patterns from Process.jsx
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

      case 'NumberArray':
        // Special validation for observed values array
        const arrayValue = formData[fieldName];

        // Check if it's an array
        if (!Array.isArray(arrayValue)) {
          return rule.required ? { isValid: false, message: `${rule.field} is required` } : { isValid: true };
        }

        // Filter out empty values
        const nonEmptyValues = arrayValue.filter(val => val !== null && val !== undefined && String(val).trim() !== '');

        if (rule.required && nonEmptyValues.length === 0) {
          return { isValid: false, message: `${rule.field} must have at least one value` };
        }

        // Validate each number in the array
        for (let i = 0; i < nonEmptyValues.length; i++) {
          const val = nonEmptyValues[i];
          const num = parseFloat(val);

          if (isNaN(num) || !isFinite(num)) {
            return { isValid: false, message: `${rule.field} must contain only valid numbers` };
          }

          // Check min/max constraints
          if (rule.min !== undefined && num < rule.min) {
            return { isValid: false, message: `${rule.field} values must be at least ${rule.min}` };
          }
          if (rule.max !== undefined && num > rule.max) {
            return { isValid: false, message: `${rule.field} values must be no more than ${rule.max}` };
          }
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

        // Check maxLength if specified
        if (rule.maxLength && textValue.length > rule.maxLength) {
          return { isValid: false, message: `${rule.field} must be no more than ${rule.maxLength} characters` };
        }
        break;

      case 'Select':
        // Enhanced select validation for dropdown/select fields
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
          return { isValid: false, message: `${rule.field} must be one of: ${rule.allowedValues.join(', ')}` };
        }
        break;

      case 'Date':
        // Enhanced date validation
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

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   */
  const getInputClassName = (validationState) => {
    if (validationState === false) return 'invalid-input';
    return '';
  };

  /*
   * Helper to check if a specific observed value is invalid
   * so we only red-highlight the faulty one, not all of them
   */
  const isObservedValueInvalid = (val) => {
    const rule = validationRanges.find(r => r.field === 'Observed Value');
    if (!rule) return false;
    
    // If empty and required, it's invalid
    if (val === undefined || val === null || String(val).trim() === '') {
      // Impact test specific: if none exist and it's required (currently not required, but logic scales)
      return rule.required ? true : false;
    }
    
    const num = parseFloat(val);
    if (isNaN(num) || !isFinite(num)) return true;
    if (rule.min !== undefined && num < rule.min) return true;
    if (rule.max !== undefined && num > rule.max) return true;
    
    return false;
  };

  // ====================== Format date ======================
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d} / ${m} / ${y}`;
  };

  /*
   * Handle input change
   * When user starts typing, reset validation state to null (neutral)
   * This removes the red border as user begins correcting the field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset validation to neutral when user starts typing
    setValidation(name, null);

    // Auto-uppercase dateCode
    const finalValue = name === 'dateCode' ? value.toUpperCase() : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  /*
   * Handle observed value input change (for individual number inputs)
   */
  const handleObservedValueChange = (id, value) => {
    // Reset validation to neutral when user starts typing
    setValidation('observedValues', null);

    // Update local observed values state
    updateObservedValue(id, value);
  };


  // ====================== Enter Key Navigation ======================
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
        if (submitButtonRef.current) submitButtonRef.current.focus();
      }
    }
  };

  // ====================== Submit ======================
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
    let hasErrors = false;
    // AUTO-NAVIGATION: Track the first field that fails validation (see comment block above)
    let firstErrorField = null;
    const errorMessages = [];

    // ====================== DYNAMIC VALIDATION LOOP ======================
    // Iterate through all validation rules and validate each field dynamically
    for (const rule of validationRanges) {
      const mappedField = fieldMapping[rule.field];
      const validationSetter = validationSetters[mappedField];

      if (!mappedField || !validationSetter) {
        console.warn(`No mapping or setter found for field: ${rule.field}`);
        continue;
      }

      // Validate the field using the dynamic validateField function
      const result = validateField(rule, mappedField, formData);

      if (!result.isValid) {
        // Set validation state to false (red border)
        validationSetter(false);
        hasErrors = true;
        errorMessages.push(result.message);

        // Capture only the first error field for auto-navigation
        if (!firstErrorField) {
          firstErrorField = mappedField;
        }
      } else {
        // Set validation state to null (neutral, no color)
        validationSetter(null);
      }
    }

    // If there are errors, show error message and stop submission
    if (hasErrors) {
      setSubmitErrorMessage('Enter data in correct Format');

      // AUTO-NAVIGATION: Focus on the first field that failed validation
      // This happens immediately (synchronously) because firstErrorField
      // is a plain variable, not state. Works on FIRST submit click.
      if (firstErrorField) {
        // Special handling for observedValues - focus on first observed value input
        if (firstErrorField === 'observedValues' && observedValues.length > 0) {
          inputRefs.current[`observedValue_${observedValues[0].id}`]?.focus();
        } else {
          inputRefs.current[firstErrorField]?.focus();
        }
      }

      return;
    }

    // Clear error message if validation passes
    setSubmitErrorMessage('');

    try {
      setSubmitLoading(true);

      // ====================== FIELD FORMATTING LOGIC ======================
      // Format non-required fields to use "-" when empty for consistent data representation
      // This matches the pattern used in Process.jsx for backend data consistency
      const payload = { ...formData };

      // Special handling for observedValues array - sync from local state
      payload.observedValues = observedValues
        .map(ov => ov.value)
        .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
        .map(val => parseFloat(val)); // Convert to numbers

      // Format non-required fields to use "-" when empty based on validationRanges
      for (const rule of validationRanges) {
        const mappedField = fieldMapping[rule.field];
        if (!mappedField || Array.isArray(mappedField)) continue; // Skip range fields and unmapped fields

        // Skip observedValues as it has special handling above
        if (mappedField === 'observedValues') continue;

        // If field is not required (no required property OR required: false), set empty values to "-"
        const isRequired = rule.required === true; // Only true if explicitly set to true
        if (!isRequired && (!payload[mappedField] || payload[mappedField].toString().trim() === '')) {
          payload[mappedField] = '-';
        }
      }

      const response = await fetch(API_ENDPOINTS.impactTests, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        // Show success popup
        setShowSuccessPopup(true);

        // Reset form using context
        resetFormData();

        // Reset observed values state to default
        setObservedValues([{ id: 1, value: '' }]);

        setTimeout(() => {
          inputRefs.current.date?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error creating impact test:', error);
      alert('Failed to create entry: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ====================== JSX ======================
  return (
    <>
      <div className="impact-header">
        <div className="impact-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Impact Test - Entry Form
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? formatDisplayDate(formData.date) : '-'}
        </div>
      </div>

      {/* Info Modal */}
      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="Impact Test - Validation Ranges & Guidelines"
        validationRanges={validationRanges}
      />

      <form className="impact-form-grid">

        {/* DATE INPUT */}
        <div className="impact-form-group">
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

        {/* PART NAME - with validation */}
        <div className="impact-form-group">
          <label>Part Name</label>
          <input
            ref={(el) => inputRefs.current.partName = el}
            type="text"
            name="partName"
            value={formData.partName}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g: Crankshaft"
            autoComplete="off"
            className={getInputClassName(validationStates.partName)}
          />
        </div>

        {/* DATE CODE */}
        <div className="impact-form-group">
          <label>Date Code</label>
          <input
            ref={(el) => inputRefs.current.dateCode = el}
            type="text"
            name="dateCode"
            value={formData.dateCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g: 6F25"
            autoComplete="off"
            className={getInputClassName(validationStates.dateCode)}
          />
        </div>

        {/* SPECIFICATION */}
        <div className="impact-form-group">
          <label>Specification</label>
          <input
            ref={(el) => inputRefs.current.specification = el}
            type="text"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g: 12.5 J, 30° unnotch"
            autoComplete="off"
            className={getInputClassName(validationStates.specification)}
          />
        </div>

        {/* OBSERVED VALUES - Dynamic Number Inputs */}
        <div className="impact-form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Observed Values</label>
          <div style={{
            display: 'flex',
            flexFlow: 'row wrap',
            gap: '1rem',
            alignItems: 'center',
            width: '100%'
          }}>
            {observedValues.map((observedValue, index) => (
              <div
                key={observedValue.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <input
                  ref={(el) => inputRefs.current[`observedValue_${observedValue.id}`] = el}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={observedValue.value}
                  onChange={(e) => handleObservedValueChange(observedValue.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Value ${index + 1}`}
                  autoComplete="off"
                  style={{
                    width: '100px',
                    padding: '0.5rem 0.75rem',
                    border: (validationStates.observedValues === false && isObservedValueInvalid(observedValue.value)) 
                              ? '2px solid #ef4444' 
                              : '2px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#fff',
                    display: 'inline-block'
                  }}
                />
                <div style={{
                  display: 'inline-flex',
                  gap: '0.2rem',
                  alignItems: 'center'
                }}>
                  {observedValues.length > 1 && (
                    <MinusButton
                      onClick={() => removeObservedValue(observedValue.id)}
                      title={`Remove value ${index + 1}`}
                    />
                  )}
                  {index === observedValues.length - 1 && (
                    <PlusButton
                      onClick={addObservedValue}
                      title="Add another value"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REMARKS */}
        <div className="impact-form-group medium-width">
          <label>Remarks</label>
          <input
            ref={(el) => inputRefs.current.remarks = el}
            type="text"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter any additional notes or observations..."
            maxLength={80}
            autoComplete="off"
            className={getInputClassName(validationStates.remarks)}
          />
        </div>

      </form>

      <div className="impact-submit-container">
        {submitErrorMessage && (
          <InlineLoader 
            message={submitErrorMessage}
            variant="danger"
            size="medium"
          />
        )}
        <div className="impact-submit-right">
          <SubmitButton
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={submitLoading}
            onKeyDown={handleSubmitButtonKeyDown}
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
    </>
  );
};

export default Impact;
