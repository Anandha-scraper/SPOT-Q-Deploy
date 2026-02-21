import React, { useState, useRef } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { SubmitButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { InlineLoader } from '../../Components/Alert';
import Sakthi from '../../Components/Sakthi';
import { useInfoModal, InfoIcon, InfoCard } from '../../Components/Info';
import '../../styles/PageStyles/QcProduction/QcProductionDetails.css';

const QcProductionDetails = () => {
  // Info modal hook
  const { isOpen, openModal, closeModal } = useInfoModal();

  // ====================== Validation Ranges ======================
  const validationRanges = [
    {
      field: 'Date',
      required: true,
      type: 'Date',
      pattern: 'DD/MM/YYYY',
      description: 'Select a valid date for QC production entry. Cannot be in the future.'
    },
    {
      field: 'Part Name',
      required: true,
      type: 'Text',
      maxLength: 100,
      pattern: 'e.g., Brake Disc',
      description: 'Enter the name of the part being produced'
    },
    {
      field: 'No. of Moulds',
      required: true,
      type: 'Number',
      min: 1,
      description: 'Enter the number of moulds produced'
    },
    {
      field: 'C % (Carbon)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Carbon percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Si % (Silicon)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Silicon percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Mn % (Manganese)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Manganese percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'P % (Phosphorus)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Phosphorus percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'S % (Sulfur)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Sulfur percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Mg % (Magnesium)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Magnesium percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Cu % (Copper)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Copper percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Cr % (Chromium)',
      required: true,
      type: 'Number Range',
      min: 0,
      max: 100,
      unit: '%',
      description: 'Chromium percentage - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Nodularity',
      required: true,
      type: 'Number Range',
      min: 0,
      description: 'Nodularity value - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Graphite Type',
      required: true,
      type: 'Number Range',
      min: 0,
      description: 'Graphite type value - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Pearlite Ferrite',
      required: true,
      type: 'Number Range',
      min: 0,
      description: 'Pearlite Ferrite value - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'Hardness BHN',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'BHN',
      description: 'Brinell Hardness Number - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'TS (Tensile Strength)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'MPa',
      description: 'Tensile Strength in MPa - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'YS (Yield Strength)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: 'MPa',
      description: 'Yield Strength in MPa - Enter Min and Max values. If only one value, set Max to 0.'
    },
    {
      field: 'EL (Elongation)',
      required: true,
      type: 'Number Range',
      min: 0,
      unit: '%',
      description: 'Elongation percentage - Enter Min and Max values. If only one value, set Max to 0.'
    }
  ];

  // Helper: display DD/MM/YYYY
  const formatDisplayDate = (iso) => {
    if (!iso || typeof iso !== 'string' || !iso.includes('-')) return '';
    const [y, m, d] = iso.split('-');
    return `${d} / ${m} / ${y}`;
  };

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    partName: '',
    noOfMoulds: '',
    cPercentMin: '',
    cPercentMax: '',
    siPercentMin: '',
    siPercentMax: '',
    mnPercentMin: '',
    mnPercentMax: '',
    pPercentMin: '',
    pPercentMax: '',
    sPercentMin: '',
    sPercentMax: '',
    mgPercentMin: '',
    mgPercentMax: '',
    cuPercentMin: '',
    cuPercentMax: '',
    crPercentMin: '',
    crPercentMax: '',
    nodularityMin: '',
    nodularityMax: '',
    graphiteTypeMin: '',
    graphiteTypeMax: '',
    pearliteFertiteMin: '',
    pearliteFertiteMax: '',
    hardnessBHNMin: '',
    hardnessBHNMax: '',
    tsMin: '',
    tsMax: '',
    ysMin: '',
    ysMax: '',
    elMin: '',
    elMax: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [showSakthi, setShowSakthi] = useState(false);

  /* 
   * VALIDATION STATES
   * null = neutral/default (no border color)
   * false = invalid (red border) - shown after submit when field is empty/invalid
   */
  const [dateValid, setDateValid] = useState(null);
  const [partNameValid, setPartNameValid] = useState(null);
  const [noOfMouldsValid, setNoOfMouldsValid] = useState(null);
  const [cPercentMinValid, setCPercentMinValid] = useState(null);
  const [cPercentMaxValid, setCPercentMaxValid] = useState(null);
  const [siPercentMinValid, setSiPercentMinValid] = useState(null);
  const [siPercentMaxValid, setSiPercentMaxValid] = useState(null);
  const [mnPercentMinValid, setMnPercentMinValid] = useState(null);
  const [mnPercentMaxValid, setMnPercentMaxValid] = useState(null);
  const [pPercentMinValid, setPPercentMinValid] = useState(null);
  const [pPercentMaxValid, setPPercentMaxValid] = useState(null);
  const [sPercentMinValid, setSPercentMinValid] = useState(null);
  const [sPercentMaxValid, setSPercentMaxValid] = useState(null);
  const [mgPercentMinValid, setMgPercentMinValid] = useState(null);
  const [mgPercentMaxValid, setMgPercentMaxValid] = useState(null);
  const [cuPercentMinValid, setCuPercentMinValid] = useState(null);
  const [cuPercentMaxValid, setCuPercentMaxValid] = useState(null);
  const [crPercentMinValid, setCrPercentMinValid] = useState(null);
  const [crPercentMaxValid, setCrPercentMaxValid] = useState(null);
  const [nodularityMinValid, setNodularityMinValid] = useState(null);
  const [nodularityMaxValid, setNodularityMaxValid] = useState(null);
  const [graphiteTypeMinValid, setGraphiteTypeMinValid] = useState(null);
  const [graphiteTypeMaxValid, setGraphiteTypeMaxValid] = useState(null);
  const [pearliteFertiteMinValid, setPearliteFertiteMinValid] = useState(null);
  const [pearliteFertiteMaxValid, setPearliteFertiteMaxValid] = useState(null);
  const [hardnessBHNMinValid, setHardnessBHNMinValid] = useState(null);
  const [hardnessBHNMaxValid, setHardnessBHNMaxValid] = useState(null);
  const [tsMinValid, setTsMinValid] = useState(null);
  const [tsMaxValid, setTsMaxValid] = useState(null);
  const [ysMinValid, setYsMinValid] = useState(null);
  const [ysMaxValid, setYsMaxValid] = useState(null);
  const [elMinValid, setElMinValid] = useState(null);
  const [elMaxValid, setElMaxValid] = useState(null);

  // Refs for navigation and auto-focus on first error
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

    // Clear error message when user starts typing
    if (submitErrorMessage) {
      setSubmitErrorMessage('');
    }

    // List of numeric fields that should only accept numbers
    const numericFields = [
      'noOfMoulds',
      'cPercentMin', 'cPercentMax',
      'siPercentMin', 'siPercentMax',
      'mnPercentMin', 'mnPercentMax',
      'pPercentMin', 'pPercentMax',
      'sPercentMin', 'sPercentMax',
      'mgPercentMin', 'mgPercentMax',
      'cuPercentMin', 'cuPercentMax',
      'crPercentMin', 'crPercentMax',
      'nodularityMin', 'nodularityMax',
      'graphiteTypeMin', 'graphiteTypeMax',
      'pearliteFertiteMin', 'pearliteFertiteMax',
      'hardnessBHNMin', 'hardnessBHNMax',
      'tsMin', 'tsMax',
      'ysMin', 'ysMax',
      'elMin', 'elMax'
    ];

    // Filter numeric input - allow only numbers and decimal point
    let filteredValue = value;
    if (numericFields.includes(name)) {
      // Allow only digits and one decimal point
      filteredValue = value.replace(/[^0-9.]/g, '');
      // Prevent multiple decimal points
      const parts = filteredValue.split('.');
      if (parts.length > 2) {
        filteredValue = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    // Reset validation to neutral when user starts typing
    // For min/max pairs, clear both when either is edited
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
      case 'cPercentMin':
      case 'cPercentMax':
        setCPercentMinValid(null);
        setCPercentMaxValid(null);
        break;
      case 'siPercentMin':
      case 'siPercentMax':
        setSiPercentMinValid(null);
        setSiPercentMaxValid(null);
        break;
      case 'mnPercentMin':
      case 'mnPercentMax':
        setMnPercentMinValid(null);
        setMnPercentMaxValid(null);
        break;
      case 'pPercentMin':
      case 'pPercentMax':
        setPPercentMinValid(null);
        setPPercentMaxValid(null);
        break;
      case 'sPercentMin':
      case 'sPercentMax':
        setSPercentMinValid(null);
        setSPercentMaxValid(null);
        break;
      case 'mgPercentMin':
      case 'mgPercentMax':
        setMgPercentMinValid(null);
        setMgPercentMaxValid(null);
        break;
      case 'cuPercentMin':
      case 'cuPercentMax':
        setCuPercentMinValid(null);
        setCuPercentMaxValid(null);
        break;
      case 'crPercentMin':
      case 'crPercentMax':
        setCrPercentMinValid(null);
        setCrPercentMaxValid(null);
        break;
      case 'nodularityMin':
      case 'nodularityMax':
        setNodularityMinValid(null);
        setNodularityMaxValid(null);
        break;
      case 'graphiteTypeMin':
      case 'graphiteTypeMax':
        setGraphiteTypeMinValid(null);
        setGraphiteTypeMaxValid(null);
        break;
      case 'pearliteFertiteMin':
      case 'pearliteFertiteMax':
        setPearliteFertiteMinValid(null);
        setPearliteFertiteMaxValid(null);
        break;
      case 'hardnessBHNMin':
      case 'hardnessBHNMax':
        setHardnessBHNMinValid(null);
        setHardnessBHNMaxValid(null);
        break;
      case 'tsMin':
      case 'tsMax':
        setTsMinValid(null);
        setTsMaxValid(null);
        break;
      case 'ysMin':
      case 'ysMax':
        setYsMinValid(null);
        setYsMaxValid(null);
        break;
      case 'elMin':
      case 'elMax':
        setElMinValid(null);
        setElMaxValid(null);
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Convert integer to decimal (e.g., "3" → "3.0")
    if (value && value.trim() !== '') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        // Check if it's a whole number without decimal
        if (!value.includes('.')) {
          setFormData(prev => ({
            ...prev,
            [name]: numValue.toFixed(1)
          }));
        }
      }
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
    // Check all required fields and set validation states
    let hasErrors = false;
    // AUTO-NAVIGATION: Track the first field that fails validation (see comment block above)
    let firstErrorField = null;

    if (!formData.date || formData.date.trim() === '') {
      setDateValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'date';
    }
    if (!formData.partName || formData.partName.trim() === '') {
      setPartNameValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'partName';
    }
    if (!formData.noOfMoulds || isNaN(formData.noOfMoulds) || parseFloat(formData.noOfMoulds) < 1) {
      setNoOfMouldsValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'noOfMoulds';
    }

    // Validate C % min/max
    if (!formData.cPercentMin || isNaN(formData.cPercentMin)) {
      setCPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'cPercentMin';
    }
    if (!formData.cPercentMax || isNaN(formData.cPercentMax)) {
      setCPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'cPercentMax';
    }
    if (formData.cPercentMin && formData.cPercentMax && !isNaN(formData.cPercentMin) && !isNaN(formData.cPercentMax)) {
      const min = parseFloat(formData.cPercentMin);
      const max = parseFloat(formData.cPercentMax);
      if (max !== 0 && min >= max) {
        setCPercentMinValid(false);
        setCPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'cPercentMin';
      }
    }

    // Validate Si % min/max
    if (!formData.siPercentMin || isNaN(formData.siPercentMin)) {
      setSiPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'siPercentMin';
    }
    if (!formData.siPercentMax || isNaN(formData.siPercentMax)) {
      setSiPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'siPercentMax';
    }
    if (formData.siPercentMin && formData.siPercentMax && !isNaN(formData.siPercentMin) && !isNaN(formData.siPercentMax)) {
      const min = parseFloat(formData.siPercentMin);
      const max = parseFloat(formData.siPercentMax);
      if (max !== 0 && min >= max) {
        setSiPercentMinValid(false);
        setSiPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'siPercentMin';
      }
    }

    // Validate Mn % min/max
    if (!formData.mnPercentMin || isNaN(formData.mnPercentMin)) {
      setMnPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'mnPercentMin';
    }
    if (!formData.mnPercentMax || isNaN(formData.mnPercentMax)) {
      setMnPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'mnPercentMax';
    }
    if (formData.mnPercentMin && formData.mnPercentMax && !isNaN(formData.mnPercentMin) && !isNaN(formData.mnPercentMax)) {
      const min = parseFloat(formData.mnPercentMin);
      const max = parseFloat(formData.mnPercentMax);
      if (max !== 0 && min >= max) {
        setMnPercentMinValid(false);
        setMnPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'mnPercentMin';
      }
    }

    // Validate P % min/max
    if (!formData.pPercentMin || isNaN(formData.pPercentMin)) {
      setPPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pPercentMin';
    }
    if (!formData.pPercentMax || isNaN(formData.pPercentMax)) {
      setPPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pPercentMax';
    }
    if (formData.pPercentMin && formData.pPercentMax && !isNaN(formData.pPercentMin) && !isNaN(formData.pPercentMax)) {
      const min = parseFloat(formData.pPercentMin);
      const max = parseFloat(formData.pPercentMax);
      if (max !== 0 && min >= max) {
        setPPercentMinValid(false);
        setPPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'pPercentMin';
      }
    }

    // Validate S % min/max
    if (!formData.sPercentMin || isNaN(formData.sPercentMin)) {
      setSPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'sPercentMin';
    }
    if (!formData.sPercentMax || isNaN(formData.sPercentMax)) {
      setSPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'sPercentMax';
    }
    if (formData.sPercentMin && formData.sPercentMax && !isNaN(formData.sPercentMin) && !isNaN(formData.sPercentMax)) {
      const min = parseFloat(formData.sPercentMin);
      const max = parseFloat(formData.sPercentMax);
      if (max !== 0 && min >= max) {
        setSPercentMinValid(false);
        setSPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'sPercentMin';
      }
    }

    // Validate Mg % min/max
    if (!formData.mgPercentMin || isNaN(formData.mgPercentMin)) {
      setMgPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'mgPercentMin';
    }
    if (!formData.mgPercentMax || isNaN(formData.mgPercentMax)) {
      setMgPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'mgPercentMax';
    }
    if (formData.mgPercentMin && formData.mgPercentMax && !isNaN(formData.mgPercentMin) && !isNaN(formData.mgPercentMax)) {
      const min = parseFloat(formData.mgPercentMin);
      const max = parseFloat(formData.mgPercentMax);
      if (max !== 0 && min >= max) {
        setMgPercentMinValid(false);
        setMgPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'mgPercentMin';
      }
    }

    // Validate Cu % min/max
    if (!formData.cuPercentMin || isNaN(formData.cuPercentMin)) {
      setCuPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'cuPercentMin';
    }
    if (!formData.cuPercentMax || isNaN(formData.cuPercentMax)) {
      setCuPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'cuPercentMax';
    }
    if (formData.cuPercentMin && formData.cuPercentMax && !isNaN(formData.cuPercentMin) && !isNaN(formData.cuPercentMax)) {
      const min = parseFloat(formData.cuPercentMin);
      const max = parseFloat(formData.cuPercentMax);
      if (max !== 0 && min >= max) {
        setCuPercentMinValid(false);
        setCuPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'cuPercentMin';
      }
    }

    // Validate Cr % min/max
    if (!formData.crPercentMin || isNaN(formData.crPercentMin)) {
      setCrPercentMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'crPercentMin';
    }
    if (!formData.crPercentMax || isNaN(formData.crPercentMax)) {
      setCrPercentMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'crPercentMax';
    }
    if (formData.crPercentMin && formData.crPercentMax && !isNaN(formData.crPercentMin) && !isNaN(formData.crPercentMax)) {
      const min = parseFloat(formData.crPercentMin);
      const max = parseFloat(formData.crPercentMax);
      if (max !== 0 && min >= max) {
        setCrPercentMinValid(false);
        setCrPercentMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'crPercentMin';
      }
    }

    // Validate Nodularity min/max
    if (!formData.nodularityMin || isNaN(formData.nodularityMin)) {
      setNodularityMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'nodularityMin';
    }
    if (!formData.nodularityMax || isNaN(formData.nodularityMax)) {
      setNodularityMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'nodularityMax';
    }
    if (formData.nodularityMin && formData.nodularityMax && !isNaN(formData.nodularityMin) && !isNaN(formData.nodularityMax)) {
      const min = parseFloat(formData.nodularityMin);
      const max = parseFloat(formData.nodularityMax);
      if (max !== 0 && min >= max) {
        setNodularityMinValid(false);
        setNodularityMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'nodularityMin';
      }
    }

    // Validate Graphite Type min/max
    if (!formData.graphiteTypeMin || isNaN(formData.graphiteTypeMin)) {
      setGraphiteTypeMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'graphiteTypeMin';
    }
    if (!formData.graphiteTypeMax || isNaN(formData.graphiteTypeMax)) {
      setGraphiteTypeMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'graphiteTypeMax';
    }
    if (formData.graphiteTypeMin && formData.graphiteTypeMax && !isNaN(formData.graphiteTypeMin) && !isNaN(formData.graphiteTypeMax)) {
      const min = parseFloat(formData.graphiteTypeMin);
      const max = parseFloat(formData.graphiteTypeMax);
      if (max !== 0 && min >= max) {
        setGraphiteTypeMinValid(false);
        setGraphiteTypeMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'graphiteTypeMin';
      }
    }

    // Validate Pearlite Ferrite min/max
    if (!formData.pearliteFertiteMin || isNaN(formData.pearliteFertiteMin)) {
      setPearliteFertiteMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pearliteFertiteMin';
    }
    if (!formData.pearliteFertiteMax || isNaN(formData.pearliteFertiteMax)) {
      setPearliteFertiteMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'pearliteFertiteMax';
    }
    if (formData.pearliteFertiteMin && formData.pearliteFertiteMax && !isNaN(formData.pearliteFertiteMin) && !isNaN(formData.pearliteFertiteMax)) {
      const min = parseFloat(formData.pearliteFertiteMin);
      const max = parseFloat(formData.pearliteFertiteMax);
      if (max !== 0 && min >= max) {
        setPearliteFertiteMinValid(false);
        setPearliteFertiteMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'pearliteFertiteMin';
      }
    }

    // Validate Hardness BHN min/max
    if (!formData.hardnessBHNMin || isNaN(formData.hardnessBHNMin)) {
      setHardnessBHNMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'hardnessBHNMin';
    }
    if (!formData.hardnessBHNMax || isNaN(formData.hardnessBHNMax)) {
      setHardnessBHNMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'hardnessBHNMax';
    }
    if (formData.hardnessBHNMin && formData.hardnessBHNMax && !isNaN(formData.hardnessBHNMin) && !isNaN(formData.hardnessBHNMax)) {
      const min = parseFloat(formData.hardnessBHNMin);
      const max = parseFloat(formData.hardnessBHNMax);
      if (max !== 0 && min >= max) {
        setHardnessBHNMinValid(false);
        setHardnessBHNMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'hardnessBHNMin';
      }
    }

    // Validate TS min/max
    if (!formData.tsMin || isNaN(formData.tsMin)) {
      setTsMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'tsMin';
    }
    if (!formData.tsMax || isNaN(formData.tsMax)) {
      setTsMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'tsMax';
    }
    if (formData.tsMin && formData.tsMax && !isNaN(formData.tsMin) && !isNaN(formData.tsMax)) {
      const min = parseFloat(formData.tsMin);
      const max = parseFloat(formData.tsMax);
      if (max !== 0 && min >= max) {
        setTsMinValid(false);
        setTsMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'tsMin';
      }
    }

    // Validate YS min/max
    if (!formData.ysMin || isNaN(formData.ysMin)) {
      setYsMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ysMin';
    }
    if (!formData.ysMax || isNaN(formData.ysMax)) {
      setYsMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'ysMax';
    }
    if (formData.ysMin && formData.ysMax && !isNaN(formData.ysMin) && !isNaN(formData.ysMax)) {
      const min = parseFloat(formData.ysMin);
      const max = parseFloat(formData.ysMax);
      if (max !== 0 && min >= max) {
        setYsMinValid(false);
        setYsMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'ysMin';
      }
    }

    // Validate EL min/max
    if (!formData.elMin || isNaN(formData.elMin)) {
      setElMinValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'elMin';
    }
    if (!formData.elMax || isNaN(formData.elMax)) {
      setElMaxValid(false);
      hasErrors = true;
      if (!firstErrorField) firstErrorField = 'elMax';
    }
    if (formData.elMin && formData.elMax && !isNaN(formData.elMin) && !isNaN(formData.elMax)) {
      const min = parseFloat(formData.elMin);
      const max = parseFloat(formData.elMax);
      if (max !== 0 && min >= max) {
        setElMinValid(false);
        setElMaxValid(false);
        hasErrors = true;
        if (!firstErrorField) firstErrorField = 'elMin';
      }
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

    // Clear all validation states on successful validation
    setDateValid(null);
    setPartNameValid(null);
    setNoOfMouldsValid(null);
    setCPercentMinValid(null);
    setCPercentMaxValid(null);
    setSiPercentMinValid(null);
    setSiPercentMaxValid(null);
    setMnPercentMinValid(null);
    setMnPercentMaxValid(null);
    setPPercentMinValid(null);
    setPPercentMaxValid(null);
    setSPercentMinValid(null);
    setSPercentMaxValid(null);
    setMgPercentMinValid(null);
    setMgPercentMaxValid(null);
    setCuPercentMinValid(null);
    setCuPercentMaxValid(null);
    setCrPercentMinValid(null);
    setCrPercentMaxValid(null);
    setNodularityMinValid(null);
    setNodularityMaxValid(null);
    setGraphiteTypeMinValid(null);
    setGraphiteTypeMaxValid(null);
    setPearliteFertiteMinValid(null);
    setPearliteFertiteMaxValid(null);
    setHardnessBHNMinValid(null);
    setHardnessBHNMaxValid(null);
    setTsMinValid(null);
    setTsMaxValid(null);
    setYsMinValid(null);
    setYsMaxValid(null);
    setElMinValid(null);
    setElMaxValid(null);

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
      
      // Helper function to format range - if max is 0, return only min value
      const formatRange = (min, max) => {
        if (max === '0' || max === '0.0' || parseFloat(max) === 0) {
          return min;
        }
        return `${min} - ${max}`;
      };
      
      // Transform min/max fields into single range strings for backend
      const payload = {
        date: formData.date,
        partName: formData.partName,
        noOfMoulds: formData.noOfMoulds,
        cPercent: formatRange(formData.cPercentMin, formData.cPercentMax),
        siPercent: formatRange(formData.siPercentMin, formData.siPercentMax),
        mnPercent: formatRange(formData.mnPercentMin, formData.mnPercentMax),
        pPercent: formatRange(formData.pPercentMin, formData.pPercentMax),
        sPercent: formatRange(formData.sPercentMin, formData.sPercentMax),
        mgPercent: formatRange(formData.mgPercentMin, formData.mgPercentMax),
        cuPercent: formatRange(formData.cuPercentMin, formData.cuPercentMax),
        crPercent: formatRange(formData.crPercentMin, formData.crPercentMax),
        nodularity: formatRange(formData.nodularityMin, formData.nodularityMax),
        graphiteType: formatRange(formData.graphiteTypeMin, formData.graphiteTypeMax),
        pearliteFerrite: formatRange(formData.pearliteFertiteMin, formData.pearliteFertiteMax),
        hardnessBHN: formatRange(formData.hardnessBHNMin, formData.hardnessBHNMax),
        ts: formatRange(formData.tsMin, formData.tsMax),
        ys: formatRange(formData.ysMin, formData.ysMax),
        el: formatRange(formData.elMin, formData.elMax)
      };
      
      const response = await fetch('http://localhost:5000/api/v1/qc-reports', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(payload) 
      });
      
      const data = await response.json();
      setSubmitLoading(false);

      if (data.success) {
        // Show Sakthi loader
        setShowSakthi(true);
        
        // Reset form and validation states
        setFormData({
          date: getCurrentDate(),
          partName: '',
          noOfMoulds: '',
          cPercentMin: '', cPercentMax: '',
          siPercentMin: '', siPercentMax: '',
          mnPercentMin: '', mnPercentMax: '',
          pPercentMin: '', pPercentMax: '',
          sPercentMin: '', sPercentMax: '',
          mgPercentMin: '', mgPercentMax: '',
          cuPercentMin: '', cuPercentMax: '',
          crPercentMin: '', crPercentMax: '',
          nodularityMin: '', nodularityMax: '',
          graphiteTypeMin: '', graphiteTypeMax: '',
          pearliteFertiteMin: '', pearliteFertiteMax: '',
          hardnessBHNMin: '', hardnessBHNMax: '',
          tsMin: '', tsMax: '',
          ysMin: '', ysMax: '',
          elMin: '', elMax: ''
        });
        
        // Reset all validation states
        setDateValid(null);
        setPartNameValid(null);
        setNoOfMouldsValid(null);
        setCPercentMinValid(null);
        setCPercentMaxValid(null);
        setSiPercentMinValid(null);
        setSiPercentMaxValid(null);
        setMnPercentMinValid(null);
        setMnPercentMaxValid(null);
        setPPercentMinValid(null);
        setPPercentMaxValid(null);
        setSPercentMinValid(null);
        setSPercentMaxValid(null);
        setMgPercentMinValid(null);
        setMgPercentMaxValid(null);
        setCuPercentMinValid(null);
        setCuPercentMaxValid(null);
        setCrPercentMinValid(null);
        setCrPercentMaxValid(null);
        setNodularityMinValid(null);
        setNodularityMaxValid(null);
        setGraphiteTypeMinValid(null);
        setGraphiteTypeMaxValid(null);
        setPearliteFertiteMinValid(null);
        setPearliteFertiteMaxValid(null);
        setHardnessBHNMinValid(null);
        setHardnessBHNMaxValid(null);
        setTsMinValid(null);
        setTsMaxValid(null);
        setYsMinValid(null);
        setYsMaxValid(null);
        setElMinValid(null);
        setElMaxValid(null);
        
        // Focus first input after Sakthi animation completes
        setTimeout(() => {
          inputRefs.current.date?.focus();
        }, 1600);
      } else {
        // Show error message
        alert(data.message || 'Failed to create QC Production report');
      }
    } catch (error) {
      console.error('Error creating QC report:', error);
      setSubmitLoading(false);
      saveLocalEntry();
      alert('Network error. Entry saved locally.');
    }
  };

  // Helper to get current date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
      <div className="qcproduction-header">
        <div className="qcproduction-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            QC Production Details - Entry Form
            <InfoIcon onClick={openModal} />
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? formatDisplayDate(formData.date) : '-'}
        </div>
      </div>

      <form className="qcproduction-form-grid">

            <div className="qcproduction-form-group">
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

            <div className="qcproduction-form-group">
              <label>Part Name</label>
              <input
                ref={(el) => inputRefs.current.partName = el}
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
              <label>No. of Moulds</label>
              <input
                ref={(el) => inputRefs.current.noOfMoulds = el}
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
              <label>C %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.cPercentMin = el}
                  type="text"
                  name="cPercentMin"
                  value={formData.cPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(cPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.cPercentMax = el}
                  type="text"
                  name="cPercentMax"
                  value={formData.cPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(cPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Si %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.siPercentMin = el}
                  type="text"
                  name="siPercentMin"
                  value={formData.siPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(siPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.siPercentMax = el}
                  type="text"
                  name="siPercentMax"
                  value={formData.siPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(siPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Mn %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.mnPercentMin = el}
                  type="text"
                  name="mnPercentMin"
                  value={formData.mnPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(mnPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.mnPercentMax = el}
                  type="text"
                  name="mnPercentMax"
                  value={formData.mnPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(mnPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>P %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.pPercentMin = el}
                  type="text"
                  name="pPercentMin"
                  value={formData.pPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(pPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.pPercentMax = el}
                  type="text"
                  name="pPercentMax"
                  value={formData.pPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(pPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>S %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.sPercentMin = el}
                  type="text"
                  name="sPercentMin"
                  value={formData.sPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(sPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.sPercentMax = el}
                  type="text"
                  name="sPercentMax"
                  value={formData.sPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(sPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Mg %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.mgPercentMin = el}
                  type="text"
                  name="mgPercentMin"
                  value={formData.mgPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(mgPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.mgPercentMax = el}
                  type="text"
                  name="mgPercentMax"
                  value={formData.mgPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(mgPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Cu %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.cuPercentMin = el}
                  type="text"
                  name="cuPercentMin"
                  value={formData.cuPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(cuPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.cuPercentMax = el}
                  type="text"
                  name="cuPercentMax"
                  value={formData.cuPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(cuPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Cr %</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.crPercentMin = el}
                  type="text"
                  name="crPercentMin"
                  value={formData.crPercentMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(crPercentMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.crPercentMax = el}
                  type="text"
                  name="crPercentMax"
                  value={formData.crPercentMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(crPercentMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Nodularity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.nodularityMin = el}
                  type="text"
                  name="nodularityMin"
                  value={formData.nodularityMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(nodularityMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.nodularityMax = el}
                  type="text"
                  name="nodularityMax"
                  value={formData.nodularityMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(nodularityMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Graphite Type</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.graphiteTypeMin = el}
                  type="text"
                  name="graphiteTypeMin"
                  value={formData.graphiteTypeMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(graphiteTypeMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.graphiteTypeMax = el}
                  type="text"
                  name="graphiteTypeMax"
                  value={formData.graphiteTypeMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(graphiteTypeMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Pearlite Ferrite</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.pearliteFertiteMin = el}
                  type="text"
                  name="pearliteFertiteMin"
                  value={formData.pearliteFertiteMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(pearliteFertiteMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.pearliteFertiteMax = el}
                  type="text"
                  name="pearliteFertiteMax"
                  value={formData.pearliteFertiteMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(pearliteFertiteMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>Hardness BHN</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.hardnessBHNMin = el}
                  type="text"
                  name="hardnessBHNMin"
                  value={formData.hardnessBHNMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(hardnessBHNMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.hardnessBHNMax = el}
                  type="text"
                  name="hardnessBHNMax"
                  value={formData.hardnessBHNMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(hardnessBHNMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>TS (Tensile Strength)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.tsMin = el}
                  type="text"
                  name="tsMin"
                  value={formData.tsMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(tsMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.tsMax = el}
                  type="text"
                  name="tsMax"
                  value={formData.tsMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(tsMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>YS (Yield Strength)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.ysMin = el}
                  type="text"
                  name="ysMin"
                  value={formData.ysMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(ysMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.ysMax = el}
                  type="text"
                  name="ysMax"
                  value={formData.ysMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(ysMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>

            <div className="qcproduction-form-group">
              <label>EL (Elongation)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  ref={(el) => inputRefs.current.elMin = el}
                  type="text"
                  name="elMin"
                  value={formData.elMin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Min"
                  className={getInputClassName(elMinValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
                <span style={{ color: '#64748b', fontWeight: '500' }}>-</span>
                <input
                  ref={(el) => inputRefs.current.elMax = el}
                  type="text"
                  name="elMax"
                  value={formData.elMax}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  placeholder="Max"
                  className={getInputClassName(elMaxValid)}
                  style={{ flex: 1, maxWidth: '100px' }}
                />
              </div>
            </div>
      </form>

      <div className="qcproduction-submit-container" style={{ justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
        {/* Error message display near submit button */}
        {submitErrorMessage && (
          <InlineLoader 
            message={submitErrorMessage}
            variant="danger"
            size="medium"
          />
        )}
        <SubmitButton
            ref={submitButtonRef}
            onClick={handleSubmit}
            disabled={submitLoading}
            type="button"
            onKeyDown={handleSubmitButtonKeyDown}
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

      <InfoCard
        isOpen={isOpen}
        onClose={closeModal}
        title="QC Production Details Validation"
        validationRanges={validationRanges}
      />
    </>
  );
};

export default QcProductionDetails;

