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
  const validationRanges = [
    {
      field: 'Date Of Inspection',
      required: true,
      type: 'Date',
      pattern: 'YYYY-MM-DD',
      description: 'Select a valid date for the inspection. Cannot be in the future.'
    },
    {
      field: 'Item',
      required: true,
      type: 'Text',
      maxLength: 100,
      pattern: 'e.g., Cast Iron Bar',
      description: 'Enter the item name or part number being tested'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: '5E04 (1 digit, 1 letter, 2 digits)',
      description: 'Enter the date code for the part (format: 5E04)'
    },
    {
      field: 'Heat Code',
      required: true,
      type: 'Number',
      pattern: 'e.g., 12345',
      description: 'Enter heat code - Numbers only'
    },
    {
      field: 'Dia',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'mm',
      pattern: 'e.g., 12.5',
      description: 'Enter diameter in millimeters (must be greater than 0)'
    },
    {
      field: 'Lo',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'mm',
      pattern: 'e.g., 50.0',
      description: 'Enter original gauge length in millimeters (must be greater than 0)'
    },
    {
      field: 'Li',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'mm',
      pattern: 'e.g., 58.0',
      description: 'Enter final gauge length in millimeters (must be greater than 0)'
    },
    {
      field: 'Breaking Load',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'kN',
      pattern: 'e.g., 48.5',
      description: 'Enter breaking load in kilonewtons (must be greater than 0)'
    },
    {
      field: 'Yield Load',
      required: true,
      type: 'Number',
      min: 0,
      pattern: 'e.g., 38.0',
      description: 'Enter yield load (must be greater than 0)'
    },
    {
      field: 'UTS',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'N/mm²',
      pattern: 'e.g., 680.0',
      description: 'Enter ultimate tensile strength in N/mm² (must be greater than 0)'
    },
    {
      field: 'YS',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'N/mm²',
      pattern: 'e.g., 460.0',
      description: 'Enter yield strength in N/mm² (must be greater than 0)'
    },
    {
      field: 'Elongation',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%',
      pattern: 'e.g., 18.5',
      description: 'Enter elongation percentage (0-100)'
    },
    {
      field: 'Tested By',
      required: true,
      type: 'Text',
      maxLength: 100,
      pattern: 'e.g., John Doe',
      description: 'Name of the person who performed the test'
    },
    {
      field: 'Remarks',
      required: true,
      type: 'Text',
      maxLength: 200,
      description: 'Additional notes or observations (Max 200 characters)'
    }
  ];

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

  const inputRefs = useRef({});
  const submitButtonRef = useRef(null);

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   */
  const getInputClassName = (validationState) => {
    if (validationState === false) return 'invalid-input';
    return '';
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
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset validation to neutral when user starts typing
    switch (name) {
      case 'dateOfInspection':
        setDateValid(null);
        break;
      case 'item':
        setItemValid(null);
        break;
      case 'dateCode':
        setDateCodeValid(null);
        break;
      case 'heatCode':
        setHeatCodeValid(null);
        break;
      case 'dia':
        setDiaValid(null);
        break;
      case 'lo':
        setLoValid(null);
        break;
      case 'li':
        setLiValid(null);
        break;
      case 'breakingLoad':
        setBreakingLoadValid(null);
        break;
      case 'yieldLoad':
        setYieldLoadValid(null);
        break;
      case 'uts':
        setUtsValid(null);
        break;
      case 'ys':
        setYsValid(null);
        break;
      case 'elongation':
        setElongationValid(null);
        break;
      case 'testedBy':
        setTestedByValid(null);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.target.form;
      const inputs = Array.from(form.querySelectorAll('input:not([disabled]), textarea'));
      const currentIndex = inputs.indexOf(e.target);
      const nextInput = inputs[currentIndex + 1];

      if (nextInput) {
        nextInput.focus();
      } else {
        submitButtonRef.current?.focus();
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
   */
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
    const numericPattern = /^\d+$/;

    // Validate Date
    if (!formData.dateOfInspection || !formData.dateOfInspection.trim()) {
      setDateValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'dateOfInspection';
    } else {
      setDateValid(null);
    }

    // Validate Item
    if (!formData.item || !formData.item.trim()) {
      setItemValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'item';
    } else {
      setItemValid(null);
    }

    // Validate Date Code
    if (!formData.dateCode || !formData.dateCode.trim() || !dateCodePattern.test(formData.dateCode)) {
      setDateCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'dateCode';
    } else {
      setDateCodeValid(null);
    }

    // Validate Heat Code
    if (!formData.heatCode || !formData.heatCode.trim() || !numericPattern.test(formData.heatCode)) {
      setHeatCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'heatCode';
    } else {
      setHeatCodeValid(null);
    }

    // Validate Dia
    if (!formData.dia || formData.dia.toString().trim() === '' || isNaN(formData.dia) || parseFloat(formData.dia) <= 0) {
      setDiaValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'dia';
    } else {
      setDiaValid(null);
    }

    // Validate Lo
    if (!formData.lo || formData.lo.toString().trim() === '' || isNaN(formData.lo) || parseFloat(formData.lo) <= 0) {
      setLoValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'lo';
    } else {
      setLoValid(null);
    }

    // Validate Li
    if (!formData.li || formData.li.toString().trim() === '' || isNaN(formData.li) || parseFloat(formData.li) <= 0) {
      setLiValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'li';
    } else {
      setLiValid(null);
    }

    // Validate Breaking Load
    if (!formData.breakingLoad || formData.breakingLoad.toString().trim() === '' || isNaN(formData.breakingLoad) || parseFloat(formData.breakingLoad) <= 0) {
      setBreakingLoadValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'breakingLoad';
    } else {
      setBreakingLoadValid(null);
    }

    // Validate Yield Load
    if (!formData.yieldLoad || formData.yieldLoad.toString().trim() === '' || isNaN(formData.yieldLoad) || parseFloat(formData.yieldLoad) <= 0) {
      setYieldLoadValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'yieldLoad';
    } else {
      setYieldLoadValid(null);
    }

    // Validate UTS
    if (!formData.uts || formData.uts.toString().trim() === '' || isNaN(formData.uts) || parseFloat(formData.uts) <= 0) {
      setUtsValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'uts';
    } else {
      setUtsValid(null);
    }

    // Validate YS
    if (!formData.ys || formData.ys.toString().trim() === '' || isNaN(formData.ys) || parseFloat(formData.ys) <= 0) {
      setYsValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ys';
    } else {
      setYsValid(null);
    }

    // Validate Elongation
    if (!formData.elongation || formData.elongation.toString().trim() === '') {
      setElongationValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'elongation';
    } else {
      const num = parseFloat(formData.elongation);
      if (isNaN(num) || num < 0 || num > 100) {
        setElongationValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'elongation';
      } else {
        setElongationValid(null);
      }
    }

    // Validate Tested By (required)
    if (!formData.testedBy || !formData.testedBy.trim()) {
      setTestedByValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'testedBy';
    } else {
      setTestedByValid(null);
    }

    // Validate Remarks (required)
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

      const response = await fetch(API_ENDPOINTS.tensile, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();

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

        // Reset validation states
        setDateValid(null);
        setItemValid(null);
        setDateCodeValid(null);
        setHeatCodeValid(null);
        setDiaValid(null);
        setLoValid(null);
        setLiValid(null);
        setBreakingLoadValid(null);
        setYieldLoadValid(null);
        setUtsValid(null);
        setYsValid(null);
        setElongationValid(null);
        setTestedByValid(null);
        setRemarksValid(null);
        setSubmitErrorMessage('');

        setTimeout(() => {
          inputRefs.current.dateOfInspection?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error creating tensile test:', error);
      alert('Failed to create entry: ' + error.message);
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

        <div className="tensile-form-group">
          <label>Item</label>
          <input
            ref={(el) => inputRefs.current.item = el}
            type="text"
            name="item"
            value={formData.item}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g: Steel Rod"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(itemValid)}
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
            onKeyDown={handleKeyDown}
            placeholder="e.g: 6F25"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(dateCodeValid)}
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
            onKeyDown={handleKeyDown}
            placeholder="Enter number only"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(heatCodeValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 10.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(diaValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 50.0"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(loValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 52.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(liValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 45.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(breakingLoadValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 38.2"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(yieldLoadValid)}
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
            onKeyDown={handleKeyDown}            onBlur={handleNumericBlur}            step="0.01"
            placeholder="e.g: 550"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(utsValid)}
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
            onKeyDown={handleKeyDown}
            onBlur={handleNumericBlur}
            step="0.01"
            placeholder="e.g: 460"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(ysValid)}
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
            onKeyDown={handleKeyDown}
            onBlur={handleNumericBlur}
            step="0.01"
            placeholder="e.g: 18.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(elongationValid)}
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
            onKeyDown={handleKeyDown}
            placeholder="e.g: John Doe"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(testedByValid)}
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
            onKeyDown={handleKeyDown}
            placeholder="Enter any additional notes..."
            maxLength={200}
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(remarksValid)}
          />
        </div>
      </form>

      <div className="tensile-submit-container">
        {submitErrorMessage && (
          <InlineLoader 
            message={submitErrorMessage}
            variant="danger"
            size="medium"
          />
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