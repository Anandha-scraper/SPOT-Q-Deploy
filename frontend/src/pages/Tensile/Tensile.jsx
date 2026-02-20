import React, { useState, useRef, useEffect } from 'react';
import { Save } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import '../../styles/PageStyles/Tensile/Tensile.css';

const Tensile = () => {
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

  const firstFieldRef = useRef(null);
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
  const handleSubmit = async () => {
    let hasErrors = false;

    const dateCodePattern = /^[0-9][A-Z][0-9]{2}$/;
    const numericPattern = /^\d+$/;

    // Validate Date
    if (!formData.dateOfInspection || !formData.dateOfInspection.trim()) {
      setDateValid(false);
      hasErrors = true;
    } else {
      setDateValid(null);
    }

    // Validate Item
    if (!formData.item || !formData.item.trim()) {
      setItemValid(false);
      hasErrors = true;
    } else {
      setItemValid(null);
    }

    // Validate Date Code
    if (!formData.dateCode || !formData.dateCode.trim() || !dateCodePattern.test(formData.dateCode)) {
      setDateCodeValid(false);
      hasErrors = true;
    } else {
      setDateCodeValid(null);
    }

    // Validate Heat Code
    if (!formData.heatCode || !formData.heatCode.trim() || !numericPattern.test(formData.heatCode)) {
      setHeatCodeValid(false);
      hasErrors = true;
    } else {
      setHeatCodeValid(null);
    }

    // Validate Dia
    if (!formData.dia || formData.dia.toString().trim() === '' || isNaN(formData.dia) || parseFloat(formData.dia) <= 0) {
      setDiaValid(false);
      hasErrors = true;
    } else {
      setDiaValid(null);
    }

    // Validate Lo
    if (!formData.lo || formData.lo.toString().trim() === '' || isNaN(formData.lo) || parseFloat(formData.lo) <= 0) {
      setLoValid(false);
      hasErrors = true;
    } else {
      setLoValid(null);
    }

    // Validate Li
    if (!formData.li || formData.li.toString().trim() === '' || isNaN(formData.li) || parseFloat(formData.li) <= 0) {
      setLiValid(false);
      hasErrors = true;
    } else {
      setLiValid(null);
    }

    // Validate Breaking Load
    if (!formData.breakingLoad || formData.breakingLoad.toString().trim() === '' || isNaN(formData.breakingLoad) || parseFloat(formData.breakingLoad) <= 0) {
      setBreakingLoadValid(false);
      hasErrors = true;
    } else {
      setBreakingLoadValid(null);
    }

    // Validate Yield Load
    if (!formData.yieldLoad || formData.yieldLoad.toString().trim() === '' || isNaN(formData.yieldLoad) || parseFloat(formData.yieldLoad) <= 0) {
      setYieldLoadValid(false);
      hasErrors = true;
    } else {
      setYieldLoadValid(null);
    }

    // Validate UTS
    if (!formData.uts || formData.uts.toString().trim() === '' || isNaN(formData.uts) || parseFloat(formData.uts) <= 0) {
      setUtsValid(false);
      hasErrors = true;
    } else {
      setUtsValid(null);
    }

    // Validate YS
    if (!formData.ys || formData.ys.toString().trim() === '' || isNaN(formData.ys) || parseFloat(formData.ys) <= 0) {
      setYsValid(false);
      hasErrors = true;
    } else {
      setYsValid(null);
    }

    // Validate Elongation
    if (!formData.elongation || formData.elongation.toString().trim() === '') {
      setElongationValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(formData.elongation);
      if (isNaN(num) || num < 0 || num > 100) {
        setElongationValid(false);
        hasErrors = true;
      } else {
        setElongationValid(null);
      }
    }

    // Validate Tested By (required)
    if (!formData.testedBy || !formData.testedBy.trim()) {
      setTestedByValid(false);
      hasErrors = true;
    } else {
      setTestedByValid(null);
    }

    // Validate Remarks (required)
    if (!formData.remarks || !formData.remarks.trim()) {
      setRemarksValid(false);
      hasErrors = true;
    } else {
      setRemarksValid(null);
    }

    // If there are errors, show error message and stop submission
    if (hasErrors) {
      setSubmitErrorMessage('Enter data in correct Format');
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

      const response = await fetch('/v1/tensile', {
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
          firstFieldRef.current?.focus();
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
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.dateOfInspection ? formatDisplayDate(formData.dateOfInspection) : '-'}
        </div>
      </div>

      <form className="tensile-form-grid">
        {/* DATE INPUT */}
        <div className="tensile-form-group">
          <label>Date</label>
          <CustomDatePicker
            ref={firstFieldRef}
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
            type="number"
            name="dia"
            value={formData.dia}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 10.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(diaValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Lo (mm)</label>
          <input
            type="number"
            name="lo"
            value={formData.lo}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 50.0"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(loValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Li (mm)</label>
          <input
            type="number"
            name="li"
            value={formData.li}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 52.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(liValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Breaking Load (kN)</label>
          <input
            type="number"
            name="breakingLoad"
            value={formData.breakingLoad}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 45.5"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(breakingLoadValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>Yield Load</label>
          <input
            type="number"
            name="yieldLoad"
            value={formData.yieldLoad}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 38.2"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(yieldLoadValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>UTS (N/mm²)</label>
          <input
            type="number"
            name="uts"
            value={formData.uts}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            step="0.01"
            placeholder="e.g: 550"
            autoComplete="off"
            disabled={!isDateSelected}
            className={getInputClassName(utsValid)}
          />
        </div>

        <div className="tensile-form-group">
          <label>YS (N/mm²)</label>
          <input
            type="number"
            name="ys"
            value={formData.ys}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
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
            type="number"
            name="elongation"
            value={formData.elongation}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
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
            onClick={handleSubmit}
            disabled={submitLoading}
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

export default Tensile;