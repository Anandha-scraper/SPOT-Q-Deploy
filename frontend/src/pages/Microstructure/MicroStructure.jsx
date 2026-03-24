import { useState, useRef, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { DisaDropdown, SubmitButton, LockPrimaryButton } from '../../Components/Buttons';
import Sakthi from '../../Components/Sakthi';
import { InlineLoader } from '../../Components/Alert';
import { InfoIcon, InfoCard, useInfoModal } from '../../Components/Info';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/MicroStructure/MicroStructure.css';

const MicroStructure = () => {
  // Info modal hook
  const { isOpen, openModal, closeModal } = useInfoModal();

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
      pattern: 'e.g., Brake Disc'
    },
    {
      field: 'Date Code',
      required: true,
      type: 'Text',
      pattern: 'e.g., 3A15'
    },
    {
      field: 'Heat Code',
      required: true,
      type: 'Number',
      pattern: 'e.g., 20'
    },
    {
      field: 'Nodularity %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Graphite Type',
      required: true,
      type: 'Text'
    },
    {
      field: 'Count Min',
      required: true,
      type: 'Number',
      min: 0
    },
    {
      field: 'Count Max',
      required: true,
      type: 'Number',
      min: 0
    },
    {
      field: 'Size Min',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'μm'
    },
    {
      field: 'Size Max',
      required: true,
      type: 'Number',
      min: 0,
      unit: 'μm'
    },
    {
      field: 'Ferrite Min %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Ferrite Max %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Pearlite Min %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Pearlite Max %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Carbide Min %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Carbide Max %',
      required: true,
      type: 'Number',
      min: 0,
      max: 100,
      unit: '%'
    },
    {
      field: 'Remarks',
      required: true,
      type: 'Text'
    }
  ];

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
  const [showCombinationFound, setShowCombinationFound] = useState(false);
  const [showCombinationAdded, setShowCombinationAdded] = useState(false);
  const [showPrimaryWarning, setShowPrimaryWarning] = useState(false);
  const [highlightPrimaryFields, setHighlightPrimaryFields] = useState(false);

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
  const primarySectionRef = useRef(null);

  // Field order for Enter key navigation
  const fieldOrder = [
    'date', 'disa', 'partName', 'dateCode', 'heatCode', 'nodularity', 'graphiteType',
    'countMin', 'countMax', 'sizeMin', 'sizeMax', 'ferriteMin', 'ferriteMax',
    'pearliteMin', 'pearliteMax', 'carbideMin', 'carbideMax', 'remarks'
  ];

  // ====================== Effects ======================
  
  // Set current date and load previous DISA from database on mount
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    
    setDate(`${y}-${m}-${d}`);

    // Fetch last used DISA from database
    const fetchLastDisa = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.microStructure}/last-disa`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && data.lastDisa) {
          setDisa(data.lastDisa);
        }
      } catch (error) {
        console.error('Error fetching last DISA:', error);
      }
    };
    fetchLastDisa();
  }, []);
  
  // Check if date+disa combination exists in database
  useEffect(() => {
    const checkDateDisaExists = async () => {
      if (!date || !disa) {
        setIsPrimarySaved(false);
        setEntryCount(0);
        setSavePrimaryLoading(false);
        setShowCombinationFound(false);
        setShowCombinationAdded(false);
        return;
      }
      setCheckingPrimary(true);
      try {
        setSavePrimaryLoading(true);
        setShowCombinationFound(false);
        
        const startTime = Date.now();
        
        const response = await fetch(`${API_ENDPOINTS.microStructure}/check?date=${date}&disa=${encodeURIComponent(disa)}`, {
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
  }, [date, disa]);
  
  // Add click listeners to all disabled fields to show warning
  useEffect(() => {
    const handleDisabledClick = (e) => {
      const target = e.target;

      // Check if clicked element is a disabled input or select
      if ((target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') && target.disabled) {
        handleDisabledFieldClick(e);
        return;
      }

      // Check if clicked on a label that's associated with a disabled field
      if (target.tagName === 'LABEL') {
        let fieldDiv = target.closest('.microstructure-field');
        if (fieldDiv) {
          const input = fieldDiv.querySelector('input, select, textarea');
          if (input && input.disabled) {
            handleDisabledFieldClick(e);
            return;
          }
        }
      }

      // Check if clicked on microstructure-form-row (the main row container)
      if (target.classList && target.classList.contains('microstructure-form-row') && !isPrimarySaved) {
        handleDisabledFieldClick(e);
        return;
      }

      // Check if clicked on a field div that contains a disabled field
      let fieldDiv = null;
      if (target.classList && target.classList.contains('microstructure-field')) {
        fieldDiv = target;
      } else {
        fieldDiv = target.closest('.microstructure-field');
      }

      if (fieldDiv) {
        const input = fieldDiv.querySelector('input, select, textarea');
        if (input && input.disabled) {
          handleDisabledFieldClick(e);
          return;
        }
      }

      // Handle clicks on any child elements of a field div with disabled fields
      if (!isPrimarySaved) {
        const closestFieldDiv = target.closest('.microstructure-field');
        if (closestFieldDiv) {
          const input = closestFieldDiv.querySelector('input, select, textarea');
          if (input && input.disabled) {
            handleDisabledFieldClick(e);
            return;
          }
        }
      }
    };

    // Add event listener to document to catch all clicks
    document.addEventListener('mousedown', handleDisabledClick, true);

    return () => {
      document.removeEventListener('mousedown', handleDisabledClick, true);
    };
  }, [isPrimarySaved]);

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
    
    // Reset all form fields except date and disa
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
    
    // Reset all validation states
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
  };

  const handleDisaChange = (e) => {
    setDisa(e.target.value);
    setIsPrimarySaved(false);
    
    // Reset all form fields except date and disa
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
    
    // Reset all validation states
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
    // Validate required fields
    if (!date || !disa) {
      alert('Please fill in Date and DISA');
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
      const response = await fetch(`${API_ENDPOINTS.microStructure}/save-primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date, disa })
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

    // Validate Part Name
    if (!partName || !partName.trim()) {
      setPartNameValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'partName';
    } else {
      setPartNameValid(null);
    }

    // Validate Date Code
    if (!dateCode || !dateCode.trim()) {
      setDateCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'dateCode';
    } else {
      setDateCodeValid(null);
    }

    // Validate Heat Code
    if (!heatCode || !heatCode.trim()) {
      setHeatCodeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'heatCode';
    } else {
      setHeatCodeValid(null);
    }

    // Validate Nodularity % (0-100)
    if (!validatePercentage(nodularity)) {
      setNodularityValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'nodularity';
    } else {
      setNodularityValid(null);
    }

    // Validate Graphite Type
    if (!graphiteType || !graphiteType.trim()) {
      setGraphiteTypeValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'graphiteType';
    } else {
      setGraphiteTypeValid(null);
    }

    // Validate Count range
    const countRange = validateRange(countMin, countMax, false);
    if (!countRange.minValid) {
      setCountMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'countMin';
    } else {
      setCountMinValid(null);
    }
    if (!countRange.maxValid) {
      setCountMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'countMax';
    } else {
      setCountMaxValid(null);
    }

    // Validate Size range
    const sizeRange = validateRange(sizeMin, sizeMax, false);
    if (!sizeRange.minValid) {
      setSizeMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'sizeMin';
    } else {
      setSizeMinValid(null);
    }
    if (!sizeRange.maxValid) {
      setSizeMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'sizeMax';
    } else {
      setSizeMaxValid(null);
    }

    // Validate Ferrite % range (0-100)
    const ferriteRange = validateRange(ferriteMin, ferriteMax, true);
    if (!ferriteRange.minValid) {
      setFerriteMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ferriteMin';
    } else {
      setFerriteMinValid(null);
    }
    if (!ferriteRange.maxValid) {
      setFerriteMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ferriteMax';
    } else {
      setFerriteMaxValid(null);
    }

    // Validate Pearlite % range (0-100)
    const pearliteRange = validateRange(pearliteMin, pearliteMax, true);
    if (!pearliteRange.minValid) {
      setPearliteMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pearliteMin';
    } else {
      setPearliteMinValid(null);
    }
    if (!pearliteRange.maxValid) {
      setPearliteMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pearliteMax';
    } else {
      setPearliteMaxValid(null);
    }

    // Validate Carbide % range (0-100)
    const carbideRange = validateRange(carbideMin, carbideMax, true);
    if (!carbideRange.minValid) {
      setCarbideMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'carbideMin';
    } else {
      setCarbideMinValid(null);
    }
    if (!carbideRange.maxValid) {
      setCarbideMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'carbideMax';
    } else {
      setCarbideMaxValid(null);
    }

    // Validate Remarks
    if (!remarks || !remarks.trim()) {
      setRemarksValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'remarks';
    } else {
      setRemarksValid(null);
    }

    if (hasErrors) {
      setSubmitErrorMessage('Enter data in correct format');
      
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

      const response = await fetch(`${API_ENDPOINTS.microStructure}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {date ? formatDisplayDate(date) : '-'}
        </div>
      </div>

      {/* Info Modal */}
      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="Micro Structure - Validation Ranges & Data Entry Flow"
        validationRanges={validationRanges}
      />

      <div ref={primarySectionRef}>
        <h3 className="microstructure-section-heading">
          Primary Data {isPrimarySaved && <span style={{ fontWeight: 400, fontSize: '0.875rem', color: '#5B9AA9' }}>(Entries: {entryCount})</span>}
        </h3>

        <div className="microstructure-form-row" style={{ flexWrap: 'wrap' }}>
          <div className="microstructure-field" style={{ maxWidth: '10%', position: 'relative', zIndex: 100 }}>
            <label>Ins. Date</label>
            <CustomDatePicker
              ref={el => inputRefs.current.date = el}
              value={date}
              onChange={handleDateChange}
              onKeyDown={e => handleKeyDown(e, 'date')}
              max={getCurrentDate()}
              name="date"
              style={{
                border: highlightPrimaryFields ? '2px solid #ef4444' : '2px solid #cbd5e1',
                width: '100%',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: highlightPrimaryFields ? '#fee2e2' : '#fff',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          <div className="microstructure-field" style={{ maxWidth: '5%' }}>
            <label>DISA</label>
            <DisaDropdown
              ref={el => inputRefs.current.disa = el}
              value={disa}
              onChange={handleDisaChange}
              onKeyDown={e => handleKeyDown(e, 'disa')}
              name="disa"
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
          <div className="microstructure-field" style={{ maxWidth: '25%' }}>
            <label>&nbsp;</label>
            <LockPrimaryButton
              onClick={handlePrimarySubmit}
              disabled={savePrimaryLoading || showCombinationFound || showCombinationAdded || !date || !disa || isPrimarySaved}
              isLocked={isPrimarySaved}
            />
          </div>
        </div>
      </div>

      <div className="microstructure-divider"></div>

      <div className="microstructure-form-row" style={{ flexWrap: 'wrap' }}>
        <div className="microstructure-field" style={{ maxWidth: '20%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '10%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '10%' }}>
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
      </div>

      <div className="microstructure-divider"></div>

      <div className="microstructure-section-header">
        <h3>Micro Structure : </h3>
      </div>

      <div className="microstructure-form-row" style={{ flexWrap: 'wrap' }}>
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
        <div className="microstructure-field" style={{ maxWidth: '14%', minWidth: '12%' }}>
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
      </div>

      <div className="microstructure-divider"></div>

      <div className="microstructure-form-row" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="microstructure-field" style={{ minWidth: '30%', maxWidth: '50%' }}>
          <label>Remarks *</label>
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
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {submitErrorMessage && (
            <div>
              <InlineLoader 
                message={submitErrorMessage} 
                size="medium" 
                variant="danger" 
              />
            </div>
          )}
          <div>
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
        </div>
      </div>
    </>
  );
};

export default MicroStructure;
