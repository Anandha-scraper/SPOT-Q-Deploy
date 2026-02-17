import React, { useState, useRef } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { SubmitButton, ResetButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import '../../styles/PageStyles/QcProduction/QcProductionDetails.css';

const QcProductionDetails = () => {
  // Helper: display DD/MM/YYYY
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d} / ${m} / ${y}`;
  };

  const [formData, setFormData] = useState({
    date: '',
    partName: '',
    noOfMoulds: '',
    cPercent: '',
    siPercent: '',
    mnPercent: '',
    pPercent: '',
    sPercent: '',
    mgPercent: '',
    cuPercent: '',
    crPercent: '',
    nodularity: '',
    graphiteType: '',
    pearliteFerrite: '',
    hardnessBHN: '',
    ts: '',
    ys: '',
    el: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  /* 
   * VALIDATION STATES
   * null = neutral/default (no border color)
   * false = invalid (red border) - shown after submit when field is empty/invalid
   */
  const [dateValid, setDateValid] = useState(null);
  const [partNameValid, setPartNameValid] = useState(null);
  const [noOfMouldsValid, setNoOfMouldsValid] = useState(null);
  const [cPercentValid, setCPercentValid] = useState(null);
  const [siPercentValid, setSiPercentValid] = useState(null);
  const [mnPercentValid, setMnPercentValid] = useState(null);
  const [pPercentValid, setPPercentValid] = useState(null);
  const [sPercentValid, setSPercentValid] = useState(null);
  const [mgPercentValid, setMgPercentValid] = useState(null);
  const [cuPercentValid, setCuPercentValid] = useState(null);
  const [crPercentValid, setCrPercentValid] = useState(null);
  const [nodularityValid, setNodularityValid] = useState(null);
  const [graphiteTypeValid, setGraphiteTypeValid] = useState(null);
  const [pearliteFertiteValid, setPearliteFertiteValid] = useState(null);
  const [hardnessBHNValid, setHardnessBHNValid] = useState(null);
  const [tsValid, setTsValid] = useState(null);
  const [ysValid, setYsValid] = useState(null);
  const [elValid, setElValid] = useState(null);

  // Refs for navigation
  const submitButtonRef = useRef(null);
  const firstInputRef = useRef(null);

  /*
   * Returns the appropriate CSS class for an input field based on validation state:
   * - Red border (invalid-input) when field is invalid/empty after submit
   * - Neutral (no color) otherwise
   */
  const getInputClassName = (validationState) => {
    if (validationState === false) return 'invalid-input';
    return '';
  };

  // Helper function to validate range format (e.g., "3.50-3.75" or "3.50")
  const isValidRange = (value) => {
    if (!value || value.trim() === '') return false;
    const trimmed = value.trim();
    // Check if it's a range (e.g., "3.50-3.75") or single number
    const rangePattern = /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/;
    const numberPattern = /^\d+(\.\d+)?$/;
    return rangePattern.test(trimmed) || numberPattern.test(trimmed);
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
      case 'noOfMoulds':
        setNoOfMouldsValid(null);
        break;
      case 'cPercent':
        setCPercentValid(null);
        break;
      case 'siPercent':
        setSiPercentValid(null);
        break;
      case 'mnPercent':
        setMnPercentValid(null);
        break;
      case 'pPercent':
        setPPercentValid(null);
        break;
      case 'sPercent':
        setSPercentValid(null);
        break;
      case 'mgPercent':
        setMgPercentValid(null);
        break;
      case 'cuPercent':
        setCuPercentValid(null);
        break;
      case 'crPercent':
        setCrPercentValid(null);
        break;
      case 'nodularity':
        setNodularityValid(null);
        break;
      case 'graphiteType':
        setGraphiteTypeValid(null);
        break;
      case 'pearliteFerrite':
        setPearliteFertiteValid(null);
        break;
      case 'hardnessBHN':
        setHardnessBHNValid(null);
        break;
      case 'ts':
        setTsValid(null);
        break;
      case 'ys':
        setYsValid(null);
        break;
      case 'el':
        setElValid(null);
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name, value, type } = e.target;

    // Auto-format single digit numbers with leading zero
    if (type === 'number' && value && !isNaN(value) && parseFloat(value) >= 0 && parseFloat(value) <= 9 && !value.includes('.') && value.length === 1) {
      const formattedValue = '0' + value;
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
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

  const handleSubmit = async () => {
    // Check all required fields and set validation states
    let hasErrors = false;

    if (!formData.date || formData.date.trim() === '') {
      setDateValid(false);
      hasErrors = true;
    }
    if (!formData.partName || formData.partName.trim() === '') {
      setPartNameValid(false);
      hasErrors = true;
    }
    if (!formData.noOfMoulds || isNaN(formData.noOfMoulds) || parseFloat(formData.noOfMoulds) < 1) {
      setNoOfMouldsValid(false);
      hasErrors = true;
    }
    if (!formData.cPercent || !isValidRange(formData.cPercent)) {
      setCPercentValid(false);
      hasErrors = true;
    }
    if (!formData.siPercent || !isValidRange(formData.siPercent)) {
      setSiPercentValid(false);
      hasErrors = true;
    }
    if (!formData.mnPercent || !isValidRange(formData.mnPercent)) {
      setMnPercentValid(false);
      hasErrors = true;
    }
    if (!formData.pPercent || !isValidRange(formData.pPercent)) {
      setPPercentValid(false);
      hasErrors = true;
    }
    if (!formData.sPercent || !isValidRange(formData.sPercent)) {
      setSPercentValid(false);
      hasErrors = true;
    }
    if (!formData.mgPercent || !isValidRange(formData.mgPercent)) {
      setMgPercentValid(false);
      hasErrors = true;
    }
    if (!formData.cuPercent || !isValidRange(formData.cuPercent)) {
      setCuPercentValid(false);
      hasErrors = true;
    }
    if (!formData.crPercent || !isValidRange(formData.crPercent)) {
      setCrPercentValid(false);
      hasErrors = true;
    }
    if (!formData.nodularity || formData.nodularity.trim() === '') {
      setNodularityValid(false);
      hasErrors = true;
    }
    if (!formData.graphiteType || formData.graphiteType.trim() === '') {
      setGraphiteTypeValid(false);
      hasErrors = true;
    }
    if (!formData.pearliteFerrite || formData.pearliteFerrite.trim() === '') {
      setPearliteFertiteValid(false);
      hasErrors = true;
    }
    if (!formData.hardnessBHN || !isValidRange(formData.hardnessBHN)) {
      setHardnessBHNValid(false);
      hasErrors = true;
    }
    if (!formData.ts || formData.ts.trim() === '') {
      setTsValid(false);
      hasErrors = true;
    }
    if (!formData.ys || formData.ys.trim() === '') {
      setYsValid(false);
      hasErrors = true;
    }
    if (!formData.el || formData.el.trim() === '') {
      setElValid(false);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Clear all validation states on successful validation
    setDateValid(null);
    setPartNameValid(null);
    setNoOfMouldsValid(null);
    setCPercentValid(null);
    setSiPercentValid(null);
    setMnPercentValid(null);
    setPPercentValid(null);
    setSPercentValid(null);
    setMgPercentValid(null);
    setCuPercentValid(null);
    setCrPercentValid(null);
    setNodularityValid(null);
    setGraphiteTypeValid(null);
    setPearliteFertiteValid(null);
    setHardnessBHNValid(null);
    setTsValid(null);
    setYsValid(null);
    setElValid(null);

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
      const response = await fetch('http://localhost:5000/api/v1/qc-reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(formData) });
      const data = await response.json();

      if (data.success) {
        alert('QC Production report created successfully!');
        // Reset form and validation states
        setFormData({
          date: getTodayDate(), partName: '', noOfMoulds: '', cPercent: '', siPercent: '', mnPercent: '',
          pPercent: '', sPercent: '', mgPercent: '', cuPercent: '', crPercent: '',
          nodularity: '', graphiteType: '', pearliteFerrite: '', hardnessBHN: '', ts: '', ys: '', el: ''
        });
        setPartNameValid(null);
        setNoOfMouldsValid(null);
        setCPercentValid(null);
        setSiPercentValid(null);
        setMnPercentValid(null);
        setPPercentValid(null);
        setSPercentValid(null);
        setMgPercentValid(null);
        setCuPercentValid(null);
        setCrPercentValid(null);
        setNodularityValid(null);
        setGraphiteTypeValid(null);
        setPearliteFertiteValid(null);
        setHardnessBHNValid(null);
        setTsValid(null);
        setYsValid(null);
        setElValid(null);
        
        // Focus first input after successful submission
        setTimeout(() => {
          if (firstInputRef.current && firstInputRef.current.focus) {
            firstInputRef.current.focus();
          }
        }, 100);
      }

      setFormData({
        date: getTodayDate(), partName: '', noOfMoulds: '', cPercent: '', siPercent: '', mnPercent: '',
        pPercent: '', sPercent: '', mgPercent: '', cuPercent: '', crPercent: '',
        nodularity: '', graphiteType: '', pearliteFerrite: '', hardnessBHN: '', ts: '', ys: '', el: ''
      });
      // Reset all validation states
      setPartNameValid(null);
      setNoOfMouldsValid(null);
      setCPercentValid(null);
      setSiPercentValid(null);
      setMnPercentValid(null);
      setPPercentValid(null);
      setSPercentValid(null);
      setMgPercentValid(null);
      setCuPercentValid(null);
      setCrPercentValid(null);
      setNodularityValid(null);
      setGraphiteTypeValid(null);
      setPearliteFertiteValid(null);
      setHardnessBHNValid(null);
      setTsValid(null);
      setYsValid(null);
      setElValid(null);
      // Focus first input after submission handling
      setTimeout(() => {
        if (firstInputRef.current && firstInputRef.current.focus) {
          firstInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error creating QC report:', error);
      saveLocalEntry();
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      date: '', partName: '', noOfMoulds: '', cPercent: '', siPercent: '', mnPercent: '',
      pPercent: '', sPercent: '', mgPercent: '', cuPercent: '', crPercent: '',
      nodularity: '', graphiteType: '', pearliteFerrite: '', hardnessBHN: '', ts: '', ys: '', el: ''
    });
    // Reset all validation states
    setDateValid(null);
    setPartNameValid(null);
    setNoOfMouldsValid(null);
    setCPercentValid(null);
    setSiPercentValid(null);
    setMnPercentValid(null);
    setPPercentValid(null);
    setSPercentValid(null);
    setMgPercentValid(null);
    setCuPercentValid(null);
    setCrPercentValid(null);
    setNodularityValid(null);
    setGraphiteTypeValid(null);
    setPearliteFertiteValid(null);
    setHardnessBHNValid(null);
    setTsValid(null);
    setYsValid(null);
    setElValid(null);
  };

  // Helper to get current date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <>
      <div className="qcproduction-header">
        <div className="qcproduction-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            QC Production Details - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? formatDisplayDate(formData.date) : '-'}
        </div>
      </div>

      <form className="qcproduction-form-grid">

            <div className="qcproduction-form-group">
              <label>Date *</label>
              <CustomDatePicker
                ref={firstInputRef}
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

            <div className="qcproduction-form-group">
              <label>Part Name *</label>
              <input
                ref={firstInputRef}
                type="text"
                name="partName"
                value={formData.partName}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: Brake Disc"
                className={getInputClassName(partNameValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>No. of Moulds *</label>
              <input
                type="text"
                name="noOfMoulds"
                value={formData.noOfMoulds}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 5"
                className={getInputClassName(noOfMouldsValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>C % *</label>
              <input
                type="text"
                name="cPercent"
                value={formData.cPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 3.54-3.75"
                className={getInputClassName(cPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Si % *</label>
              <input
                type="text"
                name="siPercent"
                value={formData.siPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 2.40-2.80"
                className={getInputClassName(siPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Mn % *</label>
              <input
                type="text"
                name="mnPercent"
                value={formData.mnPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.40-0.60"
                className={getInputClassName(mnPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>P % *</label>
              <input
                type="text"
                name="pPercent"
                value={formData.pPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.02-0.05"
                className={getInputClassName(pPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>S % *</label>
              <input
                type="text"
                name="sPercent"
                value={formData.sPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.01-0.05"
                className={getInputClassName(sPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Mg % *</label>
              <input
                type="text"
                name="mgPercent"
                value={formData.mgPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.03-0.05"
                className={getInputClassName(mgPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Cu % *</label>
              <input
                type="text"
                name="cuPercent"
                value={formData.cuPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.30-0.80"
                className={getInputClassName(cuPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Cr % *</label>
              <input
                type="text"
                name="crPercent"
                value={formData.crPercent}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 0.05-0.15"
                className={getInputClassName(crPercentValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Nodularity *</label>
              <input
                type="text"
                name="nodularity"
                value={formData.nodularity}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 85"
                className={getInputClassName(nodularityValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Graphite Type *</label>
              <input
                type="text"
                name="graphiteType"
                value={formData.graphiteType}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 23-45"
                className={getInputClassName(graphiteTypeValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Pearlite Ferrite *</label>
              <input
                type="text"
                name="pearliteFerrite"
                value={formData.pearliteFerrite}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 55-65P"
                className={getInputClassName(pearliteFertiteValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>Hardness BHN *</label>
              <input
                type="text"
                name="hardnessBHN"
                value={formData.hardnessBHN}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 25-48"
                className={getInputClassName(hardnessBHNValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>TS (Tensile Strength) *</label>
              <input
                type="text"
                name="ts"
                value={formData.ts}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 550.23"
                className={getInputClassName(tsValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>YS (Yield Strength) *</label>
              <input
                type="text"
                name="ys"
                value={formData.ys}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 460.23"
                className={getInputClassName(ysValid)}
              />
            </div>

            <div className="qcproduction-form-group">
              <label>EL (Elongation) *</label>
              <input
                type="text"
                name="el"
                value={formData.el}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g: 18.5"
                className={getInputClassName(elValid)}
              />
            </div>
      </form>

      <div className="qcproduction-submit-container">
        <ResetButton onClick={handleReset}>
          Reset Form
        </ResetButton>

        <div className="qcproduction-submit-right">
          <SubmitButton
            onClick={handleSubmit}
            disabled={submitLoading}
            type="button"
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
      </div>
    </>
  );
};

export default QcProductionDetails;

