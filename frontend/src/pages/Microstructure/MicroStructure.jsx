import { useState, useRef, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { DisaDropdown, SubmitButton, LockPrimaryButton } from '../../Components/Buttons';
import Sakthi from '../../Components/Sakthi';
// import { FetchingPrimaryStatus } from '../../Components/Alert';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/MicroStructure/MicroStructure.css';

const MicroStructure = () => {
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ====================== State ======================
  const [date, setDate] = useState(getCurrentDate());
  const [disa, setDisa] = useState('');
  const [partName, setPartName] = useState('');
  const [dateCode, setDateCode] = useState('');
  const [heatCode, setHeatCode] = useState('');
  const [nodularity, setNodularity] = useState('');
  const [graphiteType, setGraphiteType] = useState('');
  const [countMin, setCountMin] = useState('');
  const [countMax, setCountMax] = useState('');
  const [sizeMin, setSizeMin] = useState('');
  const [sizeMax, setSizeMax] = useState('');
  const [ferriteMin, setFerriteMin] = useState('');
  const [ferriteMax, setFerriteMax] = useState('');
  const [pearliteMin, setPearliteMin] = useState('');
  const [pearliteMax, setPearliteMax] = useState('');
  const [carbideMin, setCarbideMin] = useState('');
  const [carbideMax, setCarbideMax] = useState('');
  const [remarks, setRemarks] = useState('');

  // Primary data states
  const [isPrimarySaved, setIsPrimarySaved] = useState(false);
  const [savePrimaryLoading, setSavePrimaryLoading] = useState(false);
  const [checkingPrimary, setCheckingPrimary] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [showSakthiLoader, setShowSakthiLoader] = useState(false);
  // Removed FetchingPrimaryStatus loader state

  // Validation states (null = neutral, false = invalid)
  const [partNameValid, setPartNameValid] = useState(null);
  const [dateCodeValid, setDateCodeValid] = useState(null);
  const [heatCodeValid, setHeatCodeValid] = useState(null);
  const [nodularityValid, setNodularityValid] = useState(null);
  const [graphiteTypeValid, setGraphiteTypeValid] = useState(null);
  const [countMinValid, setCountMinValid] = useState(null);
  const [countMaxValid, setCountMaxValid] = useState(null);
  const [sizeMinValid, setSizeMinValid] = useState(null);
  const [sizeMaxValid, setSizeMaxValid] = useState(null);
  const [ferriteMinValid, setFerriteMinValid] = useState(null);
  const [ferriteMaxValid, setFerriteMaxValid] = useState(null);
  const [pearliteMinValid, setPearliteMinValid] = useState(null);
  const [pearliteMaxValid, setPearliteMaxValid] = useState(null);
  const [carbideMinValid, setCarbideMinValid] = useState(null);
  const [carbideMaxValid, setCarbideMaxValid] = useState(null);
  const [remarksValid, setRemarksValid] = useState(null);

  // Refs for navigation
  const inputRefs = useRef({});

  // Field order for Enter key navigation
  const fieldOrder = [
    'date', 'disa', 'partName', 'dateCode', 'heatCode', 'nodularity', 'graphiteType',
    'countMin', 'countMax', 'sizeMin', 'sizeMax', 'ferriteMin', 'ferriteMax',
    'pearliteMin', 'pearliteMax', 'carbideMin', 'carbideMax', 'remarks'
  ];

  // ====================== Effects ======================
  
  // Check if date+disa combination exists in database
  useEffect(() => {
    const checkDateDisaExists = async () => {
      if (!date || !disa) {
        setIsPrimarySaved(false);
        setEntryCount(0);
        setCheckingPrimary(false);
        return;
      }
      setCheckingPrimary(true);
      try {
        const response = await fetch(buildApiUrl(`/api/v1/micro-structure/check?date=${date}&disa=${encodeURIComponent(disa)}`), {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setIsPrimarySaved(data.exists);
          setEntryCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error checking date+disa:', error);
      } finally {
        setCheckingPrimary(false);
      }
    };
    checkDateDisaExists();
  }, [date, disa]);

  // ====================== Helpers ======================
  
  const getInputClassName = (baseClass, validationState) => {
    let classes = baseClass;
    if (validationState === false) classes += ' invalid-input';
    return classes;
  };

  const validatePercentage = (value) => {
    if (value === '' || value === null || value === undefined) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validateRange = (minVal, maxVal, isPercentage = false) => {
    const min = parseFloat(minVal);
    const max = parseFloat(maxVal);
    
    // If min is empty, both are invalid
    if (minVal === '' || isNaN(min)) {
      return { minValid: false, maxValid: false };
    }
    
    // If percentage, check bounds
    if (isPercentage && (min < 0 || min > 100)) {
      return { minValid: false, maxValid: false };
    }
    
    // If max is empty or 0, only min is needed
    if (maxVal === '' || max === 0 || isNaN(max)) {
      return { minValid: true, maxValid: true };
    }
    
    // If percentage, check max bounds
    if (isPercentage && (max < 0 || max > 100)) {
      return { minValid: true, maxValid: false };
    }
    
    // Check min < max
    if (min >= max) {
      return { minValid: false, maxValid: false };
    }
    
    return { minValid: true, maxValid: true };
  };

  // ====================== Handlers ======================
  
  const handleDateChange = (e) => {
    setDate(e.target.value);
    setIsPrimarySaved(false);
  };

  const handleDisaChange = (e) => {
    setDisa(e.target.value);
    setIsPrimarySaved(false);
  };

  const handleInputChange = (setter, validSetter) => (e) => {
    setter(e.target.value);
    if (validSetter) validSetter(null);
  };

  const handleDateCodeChange = (e) => {
    setDateCode(e.target.value.toUpperCase());
    setDateCodeValid(null);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(field);
      
      if (field === 'remarks') {
        inputRefs.current.submitBtn?.focus();
      } else if (idx < fieldOrder.length - 1) {
        const nextField = fieldOrder[idx + 1];
        inputRefs.current[nextField]?.focus();
      }
    }
  };

  const handlePrimarySubmit = async () => {
    if (!date || !disa) {
      alert('Please fill in Date and DISA');
      return;
    }

    try {
      setSavePrimaryLoading(true);
      
      const response = await fetch(buildApiUrl('/api/v1/micro-structure/save-primary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date, disa })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsPrimarySaved(true);
        setEntryCount(data.count || 0);
        
        setTimeout(() => {
          inputRefs.current.partName?.focus();
        }, 100);
      } else {
        alert('Failed to save primary: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving primary:', error);
      alert('Failed to save primary: ' + error.message);
    } finally {
      setSavePrimaryLoading(false);
    }
  };

  const handleSubmit = async () => {
    let hasErrors = false;

    // Validate Part Name
    if (!partName || !partName.trim()) {
      setPartNameValid(false);
      hasErrors = true;
    } else {
      setPartNameValid(null);
    }

    // Validate Date Code
    if (!dateCode || !dateCode.trim()) {
      setDateCodeValid(false);
      hasErrors = true;
    } else {
      setDateCodeValid(null);
    }

    // Validate Heat Code
    if (!heatCode || !heatCode.trim()) {
      setHeatCodeValid(false);
      hasErrors = true;
    } else {
      setHeatCodeValid(null);
    }

    // Validate Nodularity % (0-100)
    if (!validatePercentage(nodularity)) {
      setNodularityValid(false);
      hasErrors = true;
    } else {
      setNodularityValid(null);
    }

    // Validate Graphite Type
    if (!graphiteType || !graphiteType.trim()) {
      setGraphiteTypeValid(false);
      hasErrors = true;
    } else {
      setGraphiteTypeValid(null);
    }

    // Validate Count range
    const countRange = validateRange(countMin, countMax, false);
    if (!countRange.minValid) {
      setCountMinValid(false);
      hasErrors = true;
    } else {
      setCountMinValid(null);
    }
    if (!countRange.maxValid) {
      setCountMaxValid(false);
      hasErrors = true;
    } else {
      setCountMaxValid(null);
    }

    // Validate Size range
    const sizeRange = validateRange(sizeMin, sizeMax, false);
    if (!sizeRange.minValid) {
      setSizeMinValid(false);
      hasErrors = true;
    } else {
      setSizeMinValid(null);
    }
    if (!sizeRange.maxValid) {
      setSizeMaxValid(false);
      hasErrors = true;
    } else {
      setSizeMaxValid(null);
    }

    // Validate Ferrite % range (0-100)
    const ferriteRange = validateRange(ferriteMin, ferriteMax, true);
    if (!ferriteRange.minValid) {
      setFerriteMinValid(false);
      hasErrors = true;
    } else {
      setFerriteMinValid(null);
    }
    if (!ferriteRange.maxValid) {
      setFerriteMaxValid(false);
      hasErrors = true;
    } else {
      setFerriteMaxValid(null);
    }

    // Validate Pearlite % range (0-100)
    const pearliteRange = validateRange(pearliteMin, pearliteMax, true);
    if (!pearliteRange.minValid) {
      setPearliteMinValid(false);
      hasErrors = true;
    } else {
      setPearliteMinValid(null);
    }
    if (!pearliteRange.maxValid) {
      setPearliteMaxValid(false);
      hasErrors = true;
    } else {
      setPearliteMaxValid(null);
    }

    // Validate Carbide % range (0-100)
    const carbideRange = validateRange(carbideMin, carbideMax, true);
    if (!carbideRange.minValid) {
      setCarbideMinValid(false);
      hasErrors = true;
    } else {
      setCarbideMinValid(null);
    }
    if (!carbideRange.maxValid) {
      setCarbideMaxValid(false);
      hasErrors = true;
    } else {
      setCarbideMaxValid(null);
    }

    if (hasErrors) {
      setSubmitErrorMessage('Enter data in correct format');
      return;
    }

    setSubmitErrorMessage('');

    try {
      setSubmitLoading(true);

      const payload = {
        date,
        disa,
        partName,
        dateCode,
        heatCode,
        nodularity: parseFloat(nodularity),
        graphiteType,
        countMin: parseFloat(countMin),
        countMax: countMax === '' ? 0 : parseFloat(countMax),
        sizeMin: parseFloat(sizeMin),
        sizeMax: sizeMax === '' ? 0 : parseFloat(sizeMax),
        ferriteMin: parseFloat(ferriteMin),
        ferriteMax: ferriteMax === '' ? 0 : parseFloat(ferriteMax),
        pearliteMin: parseFloat(pearliteMin),
        pearliteMax: pearliteMax === '' ? 0 : parseFloat(pearliteMax),
        carbideMin: parseFloat(carbideMin),
        carbideMax: carbideMax === '' ? 0 : parseFloat(carbideMax),
        remarks
      };

      const response = await fetch(buildApiUrl('/api/v1/micro-structure'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (data.success) {
        // Show Sakthi loader
        setShowSakthiLoader(true);

        // Reset all fields except primary data
        setPartName('');
        setDateCode('');
        setHeatCode('');
        setNodularity('');
        setGraphiteType('');
        setCountMin('');
        setCountMax('');
        setSizeMin('');
        setSizeMax('');
        setFerriteMin('');
        setFerriteMax('');
        setPearliteMin('');
        setPearliteMax('');
        setCarbideMin('');
        setCarbideMax('');
        setRemarks('');

        // Reset validation states
        setPartNameValid(null);
        setDateCodeValid(null);
        setHeatCodeValid(null);
        setNodularityValid(null);
        setGraphiteTypeValid(null);
        setCountMinValid(null);
        setCountMaxValid(null);
        setSizeMinValid(null);
        setSizeMaxValid(null);
        setFerriteMinValid(null);
        setFerriteMaxValid(null);
        setPearliteMinValid(null);
        setPearliteMaxValid(null);
        setCarbideMinValid(null);
        setCarbideMaxValid(null);
        setRemarksValid(null);

        setSubmitErrorMessage('');
        setEntryCount(prev => prev + 1);

        setTimeout(() => {
          inputRefs.current.partName?.focus();
        }, 100);
      } else {
        alert('Failed to save entry: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ====================== Format date ======================
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  // ====================== JSX ======================
  return (
    <>
      {showSakthiLoader && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999
        }}>
          <Sakthi onComplete={() => setShowSakthiLoader(false)} />
        </div>
      )}
      
      <div className="microstructure-header">
        <div className="microstructure-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Micro Structure - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formatDisplayDate(getCurrentDate())}
        </div>
      </div>

      <h3 className="microstructure-section-heading">
        Primary Data : {isPrimarySaved && <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#5B9AA9' }}>(Entries: {entryCount})</span>}
      </h3>

      <div className="microstructure-form-row">
        <div className="microstructure-field">
          <label>Date</label>
          <CustomDatePicker
            ref={el => inputRefs.current.date = el}
            value={date}
            onChange={handleDateChange}
            onKeyDown={e => handleKeyDown(e, 'date')}
            max={getCurrentDate()}
            name="date"
          />
        </div>
        <div className="microstructure-field">
          <label>DISA</label>
          <DisaDropdown
            ref={el => inputRefs.current.disa = el}
            value={disa}
            onChange={handleDisaChange}
            onKeyDown={e => handleKeyDown(e, 'disa')}
            name="disa"
          />
        </div>
        <div className="microstructure-field">
          <label>&nbsp;</label>
          <LockPrimaryButton
            onClick={handlePrimarySubmit}
            disabled={savePrimaryLoading || !date || !disa}
            isLocked={isPrimarySaved}
          />
        </div>
      </div>

      <div className="microstructure-divider"></div>

      <div className="microstructure-form-row">
        <div className="microstructure-field">
          <label>Part Name</label>
          <input
            ref={el => inputRefs.current.partName = el}
            type="text"
            value={partName}
            onChange={handleInputChange(setPartName, setPartNameValid)}
            onKeyDown={e => handleKeyDown(e, 'partName')}
            name="partName"
            placeholder="Enter part name"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', partNameValid)}
          />
        </div>
        <div className="microstructure-field">
          <label>Date Code</label>
          <input
            ref={el => inputRefs.current.dateCode = el}
            type="text"
            value={dateCode}
            onChange={handleDateCodeChange}
            onKeyDown={e => handleKeyDown(e, 'dateCode')}
            name="dateCode"
            placeholder="Enter date code"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', dateCodeValid)}
          />
        </div>
        <div className="microstructure-field">
          <label>Heat Code</label>
          <input
            ref={el => inputRefs.current.heatCode = el}
            type="text"
            value={heatCode}
            onChange={handleInputChange(setHeatCode, setHeatCodeValid)}
            onKeyDown={e => handleKeyDown(e, 'heatCode')}
            name="heatCode"
            placeholder="Enter heat code"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', heatCodeValid)}
          />
        </div>
        <div className="microstructure-field">
          <label>Nodularity %</label>
          <input
            ref={el => inputRefs.current.nodularity = el}
            type="number"
            value={nodularity}
            onChange={handleInputChange(setNodularity, setNodularityValid)}
            onKeyDown={e => handleKeyDown(e, 'nodularity')}
            name="nodularity"
            placeholder="0-100"
            min="0"
            max="100"
            step="0.01"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', nodularityValid)}
          />
        </div>
        <div className="microstructure-field">
          <label>Graphite Type</label>
          <input
            ref={el => inputRefs.current.graphiteType = el}
            type="text"
            value={graphiteType}
            onChange={handleInputChange(setGraphiteType, setGraphiteTypeValid)}
            onKeyDown={e => handleKeyDown(e, 'graphiteType')}
            name="graphiteType"
            placeholder="Enter graphite type"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', graphiteTypeValid)}
          />
        </div>
        <div className="microstructure-field">
          <label>Count (Nos / mm²)</label>
          <div className="microstructure-range-input">
            <input
              ref={el => inputRefs.current.countMin = el}
              type="number"
              value={countMin}
              onChange={handleInputChange(setCountMin, setCountMinValid)}
              onKeyDown={e => handleKeyDown(e, 'countMin')}
              name="countMin"
              placeholder="Min"
              min="0"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', countMinValid)}
            />
            <span className="range-separator">-</span>
            <input
              ref={el => inputRefs.current.countMax = el}
              type="number"
              value={countMax}
              onChange={handleInputChange(setCountMax, setCountMaxValid)}
              onKeyDown={e => handleKeyDown(e, 'countMax')}
              name="countMax"
              placeholder="Max"
              min="0"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', countMaxValid)}
            />
          </div>
        </div>
      </div>

      <div className="microstructure-form-row">
        <div className="microstructure-field">
          <label>Size</label>
          <div className="microstructure-range-input">
            <input
              ref={el => inputRefs.current.sizeMin = el}
              type="number"
              value={sizeMin}
              onChange={handleInputChange(setSizeMin, setSizeMinValid)}
              onKeyDown={e => handleKeyDown(e, 'sizeMin')}
              name="sizeMin"
              placeholder="Min"
              min="0"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', sizeMinValid)}
            />
            <span className="range-separator">-</span>
            <input
              ref={el => inputRefs.current.sizeMax = el}
              type="number"
              value={sizeMax}
              onChange={handleInputChange(setSizeMax, setSizeMaxValid)}
              onKeyDown={e => handleKeyDown(e, 'sizeMax')}
              name="sizeMax"
              placeholder="Max"
              min="0"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', sizeMaxValid)}
            />
          </div>
        </div>
        <div className="microstructure-field">
          <label>Ferrite %</label>
          <div className="microstructure-range-input">
            <input
              ref={el => inputRefs.current.ferriteMin = el}
              type="number"
              value={ferriteMin}
              onChange={handleInputChange(setFerriteMin, setFerriteMinValid)}
              onKeyDown={e => handleKeyDown(e, 'ferriteMin')}
              name="ferriteMin"
              placeholder="Min"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', ferriteMinValid)}
            />
            <span className="range-separator">-</span>
            <input
              ref={el => inputRefs.current.ferriteMax = el}
              type="number"
              value={ferriteMax}
              onChange={handleInputChange(setFerriteMax, setFerriteMaxValid)}
              onKeyDown={e => handleKeyDown(e, 'ferriteMax')}
              name="ferriteMax"
              placeholder="Max"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', ferriteMaxValid)}
            />
          </div>
        </div>
        <div className="microstructure-field">
          <label>Pearlite %</label>
          <div className="microstructure-range-input">
            <input
              ref={el => inputRefs.current.pearliteMin = el}
              type="number"
              value={pearliteMin}
              onChange={handleInputChange(setPearliteMin, setPearliteMinValid)}
              onKeyDown={e => handleKeyDown(e, 'pearliteMin')}
              name="pearliteMin"
              placeholder="Min"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', pearliteMinValid)}
            />
            <span className="range-separator">-</span>
            <input
              ref={el => inputRefs.current.pearliteMax = el}
              type="number"
              value={pearliteMax}
              onChange={handleInputChange(setPearliteMax, setPearliteMaxValid)}
              onKeyDown={e => handleKeyDown(e, 'pearliteMax')}
              name="pearliteMax"
              placeholder="Max"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', pearliteMaxValid)}
            />
          </div>
        </div>
        <div className="microstructure-field">
          <label>Carbide %</label>
          <div className="microstructure-range-input">
            <input
              ref={el => inputRefs.current.carbideMin = el}
              type="number"
              value={carbideMin}
              onChange={handleInputChange(setCarbideMin, setCarbideMinValid)}
              onKeyDown={e => handleKeyDown(e, 'carbideMin')}
              name="carbideMin"
              placeholder="Min"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', carbideMinValid)}
            />
            <span className="range-separator">-</span>
            <input
              ref={el => inputRefs.current.carbideMax = el}
              type="number"
              value={carbideMax}
              onChange={handleInputChange(setCarbideMax, setCarbideMaxValid)}
              onKeyDown={e => handleKeyDown(e, 'carbideMax')}
              name="carbideMax"
              placeholder="Max"
              min="0"
              max="100"
              step="0.01"
              disabled={!isPrimarySaved}
              className={getInputClassName('microstructure-input', carbideMaxValid)}
            />
          </div>
        </div>
        <div className="microstructure-field microstructure-field-small">
          <label>Remarks</label>
          <input
            ref={el => inputRefs.current.remarks = el}
            type="text"
            value={remarks}
            onChange={handleInputChange(setRemarks, setRemarksValid)}
            onKeyDown={e => handleKeyDown(e, 'remarks')}
            name="remarks"
            placeholder="Enter remarks"
            disabled={!isPrimarySaved}
            className={getInputClassName('microstructure-input', remarksValid)}
          />
        </div>
      </div>

      <div className="microstructure-submit-row">
        {submitErrorMessage && (
          <span className="microstructure-error-message">{submitErrorMessage}</span>
        )}
        <SubmitButton
          ref={el => inputRefs.current.submitBtn = el}
          onClick={handleSubmit}
          onKeyDown={handleSubmitKeyDown}
          disabled={!isPrimarySaved || submitLoading}
        >
          {submitLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Submit'
          )}
        </SubmitButton>
      </div>
    </>
  );
};

export default MicroStructure;
