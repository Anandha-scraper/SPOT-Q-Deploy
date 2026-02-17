import React, { useState, useRef, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { SubmitButton, LockPrimaryButton, DisaDropdown, CustomTimeInput, Time } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { ErrorAlert } from '../../Components/Alert';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/Process/Process.css';

export default function ProcessControl() {

  const [formData, setFormData] = useState({
    date: '', disa: '', partName: '', datecode: '', heatcode: '', quantityOfMoulds: '', metalCompositionC: '', metalCompositionSi: '',
    metalCompositionMn: '', metalCompositionP: '', metalCompositionS: '', metalCompositionMgFL: '',
    metalCompositionCr: '', metalCompositionCu: '', 
    pouringTemperature: '',
    ppCode: '', treatmentNo: '', fcNo: '', heatNo: '', conNo: '', 
    correctiveAdditionC: '',
    correctiveAdditionSi: '', correctiveAdditionMn: '', correctiveAdditionS: '', correctiveAdditionCr: '',
    correctiveAdditionCu: '', correctiveAdditionSn: '', tappingWt: '', mg: '', resMgConvertor: '',
    recOfMg: '', streamInoculant: '', pTime: '', remarks: ''
  });

  // Time states using Time objects from HeroUI
  const [pouringFromTime, setPouringFromTime] = useState(null);
  const [pouringToTime, setPouringToTime] = useState(null);
  const [tappingTime, setTappingTime] = useState(null);


  const inputRefs = useRef({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isPrimarySaved, setIsPrimarySaved] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [savePrimaryLoading, setSavePrimaryLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [showSakthi, setShowSakthi] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  /* 
   * VALIDATION STATES
   * null = neutral/default (no border color)
   * true = valid (green border) - NOT USED, kept for backwards compatibility
   * false = invalid (red border) - shown after submit when field is empty/invalid
   */
  // Basic fields
  const [partNameValid, setPartNameValid] = useState(null);
  const [datecodeValid, setDatecodeValid] = useState(null);
  const [heatcodeValid, setHeatcodeValid] = useState(null);
  const [quantityOfMouldsValid, setQuantityOfMouldsValid] = useState(null);
  const [ppCodeValid, setPpCodeValid] = useState(null);
  const [treatmentNoValid, setTreatmentNoValid] = useState(null);
  const [fcNoValid, setFcNoValid] = useState(null);
  const [heatNoValid, setHeatNoValid] = useState(null);
  const [pouringTempValid, setPouringTempValid] = useState(null);
  const [pouringTimeValid, setPouringTimeValid] = useState(null);
  const [tappingWtValid, setTappingWtValid] = useState(null);
  const [streamInoculantValid, setStreamInoculantValid] = useState(null);
  const [remarksValid, setRemarksValid] = useState(null);
  
  // Metal Composition validation states
  const [metalCValid, setMetalCValid] = useState(null);
  const [metalSiValid, setMetalSiValid] = useState(null);
  const [metalMnValid, setMetalMnValid] = useState(null);
  const [metalPValid, setMetalPValid] = useState(null);
  const [metalSValid, setMetalSValid] = useState(null);
  const [metalMgFLValid, setMetalMgFLValid] = useState(null);
  const [metalCuValid, setMetalCuValid] = useState(null);
  const [metalCrValid, setMetalCrValid] = useState(null);
  
  // Corrective Addition validation states
  const [corrCValid, setCorrCValid] = useState(null);
  const [corrSiValid, setCorrSiValid] = useState(null);
  const [corrMnValid, setCorrMnValid] = useState(null);
  const [corrSValid, setCorrSValid] = useState(null);
  const [corrCrValid, setCorrCrValid] = useState(null);
  const [corrCuValid, setCorrCuValid] = useState(null);
  const [corrSnValid, setCorrSnValid] = useState(null);
  
  // Other optional fields
  const [conNoValid, setConNoValid] = useState(null);
  const [tappingTimeValid, setTappingTimeValid] = useState(null);
  const [mgValid, setMgValid] = useState(null);
  const [resMgConvertorValid, setResMgConvertorValid] = useState(null);
  const [recOfMgValid, setRecOfMgValid] = useState(null);
  const [pTimeValid, setPTimeValid] = useState(null);

  // Submit error message state
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

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
   * Legacy validation class getter for backwards compatibility
   */
  const getValidationClass = (isValid) => {
    if (isValid === true) return 'valid-input';
    if (isValid === false) return 'invalid-input';
    return '';
  };

  // Set current date on mount as default
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      date: `${y}-${m}-${d}`
    }));
  }, []);

  // Check if date+disa combination exists in database
  useEffect(() => {
    const checkDateDisaExists = async () => {
      if (!formData.date || !formData.disa) {
        setIsPrimarySaved(false);
        setEntryCount(0);
        return;
      }

      try {
        const response = await fetch(buildApiUrl(`/api/v1/process/check?date=${formData.date}&disa=${encodeURIComponent(formData.disa)}`), {
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
      }
    };

    checkDateDisaExists();
  }, [formData.date, formData.disa]);

  // Validate pouring time when time values change
  useEffect(() => {
    if (pouringFromTime && pouringToTime) {
      setPouringTimeValid(null);
    } else if (!pouringFromTime && !pouringToTime) {
      setPouringTimeValid(null);
    } else {
      setPouringTimeValid(false);
    }
  }, [pouringFromTime, pouringToTime]);

  // Validate tapping time when time value changes
  useEffect(() => {
    if (tappingTime) {
      setTappingTimeValid(null);
    } else {
      setTappingTimeValid(null);
    }
  }, [tappingTime]);

  const fieldOrder = ['date', 'disa', 'partName', 'datecode', 'heatcode', 'quantityOfMoulds', 'metalCompositionC', 'metalCompositionSi',
    'metalCompositionMn', 'metalCompositionP', 'metalCompositionS', 'metalCompositionMgFL', 'metalCompositionCu',
    'metalCompositionCr', 'pouringTemperature', 'ppCode', 'treatmentNo', 'fcNo', 'heatNo', 'conNo',
    'correctiveAdditionC', 'correctiveAdditionSi', 'correctiveAdditionMn', 'correctiveAdditionS',
    'correctiveAdditionCr', 'correctiveAdditionCu', 'correctiveAdditionSn', 'tappingWt', 'mg', 'resMgConvertor',
    'recOfMg', 'streamInoculant', 'pTime', 'remarks'];

  /*
   * Handle input change
   * When user starts typing, reset validation state to null (neutral)
   * This removes the red border as user begins correcting the field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'partName':
        setPartNameValid(null);
        break;
      case 'datecode':
        setDatecodeValid(null);
        break;
      case 'heatcode':
        setHeatcodeValid(null);
        break;
      case 'quantityOfMoulds':
        setQuantityOfMouldsValid(null);
        break;
      case 'metalCompositionC':
        setMetalCValid(null);
        break;
      case 'metalCompositionSi':
        setMetalSiValid(null);
        break;
      case 'metalCompositionMn':
        setMetalMnValid(null);
        break;
      case 'metalCompositionP':
        setMetalPValid(null);
        break;
      case 'metalCompositionS':
        setMetalSValid(null);
        break;
      case 'metalCompositionMgFL':
        setMetalMgFLValid(null);
        break;
      case 'metalCompositionCu':
        setMetalCuValid(null);
        break;
      case 'metalCompositionCr':
        setMetalCrValid(null);
        break;
      case 'pouringTemperature':
        setPouringTempValid(null);
        break;
      case 'ppCode':
        setPpCodeValid(null);
        break;
      case 'treatmentNo':
        setTreatmentNoValid(null);
        break;
      case 'fcNo':
        setFcNoValid(null);
        break;
      case 'heatNo':
        setHeatNoValid(null);
        break;
      case 'conNo':
        setConNoValid(null);
        break;
      case 'correctiveAdditionC':
        setCorrCValid(null);
        break;
      case 'correctiveAdditionSi':
        setCorrSiValid(null);
        break;
      case 'correctiveAdditionMn':
        setCorrMnValid(null);
        break;
      case 'correctiveAdditionS':
        setCorrSValid(null);
        break;
      case 'correctiveAdditionCr':
        setCorrCrValid(null);
        break;
      case 'correctiveAdditionCu':
        setCorrCuValid(null);
        break;
      case 'correctiveAdditionSn':
        setCorrSnValid(null);
        break;
      case 'tappingWt':
        setTappingWtValid(null);
        break;
      case 'mg':
        setMgValid(null);
        break;
      case 'resMgConvertor':
        setResMgConvertorValid(null);
        break;
      case 'recOfMg':
        setRecOfMgValid(null);
        break;
      case 'streamInoculant':
        setStreamInoculantValid(null);
        break;
      case 'pTime':
        setPTimeValid(null);
        break;
      case 'remarks':
        setRemarksValid(null);
        break;
      default:
        break;
    }

    if (name === 'datecode') {
      setFormData({...formData, [name]: value.toUpperCase()});
      return;
    }

    setFormData({...formData, [name]: value});
  };
  
  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(field);
      
      // If on remarks field (last field), move to submit button
      if (field === 'remarks') {
        inputRefs.current.submitBtn?.focus();
      } else if (idx < fieldOrder.length - 1) {
        inputRefs.current[fieldOrder[idx + 1]]?.focus();
      }
    }
  };

  const handlePrimarySubmit = async () => {
    // Validate required fields
    if (!formData.date || !formData.disa) {
      alert('Please fill in Date and DISA');
      return;
    }

    try {
      setSavePrimaryLoading(true);
      
      // Call save-primary API to save date+disa and get entry count
      const response = await fetch(buildApiUrl('/api/v1/process/save-primary'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          date: formData.date,
          disa: formData.disa
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsPrimarySaved(true);
        setEntryCount(data.count || 0);
        // Focus on Part Name field after primary is saved
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

    const datecodePattern = /^[0-9][A-Z][0-9]{2}$/;
    const numericPattern = /^\d+$/;

    if (!formData.partName || !formData.partName.trim()) {
      setPartNameValid(false);
      hasErrors = true;
    } else {
      setPartNameValid(null);
    }

    if (!formData.datecode || !formData.datecode.trim() || !datecodePattern.test(formData.datecode)) {
      setDatecodeValid(false);
      hasErrors = true;
    } else {
      setDatecodeValid(null);
    }

    if (!formData.heatcode || !formData.heatcode.trim() || !numericPattern.test(formData.heatcode)) {
      setHeatcodeValid(false);
      hasErrors = true;
    } else {
      setHeatcodeValid(null);
    }

    if (!formData.quantityOfMoulds || formData.quantityOfMoulds.trim() === '' || isNaN(formData.quantityOfMoulds) || parseFloat(formData.quantityOfMoulds) < 0) {
      setQuantityOfMouldsValid(false);
      hasErrors = true;
    } else {
      setQuantityOfMouldsValid(null);
    }

    if (!formData.metalCompositionC || formData.metalCompositionC.trim() === '' || isNaN(formData.metalCompositionC) || parseFloat(formData.metalCompositionC) < 0) {
      setMetalCValid(false);
      hasErrors = true;
    } else {
      setMetalCValid(null);
    }

    if (!formData.metalCompositionSi || formData.metalCompositionSi.trim() === '' || isNaN(formData.metalCompositionSi) || parseFloat(formData.metalCompositionSi) < 0) {
      setMetalSiValid(false);
      hasErrors = true;
    } else {
      setMetalSiValid(null);
    }

    if (!formData.metalCompositionMn || formData.metalCompositionMn.trim() === '' || isNaN(formData.metalCompositionMn) || parseFloat(formData.metalCompositionMn) < 0) {
      setMetalMnValid(false);
      hasErrors = true;
    } else {
      setMetalMnValid(null);
    }

    if (!formData.metalCompositionP || formData.metalCompositionP.trim() === '' || isNaN(formData.metalCompositionP) || parseFloat(formData.metalCompositionP) < 0) {
      setMetalPValid(false);
      hasErrors = true;
    } else {
      setMetalPValid(null);
    }

    if (!formData.metalCompositionS || formData.metalCompositionS.trim() === '' || isNaN(formData.metalCompositionS) || parseFloat(formData.metalCompositionS) < 0) {
      setMetalSValid(false);
      hasErrors = true;
    } else {
      setMetalSValid(null);
    }

    if (!formData.metalCompositionMgFL || formData.metalCompositionMgFL.trim() === '' || isNaN(formData.metalCompositionMgFL) || parseFloat(formData.metalCompositionMgFL) < 0) {
      setMetalMgFLValid(false);
      hasErrors = true;
    } else {
      setMetalMgFLValid(null);
    }

    if (!formData.metalCompositionCu || formData.metalCompositionCu.trim() === '' || isNaN(formData.metalCompositionCu) || parseFloat(formData.metalCompositionCu) < 0) {
      setMetalCuValid(false);
      hasErrors = true;
    } else {
      setMetalCuValid(null);
    }

    if (!formData.metalCompositionCr || formData.metalCompositionCr.trim() === '' || isNaN(formData.metalCompositionCr) || parseFloat(formData.metalCompositionCr) < 0) {
      setMetalCrValid(false);
      hasErrors = true;
    } else {
      setMetalCrValid(null);
    }

    if (!formData.ppCode || !formData.ppCode.trim() || !numericPattern.test(formData.ppCode)) {
      setPpCodeValid(false);
      hasErrors = true;
    } else {
      setPpCodeValid(null);
    }

    if (!formData.treatmentNo || !formData.treatmentNo.trim() || !numericPattern.test(formData.treatmentNo)) {
      setTreatmentNoValid(false);
      hasErrors = true;
    } else {
      setTreatmentNoValid(null);
    }

    if (!formData.fcNo || !formData.fcNo.trim()) {
      setFcNoValid(false);
      hasErrors = true;
    } else {
      setFcNoValid(null);
    }

    if (!formData.heatNo || !formData.heatNo.trim()) {
      setHeatNoValid(false);
      hasErrors = true;
    } else {
      setHeatNoValid(null);
    }

    if (!formData.conNo || formData.conNo.trim() === '' || isNaN(formData.conNo) || parseFloat(formData.conNo) < 0) {
      setConNoValid(false);
      hasErrors = true;
    } else {
      setConNoValid(null);
    }

    if (!formData.pouringTemperature || isNaN(formData.pouringTemperature) || parseFloat(formData.pouringTemperature) <= 0) {
      setPouringTempValid(false);
      hasErrors = true;
    } else {
      setPouringTempValid(null);
    }

    if (!pouringFromTime || !pouringToTime) {
      setPouringTimeValid(false);
      hasErrors = true;
    } else {
      setPouringTimeValid(null);
    }

    if (!tappingTime) {
      setTappingTimeValid(false);
      hasErrors = true;
    } else {
      setTappingTimeValid(null);
    }

    if (!formData.correctiveAdditionC || formData.correctiveAdditionC.trim() === '' || isNaN(formData.correctiveAdditionC) || parseFloat(formData.correctiveAdditionC) < 0) {
      setCorrCValid(false);
      hasErrors = true;
    } else {
      setCorrCValid(null);
    }

    if (!formData.correctiveAdditionSi || formData.correctiveAdditionSi.trim() === '' || isNaN(formData.correctiveAdditionSi) || parseFloat(formData.correctiveAdditionSi) < 0) {
      setCorrSiValid(false);
      hasErrors = true;
    } else {
      setCorrSiValid(null);
    }

    if (!formData.correctiveAdditionMn || formData.correctiveAdditionMn.trim() === '' || isNaN(formData.correctiveAdditionMn) || parseFloat(formData.correctiveAdditionMn) < 0) {
      setCorrMnValid(false);
      hasErrors = true;
    } else {
      setCorrMnValid(null);
    }

    if (!formData.correctiveAdditionS || formData.correctiveAdditionS.trim() === '' || isNaN(formData.correctiveAdditionS) || parseFloat(formData.correctiveAdditionS) < 0) {
      setCorrSValid(false);
      hasErrors = true;
    } else {
      setCorrSValid(null);
    }

    if (!formData.correctiveAdditionCr || formData.correctiveAdditionCr.trim() === '' || isNaN(formData.correctiveAdditionCr) || parseFloat(formData.correctiveAdditionCr) < 0) {
      setCorrCrValid(false);
      hasErrors = true;
    } else {
      setCorrCrValid(null);
    }

    if (!formData.correctiveAdditionCu || formData.correctiveAdditionCu.trim() === '' || isNaN(formData.correctiveAdditionCu) || parseFloat(formData.correctiveAdditionCu) < 0) {
      setCorrCuValid(false);
      hasErrors = true;
    } else {
      setCorrCuValid(null);
    }

    if (!formData.correctiveAdditionSn || formData.correctiveAdditionSn.trim() === '' || isNaN(formData.correctiveAdditionSn) || parseFloat(formData.correctiveAdditionSn) < 0) {
      setCorrSnValid(false);
      hasErrors = true;
    } else {
      setCorrSnValid(null);
    }

    if (!formData.tappingWt || isNaN(formData.tappingWt) || parseFloat(formData.tappingWt) <= 0) {
      setTappingWtValid(false);
      hasErrors = true;
    } else {
      setTappingWtValid(null);
    }

    if (!formData.mg || formData.mg.trim() === '' || isNaN(formData.mg) || parseFloat(formData.mg) < 0) {
      setMgValid(false);
      hasErrors = true;
    } else {
      setMgValid(null);
    }

    if (!formData.resMgConvertor || formData.resMgConvertor.trim() === '' || isNaN(formData.resMgConvertor) || parseFloat(formData.resMgConvertor) < 0) {
      setResMgConvertorValid(false);
      hasErrors = true;
    } else {
      setResMgConvertorValid(null);
    }

    if (!formData.recOfMg || formData.recOfMg.trim() === '' || isNaN(formData.recOfMg) || parseFloat(formData.recOfMg) < 0) {
      setRecOfMgValid(false);
      hasErrors = true;
    } else {
      setRecOfMgValid(null);
    }

    if (!formData.streamInoculant || isNaN(formData.streamInoculant) || parseFloat(formData.streamInoculant) < 0) {
      setStreamInoculantValid(false);
      hasErrors = true;
    } else {
      setStreamInoculantValid(null);
    }

    if (!formData.pTime || formData.pTime.trim() === '' || isNaN(formData.pTime) || parseFloat(formData.pTime) < 0) {
      setPTimeValid(false);
      hasErrors = true;
    } else {
      setPTimeValid(null);
    }

    if (!formData.remarks || !formData.remarks.trim()) {
      setRemarksValid(false);
      hasErrors = true;
    } else {
      setRemarksValid(null);
    }

    if (hasErrors) {
      setSubmitErrorMessage('Enter data in correct Format');
      return;
    }

    setSubmitErrorMessage('');

    try {
      setSubmitLoading(true);

      // Format time from Time objects
      let timeOfPouring = '';
      if (pouringFromTime && pouringToTime) {
        const formatTime = (time) => {
          const hour = time.hour % 12 || 12;
          const minute = String(time.minute).padStart(2, '0');
          const period = time.hour >= 12 ? 'PM' : 'AM';
          return `${hour}:${minute} ${period}`;
        };
        timeOfPouring = `${formatTime(pouringFromTime)} - ${formatTime(pouringToTime)}`;
      }

      // Format tapping time
      let tappingTimeStr = '';
      if (tappingTime) {
        const hour = tappingTime.hour % 12 || 12;
        const minute = String(tappingTime.minute).padStart(2, '0');
        const period = tappingTime.hour >= 12 ? 'PM' : 'AM';
        tappingTimeStr = `${hour}:${minute} ${period}`;
      }

      // Prepare payload
      const payload = { ...formData };
      
      payload.timeOfPouring = timeOfPouring;
      payload.tappingTime = tappingTimeStr;

      // Send all data (primary + other fields) combined to backend
      // Backend will find existing document by date+disa and update it, or create new one
      const response = await fetch(buildApiUrl('/api/v1/process'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        // Show Sakthi loader
        setShowSakthi(true);

        // Get current date
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const currentDate = `${y}-${m}-${d}`;

        // Reset all fields except primary data (date and disa)
        const resetData = { 
          date: currentDate
        };
        Object.keys(formData).forEach(key => {
          if (key !== 'date' && key !== 'disa') {
            resetData[key] = '';
          } else if (key === 'disa') {
            resetData[key] = formData.disa; // Keep disa
          }
        });
        setFormData(resetData);
        
        // Reset time states
        setPouringFromTime(null);
        setPouringToTime(null);
        setTappingTime(null);
        
        // Reset all validation states to null
        setPartNameValid(null);
        setDatecodeValid(null);
        setHeatcodeValid(null);
        setQuantityOfMouldsValid(null);
        setMetalCValid(null);
        setMetalSiValid(null);
        setMetalMnValid(null);
        setMetalPValid(null);
        setMetalSValid(null);
        setMetalMgFLValid(null);
        setMetalCuValid(null);
        setMetalCrValid(null);
        setPouringTimeValid(null);
        setPouringTempValid(null);
        setPpCodeValid(null);
        setTreatmentNoValid(null);
        setFcNoValid(null);
        setHeatNoValid(null);
        setConNoValid(null);
        setTappingTimeValid(null);
        setCorrCValid(null);
        setCorrSiValid(null);
        setCorrMnValid(null);
        setCorrSValid(null);
        setCorrCrValid(null);
        setCorrCuValid(null);
        setCorrSnValid(null);
        setTappingWtValid(null);
        setMgValid(null);
        setResMgConvertorValid(null);
        setRecOfMgValid(null);
        setStreamInoculantValid(null);
        setPTimeValid(null);
        setRemarksValid(null);
        
        // Reset error states
        setSubmitErrorMessage('');
        
        // Increment entry count
        setEntryCount(prev => prev + 1);
        
        // Keep primary locked, focus on Part Name for next entry
        setTimeout(() => {
          inputRefs.current.partName?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error saving process control entry:', error);
      setAlertMessage('Failed to save entry: ' + error.message);
      setShowErrorAlert(true);
      setTimeout(() => setShowErrorAlert(false), 3000);
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

  const handleSakthiComplete = () => {
    setShowSakthi(false);
  };

  return (
    <>
      {showSakthi && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Sakthi onComplete={handleSakthiComplete} />
        </div>
      )}
      <div className="process-header">
        <div className="process-header-text">
          <h2>
            <FileText size={28} style={{ color: '#5B9AA9' }} />
            Process Control - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? (() => {
            const [y, m, d] = formData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      <div className="process-form-grid">
            {/* Primary Data Section */}
            <div className="section-header primary-data-header">
              <h3>Primary Data {isPrimarySaved && <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#5B9AA9' }}>(Entries: {entryCount})</span>}</h3>
            </div>

            <div className="process-form-group">
              <label>Date </label>
              <CustomDatePicker
                ref={el => inputRefs.current.date = el}
                name="date"
                value={formData.date}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'date')}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  border: '2px solid #cbd5e1',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#fff'
                }}
              />
            </div>

            <div className="process-form-group">
              <label>DISA </label>
              <DisaDropdown
                ref={el => inputRefs.current.disa = el}
                name="disa"
                value={formData.disa}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'disa')}
              />
            </div>

            <div className="process-form-group">
              <label>&nbsp;</label>
              <LockPrimaryButton
                onClick={handlePrimarySubmit}
                disabled={savePrimaryLoading || !formData.date || !formData.disa || isPrimarySaved}
                isLocked={isPrimarySaved}
              />
              {savePrimaryLoading && <span style={{ fontSize: '0.75rem', color: '#5B9AA9' }}>Saving...</span>}
            </div>

            {/* Divider line to separate primary data from other inputs */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className="process-form-group">
              <label>Part Name </label>
              <input 
                ref={el => inputRefs.current.partName = el} 
                type="text" 
                name="partName" 
                value={formData.partName} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'partName')}
                placeholder="e.g., ABC-123"
                disabled={!isPrimarySaved}
                className={getInputClassName('partName', partNameValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Date Code </label>
              <input 
                ref={el => inputRefs.current.datecode = el} 
                type="text" 
                name="datecode" 
                value={formData.datecode} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'datecode')}
                placeholder="e.g., 6F25"
                disabled={!isPrimarySaved}
                className={getInputClassName('datecode', datecodeValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Heat Code </label>
              <input 
                ref={el => inputRefs.current.heatcode = el} 
                type="number" 
                name="heatcode" 
                value={formData.heatcode} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'heatcode')}
                placeholder="Enter number only"
                disabled={!isPrimarySaved}
                className={getInputClassName('heatcode', heatcodeValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Qty. Of Moulds *</label>
              <input 
                ref={el => inputRefs.current.quantityOfMoulds = el} 
                type="number" 
                name="quantityOfMoulds" 
                value={formData.quantityOfMoulds} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'quantityOfMoulds')}
                placeholder="Enter quantity"
                disabled={!isPrimarySaved}
                className={getInputClassName('quantityOfMoulds', quantityOfMouldsValid)}
              />
            </div>

            <div className="section-header metal-composition-header">
              <h3>Metal Composition (%) </h3>
            </div>
            <div className="process-form-group">
              <label>C</label>
              <input 
                ref={r => inputRefs.current.metalCompositionC = r} 
                type="number" 
                name="metalCompositionC" 
                step="0.001" 
                value={formData.metalCompositionC} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionC')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionC', metalCValid)}
              />
            </div>
            <div className="process-form-group">
              <label>Si</label>
              <input 
                ref={r => inputRefs.current.metalCompositionSi = r} 
                type="number" 
                name="metalCompositionSi" 
                step="0.001" 
                value={formData.metalCompositionSi} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionSi')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionSi', metalSiValid)}
              />
            </div>
            <div className="process-form-group">
              <label>Mn</label>
              <input 
                ref={r => inputRefs.current.metalCompositionMn = r} 
                type="number" 
                name="metalCompositionMn" 
                step="0.001" 
                value={formData.metalCompositionMn} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionMn')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionMn', metalMnValid)}
              />
            </div>
            <div className="process-form-group">
              <label>P</label>
              <input 
                ref={r => inputRefs.current.metalCompositionP = r} 
                type="number" 
                name="metalCompositionP" 
                step="0.001" 
                value={formData.metalCompositionP} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionP')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionP', metalPValid)}
              />
            </div>
            <div className="process-form-group">
              <label>S</label>
              <input 
                ref={r => inputRefs.current.metalCompositionS = r} 
                type="number" 
                name="metalCompositionS" 
                step="0.001" 
                value={formData.metalCompositionS} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionS')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionS', metalSValid)}
              />
            </div>
            <div className="process-form-group">
              <label>Mg F/L</label>
              <input 
                ref={r => inputRefs.current.metalCompositionMgFL = r} 
                type="number" 
                name="metalCompositionMgFL" 
                step="0.001" 
                value={formData.metalCompositionMgFL} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionMgFL')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionMgFL', metalMgFLValid)}
              />
            </div>
            <div className="process-form-group">
              <label>Cu</label>
              <input 
                ref={r => inputRefs.current.metalCompositionCu = r} 
                type="number" 
                name="metalCompositionCu" 
                step="0.001" 
                value={formData.metalCompositionCu} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionCu')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionCu', metalCuValid)}
              />
            </div>
            <div className="process-form-group">
              <label>Cr</label>
              <input 
                ref={r => inputRefs.current.metalCompositionCr = r} 
                type="number" 
                name="metalCompositionCr" 
                step="0.001" 
                value={formData.metalCompositionCr} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'metalCompositionCr')}
                placeholder="%"
                disabled={!isPrimarySaved}
                className={getInputClassName('metalCompositionCr', metalCrValid)}
              />
            </div>

            {/* Divider line */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className="process-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Time of Pouring (Range) </label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <label>From Time</label>
                  <CustomTimeInput
                    value={pouringFromTime}
                    onChange={setPouringFromTime}
                    disabled={!isPrimarySaved}
                    hasError={pouringTimeValid === false}
                  />
                </div>
                <div>
                  <label>To Time</label>
                  <CustomTimeInput
                    value={pouringToTime}
                    onChange={setPouringToTime}
                    disabled={!isPrimarySaved}
                    hasError={pouringTimeValid === false}
                  />
                </div>
              </div>
            </div>

            <div className="process-form-group">
              <label>Pouring Temp (°C) </label>
              <input 
                ref={el => inputRefs.current.pouringTemperature = el} 
                type="number" 
                name="pouringTemperature" 
                step="0.01" 
                value={formData.pouringTemperature} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'pouringTemperature')}
                placeholder="e.g., 1450"
                disabled={!isPrimarySaved}
                className={getInputClassName('pouringTemperature', pouringTempValid)}
              />
            </div>

            <div className="process-form-group">
              <label>PP Code </label>
              <input 
                ref={el => inputRefs.current.ppCode = el} 
                type="number" 
                name="ppCode" 
                value={formData.ppCode} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'ppCode')}
                placeholder="Enter number only"
                disabled={!isPrimarySaved}
                className={getInputClassName('ppCode', ppCodeValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Treatment No </label>
              <input 
                ref={el => inputRefs.current.treatmentNo = el} 
                type="number" 
                name="treatmentNo" 
                value={formData.treatmentNo} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'treatmentNo')}
                placeholder="Enter number only"
                disabled={!isPrimarySaved}
                className={getInputClassName('treatmentNo', treatmentNoValid)}
              />
            </div>

            <div className="process-form-group">
              <label>F/C No. </label>
              <select
                ref={el => inputRefs.current.fcNo = el} 
                name="fcNo" 
                value={formData.fcNo} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'fcNo')}
                disabled={!isPrimarySaved}
                className={getInputClassName('fcNo', fcNoValid)}
              >
                <option value="">Select F/C No.</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
              </select>
            </div>

            <div className="process-form-group">
              <label>Heat No </label>
              <input 
                ref={el => inputRefs.current.heatNo = el} 
                type="text" 
                name="heatNo" 
                value={formData.heatNo} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'heatNo')}
                placeholder="Enter Heat No"
                disabled={!isPrimarySaved}
                className={getInputClassName('heatNo', heatNoValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Con No </label>
              <input 
                ref={el => inputRefs.current.conNo = el} 
                type="number" 
                name="conNo" 
                value={formData.conNo} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'conNo')}
                placeholder="Enter number only"
                disabled={!isPrimarySaved}
                className={getInputClassName('conNo', conNoValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Tapping Time </label>
              <CustomTimeInput
                value={tappingTime}
                onChange={setTappingTime}
                disabled={!isPrimarySaved}
                hasError={tappingTimeValid === false}
              />
            </div>

            <div className="section-header corrective-addition-header">
              <h3>Corrective Additions (Kgs) </h3>
            </div>
            <div className="process-form-group">
              <label>C</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionC = r} 
                type="number" 
                name="correctiveAdditionC" 
                step="0.01" 
                value={formData.correctiveAdditionC} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionC')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionC', corrCValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Si</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionSi = r} 
                type="number" 
                name="correctiveAdditionSi" 
                step="0.01" 
                value={formData.correctiveAdditionSi} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionSi')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionSi', corrSiValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Mn</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionMn = r} 
                type="number" 
                name="correctiveAdditionMn" 
                step="0.01" 
                value={formData.correctiveAdditionMn} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionMn')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionMn', corrMnValid)}
              />
            </div>

            <div className="process-form-group">
              <label>S</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionS = r} 
                type="number" 
                name="correctiveAdditionS" 
                step="0.01" 
                value={formData.correctiveAdditionS} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionS')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionS', corrSValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Cr</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionCr = r} 
                type="number" 
                name="correctiveAdditionCr" 
                step="0.01" 
                value={formData.correctiveAdditionCr} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionCr')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionCr', corrCrValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Cu</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionCu = r} 
                type="number" 
                name="correctiveAdditionCu" 
                step="0.01" 
                value={formData.correctiveAdditionCu} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionCu')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionCu', corrCuValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Sn</label>
              <input 
                ref={r => inputRefs.current.correctiveAdditionSn = r} 
                type="number" 
                name="correctiveAdditionSn" 
                step="0.01" 
                value={formData.correctiveAdditionSn} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'correctiveAdditionSn')}
                placeholder="Kgs"
                disabled={!isPrimarySaved}
                className={getInputClassName('correctiveAdditionSn', corrSnValid)}
              />
            </div>

            {/* Divider line */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className="process-form-group">
              <label>Tapping Wt (Kgs) </label>
              <input 
                ref={el => inputRefs.current.tappingWt = el} 
                type="number" 
                name="tappingWt" 
                step="0.01" 
                value={formData.tappingWt} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'tappingWt')}
                placeholder="Enter weight"
                disabled={!isPrimarySaved}
                className={getInputClassName('tappingWt', tappingWtValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Mg (Kgs)</label>
              <input 
                ref={el => inputRefs.current.mg = el} 
                type="number" 
                name="mg" 
                step="0.01" 
                value={formData.mg} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'mg')}
                placeholder="Enter Mg"
                disabled={!isPrimarySaved}
                className={getInputClassName('mg', mgValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Res. Mg. Convertor (%)</label>
              <input 
                ref={el => inputRefs.current.resMgConvertor = el} 
                type="number" 
                name="resMgConvertor" 
                step="0.01" 
                value={formData.resMgConvertor} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'resMgConvertor')}
                placeholder="Enter %"
                disabled={!isPrimarySaved}
                className={getInputClassName('resMgConvertor', resMgConvertorValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Rec. Of Mg (%)</label>
              <input 
                ref={el => inputRefs.current.recOfMg = el} 
                type="number" 
                name="recOfMg" 
                step="0.01" 
                value={formData.recOfMg} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'recOfMg')}
                placeholder="Enter %"
                disabled={!isPrimarySaved}
                className={getInputClassName('recOfMg', recOfMgValid)}
              />
            </div>

            <div className="process-form-group">
              <label>Stream Inoculant (gm/Sec) </label>
              <input 
                ref={el => inputRefs.current.streamInoculant = el}
                type="number"
                name="streamInoculant"
                value={formData.streamInoculant}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'streamInoculant')}
                step="0.1"
                placeholder="e.g., 5.5"
                disabled={!isPrimarySaved}
                className={getInputClassName('streamInoculant', streamInoculantValid)}
              />
            </div>

            <div className="process-form-group">
              <label>P.Time (sec)</label>
              <input 
                ref={el => inputRefs.current.pTime = el}
                type="number"
                name="pTime"
                value={formData.pTime}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'pTime')}
                step="0.1"
                placeholder="e.g., 120"
                disabled={!isPrimarySaved}
                className={getInputClassName('pTime', pTimeValid)}
              />
            </div>

            <div className="process-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Remarks </label>
              <textarea 
                ref={el => inputRefs.current.remarks = el} 
                name="remarks" 
                value={formData.remarks} 
                onChange={handleChange} 
                onKeyDown={e => handleKeyDown(e, 'remarks')}
                placeholder="Enter any additional notes..."
                maxLength={200}
                rows={3}
                disabled={!isPrimarySaved}
                className={getInputClassName('remarks', remarksValid)}
              />
            </div>
      </div>

      <div className="process-submit-container" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {/* Error message display near submit button */}
        {submitErrorMessage && (
          <span className="submit-error-message">
            {submitErrorMessage}
          </span>
        )}
        <ErrorAlert isVisible={showErrorAlert} message={alertMessage} />
        <SubmitButton
          ref={el => inputRefs.current.submitBtn = el}
          onClick={handleSubmit}
          disabled={submitLoading || !isPrimarySaved}
          type="button"
          onKeyDown={handleSubmitKeyDown}
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
    </>
  );
}