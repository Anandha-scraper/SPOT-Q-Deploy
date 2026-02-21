import { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { InfoIcon, InfoCard, useInfoModal } from '../../Components/Info';
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
      pattern: 'DD/MM/YYYY',
      description: 'Select a valid date for impact test. Cannot be in the future.'
    },
    {
      field: 'Part Name',
      required: true,
      type: 'Text',
      maxLength: 100,
      pattern: 'Alphanumeric',
      description: 'Enter the name of the part being tested'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: 'e.g., 6F25',
      maxLength: 50,
      description: 'Enter the date code for the part'
    },
    {
      field: 'Specification',
      required: true,
      type: 'Number',
      max: 100,
      unit: 'Joules',
      pattern: 'e.g., 15',
      description: 'Enter the impact test specification value in Joules'
    },
    {
      field: 'Observed Value',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Joules',
      pattern: 'e.g., 12 or 12.5 or 12, 34 or 12.5, 34.6',
      description: 'Enter observed impact value(s). Can be single (12) or multiple comma-separated values (12, 34). Decimals allowed using dot or comma (12.5 or 12,5)'
    },
    {
      field: 'Remarks',
      required: true,
      type: 'Text',
      maxLength: 200,
      description: 'Enter any additional notes or observations (Max 200 characters)'
    }
  ];

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ====================== State ======================
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    partName: '',
    dateCode: '',
    specification: '',
    observedValue: '',
    remarks: ''
  });

  /* 
   * VALIDATION STATES
   * null = neutral/default (no border color)
   * false = invalid (red border) - shown after submit when field is empty/invalid
   */
  const [dateValid, setDateValid] = useState(null);
  const [partNameValid, setPartNameValid] = useState(null);
  const [dateCodeValid, setDateCodeValid] = useState(null);
  const [specificationValid, setSpecificationValid] = useState(null);
  const [observedValueValid, setObservedValueValid] = useState(null);
  const [remarksValid, setRemarksValid] = useState(null);

  // Check if date is selected (for locking other inputs)
  const isDateSelected = formData.date && formData.date.trim() !== '';

  const [submitLoading, setSubmitLoading] = useState(false);
  // Submit error message state
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Refs
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
    switch (name) {
      case 'date':
        setDateValid(null);
        break;
      case 'partName':
        setPartNameValid(null);
        break;
      case 'dateCode':
        setDateCodeValid(null);
        break;
      case 'specification':
        setSpecificationValid(null);
        break;
      case 'observedValue':
        setObservedValueValid(null);
        break;
      case 'remarks':
        setRemarksValid(null);
        break;
      default:
        break;
    }

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

    const dateCodePattern = /^[0-9][A-Z][0-9]{2}$/;
    const partNamePattern = /^[A-Za-z\s]+$/;
    // Allows: "12" or "12.5" or "12,5" or "12, 34" or "12.5, 34.6"
    const observedValuePattern = /^(\d+([.,]\d+)?)(\s*,\s*\d+([.,]\d+)?)*$/;

    // Validate Date
    if (!formData.date || !formData.date.trim()) {
      setDateValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'date';
    } else {
      setDateValid(null);
    }

    // Validate Part Name
    if (!formData.partName || !formData.partName.trim() || !partNamePattern.test(formData.partName)) {
      setPartNameValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'partName';
    } else {
      setPartNameValid(null);
    }

    // Validate Date Code
    if (!formData.dateCode || !formData.dateCode.trim() || !dateCodePattern.test(formData.dateCode)) {
      setDateCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'dateCode';
    } else {
      setDateCodeValid(null);
    }

    // Validate Specification
    if (!formData.specification || !formData.specification.trim()) {
      setSpecificationValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'specification';
    } else {
      setSpecificationValid(null);
    }

    // Validate Observed Value
    if (!formData.observedValue || !formData.observedValue.trim() || !observedValuePattern.test(formData.observedValue)) {
      setObservedValueValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'observedValue';
    } else {
      setObservedValueValid(null);
    }

    // Validate Remarks
    if (!formData.remarks || !formData.remarks.trim()) {
      setRemarksValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'remarks';
    } else {
      setRemarksValid(null);
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

        // Reset form
        setFormData({
          date: getCurrentDate(),
          partName: '',
          dateCode: '',
          specification: '',
          observedValue: '',
          remarks: ''
        });

        // Reset validation states
        setDateValid(null);
        setPartNameValid(null);
        setDateCodeValid(null);
        setSpecificationValid(null);
        setObservedValueValid(null);
        setRemarksValid(null);
        setSubmitErrorMessage('');

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
              border: dateValid === false ? '2px solid #ef4444' : '2px solid #cbd5e1',
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
            className={getInputClassName(partNameValid)}
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
            className={getInputClassName(dateCodeValid)}
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
            className={getInputClassName(specificationValid)}
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
            className={getInputClassName(observedValueValid)}
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
            className={getInputClassName(remarksValid)}
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
