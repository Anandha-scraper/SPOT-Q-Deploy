import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, CheckCircle } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { CustomTimeInput, Time, ShiftDropdown, HolderDropdown, PlusButton, MinusButton } from '../../Components/Buttons';
import { SuccessAlert } from '../../Components/Alert';
import '../../styles/PageStyles/Melting/CupolaHolderLogSheet.css';

const CupolaHolderLogSheet = () => {
  // Primary Data
  const [primaryData, setPrimaryData] = useState({
    date: "",
    shift: '',
    holderNumber: ''
  });

  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primarySavedVisual, setPrimarySavedVisual] = useState(false);
  const [primaryId, setPrimaryId] = useState(null);
  const [fetchingPrimary, setFetchingPrimary] = useState(false);
  const [isPrimaryDataSaved, setIsPrimaryDataSaved] = useState(false);
  const [dynamicCheckAlert, setDynamicCheckAlert] = useState(false);

  // Auto-dismiss dynamic check alert
  useEffect(() => {
    if (dynamicCheckAlert) {
      const timer = setTimeout(() => {
        setDynamicCheckAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dynamicCheckAlert]);

  // Auto-incremented Heat No
  const [heatNo, setHeatNo] = useState(1);

  // Multiple input rows
  const createEmptyRow = () => ({
    cpc: '', mFeSl: '', feMn: '', sic: '', pureMg: '', cu: '', feCr: '',
    actualTimeHour: '', actualTimeMinute: '',
    tappingTimeHour: '', tappingTimeMinute: '',
    tappingTemp: '', metalKg: '',
    disaLine: '', indFur: '', bailNo: '', tap: '', kw: '',
    remarks: ''
  });

  const [inputRows, setInputRows] = useState([createEmptyRow()]);

  const [submitLoading, setSubmitLoading] = useState(false);

  // Submitted rows displayed above the input rows
  const [submittedRows, setSubmittedRows] = useState([]);

  // Validation states
  const [validationErrors, setValidationErrors] = useState({}); // { rowIndex: { fieldName: true/false } }
  const [focusedField, setFocusedField] = useState(null); // { rowIndex, fieldName }
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for Enter-key navigation across table cells
  const inputRefs = useRef({});

  // Helper functions to convert between Time object and hour/minute strings
  const createTimeFromHourMinute = (hour, minute) => {
    if (!hour && !minute) return null;
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    return new Time(h, m);
  };

  const handleTimeChange = (rowIndex, hourField, minuteField, timeValue) => {
    setInputRows(prev => {
      const updated = [...prev];
      if (!timeValue) {
        updated[rowIndex] = { ...updated[rowIndex], [hourField]: '', [minuteField]: '' };
      } else {
        updated[rowIndex] = { ...updated[rowIndex], [hourField]: timeValue.hour.toString(), [minuteField]: timeValue.minute.toString() };
      }
      return updated;
    });

    // Validate time fields after change
    const hourValue = timeValue ? timeValue.hour.toString() : '';
    const minuteValue = timeValue ? timeValue.minute.toString() : '';
    const hourValid = validateField(hourField, hourValue);
    const minuteValid = validateField(minuteField, minuteValue);

    if (hourValid && minuteValid) {
      // Clear errors for both hour and minute fields
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[rowIndex]) {
          delete newErrors[rowIndex][hourField];
          delete newErrors[rowIndex][minuteField];
          if (Object.keys(newErrors[rowIndex]).length === 0) {
            delete newErrors[rowIndex];
          }
        }
        return newErrors;
      });
      if (Object.keys(validationErrors).length <= 1) {
        setErrorMessage('');
      }
    } else if (submitAttempted) {
      // Set errors if submit was attempted
      setValidationErrors(prev => ({
        ...prev,
        [rowIndex]: {
          ...(prev[rowIndex] || {}),
          ...(hourValid ? {} : { [hourField]: true }),
          ...(minuteValid ? {} : { [minuteField]: true })
        }
      }));
    }
  };

  // Validation function for individual field
  const validateField = (field, value) => {
    // All fields are required - empty values not allowed
    if (value === '' || value === null || value === undefined) {
      return false;
    }
    
    // Numeric fields that should be validated for datatype
    const numericFields = ['cpc', 'mFeSl', 'feMn', 'sic', 'pureMg', 'cu', 'feCr', 'tappingTemp', 'metalKg', 'kw'];
    
    if (numericFields.includes(field)) {
      // Check if it's a valid number
      const num = parseFloat(value);
      if (isNaN(num) || !isFinite(num)) {
        return false;
      }
    }
    
    // Text fields must not be empty
    const textValue = String(value).trim();
    if (textValue === '') {
      return false;
    }
    
    return true;
  };

  const handleRowChange = (rowIndex, field, value) => {
    setInputRows(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], [field]: value };
      return updated;
    });

    // Real-time validation
    const isValid = validateField(field, value);
    
    if (isValid) {
      // Clear error if field becomes valid
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[rowIndex]) {
          delete newErrors[rowIndex][field];
          if (Object.keys(newErrors[rowIndex]).length === 0) {
            delete newErrors[rowIndex];
          }
        }
        return newErrors;
      });
      // Clear error message if all fields are now valid
      if (Object.keys(validationErrors).length <= 1) {
        setErrorMessage('');
      }
    } else if (submitAttempted) {
      // Set error only if submit was already attempted
      setValidationErrors(prev => ({
        ...prev,
        [rowIndex]: {
          ...(prev[rowIndex] || {}),
          [field]: true
        }
      }));
    }
  };

  const addInputRow = () => {
    setInputRows(prev => [...prev, createEmptyRow()]);
    // Clear submit attempted when adding new row
    setSubmitAttempted(false);
    setErrorMessage('');
  };

  const removeInputRow = () => {
    if (inputRows.length > 1) {
      const lastIndex = inputRows.length - 1;
      setInputRows(prev => prev.slice(0, -1));
      // Clear validation errors for removed row
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[lastIndex];
        return newErrors;
      });
    }
  };

  // Fetch primary data when date + shift + holderNumber all have values
  useEffect(() => {
    if (primaryData.date && primaryData.shift && primaryData.holderNumber) {
      fetchPrimaryData(primaryData.date, primaryData.shift, primaryData.holderNumber);
    } else {
      // Reset when any key field is missing
      setPrimaryId(null);
      setIsPrimaryDataSaved(false);
      setSubmittedRows([]);
      setHeatNo(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryData.date, primaryData.shift, primaryData.holderNumber]);

  const fetchPrimaryData = async (date, shift, holderNumber) => {
    if (!date || !shift || !holderNumber) return;

    setFetchingPrimary(true);
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await fetch(
        `http://localhost:5000/api/v1/cupola-logs/primary/${dateStr}?shift=${encodeURIComponent(shift)}&holderNumber=${encodeURIComponent(holderNumber)}`,
        { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      );
      const response = await res.json();

      if (response.success && response.data) {
        const data = response.data;
        setPrimaryId(data._id);
        setIsPrimaryDataSaved(true);

        // Only update Heat No based on database count, don't display previous entries
        if (data.entries && data.entries.length > 0) {
          setHeatNo(data.entries.length + 1);
        } else {
          setHeatNo(1);
        }
        // Keep submittedRows empty - don't show previous data
        setSubmittedRows([]);
      } else {
        // No existing primary for this combo
        setPrimaryId(null);
        setIsPrimaryDataSaved(false);
        setSubmittedRows([]);
        setHeatNo(1);
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
      setPrimaryId(null);
      setIsPrimaryDataSaved(false);
      setSubmittedRows([]);
      setHeatNo(1);
    } finally {
      setFetchingPrimary(false);
      setDynamicCheckAlert(true);
    }
  };

  const handlePrimaryChange = (field, value) => {
    setPrimaryData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // When date is cleared, reset everything
    if (field === 'date' && !value) {
      setPrimaryId(null);
      setIsPrimaryDataSaved(false);
      setSubmittedRows([]);
      setHeatNo(1);
    }
  };

  const handlePrimarySubmit = async () => {
    if (!primaryData.date || !primaryData.shift || !primaryData.holderNumber) {
      return;
    }

    setPrimaryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/cupola-logs/primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          primaryData: primaryData
        })
      });
      const response = await res.json();
      
      if (response.success) {
        setPrimaryId(response.data._id);
        setPrimarySavedVisual(true);
        setTimeout(() => {
          setIsPrimaryDataSaved(true);
          setPrimarySavedVisual(false);
        }, 1500);
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
    } finally {
      setPrimaryLoading(false);
    }
  };

  // Validate all rows before submit
  const validateAllRows = () => {
    const errors = {};
    let isValid = true;

    // All fields are required (including time fields and text fields)
    const allFields = [
      'cpc', 'mFeSl', 'feMn', 'sic', 'pureMg', 'cu', 'feCr',
      'actualTimeHour', 'actualTimeMinute', 'tappingTimeHour', 'tappingTimeMinute',
      'tappingTemp', 'metalKg', 'disaLine', 'indFur', 'bailNo', 'tap', 'kw', 'remarks'
    ];

    inputRows.forEach((row, rowIndex) => {
      allFields.forEach(field => {
        const value = row[field];
        if (!validateField(field, value)) {
          if (!errors[rowIndex]) {
            errors[rowIndex] = {};
          }
          errors[rowIndex][field] = true;
          isValid = false;
        }
      });
    });

    setValidationErrors(errors);

    if (!isValid) {
      setErrorMessage('All fields are required. Please enter data in all fields.');
    } else {
      setErrorMessage('');
    }

    return isValid;
  };

  const handleAllTablesSubmit = async () => {
    // Set submit attempted flag
    setSubmitAttempted(true);

    // Check primary fields
    if (!primaryData.date || !primaryData.shift || !primaryData.holderNumber) {
      return;
    }

    // Validate all rows
    if (!validateAllRows()) {
      return;
    }

    setSubmitLoading(true);
    try {
      // Build entries from all input rows
      const entries = inputRows.map((row, idx) => ({
        heatNo: `Heat No ${heatNo + idx}`,
        cpc: row.cpc ? parseFloat(row.cpc) : null,
        FeSl: row.mFeSl ? parseFloat(row.mFeSl) : null,
        feMn: row.feMn ? parseFloat(row.feMn) : null,
        sic: row.sic ? parseFloat(row.sic) : null,
        pureMg: row.pureMg ? parseFloat(row.pureMg) : null,
        cu: row.cu ? parseFloat(row.cu) : null,
        feCr: row.feCr ? parseFloat(row.feCr) : null,
        actualTime: (row.actualTimeHour && row.actualTimeMinute) ? `${row.actualTimeHour}:${row.actualTimeMinute}` : '',
        tappingTime: (row.tappingTimeHour && row.tappingTimeMinute) ? `${row.tappingTimeHour}:${row.tappingTimeMinute}` : '',
        tappingTemp: row.tappingTemp ? parseFloat(row.tappingTemp) : null,
        metalKg: row.metalKg ? parseFloat(row.metalKg) : null,
        disaLine: row.disaLine || '',
        indFur: row.indFur || '',
        bailNo: row.bailNo || '',
        tap: row.tap || '',
        kw: row.kw ? parseFloat(row.kw) : null,
        remarks: row.remarks || ''
      }));

      const response = await fetch('http://localhost:5000/api/v1/cupola-logs/table-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          primaryData: primaryData,
          data: entries
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update Heat No counter (don't add to submittedRows)
        setHeatNo(prev => prev + inputRows.length);
        setIsPrimaryDataSaved(true);
        // Reset input rows for next entry
        setInputRows([createEmptyRow()]);
        // Clear validation states
        setValidationErrors({});
        setSubmitAttempted(false);
        setErrorMessage('');
        setFocusedField(null);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving cupola holder log:', error);
      alert('Failed to save entry: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAllTablesReset = () => {
    setInputRows([createEmptyRow()]);
  };

  // Get border color based on validation state and focus
  const getBorderColor = (rowIndex, fieldName) => {
    // Check if field has validation error
    const hasError = validationErrors[rowIndex]?.[fieldName];
    
    // Check if field is currently focused
    const isFocused = focusedField?.rowIndex === rowIndex && focusedField?.fieldName === fieldName;
    
    if (hasError) {
      return '#ef4444'; // Red for errors
    }
    
    if (isFocused) {
      return '#10b981'; // Green for focused
    }
    
    return '#cbd5e1'; // Default gray
  };

  // Get border color for time fields (check both hour and minute)
  const getTimeBorderColor = (rowIndex, hourField, minuteField) => {
    const hasError = validationErrors[rowIndex]?.[hourField] || validationErrors[rowIndex]?.[minuteField];
    
    if (hasError) {
      return '#ef4444'; // Red for errors
    }
    
    return '#cbd5e1'; // Default gray
  };

  const handleEnterFocusNext = (e) => {
    if (e.key !== 'Enter') return;
    const target = e.target;
    if (!(target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'))) return;
    
    // Find all focusable inputs in the page
    const wrapper = document.querySelector('.page-wrapper');
    if (!wrapper) return;
    
    const elements = Array.from(wrapper.querySelectorAll('input, select, textarea')).filter(el => 
      !el.disabled && !el.readOnly && el.type !== 'hidden'
    );
    
    const currentIndex = elements.indexOf(target);
    if (currentIndex > -1 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
      e.preventDefault();
    }
  };

  // Common cell/input styles
  const thStyle = {
    padding: '0.5rem 0.4rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
    borderBottom: '2px solid #cbd5e1',
    borderRight: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
    background: '#f8fafc'
  };

  const groupThStyle = {
    ...thStyle,
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1e293b',
    background: '#eef4f7',
    letterSpacing: '0.03em',
    borderBottom: '1px solid #cbd5e1'
  };

  const tdStyle = {
    padding: '0.25rem 0.2rem',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    fontSize: '0.825rem',
    color: '#475569',
    verticalAlign: 'middle'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.4rem 0.3rem',
    border: '1.5px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '0.825rem',
    textAlign: 'center',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    minWidth: '50px',
    height: '34px'
  };

  const lockedCellStyle = {
    ...tdStyle,
    background: '#f1f5f9',
    color: '#64748b',
    fontWeight: 500
  };

  const fmtVal = (v) => (v !== undefined && v !== null && v !== '' && v !== 0) ? v : '-';

  return (
    <div className="page-wrapper" onKeyDown={handleEnterFocusNext}>
      {/* Header */}
      <div className="cupola-holder-header">
        <div className="cupola-holder-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Cupola Holder Log Sheet - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {primaryData.date ? new Date(primaryData.date).toLocaleDateString('en-GB') : '-'}
        </div>
      </div>

      {/* Primary Section */}
      <div>
        <h3 className="section-header" style={{ display: 'flex', alignItems: 'center' }}>
          Primary Data
          {dynamicCheckAlert && <div style={{ marginLeft: 'auto' }}><SuccessAlert isVisible={dynamicCheckAlert} message="Data check completed successfully!" /></div>}
        </h3>

        <div className="cupola-holder-form-grid">
          <div className="cupola-holder-form-group">
            <label>Date <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDatePicker
              value={primaryData.date}
              onChange={(e) => handlePrimaryChange('date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Shift <span style={{ color: '#ef4444' }}>*</span></label>
            <ShiftDropdown
              value={primaryData.shift}
              onChange={(e) => handlePrimaryChange('shift', e.target.value)}
              disabled={!primaryData.date || fetchingPrimary}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Holder No <span style={{ color: '#ef4444' }}>*</span></label>
            <HolderDropdown
              value={primaryData.holderNumber}
              onChange={(e) => handlePrimaryChange('holderNumber', e.target.value)}
              disabled={!primaryData.date || !primaryData.shift || fetchingPrimary}
            />
          </div>
        </div>

        <div className={`cupola-primary-btn-wrapper ${!isPrimaryDataSaved && primaryData.date && primaryData.shift && primaryData.holderNumber ? 'show' : 'hide'}`}>
          <div className="cupola-holder-submit-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: 'none', paddingTop: '0.5rem' }}>
            <button
              className={`cupola-holder-submit-btn ${primarySavedVisual ? 'saved' : ''}`}
              type="button"
              onClick={handlePrimarySubmit}
              disabled={primaryLoading || fetchingPrimary || primarySavedVisual}
            >
              {primaryLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : primarySavedVisual ? (
                <><CheckCircle size={18} /> Saved</>
              ) : (
                <><Save size={18} /> Save Primary</>
              )}
            </button>
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Main Log Table */}
      <div style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none', transition: 'opacity 0.35s ease' }}>
      {!isPrimaryDataSaved && <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#ef4444', marginBottom: '0.5rem' }}>Locked - Save Primary Data First</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <PlusButton onClick={addInputRow} disabled={!isPrimaryDataSaved} title="Add Row" />
        <MinusButton onClick={removeInputRow} disabled={!isPrimaryDataSaved || inputRows.length <= 1} title="Remove Row" />
      </div>
      <div style={{ overflowX: 'auto', border: '1.5px solid #cbd5e1', borderRadius: '10px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
          {/* Group Headers Row */}
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...groupThStyle, width: '70px', borderLeft: 'none' }}>Heat<br/>No</th>
              <th colSpan={7} style={{ ...groupThStyle }}>ADDITIONS</th>
              <th colSpan={4} style={{ ...groupThStyle }}>TAPPING</th>
              <th colSpan={3} style={{ ...groupThStyle }}>POURING</th>
              <th colSpan={2} style={{ ...groupThStyle }}>ELECTRICAL</th>
              <th rowSpan={2} style={{ ...groupThStyle, width: '120px', borderRight: 'none' }}>Remarks</th>
            </tr>
            {/* Sub Headers Row */}
            <tr>
              <th style={thStyle}>CPC</th>
              <th style={thStyle}>Fe Sl</th>
              <th style={thStyle}>Fe Mn</th>
              <th style={thStyle}>SIC</th>
              <th style={thStyle}>Pure Mg</th>
              <th style={thStyle}>Cu</th>
              <th style={thStyle}>Fe Cr</th>
              <th style={thStyle}>Actual<br/>Time</th>
              <th style={thStyle}>Tapping<br/>Time</th>
              <th style={thStyle}>Temp °C</th>
              <th style={thStyle}>Metal<br/>(KG)</th>
              <th style={{ ...thStyle, minWidth: '150px' }}>DISA<br/>LINE</th>
              <th style={thStyle}>IND<br/>FUR</th>
              <th style={thStyle}>BAIL<br/>NO</th>
              <th style={thStyle}>TAP</th>
              <th style={{ ...thStyle, borderRight: 'none' }}>KW</th>
            </tr>
          </thead>

          <tbody>
            {/* Submitted Rows (read-only) */}
            {submittedRows.map((row, idx) => (
              <tr key={`submitted-${idx}`} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={lockedCellStyle}>{fmtVal(row.heatNo)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.cpc)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.FeSl)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.feMn)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.sic)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.pureMg)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.cu)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.feCr)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.actualTime)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.tappingTime)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.tappingTemp)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.metalKg)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.disaLine)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.indFur)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.bailNo)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.tap)}</td>
                <td style={lockedCellStyle}>{fmtVal(row.kw)}</td>
                <td style={{ ...lockedCellStyle, borderRight: 'none' }}>{fmtVal(row.remarks)}</td>
              </tr>
            ))}

            {/* Active Input Rows */}
            {inputRows.map((row, rowIdx) => (
              <tr key={`input-${rowIdx}`} style={{ background: '#fff' }}>
                {/* Heat No */}
                <td style={{ ...tdStyle, fontWeight: 700, color: '#0ea5e9', fontSize: '0.95rem' }}>
                  {heatNo + rowIdx}
                </td>
                {/* ADDITIONS */}
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.cpc} 
                    onChange={(e) => handleRowChange(rowIdx, 'cpc', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'cpc' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'cpc') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.mFeSl} 
                    onChange={(e) => handleRowChange(rowIdx, 'mFeSl', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'mFeSl' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'mFeSl') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.feMn} 
                    onChange={(e) => handleRowChange(rowIdx, 'feMn', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'feMn' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'feMn') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.sic} 
                    onChange={(e) => handleRowChange(rowIdx, 'sic', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'sic' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'sic') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.pureMg} 
                    onChange={(e) => handleRowChange(rowIdx, 'pureMg', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'pureMg' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'pureMg') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.cu} 
                    onChange={(e) => handleRowChange(rowIdx, 'cu', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'cu' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'cu') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="0"
                    value={row.feCr} 
                    onChange={(e) => handleRowChange(rowIdx, 'feCr', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'feCr' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'feCr') }} />
                </td>
                {/* TAPPING */}
                <td style={tdStyle}>
                  <div style={{ 
                    border: `2px solid ${getTimeBorderColor(rowIdx, 'actualTimeHour', 'actualTimeMinute')}`,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <CustomTimeInput
                      value={createTimeFromHourMinute(row.actualTimeHour, row.actualTimeMinute)}
                      onChange={(time) => handleTimeChange(rowIdx, 'actualTimeHour', 'actualTimeMinute', time)}
                    />
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ 
                    border: `2px solid ${getTimeBorderColor(rowIdx, 'tappingTimeHour', 'tappingTimeMinute')}`,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <CustomTimeInput
                      value={createTimeFromHourMinute(row.tappingTimeHour, row.tappingTimeMinute)}
                      onChange={(time) => handleTimeChange(rowIdx, 'tappingTimeHour', 'tappingTimeMinute', time)}
                    />
                  </div>
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="1500"
                    value={row.tappingTemp} 
                    onChange={(e) => handleRowChange(rowIdx, 'tappingTemp', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'tappingTemp' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'tappingTemp') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="2000"
                    value={row.metalKg} 
                    onChange={(e) => handleRowChange(rowIdx, 'metalKg', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'metalKg' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'metalKg') }} />
                </td>
                {/* POURING */}
                <td style={tdStyle}>
                  <select
                    value={row.disaLine}
                    onChange={(e) => handleRowChange(rowIdx, 'disaLine', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'disaLine' })}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '14px',
                      border: `2px solid ${getBorderColor(rowIdx, 'disaLine')}`,
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <option value="">Select DISA</option>
                    <option value="DISA 1">DISA 1</option>
                    <option value="DISA 2">DISA 2</option>
                    <option value="DISA 3">DISA 3</option>
                    <option value="DISA 4">DISA 4</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <input type="text" placeholder="IND-1"
                    value={row.indFur} 
                    onChange={(e) => handleRowChange(rowIdx, 'indFur', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'indFur' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'indFur') }} />
                </td>
                <td style={tdStyle}>
                  <input type="text" placeholder="B-001"
                    value={row.bailNo} 
                    onChange={(e) => handleRowChange(rowIdx, 'bailNo', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'bailNo' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'bailNo') }} />
                </td>
                {/* ELECTRICAL */}
                <td style={tdStyle}>
                  <input type="text" placeholder="TAP"
                    value={row.tap} 
                    onChange={(e) => handleRowChange(rowIdx, 'tap', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'tap' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'tap') }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" step="0.1" placeholder="2500"
                    value={row.kw} 
                    onChange={(e) => handleRowChange(rowIdx, 'kw', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'kw' })}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle, borderColor: getBorderColor(rowIdx, 'kw') }} />
                </td>
                {/* REMARKS */}
                <td style={{ ...tdStyle, borderRight: 'none' }}>
                  <input type="text" placeholder="Remarks"
                    value={row.remarks} 
                    onChange={(e) => handleRowChange(rowIdx, 'remarks', e.target.value)}
                    onFocus={() => setFocusedField({ rowIndex: rowIdx, fieldName: 'remarks' })}
                    onBlur={() => setFocusedField(null)}
                    maxLength={80} 
                    style={{ ...inputStyle, minWidth: '90px', borderColor: getBorderColor(rowIdx, 'remarks') }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="cupola-holder-submit-container" style={{ marginTop: '1.5rem', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        {errorMessage && (
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', margin: 0 }}>
            {errorMessage}
          </p>
        )}
        <button
          className="cupola-holder-submit-btn"
          type="button"
          onClick={handleAllTablesSubmit}
          disabled={submitLoading || !isPrimaryDataSaved}
          title={!isPrimaryDataSaved ? 'Please save primary data first' : 'Save All Rows'}
        >
          {submitLoading ? (
            <><Loader2 size={20} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={18} /> Save Entry ({inputRows.length} {inputRows.length === 1 ? 'row' : 'rows'})</>
          )}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CupolaHolderLogSheet;
