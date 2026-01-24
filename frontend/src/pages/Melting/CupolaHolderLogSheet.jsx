import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { TimeInput } from '../../Components/Buttons';
import '../../styles/PageStyles/Melting/CupolaHolderLogSheet.css';

const CupolaHolderLogSheet = () => {
  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Primary Data (without heatNo)
  const [primaryData, setPrimaryData] = useState({
    date: getCurrentDate(),
    shift: '',
    holderNumber: ''
  });

  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryId, setPrimaryId] = useState(null);
  const [fetchingPrimary, setFetchingPrimary] = useState(false);
  const [primaryLocks, setPrimaryLocks] = useState({});

  // Auto-incremented Heat No
  const [heatNo, setHeatNo] = useState(1);
  const [fetchingHeatNo, setFetchingHeatNo] = useState(false);

  // Table Data
  const [table1, setTable1] = useState({
    cpc: '',
    mFeSl: '',
    feMn: '',
    sic: '',
    pureMg: '',
    cu: '',
    feCr: ''
  });

  const [table2, setTable2] = useState({
    actualTimeHour: '',
    actualTimeMinute: '',
    tappingTimeHour: '',
    tappingTimeMinute: '',
    tappingTemp: '',
    metalKg: ''
  });

  const [table3, setTable3] = useState({
    disaLine: '',
    indFur: '',
    bailNo: '',
    tap: '',
    kw: ''
  });

  const [table4, setTable4] = useState({
    remarks: ''
  });

  // Refs for time inputs
  const actualTimeHourRef = useRef(null);
  const actualTimeMinuteRef = useRef(null);
  const tappingTimeHourRef = useRef(null);
  const tappingTimeMinuteRef = useRef(null);

  // Validation states (null = neutral, true = valid/green, false = invalid/red)
  // Primary validations
  const [shiftValid, setShiftValid] = useState(null);
  const [holderNumberValid, setHolderNumberValid] = useState(null);

  // Table 1 validations
  const [cpcValid, setCpcValid] = useState(null);
  const [mFeSlValid, setMFeSlValid] = useState(null);
  const [feMnValid, setFeMnValid] = useState(null);
  const [sicValid, setSicValid] = useState(null);
  const [pureMgValid, setPureMgValid] = useState(null);
  const [cuValid, setCuValid] = useState(null);
  const [feCrValid, setFeCrValid] = useState(null);

  // Table 2 validations
  const [actualTimeValid, setActualTimeValid] = useState(null);
  const [tappingTimeValid, setTappingTimeValid] = useState(null);
  const [tappingTempValid, setTappingTempValid] = useState(null);
  const [metalKgValid, setMetalKgValid] = useState(null);

  // Table 3 validations
  const [disaLineValid, setDisaLineValid] = useState(null);
  const [indFurValid, setIndFurValid] = useState(null);
  const [bailNoValid, setBailNoValid] = useState(null);
  const [tapValid, setTapValid] = useState(null);
  const [kwValid, setKwValid] = useState(null);

  // Table 4 validations
  const [remarksValid, setRemarksValid] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  // Helper function to get validation class
  const getValidationClass = (validationState) => {
    if (validationState === null) return '';
    return validationState ? 'valid-input' : 'invalid-input';
  };

  // Fetch primary data and heat no automatically on mount
  useEffect(() => {
    const currentDate = getCurrentDate();
    if (currentDate) {
      fetchPrimaryData(currentDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch heat no when date, shift, or holderNumber changes
  useEffect(() => {
    if (primaryData.date) {
      fetchNextHeatNo(primaryData.date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryData.date, primaryData.shift, primaryData.holderNumber]);

  const fetchNextHeatNo = async (date) => {
    try {
      setFetchingHeatNo(true);
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await fetch(`http://localhost:5000/api/v1/cupola-logs/filter?startDate=${dateStr}&endDate=${dateStr}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        // Count entries for this date to determine next heat no
        const entriesCount = data.data.length;
        setHeatNo(entriesCount + 1);
      } else {
        setHeatNo(1);
      }
    } catch (error) {
      console.error('Error fetching heat number:', error);
      setHeatNo(1);
    } finally {
      setFetchingHeatNo(false);
    }
  };

  const fetchPrimaryData = async (date) => {
    if (!date) return;
    
    setFetchingPrimary(true);
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await fetch(`http://localhost:5000/api/v1/cupola-logs/filter?startDate=${dateStr}&endDate=${dateStr}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const response = await res.json();
      
      if (response.success && response.data && response.data.length > 0) {
        // Get the first entry for this date
        const data = response.data[0];
        
        // Populate form with fetched data
        setPrimaryData({
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : date,
          shift: data.shift || '',
          holderNumber: data.holderNumber || ''
        });
        setPrimaryId(data._id);
        
        // Lock only fields that have values
        const locks = {};
        if (data.shift !== undefined && data.shift !== null && data.shift !== '') {
          locks.shift = true;
        }
        if (data.holderNumber !== undefined && data.holderNumber !== null && data.holderNumber !== '') {
          locks.holderNumber = true;
        }
        setPrimaryLocks(locks);
      } else {
        // No data found for this date, reset
        setPrimaryId(null);
        setPrimaryLocks({});
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
      setPrimaryId(null);
      setPrimaryLocks({});
    } finally {
      setFetchingPrimary(false);
    }
  };

  const handlePrimaryChange = (field, value) => {
    // Prevent changes to locked fields (except date)
    if (field !== 'date' && isPrimaryFieldLocked(field)) {
      return;
    }

    // Validation logic for primary fields
    if (field === 'shift') {
      if (value.trim() === '') {
        setShiftValid(null);
      } else {
        setShiftValid(value.trim().length > 0);
      }
    }
    if (field === 'holderNumber') {
      if (value.trim() === '') {
        setHolderNumberValid(null);
      } else {
        setHolderNumberValid(value.trim().length > 0);
      }
    }
    
    setPrimaryData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // When date changes, automatically fetch existing data
    if (field === 'date' && value) {
      const dateStr = value instanceof Date ? value.toISOString().split('T')[0] : value;
      fetchPrimaryData(dateStr);
    } else if (field === 'date' && !value) {
      // Clear primary ID, locks, and validation states when date is cleared
      setPrimaryId(null);
      setPrimaryLocks({});
      setShiftValid(null);
      setHolderNumberValid(null);
    }
  };

  const handleTableChange = (tableNum, field, value) => {
    // Validation logic for Table 1
    if (tableNum === 1) {
      const validations = {
        cpc: setCpcValid,
        mFeSl: setMFeSlValid,
        feMn: setFeMnValid,
        sic: setSicValid,
        pureMg: setPureMgValid,
        cu: setCuValid,
        feCr: setFeCrValid
      };
      
      if (validations[field]) {
        if (value.trim() === '') {
          validations[field](null);
        } else {
          validations[field](!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

    // Validation logic for Table 2
    if (tableNum === 2) {
      if (field.includes('actualTime')) {
        const updatedData = {...table2, [field]: value};
        const hasTime = updatedData.actualTimeHour && updatedData.actualTimeMinute;
        const allEmpty = !updatedData.actualTimeHour && !updatedData.actualTimeMinute;
        
        if (allEmpty) {
          setActualTimeValid(null);
        } else if (hasTime) {
          setActualTimeValid(true);
        } else {
          setActualTimeValid(false);
        }
      }
      if (field.includes('tappingTime')) {
        const updatedData = {...table2, [field]: value};
        const hasTime = updatedData.tappingTimeHour && updatedData.tappingTimeMinute;
        const allEmpty = !updatedData.tappingTimeHour && !updatedData.tappingTimeMinute;
        
        if (allEmpty) {
          setTappingTimeValid(null);
        } else if (hasTime) {
          setTappingTimeValid(true);
        } else {
          setTappingTimeValid(false);
        }
      }
      if (field === 'tappingTemp') {
        if (value.trim() === '') {
          setTappingTempValid(null);
        } else {
          setTappingTempValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'metalKg') {
        if (value.trim() === '') {
          setMetalKgValid(null);
        } else {
          setMetalKgValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

    // Validation logic for Table 3
    if (tableNum === 3) {
      if (field === 'disaLine') {
        if (value.trim() === '') {
          setDisaLineValid(null);
        } else {
          setDisaLineValid(value.trim().length > 0);
        }
      }
      if (field === 'indFur') {
        if (value.trim() === '') {
          setIndFurValid(null);
        } else {
          setIndFurValid(value.trim().length > 0);
        }
      }
      if (field === 'bailNo') {
        if (value.trim() === '') {
          setBailNoValid(null);
        } else {
          setBailNoValid(value.trim().length > 0);
        }
      }
      if (field === 'tap') {
        if (value.trim() === '') {
          setTapValid(null);
        } else {
          setTapValid(value.trim().length > 0);
        }
      }
      if (field === 'kw') {
        if (value.trim() === '') {
          setKwValid(null);
        } else {
          setKwValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

    // Validation logic for Table 4
    if (tableNum === 4) {
      if (field === 'remarks') {
        if (value.trim() === '') {
          setRemarksValid(null);
        } else {
          setRemarksValid(value.trim().length > 0);
        }
      }
    }

    const setters = {
      1: setTable1,
      2: setTable2,
      3: setTable3,
      4: setTable4
    };
    setters[tableNum](prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrimarySubmit = async () => {
    // Validate required fields
    if (!primaryData.date) {
      alert('Please fill in Date');
      return;
    }
    if (!primaryData.shift) {
      setShiftValid(false);
      alert('Please fill in Shift');
      return;
    }
    if (!primaryData.holderNumber) {
      setHolderNumberValid(false);
      alert('Please fill in Holder Number');
      return;
    }

    // Check if primary data already exists for this date (prevent duplicates)
    if (primaryId) {
      alert('Primary data already exists for this date. Only one entry per day is allowed.');
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
        setPrimaryData(prev => ({
          ...prev,
          date: response.data.date ? new Date(response.data.date).toISOString().split('T')[0] : prev.date
        }));
        
        // Lock fields that have values after saving
        const locks = {};
        if (primaryData.shift !== undefined && primaryData.shift !== null && primaryData.shift !== '') locks.shift = true;
        if (primaryData.holderNumber !== undefined && primaryData.holderNumber !== null && primaryData.holderNumber !== '') locks.holderNumber = true;
        setPrimaryLocks(locks);
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
      alert('Failed to save primary data. Please try again.');
    } finally {
      setPrimaryLoading(false);
    }
  };



  const isPrimaryFieldLocked = (field) => {
    return primaryLocks[field] === true;
  };

  const handleAllTablesSubmit = async () => {
    // Validate all table fields
    let hasErrors = false;

    // Validate Table 1 fields
    if (!table1.cpc || table1.cpc.trim() === '') {
      setCpcValid(false);
      hasErrors = true;
    }
    if (!table1.mFeSl || table1.mFeSl.trim() === '') {
      setMFeSlValid(false);
      hasErrors = true;
    }
    if (!table1.feMn || table1.feMn.trim() === '') {
      setFeMnValid(false);
      hasErrors = true;
    }
    if (!table1.sic || table1.sic.trim() === '') {
      setSicValid(false);
      hasErrors = true;
    }
    if (!table1.pureMg || table1.pureMg.trim() === '') {
      setPureMgValid(false);
      hasErrors = true;
    }
    if (!table1.cu || table1.cu.trim() === '') {
      setCuValid(false);
      hasErrors = true;
    }
    if (!table1.feCr || table1.feCr.trim() === '') {
      setFeCrValid(false);
      hasErrors = true;
    }

    // Validate Table 2 fields
    if (!table2.actualTimeHour || !table2.actualTimeMinute) {
      setActualTimeValid(false);
      hasErrors = true;
    }
    if (!table2.tappingTimeHour || !table2.tappingTimeMinute) {
      setTappingTimeValid(false);
      hasErrors = true;
    }
    if (!table2.tappingTemp || table2.tappingTemp.trim() === '') {
      setTappingTempValid(false);
      hasErrors = true;
    }
    if (!table2.metalKg || table2.metalKg.trim() === '') {
      setMetalKgValid(false);
      hasErrors = true;
    }

    // Validate Table 3 fields
    if (!table3.disaLine || table3.disaLine.trim() === '') {
      setDisaLineValid(false);
      hasErrors = true;
    }
    if (!table3.indFur || table3.indFur.trim() === '') {
      setIndFurValid(false);
      hasErrors = true;
    }
    if (!table3.bailNo || table3.bailNo.trim() === '') {
      setBailNoValid(false);
      hasErrors = true;
    }
    if (!table3.tap || table3.tap.trim() === '') {
      setTapValid(false);
      hasErrors = true;
    }
    if (!table3.kw || table3.kw.trim() === '') {
      setKwValid(false);
      hasErrors = true;
    }

    // Validate Table 4 fields
    if (!table4.remarks || table4.remarks.trim() === '') {
      setRemarksValid(false);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setSubmitLoading(true);
    try {
      const formattedData = {
        date: primaryData.date,
        shift: primaryData.shift,
        holderNumber: primaryData.holderNumber,
        heatNo: `Heat No ${heatNo}`,
        additions: {
          cpc: parseFloat(table1.cpc),
          FeSl: parseFloat(table1.mFeSl),
          feMn: parseFloat(table1.feMn),
          sic: parseFloat(table1.sic),
          pureMg: parseFloat(table1.pureMg),
          cu: parseFloat(table1.cu),
          feCr: parseFloat(table1.feCr)
        },
        tapping: {
          time: {
            actualTime: `${table2.actualTimeHour}:${table2.actualTimeMinute}`,
            tappingTime: `${table2.tappingTimeHour}:${table2.tappingTimeMinute}`
          },
          tempC: parseFloat(table2.tappingTemp),
          metalKgs: parseFloat(table2.metalKg)
        },
        pouring: {
          disaLine: table3.disaLine,
          indFur: table3.indFur,
          bailNo: table3.bailNo
        },
        electrical: {
          tap: table3.tap,
          kw: parseFloat(table3.kw)
        },
        remarks: table4.remarks
      };

      const response = await fetch('http://localhost:5000/api/v1/cupola-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formattedData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh heat no
        fetchNextHeatNo(primaryData.date);
        // Reset tables
        handleAllTablesReset();
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
    setTable1({
      cpc: '',
      mFeSl: '',
      feMn: '',
      sic: '',
      pureMg: '',
      cu: '',
      feCr: ''
    });
    setTable2({
      actualTimeHour: '',
      actualTimeMinute: '',
      tappingTimeHour: '',
      tappingTimeMinute: '',
      tappingTemp: '',
      metalKg: ''
    });
    setTable3({
      disaLine: '',
      indFur: '',
      bailNo: '',
      tap: '',
      kw: ''
    });
    setTable4({
      remarks: ''
    });

    // Reset all validation states
    setCpcValid(null);
    setMFeSlValid(null);
    setFeMnValid(null);
    setSicValid(null);
    setPureMgValid(null);
    setCuValid(null);
    setFeCrValid(null);
    setActualTimeValid(null);
    setTappingTimeValid(null);
    setTappingTempValid(null);
    setMetalKgValid(null);
    setDisaLineValid(null);
    setIndFurValid(null);
    setBailNoValid(null);
    setTapValid(null);
    setKwValid(null);
    setRemarksValid(null);
  };

  const handleEnterFocusNext = (e) => {
    if (e.key !== 'Enter') return;
    const target = e.target;
    if (!(target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'))) return;
    
    const form = target.form;
    if (!form) return;
    
    const elements = Array.from(form.elements).filter(el => 
      (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') && 
      !el.disabled && 
      !el.readOnly &&
      el.type !== 'hidden'
    );
    
    const currentIndex = elements.indexOf(target);
    if (currentIndex > -1 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
      e.preventDefault();
    }
  };

  return (
    <div className="page-wrapper" onKeyDown={handleEnterFocusNext}>
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
        <h3 className="section-header">Primary Data</h3>
        
        <div className="cupola-holder-form-grid cupola-holder-table2-grid">
          <div className="cupola-holder-form-group">
            <label>Shift *</label>
            <select
              name="shift"
              value={primaryData.shift}
              onChange={(e) => handlePrimaryChange('shift', e.target.value)}
              disabled={isPrimaryFieldLocked('shift') || fetchingPrimary}
              className={getValidationClass(shiftValid)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: isPrimaryFieldLocked('shift') ? '#f1f5f9' : '#ffffff',
                color: isPrimaryFieldLocked('shift') ? '#64748b' : '#1e293b',
                cursor: isPrimaryFieldLocked('shift') ? 'not-allowed' : 'pointer',
                opacity: isPrimaryFieldLocked('shift') ? 0.8 : 1
              }}
            >
              <option value="">Select Shift</option>
              <option value="Shift 1">Shift 1</option>
              <option value="Shift 2">Shift 2</option>
              <option value="Shift 3">Shift 3</option>
            </select>
          </div>

          <div className="cupola-holder-form-group">
            <label>Holder Number *</label>
            <input
              type="text"
              name="holderNumber"
              value={primaryData.holderNumber}
              onChange={(e) => handlePrimaryChange('holderNumber', e.target.value)}
              placeholder="e.g: H001"
              disabled={isPrimaryFieldLocked('holderNumber') || fetchingPrimary}
              readOnly={isPrimaryFieldLocked('holderNumber')}
              className={getValidationClass(holderNumberValid)}
              style={{
                backgroundColor: isPrimaryFieldLocked('holderNumber') ? '#f1f5f9' : '#ffffff',
                cursor: isPrimaryFieldLocked('holderNumber') ? 'not-allowed' : 'text'
              }}
            />
          </div>

          <div className="cupola-holder-form-group" />
        </div>

        <div className="cupola-holder-submit-container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            className="cupola-holder-submit-btn"
            type="button"
            onClick={handlePrimarySubmit}
            disabled={primaryLoading || fetchingPrimary || (!primaryData.date || !primaryData.shift || !primaryData.holderNumber) || primaryId}
            title={primaryId ? 'Primary data already exists for today' : 'Save Primary Data'}
          >
            {primaryLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Primary Data
              </>
            )}
          </button>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Heat No Display */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '2px solid #0ea5e9', maxWidth: '200px' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0c4a6e' }}>
          Current Heat No: <span style={{ color: '#0ea5e9' }}> {heatNo}</span>
        </div>
      </div>

      {/* Table 1 */}
      <div>
        <h3 className="section-header">Table 1 - Additions</h3>
        
        <div className="cupola-holder-form-grid">
          <div className="cupola-holder-form-group">
            <label>CPC</label>
            <input
              type="number"
              value={table1.cpc || ''}
              onChange={(e) => handleTableChange(1, 'cpc', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(cpcValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Fe Sl</label>
            <input
              type="number"
              value={table1.mFeSl || ''}
              onChange={(e) => handleTableChange(1, 'mFeSl', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(mFeSlValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Fe Mn</label>
            <input
              type="number"
              value={table1.feMn || ''}
              onChange={(e) => handleTableChange(1, 'feMn', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(feMnValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>SIC</label>
            <input
              type="number"
              value={table1.sic || ''}
              onChange={(e) => handleTableChange(1, 'sic', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(sicValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Pure Mg</label>
            <input
              type="number"
              value={table1.pureMg || ''}
              onChange={(e) => handleTableChange(1, 'pureMg', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(pureMgValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Cu</label>
            <input
              type="number"
              value={table1.cu || ''}
              onChange={(e) => handleTableChange(1, 'cu', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(cuValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Fe Cr</label>
            <input
              type="number"
              value={table1.feCr || ''}
              onChange={(e) => handleTableChange(1, 'feCr', e.target.value)}
              step="0.1"
              placeholder="0"
              className={getValidationClass(feCrValid)}
            />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 2 */}
      <div>
        <h3 className="section-header">Table 2 - Tapping</h3>
        
        <div className="cupola-holder-form-grid">
          <div className="cupola-holder-form-group">
            <label>Actual Time</label>
            <TimeInput
              hourRef={actualTimeHourRef}
              minuteRef={actualTimeMinuteRef}
              hourName="actualTimeHour"
              minuteName="actualTimeMinute"
              hourValue={table2.actualTimeHour}
              minuteValue={table2.actualTimeMinute}
              onChange={(e) => handleTableChange(2, e.target.name, e.target.value)}
              validationState={actualTimeValid}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Tapping Time</label>
            <TimeInput
              hourRef={tappingTimeHourRef}
              minuteRef={tappingTimeMinuteRef}
              hourName="tappingTimeHour"
              minuteName="tappingTimeMinute"
              hourValue={table2.tappingTimeHour}
              minuteValue={table2.tappingTimeMinute}
              onChange={(e) => handleTableChange(2, e.target.name, e.target.value)}
              validationState={tappingTimeValid}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Temp C</label>
            <input
              type="number"
              value={table2.tappingTemp || ''}
              onChange={(e) => handleTableChange(2, 'tappingTemp', e.target.value)}
              step="0.1"
              placeholder="e.g: 1500"
              className={getValidationClass(tappingTempValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>Metal Kg</label>
            <input
              type="number"
              value={table2.metalKg || ''}
              onChange={(e) => handleTableChange(2, 'metalKg', e.target.value)}
              step="0.1"
              placeholder="e.g: 2000"
              className={getValidationClass(metalKgValid)}
            />
          </div>

          <div className="cupola-holder-form-group" />
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 3 */}
      <div>
        <h3 className="section-header">Table 3 - Pouring & Electrical</h3>
        
        <div className="cupola-holder-form-grid">
          <div className="cupola-holder-form-group">
            <label>DISA LINE</label>
            <input
              type="text"
              value={table3.disaLine || ''}
              onChange={(e) => handleTableChange(3, 'disaLine', e.target.value)}
              placeholder="e.g: DISA-1"
              className={getValidationClass(disaLineValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>IND FUR</label>
            <input
              type="text"
              value={table3.indFur || ''}
              onChange={(e) => handleTableChange(3, 'indFur', e.target.value)}
              placeholder="e.g: IND-FUR-1"
              className={getValidationClass(indFurValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>BAIL NO</label>
            <input
              type="text"
              value={table3.bailNo || ''}
              onChange={(e) => handleTableChange(3, 'bailNo', e.target.value)}
              placeholder="e.g: BAIL-001"
              className={getValidationClass(bailNoValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>TAP</label>
            <input
              type="text"
              value={table3.tap || ''}
              onChange={(e) => handleTableChange(3, 'tap', e.target.value)}
              placeholder="Enter TAP value"
              className={getValidationClass(tapValid)}
            />
          </div>

          <div className="cupola-holder-form-group">
            <label>KW</label>
            <input
              type="number"
              value={table3.kw || ''}
              onChange={(e) => handleTableChange(3, 'kw', e.target.value)}
              step="0.1"
              placeholder="e.g: 2500"
              className={getValidationClass(kwValid)}
            />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 4 */}
      <div>
        <h3 className="section-header">Table 4 - Remarks</h3>
        
        <div className="cupola-holder-form-grid">
          <div className="cupola-holder-form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Remarks</label>
            <input
              type="text"
              value={table4.remarks || ''}
              onChange={(e) => handleTableChange(4, 'remarks', e.target.value)}
              placeholder="Enter any additional notes or observations..."
              maxLength={80}
              className={getValidationClass(remarksValid)}
              style={{
                width: '100%',
                maxWidth: '500px',
                resize: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* All Tables Submit and Reset Buttons */}
      <div className="cupola-holder-submit-container" style={{ marginTop: '2rem' }}>
        <button
          className="cupola-holder-reset-btn"
          type="button"
          onClick={handleAllTablesReset}
        >
          <RotateCcw size={16} />
          Reset All Tables
        </button>
        <button
          className="cupola-holder-submit-btn"
          type="button"
          onClick={handleAllTablesSubmit}
          disabled={submitLoading || !primaryData.date}
          title={!primaryData.date ? 'Please enter a date first' : 'Save All Tables'}
        >
          {submitLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving All Tables...
            </>
          ) : (
            <>
              <Save size={18} />
              Save All Tables
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CupolaHolderLogSheet;
