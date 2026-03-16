import React, { useState, useRef, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { SubmitButton, LockPrimaryButton, DisaDropdown, CustomTimeInput, Time } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { InfoIcon, InfoCard, useInfoModal } from '../../Components/Info';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Process/Process.css';

export default function ProcessControl() {
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
      field: 'DISA',
      required: true,
      type: 'Select',
      allowedValues: ['DISA 1', 'DISA 2', 'DISA 3', 'DISA 4']
    },
    {
      field: 'Part Name',
      required: true,
      type: 'Text',
      pattern: 'e.g., ABC-123'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: 'e.g., 6F25'
    },
    {
      field: 'Heat Code',
      required: true,
      type: 'Number'
    },
    {
      field: 'Qty. Of Moulds',
      required: true,
      type: 'Number',
      min: 1
    },
    {
      field: 'Metal Composition - C',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - Si',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - Mn',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - P',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - S',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - Mg F/L',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - Cu',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Metal Composition - Cr',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Time of Pouring (Range)',
      required: true,
      type: 'Time Range',
      pattern: 'HH:MM - HH:MM'
    },
    {
      field: 'Pouring Temp',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: '°C',
      pattern: 'Min - Max (e.g., 1400 - 1500)'
    },
    {
      field: 'PP Code',
      required: true,
      type: 'Integer'
    },
    {
      field: 'Treatment No',
      required: true,
      type: 'Integer'
    },
    {
      field: 'F/C No.',
      required: true,
      type: 'Select',
      allowedValues: ['I', 'II', 'III', 'IV', 'V', 'VI']
    },
    {
      field: 'Heat No',
      required: true,
      type: 'Text'
    },
    {
      field: 'Con No',
      required: false,
      type: 'Number'
    },
    {
      field: 'Tapping Time',
      required: false,
      type: 'Time',
      pattern: 'HH:MM'
    },
    {
      field: 'Corrective Addition - C',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - Si',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - Mn',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - S',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - Cr',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - Cu',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Corrective Addition - Sn',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Tapping Wt',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Mg',
      required: false,
      type: 'Number',
      min: 0,
      unit: 'Kgs'
    },
    {
      field: 'Res. Mg. Convertor',
      required: false,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Rec. Of Mg',
      required: false,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Stream Inoculant',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'gm/Sec',
      pattern: 'e.g., 5.5'
    },
    {
      field: 'P.Time',
      required: false,
      type: 'Number',
      min: 0,
      unit: 'sec',
      pattern: 'e.g., 120'
    },
    {
      field: 'Remarks',
      required: true,
      type: 'Text'
    }
  ];

  const [formData, setFormData] = useState({
    date: '', disa: '', partName: '', datecode: '', heatcode: '', quantityOfMoulds: '', metalCompositionC: '', metalCompositionSi: '',
    metalCompositionMn: '', metalCompositionP: '', metalCompositionS: '', metalCompositionMgFL: '',
    metalCompositionCr: '', metalCompositionCu: '', 
    pouringTemperatureMin: '',
    pouringTemperatureMax: '',
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
  const primarySectionRef = useRef(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isPrimarySaved, setIsPrimarySaved] = useState(false);
  const [savePrimaryLoading, setSavePrimaryLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [showSakthi, setShowSakthi] = useState(false);
  const [showCombinationFound, setShowCombinationFound] = useState(false);
  const [showCombinationAdded, setShowCombinationAdded] = useState(false);
  const [showPrimaryWarning, setShowPrimaryWarning] = useState(false);
  const [highlightPrimaryFields, setHighlightPrimaryFields] = useState(false);

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

  // Set current date and load previous DISA on mount as default
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
        setSavePrimaryLoading(false);
        setShowCombinationFound(false);
        setShowCombinationAdded(false);
        return;
      }

      try {
        setSavePrimaryLoading(true);
        setShowCombinationFound(false);
        
        const startTime = Date.now();
        
        const response = await fetch(`${API_ENDPOINTS.process}/check?date=${formData.date}&disa=${encodeURIComponent(formData.disa)}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        
        // Ensure minimum 1 second loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsedTime);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        setSavePrimaryLoading(false);
        
        if (data.success && data.exists) {
          setShowCombinationFound(true);
          
          // Hide "Combination found" message after 1.5 seconds
          setTimeout(() => {
            setShowCombinationFound(false);
            setIsPrimarySaved(true);
            setEntryCount(data.count || 0);
          }, 1500);
        } else {
          // Combination not found, just update states
          setIsPrimarySaved(false);
          setEntryCount(0);
        }
      } catch (error) {
        console.error('Error checking date+disa:', error);
        setSavePrimaryLoading(false);
      }
    };

    checkDateDisaExists();
  }, [formData.date, formData.disa]);

  // Reset pouring time validation when time values change (validation only happens on submit)
  useEffect(() => {
    // Only reset to neutral, never set to invalid during input
    setPouringTimeValid(null);
    setSubmitErrorMessage('');
  }, [pouringFromTime, pouringToTime]);

  // Validate tapping time when time value changes
  useEffect(() => {
    if (tappingTime) {
      setTappingTimeValid(null);
    } else {
      setTappingTimeValid(null);
    }
  }, [tappingTime]);

  // Add click listeners to all disabled fields to show warning
  useEffect(() => {
    const handleDisabledClick = (e) => {
      const target = e.target;
      
      // Check if clicked element is a disabled input or select
      if ((target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') && target.disabled) {
        handleDisabledFieldClick(e);
        return;
      }
      
      // Check if clicked on process-form-grid (the main grid container)
      if (target.classList && target.classList.contains('process-form-grid') && !isPrimarySaved) {
        handleDisabledFieldClick(e);
        return;
      }
      
      // Check if clicked on a form-group div that contains a disabled field
      let formGroup = null;
      if (target.classList && target.classList.contains('process-form-group')) {
        formGroup = target;
      } else {
        formGroup = target.closest('.process-form-group');
      }
      
      if (formGroup) {
        const input = formGroup.querySelector('input, select, textarea');
        if (input && input.disabled) {
          handleDisabledFieldClick(e);
          return;
        }
      }
    };

    // Add event listener to document to catch all clicks
    document.addEventListener('mousedown', handleDisabledClick, true);

    return () => {
      document.removeEventListener('mousedown', handleDisabledClick, true);
    };
  }, [isPrimarySaved]);

  const fieldOrder = ['date', 'disa', 'partName', 'datecode', 'heatcode', 'quantityOfMoulds', 'metalCompositionC', 'metalCompositionSi',
    'metalCompositionMn', 'metalCompositionP', 'metalCompositionS', 'metalCompositionMgFL', 'metalCompositionCu',
    'metalCompositionCr', 'pouringTemperatureMin', 'pouringTemperatureMax', 'ppCode', 'treatmentNo', 'fcNo', 'heatNo', 'conNo', 'tappingTime',
    'correctiveAdditionC', 'correctiveAdditionSi', 'correctiveAdditionMn', 'correctiveAdditionS',
    'correctiveAdditionCr', 'correctiveAdditionCu', 'correctiveAdditionSn', 'tappingWt', 'mg', 'resMgConvertor',
    'recOfMg', 'streamInoculant', 'pTime', 'remarks'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'date':
      case 'disa':
        // Reset primary saved state when date or disa changes
        setIsPrimarySaved(false);
        
        // Clear all form fields except date and disa
        setFormData(prev => ({
          date: name === 'date' ? value : prev.date,
          disa: name === 'disa' ? value : prev.disa,
          partName: '', datecode: '', heatcode: '', quantityOfMoulds: '',
          metalCompositionC: '', metalCompositionSi: '', metalCompositionMn: '',
          metalCompositionP: '', metalCompositionS: '', metalCompositionMgFL: '',
          metalCompositionCr: '', metalCompositionCu: '',
          pouringTemperatureMin: '', pouringTemperatureMax: '', ppCode: '', treatmentNo: '', fcNo: '',
          heatNo: '', conNo: '', correctiveAdditionC: '', correctiveAdditionSi: '',
          correctiveAdditionMn: '', correctiveAdditionS: '', correctiveAdditionCr: '',
          correctiveAdditionCu: '', correctiveAdditionSn: '', tappingWt: '',
          mg: '', resMgConvertor: '', recOfMg: '', streamInoculant: '',
          pTime: '', remarks: ''
        }));
        
        // Reset all time fields
        setPouringFromTime(null);
        setPouringToTime(null);
        setTappingTime(null);
        
        // Reset all validation states
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
        setPouringTempValid(null);
        setPouringTimeValid(null);
        setPpCodeValid(null);
        setTreatmentNoValid(null);
        setFcNoValid(null);
        setHeatNoValid(null);
        setConNoValid(null);
        setCorrCValid(null);
        setCorrSiValid(null);
        setCorrMnValid(null);
        setCorrSValid(null);
        setCorrCrValid(null);
        setCorrCuValid(null);
        setCorrSnValid(null);
        setTappingWtValid(null);
        setTappingTimeValid(null);
        setMgValid(null);
        setResMgConvertorValid(null);
        setRecOfMgValid(null);
        setStreamInoculantValid(null);
        setPTimeValid(null);
        setRemarksValid(null);
        setSubmitErrorMessage('');
        return;
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
      case 'pouringTemperatureMin':
      case 'pouringTemperatureMax':
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

    // Handle PP Code and Treatment No - only allow integers (no decimals)
    if (name === 'ppCode' || name === 'treatmentNo') {
      // Remove any non-digit characters (including decimal points)
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData({...formData, [name]: sanitizedValue});
      return;
    }

    setFormData({...formData, [name]: value});
  };
  
  // Handle blur event for PP Code and Treatment No to add leading zero
  const handleIntegerBlur = (fieldName) => {
    const value = formData[fieldName];
    if (value && value.length === 1) {
      // Add leading zero if single digit
      setFormData(prev => ({...prev, [fieldName]: '0' + value}));
    }
  };
  
  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = fieldOrder.indexOf(field);
      
      // Special case: from Cr field to Pouring From Time
      if (field === 'metalCompositionCr') {
        inputRefs.current.pouringFromTime?.focus();
        return;
      }
      
      // Special case: from conNo to tappingTime
      if (field === 'conNo') {
        inputRefs.current.tappingTime?.focus();
        return;
      }
      
      // If on remarks field (last field), move to submit button
      if (field === 'remarks') {
        inputRefs.current.submitBtn?.focus();
      } else if (idx < fieldOrder.length - 1) {
        inputRefs.current[fieldOrder[idx + 1]]?.focus();
      }
    }
  };

  const handleDisabledFieldClick = (e) => {
    if (!isPrimarySaved) {
      e.preventDefault();
      e.stopPropagation();
      
      // Show warning
      setShowPrimaryWarning(true);
      setHighlightPrimaryFields(true);
      
      // Scroll to primary section
      if (primarySectionRef.current) {
        primarySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Hide warning and remove highlight after 3 seconds
      setTimeout(() => {
        setShowPrimaryWarning(false);
        setHighlightPrimaryFields(false);
      }, 3000);
    }
  };

  const handlePrimarySubmit = async () => {
    // Validate required fields
    if (!formData.date || !formData.disa) {
      alert('Please fill in Date and DISA');
      
      // Auto-focus on the first empty field
      if (!formData.date) {
        inputRefs.current.date?.focus();
      } else if (!formData.disa) {
        inputRefs.current.disa?.focus();
      }
      
      return;
    }

    // If already processing, don't submit again
    if (savePrimaryLoading || showCombinationFound || showCombinationAdded) {
      return;
    }

    try {
      setSavePrimaryLoading(true);
      
      const startTime = Date.now();
      
      // Call save-primary API to save date+disa and get entry count
      const response = await fetch(`${API_ENDPOINTS.process}/save-primary`, {
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

      const rawResponse = await response.text();
      let data = null;
      if (rawResponse) {
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          throw new Error('Invalid server response');
        }
      } else {
        data = { success: false, message: 'Empty response from server' };
      }
      
      // Ensure minimum 1 second for consistent UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setSavePrimaryLoading(false);
      
      if (data.success) {
        setShowCombinationAdded(true);
        
        // Hide "Combination Added" message after 1 second
        setTimeout(() => {
          setShowCombinationAdded(false);
          setIsPrimarySaved(true);
          setEntryCount(data.count || 0);
          // Focus on Part Name field after primary is saved
          setTimeout(() => {
            inputRefs.current.partName?.focus();
          }, 100);
        }, 1000);
      } else {
        alert('Failed to save primary: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving primary:', error);
      setSavePrimaryLoading(false);
      alert('Failed to save primary: ' + error.message);
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

    const datecodePattern = /^[0-9][A-Z][0-9]{2}$/;
    const numericPattern = /^\d+$/;

    // Example validation with auto-navigation tracking:
    // 1. Check if field is invalid
    // 2. Set validation state to false (red border)
    // 3. Mark hasErrors flag
    // 4. Save field name in firstErrorField ONLY if it's the first error
    if (!formData.partName || !formData.partName.trim()) {
      setPartNameValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'partName'; // Only set if this is the FIRST error
    } else {
      setPartNameValid(null);
    }

    if (!formData.datecode || !formData.datecode.trim() || !datecodePattern.test(formData.datecode)) {
      setDatecodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'datecode';
    } else {
      setDatecodeValid(null);
    }

    if (!formData.heatcode || !formData.heatcode.trim() || !numericPattern.test(formData.heatcode)) {
      setHeatcodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'heatcode';
    } else {
      setHeatcodeValid(null);
    }

    if (!formData.quantityOfMoulds || formData.quantityOfMoulds.trim() === '' || isNaN(formData.quantityOfMoulds) || parseFloat(formData.quantityOfMoulds) < 0) {
      setQuantityOfMouldsValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'quantityOfMoulds';
    } else {
      setQuantityOfMouldsValid(null);
    }

    if (!formData.metalCompositionC || formData.metalCompositionC.trim() === '' || isNaN(formData.metalCompositionC) || parseFloat(formData.metalCompositionC) < 0 || parseFloat(formData.metalCompositionC) > 100) {
      setMetalCValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionC';
    } else {
      setMetalCValid(null);
    }

    if (!formData.metalCompositionSi || formData.metalCompositionSi.trim() === '' || isNaN(formData.metalCompositionSi) || parseFloat(formData.metalCompositionSi) < 0 || parseFloat(formData.metalCompositionSi) > 100) {
      setMetalSiValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionSi';
    } else {
      setMetalSiValid(null);          
    }

    if (!formData.metalCompositionMn || formData.metalCompositionMn.trim() === '' || isNaN(formData.metalCompositionMn) || parseFloat(formData.metalCompositionMn) < 0 || parseFloat(formData.metalCompositionMn) > 100) {
      setMetalMnValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionMn';
    } else {
      setMetalMnValid(null);
    }

    if (!formData.metalCompositionP || formData.metalCompositionP.trim() === '' || isNaN(formData.metalCompositionP) || parseFloat(formData.metalCompositionP) < 0 || parseFloat(formData.metalCompositionP) > 100) {
      setMetalPValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionP';
    } else {
      setMetalPValid(null);
    }

    if (!formData.metalCompositionS || formData.metalCompositionS.trim() === '' || isNaN(formData.metalCompositionS) || parseFloat(formData.metalCompositionS) < 0 || parseFloat(formData.metalCompositionS) > 100) {
      setMetalSValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionS';
    } else {
      setMetalSValid(null);
    }

    if (!formData.metalCompositionMgFL || formData.metalCompositionMgFL.trim() === '' || isNaN(formData.metalCompositionMgFL) || parseFloat(formData.metalCompositionMgFL) < 0 || parseFloat(formData.metalCompositionMgFL) > 100) {
      setMetalMgFLValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionMgFL';
    } else {
      setMetalMgFLValid(null);
    }

    if (!formData.metalCompositionCu || formData.metalCompositionCu.trim() === '' || isNaN(formData.metalCompositionCu) || parseFloat(formData.metalCompositionCu) < 0 || parseFloat(formData.metalCompositionCu) > 100) {
      setMetalCuValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionCu';
    } else {
      setMetalCuValid(null);
    }

    if (!formData.metalCompositionCr || formData.metalCompositionCr.trim() === '' || isNaN(formData.metalCompositionCr) || parseFloat(formData.metalCompositionCr) < 0 || parseFloat(formData.metalCompositionCr) > 100) {
      setMetalCrValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'metalCompositionCr';
    } else {
      setMetalCrValid(null);
    }

    if (!formData.ppCode || !formData.ppCode.trim() || !numericPattern.test(formData.ppCode)) {
      setPpCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ppCode';
    } else {
      setPpCodeValid(null);
    }

    if (!formData.treatmentNo || !formData.treatmentNo.trim() || !numericPattern.test(formData.treatmentNo)) {
      setTreatmentNoValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'treatmentNo';
    } else {
      setTreatmentNoValid(null);
    }

    if (!formData.fcNo || !formData.fcNo.trim()) {
      setFcNoValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'fcNo';
    } else {
      setFcNoValid(null);
    }

    if (!formData.heatNo || !formData.heatNo.trim()) {
      setHeatNoValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'heatNo';
    } else {
      setHeatNoValid(null);
    }

    if (!formData.conNo || formData.conNo.trim() === '' || isNaN(formData.conNo) || parseFloat(formData.conNo) < 0) {
      setConNoValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'conNo';
    } else {
      setConNoValid(null);
    }

    // Validate Pouring Temperature Min and Max
    const tempMin = formData.pouringTemperatureMin ? parseFloat(formData.pouringTemperatureMin) : null;
    const tempMax = formData.pouringTemperatureMax ? parseFloat(formData.pouringTemperatureMax) : null;
    
    if (!formData.pouringTemperatureMin || isNaN(tempMin) || tempMin < 0) {
      setPouringTempValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pouringTemperatureMin';
    } else if (formData.pouringTemperatureMax === '' || isNaN(tempMax)) {
      setPouringTempValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pouringTemperatureMax';
    } else if (tempMax < 0) {
      setPouringTempValid(false);
      setSubmitErrorMessage('Pouring Temp: Max cannot be negative');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pouringTemperatureMax';
    } else if (tempMax !== 0 && tempMin >= tempMax) {
      setPouringTempValid(false);
      setSubmitErrorMessage('Pouring Temp: Min must be less than Max');
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pouringTemperatureMin';
    } else {
      setPouringTempValid(null);
    }

    if (!pouringFromTime || !pouringToTime) {
      setPouringTimeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pouringFromTime';
    } else {
      // Convert Time objects to minutes for comparison
      const fromMinutes = pouringFromTime.hour * 60 + pouringFromTime.minute;
      const toMinutes = pouringToTime.hour * 60 + pouringToTime.minute;
      
      // Check if from time is greater than to time
      if (fromMinutes >= toMinutes) {
        setPouringTimeValid(false);
        setSubmitErrorMessage('Time of Pouring: Start time must be less than end time');
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'pouringFromTime';
      } 
      // Check if difference is more than 1 hour (60 minutes)
      else if ((toMinutes - fromMinutes) > 60) {
        setPouringTimeValid(false);
        setSubmitErrorMessage('Time of Pouring: Maximum allowed difference is 1 hour');
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'pouringFromTime';
      } else {
        setPouringTimeValid(null);
      }
    }

    if (!tappingTime) {
      setTappingTimeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'tappingTime';
    } else {
      setTappingTimeValid(null);
    }

    if (!formData.correctiveAdditionC || formData.correctiveAdditionC.trim() === '' || isNaN(formData.correctiveAdditionC) || parseFloat(formData.correctiveAdditionC) < 0) {
      setCorrCValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionC';
    } else {
      setCorrCValid(null);
    }

    if (!formData.correctiveAdditionSi || formData.correctiveAdditionSi.trim() === '' || isNaN(formData.correctiveAdditionSi) || parseFloat(formData.correctiveAdditionSi) < 0) {
      setCorrSiValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionSi';
    } else {
      setCorrSiValid(null);
    }

    if (!formData.correctiveAdditionMn || formData.correctiveAdditionMn.trim() === '' || isNaN(formData.correctiveAdditionMn) || parseFloat(formData.correctiveAdditionMn) < 0) {
      setCorrMnValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionMn';
    } else {
      setCorrMnValid(null);
    }

    if (!formData.correctiveAdditionS || formData.correctiveAdditionS.trim() === '' || isNaN(formData.correctiveAdditionS) || parseFloat(formData.correctiveAdditionS) < 0) {
      setCorrSValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionS';
    } else {
      setCorrSValid(null);
    }

    if (!formData.correctiveAdditionCr || formData.correctiveAdditionCr.trim() === '' || isNaN(formData.correctiveAdditionCr) || parseFloat(formData.correctiveAdditionCr) < 0) {
      setCorrCrValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionCr';
    } else {
      setCorrCrValid(null);
    }

    if (!formData.correctiveAdditionCu || formData.correctiveAdditionCu.trim() === '' || isNaN(formData.correctiveAdditionCu) || parseFloat(formData.correctiveAdditionCu) < 0) {
      setCorrCuValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionCu';
    } else {
      setCorrCuValid(null);
    }

    if (!formData.correctiveAdditionSn || formData.correctiveAdditionSn.trim() === '' || isNaN(formData.correctiveAdditionSn) || parseFloat(formData.correctiveAdditionSn) < 0) {
      setCorrSnValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'correctiveAdditionSn';
    } else {
      setCorrSnValid(null);
    }

    if (!formData.tappingWt || isNaN(formData.tappingWt) || parseFloat(formData.tappingWt) <= 0) {
      setTappingWtValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'tappingWt';
    } else {
      setTappingWtValid(null);
    }

    if (!formData.mg || formData.mg.trim() === '' || isNaN(formData.mg) || parseFloat(formData.mg) < 0) {
      setMgValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'mg';
    } else {
      setMgValid(null);
    }

    if (!formData.resMgConvertor || formData.resMgConvertor.trim() === '' || isNaN(formData.resMgConvertor) || parseFloat(formData.resMgConvertor) < 0) {
      setResMgConvertorValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'resMgConvertor';
    } else {
      setResMgConvertorValid(null);
    }

    if (!formData.recOfMg || formData.recOfMg.trim() === '' || isNaN(formData.recOfMg) || parseFloat(formData.recOfMg) < 0) {
      setRecOfMgValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'recOfMg';
    } else {
      setRecOfMgValid(null);
    }

    if (!formData.streamInoculant || isNaN(formData.streamInoculant) || parseFloat(formData.streamInoculant) < 0) {
      setStreamInoculantValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'streamInoculant';
    } else {
      setStreamInoculantValid(null);
    }

    if (!formData.pTime || formData.pTime.trim() === '' || isNaN(formData.pTime) || parseFloat(formData.pTime) < 0) {
      setPTimeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pTime';
    } else {
      setPTimeValid(null);
    }

    if (!formData.remarks || !formData.remarks.trim()) {
      setRemarksValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'remarks';
    } else {
      setRemarksValid(null);
    }

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
      const response = await fetch(`${API_ENDPOINTS.process}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const rawResponse = await response.text();
      let data = null;
      if (rawResponse) {
        try {
          data = JSON.parse(rawResponse);
        } catch (parseError) {
          throw new Error('Invalid server response');
        }
      } else {
        data = { success: false, message: 'Empty response from server' };
      }

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
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? (() => {
            const [y, m, d] = formData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      {/* Info Modal */}
      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="Process Control - Validation Ranges & Data Entry Flow"
        validationRanges={validationRanges}
      />

      <div className="process-form-grid">
            {/* Primary Data Section */}
            <div ref={primarySectionRef} className="section-header primary-data-header">
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
                  border: highlightPrimaryFields ? '2px solid #ef4444' : '2px solid #cbd5e1',
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: highlightPrimaryFields ? '#fee2e2' : '#fff',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div className="process-form-group" style={{ minHeight: 'auto' }}>
              <label>DISA </label>
              <DisaDropdown
                ref={el => inputRefs.current.disa = el}
                name="disa"
                value={formData.disa}
                onChange={handleChange}
                onKeyDown={e => handleKeyDown(e, 'disa')}
                style={{
                  border: highlightPrimaryFields ? '2px solid #ef4444' : undefined,
                  backgroundColor: highlightPrimaryFields ? '#fee2e2' : undefined,
                  transition: 'all 0.3s ease'
                }}
              />
              {(savePrimaryLoading || showCombinationFound || showCombinationAdded || showPrimaryWarning) && (
                <div style={{ 
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  {savePrimaryLoading && (
                    <InlineLoader 
                      message="Fetching Date, Disa" 
                      size="medium" 
                      variant="primary" 
                    />
                  )}
                  {showCombinationFound && (
                    <InlineLoader 
                      message="Combination found" 
                      size="medium" 
                      variant="success" 
                    />
                  )}
                  {showCombinationAdded && (
                    <InlineLoader 
                      message="Combination Added" 
                      size="medium" 
                      variant="success" 
                    />
                  )}
                  {showPrimaryWarning && (
                    <InlineLoader 
                      message="Save Date, Disa" 
                      size="medium" 
                      variant="danger" 
                    />
                  )}
                </div>
              )}
            </div>

            <div className="process-form-group">
              <label>&nbsp;</label>
              <LockPrimaryButton
                onClick={handlePrimarySubmit}
                disabled={savePrimaryLoading || showCombinationFound || showCombinationAdded || !formData.date || !formData.disa || isPrimarySaved}
                isLocked={isPrimarySaved}
              />
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
              <label>Qty. Of Moulds </label>
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

            <div className="section-header metal-composition-header" style={{ gridColumn: '1 / -1' }}>
              <h3>Metal Composition (%) </h3>
            </div>
            <div className="metal-composition-row" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
            </div>

            {/* Divider line */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className="process-form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Time of Pouring (Range) </label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <label>From Time</label>
                  <CustomTimeInput
                    ref={el => inputRefs.current.pouringFromTime = el}
                    value={pouringFromTime}
                    onChange={setPouringFromTime}
                    disabled={!isPrimarySaved}
                    hasError={pouringTimeValid === false}
                  />
                </div>
                <div>
                  <label>To Time</label>
                  <CustomTimeInput
                    ref={el => inputRefs.current.pouringToTime = el}
                    value={pouringToTime}
                    onChange={setPouringToTime}
                    disabled={!isPrimarySaved}
                    hasError={pouringTimeValid === false}
                  />
                </div>
              </div>
            </div>

            <div className="pouring-details-row" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="process-form-group" style={{ flex: '1', minWidth: '280px' }}>
                <label>Pouring Temp (°C) </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    ref={el => inputRefs.current.pouringTemperatureMin = el} 
                    type="number" 
                    name="pouringTemperatureMin" 
                    step="0.01" 
                    value={formData.pouringTemperatureMin} 
                    onChange={handleChange} 
                    onKeyDown={e => handleKeyDown(e, 'pouringTemperatureMin')}
                    placeholder="Min"
                    disabled={!isPrimarySaved}
                    className={getInputClassName('pouringTemperatureMin', pouringTempValid)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontWeight: '600', color: '#64748b' }}>-</span>
                  <input 
                    ref={el => inputRefs.current.pouringTemperatureMax = el} 
                    type="number" 
                    name="pouringTemperatureMax" 
                    step="0.01" 
                    value={formData.pouringTemperatureMax} 
                    onChange={handleChange} 
                    onKeyDown={e => handleKeyDown(e, 'pouringTemperatureMax')}
                    placeholder="Max"
                    disabled={!isPrimarySaved}
                    className={getInputClassName('pouringTemperatureMax', pouringTempValid)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
                <label>PP Code </label>
                <input 
                  ref={el => inputRefs.current.ppCode = el} 
                  type="text" 
                  name="ppCode" 
                  value={formData.ppCode} 
                  onChange={handleChange} 
                  onBlur={() => handleIntegerBlur('ppCode')}
                  onKeyDown={e => handleKeyDown(e, 'ppCode')}
                  placeholder="Enter number only"
                  disabled={!isPrimarySaved}
                  className={getInputClassName('ppCode', ppCodeValid)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
                <label>Treatment No </label>
                <input 
                  ref={el => inputRefs.current.treatmentNo = el} 
                  type="text" 
                  name="treatmentNo" 
                  value={formData.treatmentNo} 
                  onChange={handleChange} 
                  onBlur={() => handleIntegerBlur('treatmentNo')}
                  onKeyDown={e => handleKeyDown(e, 'treatmentNo')}
                  placeholder="Enter number only"
                  disabled={!isPrimarySaved}
                  className={getInputClassName('treatmentNo', treatmentNoValid)}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '130px' }}>
                <label>Tapping Time </label>
                <CustomTimeInput
                  ref={el => inputRefs.current.tappingTime = el}
                  value={tappingTime}
                  onChange={setTappingTime}
                  disabled={!isPrimarySaved}
                  hasError={tappingTimeValid === false}
                />
              </div>
            </div>

            <div className="section-header corrective-addition-header" style={{ gridColumn: '1 / -1' }}>
              <h3>Corrective Additions (Kgs) </h3>
            </div>
            <div className="corrective-additions-row" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '100px' }}>
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
            </div>

            {/* Divider line */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem', paddingTop: '1rem', borderTop: '2px solid #e2e8f0' }}></div>

            <div className="additional-fields-row" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
              <div className="process-form-group" style={{ flex: '1', minWidth: '150px' }}>
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
          <InlineLoader 
            message={submitErrorMessage}
            variant="danger"
            size="medium"
          />
        )}
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