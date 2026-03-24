import { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
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
      required: true,
      type: 'Text',
      pattern: 'e.g., 12.5 J, 30° unnotch'
    },
    {
      field: 'Observed Value',
      required: true,
      type: 'Text',
      pattern: 'e.g., 12 or 12.5 or 12, 34 or 12.5, 34.6'
    },
    {
      field: 'Remarks',
      required: true,
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
    'Observed Value': 'observedValue',
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

  // ====================== Validation Setters Mapping ======================
  // Maps formData field names to their validation state setters
  const validationSetters = {
    'date': (val) => setValidation('date', val),
    'partName': (val) => setValidation('partName', val),
    'dateCode': (val) => setValidation('dateCode', val),
    'specification': (val) => setValidation('specification', val),
    'observedValue': (val) => setValidation('observedValue', val),
    'remarks': (val) => setValidation('remarks', val)
  };

  /*
   * ====================== DYNAMIC VALIDATION FUNCTION ======================
   * Validates a field based on its validation rule
   * @param {Object} rule - The validation rule from validationRanges
   * @param {string} mappedFields - The formData field name(s) from fieldMapping
   * @param {Object} formData - The current form data
   * @returns {Object} - { isValid: boolean, message: string }
   */
  const validateField = (rule, mappedFields, formData) => {
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

        // Special validation for Part Name (letters and spaces only)
        if (rule.field === 'Part Name') {
          const partNamePattern = /^[A-Za-z\s]+$/;
          if (!partNamePattern.test(textValue)) {
            return { isValid: false, message: `${rule.field} must contain only letters and spaces` };
          }
        }

        // Special validation for Observed Value (number with comma or decimal)
        if (rule.field === 'Observed Value') {
          const observedValuePattern = /^(\d+([.,]\d+)?)(\s*,\s*\d+([.,]\d+)?)*$/;
          if (!observedValuePattern.test(textValue)) {
            return { isValid: false, message: `${rule.field} must be valid numbers (e.g., 12 or 12.5 or 12, 34)` };
          }
        }

        // Check maxLength if specified
        if (rule.maxLength && textValue.length > rule.maxLength) {
          return { isValid: false, message: `${rule.field} must be no more than ${rule.maxLength} characters` };
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

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   */
  const getInputClassName = (validationState) => {
    if (validationState === false) return 'invalid-input';
    return '';
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
        inputRefs.current[firstErrorField]?.focus();
      }

      return;
    }

    // Clear error message if validation passes
    setSubmitErrorMessage('');

    try {
      setSubmitLoading(true);
      const response = await fetch(API_ENDPOINTS.impactTests, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        // Show success popup
        setShowSuccessPopup(true);

        // Reset form using context
        resetFormData();

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
            disabled={!isDateSelected}
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
            disabled={!isDateSelected}
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
            disabled={!isDateSelected}
            className={getInputClassName(validationStates.specification)}
          />
        </div>

        {/* OBSERVED VALUE */}
        <div className="impact-form-group">
          <label>Observed Value</label>
          <input
            ref={(el) => inputRefs.current.observedValue = el}
            type="text"
            name="observedValue"
            value={formData.observedValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g: 12 or 12.5 or 12, 34"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(validationStates.observedValue)}
          />
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
            disabled={!isDateSelected}
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
