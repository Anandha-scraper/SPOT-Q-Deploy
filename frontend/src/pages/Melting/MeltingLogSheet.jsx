import React, { useState, useRef, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { CustomTimeInput, Time, ShiftDropdown, FurnaceDropdown, PanelDropdown, DisaDropdown } from '../../Components/Buttons';
import { InlineLoader } from '../../Components/Alert';
import Sakthi from '../../Components/Sakthi';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Melting/MeltingLogSheet.css';

const MeltingLogSheet = () => {
  // Primary: Date, Shift, Furnace No., Panel, Cumulative Liquid metal, Final KWHr, Initial KWHr, Total Units, Cumulative Units
  const [primaryData, setPrimaryData] = useState({
    date: "",
    shift: '',
    furnaceNo: '',
    panel: '',
    cumulativeLiquidMetal: '',
    finalKWHr: '',
    initialKWHr: '',
    totalUnits: '',
    cumulativeUnits: ''
  });
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [primaryId, setPrimaryId] = useState(null);
  const [fetchingPrimary, setFetchingPrimary] = useState(false);
  const [primaryLocks, setPrimaryLocks] = useState({});
  const [isPrimaryDataSaved, setIsPrimaryDataSaved] = useState(false);
  const [primaryDataOriginal, setPrimaryDataOriginal] = useState(null);
  const [entryCount, setEntryCount] = useState(0);
  const [dynamicCheckAlert, setDynamicCheckAlert] = useState(false);
  const [showCombinationFound, setShowCombinationFound] = useState(false);
  const [showSakthi, setShowSakthi] = useState(false);
  const [showPrimaryWarning, setShowPrimaryWarning] = useState(false);
  
  // Sequential validation highlighting
  const [dateErrorHighlight, setDateErrorHighlight] = useState(false);
  const [shiftErrorHighlight, setShiftErrorHighlight] = useState(false);
  const [furnaceNoErrorHighlight, setFurnaceNoErrorHighlight] = useState(false);
  const [panelErrorHighlight, setPanelErrorHighlight] = useState(false);

  // Numeric input validation states
  const [cumulativeLiquidMetalValid, setCumulativeLiquidMetalValid] = useState(null);
  const [finalKWHrValid, setFinalKWHrValid] = useState(null);
  const [initialKWHrValid, setInitialKWHrValid] = useState(null);
  const [totalUnitsValid, setTotalUnitsValid] = useState(null);
  const [cumulativeUnitsValid, setCumulativeUnitsValid] = useState(null);

  // Refs for navigation
  const dateRef = useRef(null);
  const shiftRef = useRef(null);
  const furnaceRef = useRef(null);
  const panelRef = useRef(null);
  const cumulativeLiquidMetalRef = useRef(null);
  const finalKWHrRef = useRef(null);
  const initialKWHrRef = useRef(null);
  const totalUnitsRef = useRef(null);
  const cumulativeUnitsRef = useRef(null);
  const primarySaveButtonRef = useRef(null);
  const primarySectionRef = useRef(null);

  // Table input refs for Enter key navigation
  // Table 1
  const heatNoRef = useRef(null);
  const gradeRef = useRef(null);
  const chargingTimeRef = useRef(null);
  const ifBathRef = useRef(null);
  const liquidMetalPressPourRef = useRef(null);
  const liquidMetalHolderRef = useRef(null);
  const sgMsSteelRef = useRef(null);
  const greyMsSteelRef = useRef(null);
  const returnsSgRef = useRef(null);
  const pigIronRef = useRef(null);
  const boringsRef = useRef(null);
  const finalBathRef = useRef(null);
  // Table 2
  const charCoalRef = useRef(null);
  const cpcFurRef = useRef(null);
  const cpcLcRef = useRef(null);
  const siliconCarbideFurRef = useRef(null);
  const ferrosiliconFurRef = useRef(null);
  const ferrosiliconLcRef = useRef(null);
  const ferroManganeseFurRef = useRef(null);
  const ferroManganeseLcRef = useRef(null);
  const cuRef = useRef(null);
  const crRef = useRef(null);
  const pureMgRef = useRef(null);
  const ironPyriteRef = useRef(null);
  // Table 3
  const labCoinTimeRef = useRef(null);
  const labCoinTempCRef = useRef(null);
  const deslagingTimeFromRef = useRef(null);
  const deslagingTimeToRef = useRef(null);
  const metalReadyTimeRef = useRef(null);
  const waitingForTappingFromRef = useRef(null);
  const waitingForTappingToRef = useRef(null);
  const reasonRef = useRef(null);
  // Table 4
  const table4TimeRef = useRef(null);
  const tempCSgRef = useRef(null);
  const directFurnaceRef = useRef(null);
  const holderToFurnaceRef = useRef(null);
  const furnaceToHolderRef = useRef(null);
  const disaNoRef = useRef(null);
  const itemRef = useRef(null);
  // Table 5
  const furnace1KwRef = useRef(null);
  const furnace1ARef = useRef(null);
  const furnace1VRef = useRef(null);
  const furnace4HzRef = useRef(null);
  const furnace4GldRef = useRef(null);
  const furnace4KwHrRef = useRef(null);

  // Fetch primary data when date + shift + furnaceNo + panel all change
  useEffect(() => {
    if (primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      fetchPrimaryData(primaryData.date, primaryData.shift, primaryData.furnaceNo, primaryData.panel);
      // Reset error highlights when all key fields are filled
      setDateErrorHighlight(false);
      setShiftErrorHighlight(false);
      setFurnaceNoErrorHighlight(false);
      setPanelErrorHighlight(false);
    } else {
      // Reset when any key field is missing
      setPrimaryId(null);
      setPrimaryLocks({});
      setIsPrimaryDataSaved(false);
      // Reset value fields only (keep the key fields)
      setPrimaryData(prev => ({
        ...prev,
        cumulativeLiquidMetal: '',
        finalKWHr: '',
        initialKWHr: '',
        totalUnits: '',
        cumulativeUnits: ''
      }));
    }
  }, [primaryData.date, primaryData.shift, primaryData.furnaceNo, primaryData.panel]);

  // Auto-dismiss dynamic check alert
  useEffect(() => {
    if (dynamicCheckAlert) {
      const timer = setTimeout(() => {
        setDynamicCheckAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dynamicCheckAlert]);

  // Validation flag and helper for primary section
  const [primarySubmitted, setPrimarySubmitted] = useState(false);
  const classFor = (value, submitted, required = false, locked = false) => {
    if (locked) return '';
    const has = value !== undefined && value !== null && String(value).trim() !== '';
    if (submitted && required && !has) return 'melting-error-outline';
    return '';
  };

  // Helper for numeric validation classes
  const getNumericValidationClass = (validState, locked = false) => {
    if (locked) return '';
    if (validState === false) return 'invalid-input';
    return '';
  };

  // Check if any numeric validation is invalid (false)
  const hasInvalidNumericInput = () => {
    return cumulativeLiquidMetalValid === false || 
           finalKWHrValid === false || 
           initialKWHrValid === false || 
           totalUnitsValid === false || 
           cumulativeUnitsValid === false;
  };
  
  const [table1, setTable1] = useState({
    heatNo: '',
    grade: '',
    chargingTimeHour: '',
    chargingTimeMinute: '',
    ifBath: '',
    liquidMetalPressPour: '',
    liquidMetalHolder: '',
    sgMsSteel: '',
    greyMsSteel: '',
    returnsSg: '',
    pigIron: '',
    borings: '',
    finalBath: ''
  });
  const [table2, setTable2] = useState({
    charCoal: '',
    cpcFur: '',
    cpcLc: '',
    siliconCarbideFur: '',
    ferrosiliconFur: '',
    ferrosiliconLc: '',
    ferroManganeseFur: '',
    ferroManganeseLc: '',
    cu: '',
    cr: '',
    pureMg: '',
    ironPyrite: ''
  });
  const [table3, setTable3] = useState({
    labCoinTimeHour: '',
    labCoinTimeMinute: '',
    labCoinTempC: '',
    deslagingTimeFromHour: '',
    deslagingTimeFromMinute: '',
    deslagingTimeToHour: '',
    deslagingTimeToMinute: '',
    metalReadyTimeHour: '',
    metalReadyTimeMinute: '',
    waitingForTappingFromHour: '',
    waitingForTappingFromMinute: '',
    waitingForTappingToHour: '',
    waitingForTappingToMinute: '',
    reason: ''
  });
  const [table4, setTable4] = useState({
    timeHour: '',
    timeMinute: '',
    tempCSg: '',
    directFurnace: '',
    holderToFurnace: '',
    furnaceToHolder: '',
    disaNo: '',
    item: ''
  });
  const [table5, setTable5] = useState({
    furnace1Kw: '',
    furnace1A: '',
    furnace1V: '',
    furnace2Kw: '',
    furnace2A: '',
    furnace2V: '',
    furnace3Kw: '',
    furnace3A: '',
    furnace3V: '',
    furnace4Hz: '',
    furnace4Gld: '',
    furnace4KwHr: ''
  });

  // Validation states (null = neutral/no border, false = invalid/red border - no green used)
  // Table 1 validations
  const [heatNoValid, setHeatNoValid] = useState(null);
  const [gradeValid, setGradeValid] = useState(null);
  const [chargingTimeValid, setChargingTimeValid] = useState(null);
  const [ifBathValid, setIfBathValid] = useState(null);
  const [liquidMetalPressPourValid, setLiquidMetalPressPourValid] = useState(null);
  const [liquidMetalHolderValid, setLiquidMetalHolderValid] = useState(null);
  const [sgMsSteelValid, setSgMsSteelValid] = useState(null);
  const [greyMsSteelValid, setGreyMsSteelValid] = useState(null);
  const [returnsSgValid, setReturnsSgValid] = useState(null);
  const [pigIronValid, setPigIronValid] = useState(null);
  const [boringsValid, setBoringsValid] = useState(null);
  const [finalBathValid, setFinalBathValid] = useState(null);

  // Table 2 validations
  const [charCoalValid, setCharCoalValid] = useState(null);
  const [cpcFurValid, setCpcFurValid] = useState(null);
  const [cpcLcValid, setCpcLcValid] = useState(null);
  const [siliconCarbideFurValid, setSiliconCarbideFurValid] = useState(null);
  const [ferrosiliconFurValid, setFerrosiliconFurValid] = useState(null);
  const [ferrosiliconLcValid, setFerrosiliconLcValid] = useState(null);
  const [ferroManganeseFurValid, setFerroManganeseFurValid] = useState(null);
  const [ferroManganeseLcValid, setFerroManganeseLcValid] = useState(null);
  const [cuValid, setCuValid] = useState(null);
  const [crValid, setCrValid] = useState(null);
  const [pureMgValid, setPureMgValid] = useState(null);
  const [ironPyriteValid, setIronPyriteValid] = useState(null);

  // Table 3 validations
  const [labCoinTimeValid, setLabCoinTimeValid] = useState(null);
  const [labCoinTempCValid, setLabCoinTempCValid] = useState(null);
  const [deslagingTimeFromValid, setDeslagingTimeFromValid] = useState(null);
  const [deslagingTimeToValid, setDeslagingTimeToValid] = useState(null);
  const [metalReadyTimeValid, setMetalReadyTimeValid] = useState(null);
  const [waitingForTappingFromValid, setWaitingForTappingFromValid] = useState(null);
  const [waitingForTappingToValid, setWaitingForTappingToValid] = useState(null);
  const [reasonValid, setReasonValid] = useState(null);

  // Table 4 validations
  const [table4TimeValid, setTable4TimeValid] = useState(null);
  const [tempCSgValid, setTempCSgValid] = useState(null);
  const [directFurnaceValid, setDirectFurnaceValid] = useState(null);
  const [holderToFurnaceValid, setHolderToFurnaceValid] = useState(null);
  const [furnaceToHolderValid, setFurnaceToHolderValid] = useState(null);
  const [disaNoValid, setDisaNoValid] = useState(null);
  const [itemValid, setItemValid] = useState(null);

  // Table 5 validations
  const [furnace1KwValid, setFurnace1KwValid] = useState(null);
  const [furnace1AValid, setFurnace1AValid] = useState(null);
  const [furnace1VValid, setFurnace1VValid] = useState(null);
  const [furnace2KwValid, setFurnace2KwValid] = useState(null);
  const [furnace2AValid, setFurnace2AValid] = useState(null);
  const [furnace2VValid, setFurnace2VValid] = useState(null);
  const [furnace3KwValid, setFurnace3KwValid] = useState(null);
  const [furnace3AValid, setFurnace3AValid] = useState(null);
  const [furnace3VValid, setFurnace3VValid] = useState(null);
  const [furnace4HzValid, setFurnace4HzValid] = useState(null);
  const [furnace4GldValid, setFurnace4GldValid] = useState(null);
  const [furnace4KwHrValid, setFurnace4KwHrValid] = useState(null);

  // Focus tracking for active input highlighting
  const [focusedField, setFocusedField] = useState(null);
  
  // Validation error message
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  // Helper functions to convert between Time object and hour/minute strings
  const createTimeFromHourMinute = (hour, minute) => {
    if (!hour && !minute) return null;
    const h = parseInt(hour) || 0;
    const m = parseInt(minute) || 0;
    return new Time(h, m);
  };

  const handleTimeChange = (tableNum, hourField, minuteField, timeValue) => {
    if (!timeValue) {
      handleTableChange(tableNum, hourField, '');
      handleTableChange(tableNum, minuteField, '');
    } else {
      handleTableChange(tableNum, hourField, timeValue.hour.toString());
      handleTableChange(tableNum, minuteField, timeValue.minute.toString());
    }
  };

  const [loadingStates, setLoadingStates] = useState({
    table1: false,
    table2: false,
    table3: false,
    table4: false,
    table5: false
  });

  // Auto-dismiss validation error message after 3 seconds
  useEffect(() => {
    if (validationErrorMessage) {
      const timer = setTimeout(() => {
        setValidationErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [validationErrorMessage]);

  const handleTableChange = (tableNum, field, value) => {
    // Validation logic for Table 1 - reset to neutral on any input
    if (tableNum === 1) {
      if (field === 'heatNo') setHeatNoValid(null);
      if (field === 'grade') setGradeValid(null);
      if (field.includes('chargingTime')) setChargingTimeValid(null);
      if (field === 'ifBath') setIfBathValid(null);
      if (field === 'liquidMetalPressPour') setLiquidMetalPressPourValid(null);
      if (field === 'liquidMetalHolder') setLiquidMetalHolderValid(null);
      if (field === 'sgMsSteel') setSgMsSteelValid(null);
      if (field === 'greyMsSteel') setGreyMsSteelValid(null);
      if (field === 'returnsSg') setReturnsSgValid(null);
      if (field === 'pigIron') setPigIronValid(null);
      if (field === 'borings') setBoringsValid(null);
      if (field === 'finalBath') setFinalBathValid(null);
    }

    // Validation logic for Table 2 - reset to neutral on any input
    if (tableNum === 2) {
      const validations = {
        charCoal: setCharCoalValid,
        cpcFur: setCpcFurValid,
        cpcLc: setCpcLcValid,
        siliconCarbideFur: setSiliconCarbideFurValid,
        ferrosiliconFur: setFerrosiliconFurValid,
        ferrosiliconLc: setFerrosiliconLcValid,
        ferroManganeseFur: setFerroManganeseFurValid,
        ferroManganeseLc: setFerroManganeseLcValid,
        cu: setCuValid,
        cr: setCrValid,
        pureMg: setPureMgValid,
        ironPyrite: setIronPyriteValid
      };
      if (validations[field]) validations[field](null);
    }

    // Validation logic for Table 3 - reset to neutral on any input
    if (tableNum === 3) {
      if (field.includes('labCoinTime')) setLabCoinTimeValid(null);
      if (field === 'labCoinTempC') setLabCoinTempCValid(null);
      if (field.includes('deslagingTimeFrom')) setDeslagingTimeFromValid(null);
      if (field.includes('deslagingTimeTo')) setDeslagingTimeToValid(null);
      if (field.includes('metalReadyTime')) setMetalReadyTimeValid(null);
      if (field.includes('waitingForTappingFrom')) setWaitingForTappingFromValid(null);
      if (field.includes('waitingForTappingTo')) setWaitingForTappingToValid(null);
      if (field === 'reason') setReasonValid(null);
    }

    // Validation logic for Table 4 - reset to neutral on any input
    if (tableNum === 4) {
      if (field.includes('time')) setTable4TimeValid(null);
      if (field === 'tempCSg') setTempCSgValid(null);
      if (field === 'directFurnace') setDirectFurnaceValid(null);
      if (field === 'holderToFurnace') setHolderToFurnaceValid(null);
      if (field === 'furnaceToHolder') setFurnaceToHolderValid(null);
      if (field === 'disaNo') setDisaNoValid(null);
      if (field === 'item') setItemValid(null);
    }

    // Validation logic for Table 5 - reset to neutral on any input
    if (tableNum === 5) {
      const validations = {
        furnace1Kw: setFurnace1KwValid,
        furnace1A: setFurnace1AValid,
        furnace1V: setFurnace1VValid,
        furnace2Kw: setFurnace2KwValid,
        furnace2A: setFurnace2AValid,
        furnace2V: setFurnace2VValid,
        furnace3Kw: setFurnace3KwValid,
        furnace3A: setFurnace3AValid,
        furnace3V: setFurnace3VValid,
        furnace4Hz: setFurnace4HzValid,
        furnace4Gld: setFurnace4GldValid,
        furnace4KwHr: setFurnace4KwHrValid
      };
      if (validations[field]) validations[field](null);
    }

    // Also clear validation error message on any input
    setValidationErrorMessage('');

    const setters = {
      1: setTable1,
      2: setTable2,
      3: setTable3,
      4: setTable4,
      5: setTable5
    };
    
    setters[tableNum](prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Enter key navigation for table inputs
  const handleTableEnterKey = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };



  const handleAllTablesSubmit = async () => {
    // Clear previous error message
    setValidationErrorMessage('');
    
    // Validate only table fields (mark them as invalid if empty)
    let hasErrors = false;
    // Track first error field for auto-focus (sync variable, not state)
    let firstErrorRef = null;

    // Validate Table 1 fields
    if (!table1.heatNo || !table1.heatNo.trim()) {
      setHeatNoValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = heatNoRef;
    } else {
      setHeatNoValid(null);
    }
    if (!table1.grade || !table1.grade.trim()) {
      setGradeValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = gradeRef;
    } else {
      setGradeValid(null);
    }
    if (!table1.chargingTimeHour || !table1.chargingTimeMinute) {
      setChargingTimeValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = chargingTimeRef;
    } else {
      setChargingTimeValid(null);
    }
    if (!table1.ifBath || !table1.ifBath.trim()) {
      setIfBathValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ifBathRef;
    } else {
      setIfBathValid(null);
    }
    if (!table1.liquidMetalPressPour || table1.liquidMetalPressPour.trim() === '') {
      setLiquidMetalPressPourValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = liquidMetalPressPourRef;
    } else {
      setLiquidMetalPressPourValid(null);
    }
    if (!table1.liquidMetalHolder || table1.liquidMetalHolder.trim() === '') {
      setLiquidMetalHolderValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = liquidMetalHolderRef;
    } else {
      setLiquidMetalHolderValid(null);
    }
    if (!table1.sgMsSteel || table1.sgMsSteel.trim() === '') {
      setSgMsSteelValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = sgMsSteelRef;
    } else {
      setSgMsSteelValid(null);
    }
    if (!table1.greyMsSteel || table1.greyMsSteel.trim() === '') {
      setGreyMsSteelValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = greyMsSteelRef;
    } else {
      setGreyMsSteelValid(null);
    }
    if (!table1.returnsSg || table1.returnsSg.trim() === '') {
      setReturnsSgValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = returnsSgRef;
    } else {
      setReturnsSgValid(null);
    }
    if (!table1.pigIron || table1.pigIron.trim() === '') {
      setPigIronValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = pigIronRef;
    } else {
      setPigIronValid(null);
    }
    if (!table1.borings || table1.borings.trim() === '') {
      setBoringsValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = boringsRef;
    } else {
      setBoringsValid(null);
    }
    if (!table1.finalBath || table1.finalBath.trim() === '') {
      setFinalBathValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = finalBathRef;
    } else {
      setFinalBathValid(null);
    }

    // Validate Table 2 fields
    if (!table2.charCoal || table2.charCoal.trim() === '') {
      setCharCoalValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = charCoalRef;
    } else {
      setCharCoalValid(null);
    }
    if (!table2.cpcFur || table2.cpcFur.trim() === '') {
      setCpcFurValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = cpcFurRef;
    } else {
      setCpcFurValid(null);
    }
    if (!table2.cpcLc || table2.cpcLc.trim() === '') {
      setCpcLcValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = cpcLcRef;
    } else {
      setCpcLcValid(null);
    }
    if (!table2.siliconCarbideFur || table2.siliconCarbideFur.trim() === '') {
      setSiliconCarbideFurValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = siliconCarbideFurRef;
    } else {
      setSiliconCarbideFurValid(null);
    }
    if (!table2.ferrosiliconFur || table2.ferrosiliconFur.trim() === '') {
      setFerrosiliconFurValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ferrosiliconFurRef;
    } else {
      setFerrosiliconFurValid(null);
    }
    if (!table2.ferrosiliconLc || table2.ferrosiliconLc.trim() === '') {
      setFerrosiliconLcValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ferrosiliconLcRef;
    } else {
      setFerrosiliconLcValid(null);
    }
    if (!table2.ferroManganeseFur || table2.ferroManganeseFur.trim() === '') {
      setFerroManganeseFurValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ferroManganeseFurRef;
    } else {
      setFerroManganeseFurValid(null);
    }
    if (!table2.ferroManganeseLc || table2.ferroManganeseLc.trim() === '') {
      setFerroManganeseLcValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ferroManganeseLcRef;
    } else {
      setFerroManganeseLcValid(null);
    }
    if (!table2.cu || table2.cu.trim() === '') {
      setCuValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = cuRef;
    } else {
      setCuValid(null);
    }
    if (!table2.cr || table2.cr.trim() === '') {
      setCrValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = crRef;
    } else {
      setCrValid(null);
    }
    if (!table2.pureMg || table2.pureMg.trim() === '') {
      setPureMgValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = pureMgRef;
    } else {
      setPureMgValid(null);
    }
    if (!table2.ironPyrite || table2.ironPyrite.trim() === '') {
      setIronPyriteValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = ironPyriteRef;
    } else {
      setIronPyriteValid(null);
    }

    // Validate Table 3 fields
    if (!table3.labCoinTimeHour || !table3.labCoinTimeMinute) {
      setLabCoinTimeValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = labCoinTimeRef;
    } else {
      setLabCoinTimeValid(null);
    }
    if (!table3.labCoinTempC || table3.labCoinTempC.trim() === '') {
      setLabCoinTempCValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = labCoinTempCRef;
    } else {
      setLabCoinTempCValid(null);
    }
    if (!table3.deslagingTimeFromHour || !table3.deslagingTimeFromMinute) {
      setDeslagingTimeFromValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = deslagingTimeFromRef;
    } else {
      setDeslagingTimeFromValid(null);
    }
    if (!table3.deslagingTimeToHour || !table3.deslagingTimeToMinute) {
      setDeslagingTimeToValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = deslagingTimeToRef;
    } else {
      setDeslagingTimeToValid(null);
    }
    if (!table3.metalReadyTimeHour || !table3.metalReadyTimeMinute) {
      setMetalReadyTimeValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = metalReadyTimeRef;
    } else {
      setMetalReadyTimeValid(null);
    }
    if (!table3.waitingForTappingFromHour || !table3.waitingForTappingFromMinute) {
      setWaitingForTappingFromValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = waitingForTappingFromRef;
    } else {
      setWaitingForTappingFromValid(null);
    }
    if (!table3.waitingForTappingToHour || !table3.waitingForTappingToMinute) {
      setWaitingForTappingToValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = waitingForTappingToRef;
    } else {
      setWaitingForTappingToValid(null);
    }
    if (!table3.reason || !table3.reason.trim()) {
      setReasonValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = reasonRef;
    } else {
      setReasonValid(null);
    }

    // Validate Table 4 fields
    if (!table4.timeHour || !table4.timeMinute) {
      setTable4TimeValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = table4TimeRef;
    } else {
      setTable4TimeValid(null);
    }
    if (!table4.tempCSg || table4.tempCSg.trim() === '') {
      setTempCSgValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = tempCSgRef;
    } else {
      setTempCSgValid(null);
    }
    if (!table4.directFurnace || table4.directFurnace.trim() === '') {
      setDirectFurnaceValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = directFurnaceRef;
    } else {
      setDirectFurnaceValid(null);
    }
    if (!table4.holderToFurnace || table4.holderToFurnace.trim() === '') {
      setHolderToFurnaceValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = holderToFurnaceRef;
    } else {
      setHolderToFurnaceValid(null);
    }
    if (!table4.furnaceToHolder || table4.furnaceToHolder.trim() === '') {
      setFurnaceToHolderValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnaceToHolderRef;
    } else {
      setFurnaceToHolderValid(null);
    }
    if (!table4.disaNo || !table4.disaNo.trim()) {
      setDisaNoValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = disaNoRef;
    } else {
      setDisaNoValid(null);
    }
    if (!table4.item || !table4.item.trim()) {
      setItemValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = itemRef;
    } else {
      setItemValid(null);
    }

    // Validate Table 5 fields
    if (!table5.furnace1Kw || table5.furnace1Kw.trim() === '') {
      setFurnace1KwValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace1KwRef;
    } else {
      setFurnace1KwValid(null);
    }
    if (!table5.furnace1A || table5.furnace1A.trim() === '') {
      setFurnace1AValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace1ARef;
    } else {
      setFurnace1AValid(null);
    }
    if (!table5.furnace1V || table5.furnace1V.trim() === '') {
      setFurnace1VValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace1VRef;
    } else {
      setFurnace1VValid(null);
    }
    if (!table5.furnace4Hz || table5.furnace4Hz.trim() === '') {
      setFurnace4HzValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace4HzRef;
    } else {
      setFurnace4HzValid(null);
    }
    if (!table5.furnace4Gld || table5.furnace4Gld.trim() === '') {
      setFurnace4GldValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace4GldRef;
    } else {
      setFurnace4GldValid(null);
    }
    if (!table5.furnace4KwHr || table5.furnace4KwHr.trim() === '') {
      setFurnace4KwHrValid(false);
      hasErrors = true;
      if (!firstErrorRef) firstErrorRef = furnace4KwHrRef;
    } else {
      setFurnace4KwHrValid(null);
    }

    if (hasErrors) {
      setValidationErrorMessage('Correct Data format or Enter Empty Field');
      // Auto-focus on first error field
      if (firstErrorRef && firstErrorRef.current) {
        firstErrorRef.current.focus();
        firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Set loading
    setLoadingStates({
      table1: true,
      table2: true,
      table3: true,
      table4: true,
      table5: true
    });

    try {
      // Combine all table data into one entry
      const allData = {
        ...prepareTableData(1, table1),
        ...prepareTableData(2, table2),
        ...prepareTableData(3, table3),
        ...prepareTableData(4, table4),
        ...prepareTableData(5, table5)
      };

      const res = await fetch(`${API_ENDPOINTS.meltingLogs}/table-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          primaryData: primaryData,
          data: allData
        })
      });
      const response = await res.json();
      
      if (response.success) {
        setEntryCount(response.entryCount || 0);
        setShowSakthi(true);
        // Reset all tables after successful save
        resetTable1();
        resetTable2();
        resetTable3();
        resetTable4();
        resetTable5();
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setLoadingStates({
        table1: false,
        table2: false,
        table3: false,
        table4: false,
        table5: false
      });
    }
  };

  const fetchPrimaryData = async (date, shift, furnaceNo, panel) => {
    if (!date || !shift || !furnaceNo || !panel) return;
    
    setFetchingPrimary(true);
    const startTime = Date.now();
    let combinationWasFound = false;
    try {
      // Format date for API (YYYY-MM-DD)
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await fetch(`${API_ENDPOINTS.meltingLogs}/primary/${dateStr}?shift=${encodeURIComponent(shift)}&furnaceNo=${encodeURIComponent(furnaceNo)}&panel=${encodeURIComponent(panel)}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const response = await res.json();
      
      if (response.success && response.data) {
        // Populate form with fetched data (only value fields, not key fields)
        setPrimaryData(prev => ({
          ...prev,
          cumulativeLiquidMetal: response.data.cumulativeLiquidMetal || '',
          finalKWHr: response.data.finalKWHr || '',
          initialKWHr: response.data.initialKWHr || '',
          totalUnits: response.data.totalUnits || '',
          cumulativeUnits: response.data.cumulativeUnits || ''
        }));
        
        setPrimaryId(response.data._id);
        setEntryCount(response.data.entryCount || 0);
        
        // Reset error highlights
        setDateErrorHighlight(false);
        setShiftErrorHighlight(false);
        setFurnaceNoErrorHighlight(false);
        setPanelErrorHighlight(false);
        
        // Lock only value fields that have data (shift/furnaceNo/panel are keys, never locked)
        const locks = {};
        if (response.data.cumulativeLiquidMetal !== undefined && response.data.cumulativeLiquidMetal !== null && response.data.cumulativeLiquidMetal !== 0) {
          locks.cumulativeLiquidMetal = true;
        }
        if (response.data.finalKWHr !== undefined && response.data.finalKWHr !== null && response.data.finalKWHr !== 0) {
          locks.finalKWHr = true;
        }
        if (response.data.initialKWHr !== undefined && response.data.initialKWHr !== null && response.data.initialKWHr !== 0) {
          locks.initialKWHr = true;
        }
        if (response.data.totalUnits !== undefined && response.data.totalUnits !== null && response.data.totalUnits !== 0) {
          locks.totalUnits = true;
        }
        if (response.data.cumulativeUnits !== undefined && response.data.cumulativeUnits !== null && response.data.cumulativeUnits !== 0) {
          locks.cumulativeUnits = true;
        }
        setPrimaryLocks(locks);
        
        // Validate only locked fields (fields with actual saved data)
        // Unlocked/empty fields remain neutral (null) until user fills them
        setCumulativeLiquidMetalValid(locks.cumulativeLiquidMetal ? validateNumericInput(response.data.cumulativeLiquidMetal) : null);
        setFinalKWHrValid(locks.finalKWHr ? validateNumericInput(response.data.finalKWHr) : null);
        setInitialKWHrValid(locks.initialKWHr ? validateNumericInput(response.data.initialKWHr) : null);
        setTotalUnitsValid(locks.totalUnits ? validateNumericInput(response.data.totalUnits) : null);
        setCumulativeUnitsValid(locks.cumulativeUnits ? validateNumericInput(response.data.cumulativeUnits) : null);
        setIsPrimaryDataSaved(true);
        setPrimaryDataOriginal({
          cumulativeLiquidMetal: response.data.cumulativeLiquidMetal || '',
          finalKWHr: response.data.finalKWHr || '',
          initialKWHr: response.data.initialKWHr || '',
          totalUnits: response.data.totalUnits || '',
          cumulativeUnits: response.data.cumulativeUnits || ''
        });
        // Mark that combination was found (message shown after fetching loader hides)
        combinationWasFound = true;
      } else {
        // No data found for this combination, reset value fields
        setPrimaryId(null);
        setPrimaryLocks({});
        setIsPrimaryDataSaved(false);
        setEntryCount(0);
        setPrimaryDataOriginal(null);
        setPrimaryData(prev => ({
          ...prev,
          cumulativeLiquidMetal: '',
          finalKWHr: '',
          initialKWHr: '',
          totalUnits: '',
          cumulativeUnits: ''
        }));
        // Reset validation states
        setCumulativeLiquidMetalValid(null);
        setFinalKWHrValid(null);
        setInitialKWHrValid(null);
        setTotalUnitsValid(null);
        setCumulativeUnitsValid(null);
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
      setPrimaryId(null);
      setPrimaryLocks({});
      setIsPrimaryDataSaved(false);
      setEntryCount(0);
      setPrimaryDataOriginal(null);
      // Reset validation states
      setCumulativeLiquidMetalValid(null);
      setFinalKWHrValid(null);
      setInitialKWHrValid(null);
      setTotalUnitsValid(null);
      setCumulativeUnitsValid(null);
    } finally {
      // Ensure minimum 1 second display for consistent UX
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      setFetchingPrimary(false);
      // Show combination found message only after fetching loader is gone
      if (combinationWasFound) {
        setShowCombinationFound(true);
        setTimeout(() => setShowCombinationFound(false), 1500);
      }
      setDynamicCheckAlert(true);
    }
  };

  // Prevent non-numeric characters in number inputs
  const handleKeyDown = (e, nextRef = null, currentField = null) => {
    // Block e, E, +, - keys for numeric inputs
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
      return;
    }
    
    // Handle Enter and Tab for navigation within primary section
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      // Check if current field is locked - if so, don't navigate
      if (currentField && isPrimaryFieldLocked(currentField)) {
        return;
      }
      
      // Navigate to next field
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Get next available field after cumulativeLiquidMetal
  const getNextAfterCumulativeLiquidMetal = () => {
    if (!isPrimaryFieldLocked('finalKWHr')) return finalKWHrRef;
    if (!isPrimaryFieldLocked('initialKWHr')) return initialKWHrRef;
    if (!isPrimaryFieldLocked('totalUnits')) return totalUnitsRef;
    if (!isPrimaryFieldLocked('cumulativeUnits')) return cumulativeUnitsRef;
    return primarySaveButtonRef;
  };

  // Get next available field after finalKWHr
  const getNextAfterFinalKWHr = () => {
    if (!isPrimaryFieldLocked('initialKWHr')) return initialKWHrRef;
    if (!isPrimaryFieldLocked('totalUnits')) return totalUnitsRef;
    if (!isPrimaryFieldLocked('cumulativeUnits')) return cumulativeUnitsRef;
    return primarySaveButtonRef;
  };

  // Get next available field after initialKWHr
  const getNextAfterInitialKWHr = () => {
    if (!isPrimaryFieldLocked('totalUnits')) return totalUnitsRef;
    if (!isPrimaryFieldLocked('cumulativeUnits')) return cumulativeUnitsRef;
    return primarySaveButtonRef;
  };

  // Get next available field after totalUnits
  const getNextAfterTotalUnits = () => {
    if (!isPrimaryFieldLocked('cumulativeUnits')) return cumulativeUnitsRef;
    return primarySaveButtonRef;
  };

  // Get next available field after panel
  const getNextAfterPanel = () => {
    if (!isPrimaryFieldLocked('cumulativeLiquidMetal') && primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      return cumulativeLiquidMetalRef;
    }
    if (!isPrimaryFieldLocked('finalKWHr') && primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      return finalKWHrRef;
    }
    if (!isPrimaryFieldLocked('initialKWHr') && primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      return initialKWHrRef;
    }
    if (!isPrimaryFieldLocked('totalUnits') && primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      return totalUnitsRef;
    }
    if (!isPrimaryFieldLocked('cumulativeUnits') && primaryData.date && primaryData.shift && primaryData.furnaceNo && primaryData.panel) {
      return cumulativeUnitsRef;
    }
    return primarySaveButtonRef;
  };

  // Validate numeric input
  const validateNumericInput = (value) => {
    if (value === '' || value === null || value === undefined) {
      return null; // Empty is neutral
    }
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num) || num < 0) {
      return false; // Invalid
    }
    return null; // Valid input stays neutral (no green)
  };

  const handlePrimaryChange = (field, value) => {
    // Prevent changes to locked value fields
    if (isPrimaryFieldLocked(field)) {
      return;
    }

    // Remove error highlight when filling the field
    if (field === 'date' && value) {
      setDateErrorHighlight(false);
    }
    if (field === 'shift' && value) {
      setShiftErrorHighlight(false);
    }
    if (field === 'furnaceNo' && value) {
      setFurnaceNoErrorHighlight(false);
    }
    if (field === 'panel' && value) {
      setPanelErrorHighlight(false);
    }

    // Validate numeric fields - reset to neutral on change (red only shown on submit)
    if (field === 'cumulativeLiquidMetal') {
      setCumulativeLiquidMetalValid(null);
    }
    if (field === 'finalKWHr') {
      setFinalKWHrValid(null);
    }
    if (field === 'initialKWHr') {
      setInitialKWHrValid(null);
    }
    if (field === 'totalUnits') {
      setTotalUnitsValid(null);
    }
    if (field === 'cumulativeUnits') {
      setCumulativeUnitsValid(null);
    }

    // When date changes, reset everything
    if (field === 'date') {
      setPrimaryData({
        date: value,
        shift: '',
        furnaceNo: '',
        panel: '',
        cumulativeLiquidMetal: '',
        finalKWHr: '',
        initialKWHr: '',
        totalUnits: '',
        cumulativeUnits: ''
      });
      setPrimaryId(null);
      setPrimaryLocks({});
      setIsPrimaryDataSaved(false);
      setPrimarySubmitted(false);
      setEntryCount(0);
      setPrimaryDataOriginal(null);
      // Reset error highlights
      setDateErrorHighlight(false);
      setShiftErrorHighlight(false);
      setFurnaceNoErrorHighlight(false);
      setPanelErrorHighlight(false);
      // Reset all validation states
      setCumulativeLiquidMetalValid(null);
      setFinalKWHrValid(null);
      setInitialKWHrValid(null);
      setTotalUnitsValid(null);
      setCumulativeUnitsValid(null);
      setHeatNoValid(null);
      setGradeValid(null);
      setChargingTimeValid(null);
      setIfBathValid(null);
      setLiquidMetalPressPourValid(null);
      setLiquidMetalHolderValid(null);
      setSgMsSteelValid(null);
      setGreyMsSteelValid(null);
      setReturnsSgValid(null);
      setPigIronValid(null);
      setBoringsValid(null);
      setFinalBathValid(null);
      setCharCoalValid(null);
      setCpcFurValid(null);
      setCpcLcValid(null);
      setSiliconCarbideFurValid(null);
      setFerrosiliconFurValid(null);
      setFerrosiliconLcValid(null);
      setFerroManganeseFurValid(null);
      setFerroManganeseLcValid(null);
      setCuValid(null);
      setCrValid(null);
      setPureMgValid(null);
      setIronPyriteValid(null);
      setLabCoinTimeValid(null);
      setLabCoinTempCValid(null);
      setDeslagingTimeFromValid(null);
      setDeslagingTimeToValid(null);
      setMetalReadyTimeValid(null);
      setWaitingForTappingFromValid(null);
      setWaitingForTappingToValid(null);
      setReasonValid(null);
      setTable4TimeValid(null);
      setTempCSgValid(null);
      setDirectFurnaceValid(null);
      setHolderToFurnaceValid(null);
      setFurnaceToHolderValid(null);
      setDisaNoValid(null);
      setItemValid(null);
      setFurnace1KwValid(null);
      setFurnace1AValid(null);
      setFurnace1VValid(null);
      setFurnace2KwValid(null);
      setFurnace2AValid(null);
      setFurnace2VValid(null);
      setFurnace3KwValid(null);
      setFurnace3AValid(null);
      setFurnace3VValid(null);
      setFurnace4HzValid(null);
      setFurnace4GldValid(null);
      setFurnace4KwHrValid(null);
      resetTable1();
      resetTable2();
      resetTable3();
      resetTable4();
      resetTable5();
      return;
    }

    setPrimaryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler for when value fields are focused - check if prerequisites are filled
  const handleValueFieldFocus = (e) => {
    // Check sequential requirements
    if (!primaryData.date) {
      console.log('Setting date error highlight');
      setDateErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    if (!primaryData.shift) {
      console.log('Setting shift error highlight');
      setShiftErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    if (!primaryData.furnaceNo) {
      console.log('Setting furnace error highlight');
      setFurnaceNoErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    if (!primaryData.panel) {
      console.log('Setting panel error highlight');
      setPanelErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
  };

  // Check if primary value fields have changed from what was fetched/saved
  const isPrimaryDirty = () => {
    if (!isPrimaryDataSaved) return true; // first save always enabled
    if (!primaryDataOriginal) return true;
    return (
      String(primaryData.cumulativeLiquidMetal) !== String(primaryDataOriginal.cumulativeLiquidMetal) ||
      String(primaryData.finalKWHr) !== String(primaryDataOriginal.finalKWHr) ||
      String(primaryData.initialKWHr) !== String(primaryDataOriginal.initialKWHr) ||
      String(primaryData.totalUnits) !== String(primaryDataOriginal.totalUnits) ||
      String(primaryData.cumulativeUnits) !== String(primaryDataOriginal.cumulativeUnits)
    );
  };

  const handlePrimarySubmit = async () => {
    setPrimarySubmitted(true);
    // Validate required key fields
    if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
      alert('Please fill in Date, Shift, Furnace No., and Panel');
      return;
    }

    // Save primary data to database (without locking)
    try {
      const res = await fetch(`${API_ENDPOINTS.meltingLogs}/primary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          primaryData: primaryData,
          isLocked: false
        })
      });
      const response = await res.json();
      
      if (response.success) {
        setPrimaryId(response.data._id);
        setEntryCount(response.data.entryCount || 0);
        // Update primary data with response data to ensure consistency
        setPrimaryData(prev => ({
          ...prev,
          date: response.data.date ? new Date(response.data.date).toISOString().split('T')[0] : prev.date
        }));
        
        // Lock only value fields after saving (shift/furnaceNo/panel are keys)
        const locks = {};
        if (primaryData.cumulativeLiquidMetal !== undefined && primaryData.cumulativeLiquidMetal !== null && primaryData.cumulativeLiquidMetal !== 0 && primaryData.cumulativeLiquidMetal !== '') locks.cumulativeLiquidMetal = true;
        if (primaryData.finalKWHr !== undefined && primaryData.finalKWHr !== null && primaryData.finalKWHr !== 0 && primaryData.finalKWHr !== '') locks.finalKWHr = true;
        if (primaryData.initialKWHr !== undefined && primaryData.initialKWHr !== null && primaryData.initialKWHr !== 0 && primaryData.initialKWHr !== '') locks.initialKWHr = true;
        if (primaryData.totalUnits !== undefined && primaryData.totalUnits !== null && primaryData.totalUnits !== 0 && primaryData.totalUnits !== '') locks.totalUnits = true;
        if (primaryData.cumulativeUnits !== undefined && primaryData.cumulativeUnits !== null && primaryData.cumulativeUnits !== 0 && primaryData.cumulativeUnits !== '') locks.cumulativeUnits = true;
        setPrimaryLocks(locks);
        setIsPrimaryDataSaved(true);
        
        // Snapshot current values as original so button disables until next change
        setPrimaryDataOriginal({
          cumulativeLiquidMetal: primaryData.cumulativeLiquidMetal,
          finalKWHr: primaryData.finalKWHr,
          initialKWHr: primaryData.initialKWHr,
          totalUnits: primaryData.totalUnits,
          cumulativeUnits: primaryData.cumulativeUnits
        });
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
      alert('Failed to save primary data. Please try again.');
    } finally {
    }
  };

  // Helper function to check if a primary field is locked
  const isPrimaryFieldLocked = (field) => {
    return primaryLocks[field] === true;
  };

  // Transform frontend table state into the format the backend expects
  const combineTime = (hour, minute) => {
    if (!hour && !minute) return '';
    const h = String(hour || '0').padStart(2, '0');
    const m = String(minute || '0').padStart(2, '0');
    return `${h}:${m}`;
  };

  const prepareTableData = (tableNum, rawData) => {
    switch (tableNum) {
      case 1:
        return {
          ...rawData,
          chargingTime: combineTime(rawData.chargingTimeHour, rawData.chargingTimeMinute)
        };
      case 3:
        return {
          ...rawData,
          labCoinTime: combineTime(rawData.labCoinTimeHour, rawData.labCoinTimeMinute),
          labCoinTempC: rawData.labCoinTempC,
          deslagingTimeFrom: combineTime(rawData.deslagingTimeFromHour, rawData.deslagingTimeFromMinute),
          deslagingTimeTo: combineTime(rawData.deslagingTimeToHour, rawData.deslagingTimeToMinute),
          metalReadyTime: combineTime(rawData.metalReadyTimeHour, rawData.metalReadyTimeMinute),
          waitingForTappingFrom: combineTime(rawData.waitingForTappingFromHour, rawData.waitingForTappingFromMinute),
          waitingForTappingTo: combineTime(rawData.waitingForTappingToHour, rawData.waitingForTappingToMinute),
          reason: rawData.reason
        };
      case 4:
        return {
          ...rawData,
          time: combineTime(rawData.timeHour, rawData.timeMinute)
        };
      default:
        return rawData;
    }
  };

  const resetTable1 = () => {
    setTable1({
      heatNo: '',
      grade: '',
      chargingTimeHour: '',
      chargingTimeMinute: '',
      ifBath: '',
      liquidMetalPressPour: '',
      liquidMetalHolder: '',
      sgMsSteel: '',
      greyMsSteel: '',
      returnsSg: '',
      pigIron: '',
      borings: '',
      finalBath: ''
    });
  };

  const resetTable2 = () => {
    setTable2({
      charCoal: '',
      cpcFur: '',
      cpcLc: '',
      siliconCarbideFur: '',
      ferrosiliconFur: '',
      ferrosiliconLc: '',
      ferroManganeseFur: '',
      ferroManganeseLc: '',
      cu: '',
      cr: '',
      pureMg: '',
      ironPyrite: ''
    });
  };

  const resetTable3 = () => {
    setTable3({
      labCoinTimeHour: '',
      labCoinTimeMinute: '',
      labCoinTempC: '',
      deslagingTimeFromHour: '',
      deslagingTimeFromMinute: '',
      deslagingTimeToHour: '',
      deslagingTimeToMinute: '',
      metalReadyTimeHour: '',
      metalReadyTimeMinute: '',
      waitingForTappingFromHour: '',
      waitingForTappingFromMinute: '',
      waitingForTappingToHour: '',
      waitingForTappingToMinute: '',
      reason: ''
    });
  };

  const resetTable4 = () => {
    setTable4({
      timeHour: '',
      timeMinute: '',
      tempCSg: '',
      directFurnace: '',
      holderToFurnace: '',
      furnaceToHolder: '',
      disaNo: '',
      item: ''
    });
  };

  const resetTable5 = () => {
    setTable5({
      furnace1Kw: '',
      furnace1A: '',
      furnace1V: '',
      furnace2Kw: '',
      furnace2A: '',
      furnace2V: '',
      furnace3Kw: '',
      furnace3A: '',
      furnace3V: '',
      furnace4Hz: '',
      furnace4Gld: '',
      furnace4KwHr: ''
    });
  };

  // Helper function to get validation className
  // null = neutral (no border color), false = invalid (red border)
  const getValidationClass = (fieldKey, validationState) => {
    // Invalid data - red border
    if (validationState === false) return 'invalid-input';
    
    // Default/neutral - no special styling
    return '';
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
          <Sakthi onComplete={() => setShowSakthi(false)} />
        </div>
      )}
      <div className="page-wrapper">
      {/* Header */}
      <div className="cupola-holder-header">
        <div className="cupola-holder-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Melting Log Sheet - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {primaryData.date ? new Date(primaryData.date).toLocaleDateString('en-GB') : '-'}
        </div>
      </div>

      {/* Primary Section */}
      <div ref={primarySectionRef}>
        <h3 className="section-header" style={{ display: 'flex', alignItems: 'center' }}>Primary Data {isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#5B9AA9', marginLeft: '0.75rem' }}>( Entries : {entryCount} )</span>}</h3>
        
        {/* First Row: Date, Shift, Furnace No., Panel */}
        <div className="melting-primary-fields-row">
          <div className={`melting-log-form-group ${classFor(primaryData.date, primarySubmitted, true)} ${dateErrorHighlight ? 'error-highlight' : ''}`}>
            <label>Date <span style={{ color: '#ef4444' }}>*</span></label>
            <CustomDatePicker
              ref={dateRef}
              value={primaryData.date}
              onChange={(e) => handlePrimaryChange('date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              onKeyDown={(e) => handleKeyDown(e, shiftRef, 'date')}
            />
          </div>
          <div 
            className={`melting-log-form-group ${classFor(primaryData.shift, primarySubmitted, true)} ${shiftErrorHighlight ? 'error-highlight' : ''}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date && e.target.tagName !== 'SELECT') {
                setDateErrorHighlight(true);
                setTimeout(() => setDateErrorHighlight(false), 600);
              }
            }}
          >
            <label>
              Shift <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <ShiftDropdown
              ref={shiftRef}
              value={primaryData.shift}
              onChange={(e) => handlePrimaryChange('shift', e.target.value)}
              disabled={!primaryData.date || fetchingPrimary}
              onKeyDown={(e) => handleKeyDown(e, furnaceRef, 'shift')}
              onMouseDown={(e) => {
                if (!primaryData.date) {
                  setDateErrorHighlight(true);
                  setTimeout(() => setDateErrorHighlight(false), 600);
                }
              }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.furnaceNo, primarySubmitted, true)} ${furnaceNoErrorHighlight ? 'error-highlight' : ''}`}
            onMouseDownCapture={(e) => {
              if (e.target.tagName !== 'SELECT') {
                if (!primaryData.date) {
                  setDateErrorHighlight(true);
                  setFurnaceNoErrorHighlight(true);
                  setTimeout(() => {
                    setDateErrorHighlight(false);
                    setFurnaceNoErrorHighlight(false);
                  }, 600);
                } else if (!primaryData.shift) {
                  setShiftErrorHighlight(true);
                  setFurnaceNoErrorHighlight(true);
                  setTimeout(() => {
                    setShiftErrorHighlight(false);
                    setFurnaceNoErrorHighlight(false);
                  }, 600);
                }
              }
            }}
          >
            <label>
              Furnace No. <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <FurnaceDropdown
              ref={furnaceRef}
              value={primaryData.furnaceNo}
              onChange={(e) => handlePrimaryChange('furnaceNo', e.target.value)}
              disabled={!primaryData.date || !primaryData.shift}
              onKeyDown={(e) => handleKeyDown(e, panelRef, 'furnaceNo')}
              onMouseDown={(e) => {
                if (!primaryData.date) {
                  setDateErrorHighlight(true);
                  setTimeout(() => setDateErrorHighlight(false), 600);
                } else if (!primaryData.shift) {
                  setShiftErrorHighlight(true);
                  setTimeout(() => setShiftErrorHighlight(false), 600);
                }
              }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.panel, primarySubmitted, true)} ${panelErrorHighlight ? 'error-highlight' : ''}`}
            onMouseDownCapture={(e) => {
              if (e.target.tagName !== 'SELECT') {
                if (!primaryData.date) {
                  setDateErrorHighlight(true);
                  setPanelErrorHighlight(true);
                  setTimeout(() => {
                    setDateErrorHighlight(false);
                    setPanelErrorHighlight(false);
                  }, 600);
                } else if (!primaryData.shift) {
                  setShiftErrorHighlight(true);
                  setPanelErrorHighlight(true);
                  setTimeout(() => {
                    setShiftErrorHighlight(false);
                    setPanelErrorHighlight(false);
                  }, 600);
                } else if (!primaryData.furnaceNo) {
                  setFurnaceNoErrorHighlight(true);
                  setPanelErrorHighlight(true);
                  setTimeout(() => {
                    setFurnaceNoErrorHighlight(false);
                    setPanelErrorHighlight(false);
                  }, 600);
                }
              }
            }}
          >
            <label>
              Panel <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <PanelDropdown
              ref={panelRef}
              value={primaryData.panel}
              onChange={(e) => handlePrimaryChange('panel', e.target.value)}
              disabled={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo}
              onKeyDown={(e) => handleKeyDown(e, getNextAfterPanel(), 'panel')}
              onMouseDown={(e) => {
                if (!primaryData.date) {
                  setDateErrorHighlight(true);
                  setTimeout(() => setDateErrorHighlight(false), 600);
                } else if (!primaryData.shift) {
                  setShiftErrorHighlight(true);
                  setTimeout(() => setShiftErrorHighlight(false), 600);
                } else if (!primaryData.furnaceNo) {
                  setFurnaceNoErrorHighlight(true);
                  setTimeout(() => setFurnaceNoErrorHighlight(false), 600);
                }
              }}
            />
            {(fetchingPrimary || showCombinationFound) && (
              <div style={{ 
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                {fetchingPrimary && (
                  <InlineLoader 
                    message="Fetching Date, Shift, Furnace, Panel" 
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
              </div>
            )}
          </div>
        </div>

        <div className="melting-log-form-grid">
          <div 
            className={`melting-log-form-group ${classFor(primaryData.cumulativeLiquidMetal, primarySubmitted, true, isPrimaryFieldLocked('cumulativeLiquidMetal'))}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
                handleValueFieldFocus(e);
              }
            }}
            style={{
              cursor: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'pointer' : 'default'
            }}
          >
            <label>
              Cumulative Liquid Metal
              {isPrimaryFieldLocked('cumulativeLiquidMetal') && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
          <input
                ref={cumulativeLiquidMetalRef}
                type="number"
                value={primaryData.cumulativeLiquidMetal}
                onChange={(e) => handlePrimaryChange('cumulativeLiquidMetal', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, getNextAfterCumulativeLiquidMetal(), 'cumulativeLiquidMetal')}
                placeholder="Enter value"
                step="0.01"
                readOnly={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || isPrimaryFieldLocked('cumulativeLiquidMetal')}
                tabIndex={isPrimaryFieldLocked('cumulativeLiquidMetal') ? -1 : 0}
                className={getNumericValidationClass(cumulativeLiquidMetalValid, isPrimaryFieldLocked('cumulativeLiquidMetal'))}
                style={{
                  backgroundColor: isPrimaryFieldLocked('cumulativeLiquidMetal') ? '#f0fdf4' : (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? '#f1f5f9' : '#ffffff',
                  cursor: (isPrimaryFieldLocked('cumulativeLiquidMetal') || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'not-allowed' : 'text',
                  opacity: isPrimaryFieldLocked('cumulativeLiquidMetal') ? 0.6 : 1,
                  pointerEvents: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'none' : 'auto'
                }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.finalKWHr, primarySubmitted, true, isPrimaryFieldLocked('finalKWHr'))}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
                handleValueFieldFocus(e);
              }
            }}
            style={{
              cursor: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'pointer' : 'default'
            }}
          >
            <label>
              Final KWHr
              {isPrimaryFieldLocked('finalKWHr') && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
          <input
                ref={finalKWHrRef}
                type="number"
                value={primaryData.finalKWHr}
                onChange={(e) => handlePrimaryChange('finalKWHr', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, getNextAfterFinalKWHr(), 'finalKWHr')}
                placeholder="Enter value"
                step="0.01"
                readOnly={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || isPrimaryFieldLocked('finalKWHr')}
                tabIndex={isPrimaryFieldLocked('finalKWHr') ? -1 : 0}
                className={getNumericValidationClass(finalKWHrValid, isPrimaryFieldLocked('finalKWHr'))}
                style={{
                  backgroundColor: isPrimaryFieldLocked('finalKWHr') ? '#f0fdf4' : (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? '#f1f5f9' : '#ffffff',
                  cursor: (isPrimaryFieldLocked('finalKWHr') || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'not-allowed' : 'text',
                  opacity: isPrimaryFieldLocked('finalKWHr') ? 0.6 : 1,
                  pointerEvents: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'none' : 'auto'
                }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.initialKWHr, primarySubmitted, true, isPrimaryFieldLocked('initialKWHr'))}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
                handleValueFieldFocus(e);
              }
            }}
            style={{
              cursor: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'pointer' : 'default'
            }}
          >
            <label>
              Initial KWHr
              {isPrimaryFieldLocked('initialKWHr') && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
          <input
                ref={initialKWHrRef}
                type="number"
                value={primaryData.initialKWHr}
                onChange={(e) => handlePrimaryChange('initialKWHr', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, getNextAfterInitialKWHr(), 'initialKWHr')}
                placeholder="Enter value"
                step="0.01"
                readOnly={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || isPrimaryFieldLocked('initialKWHr')}
                tabIndex={isPrimaryFieldLocked('initialKWHr') ? -1 : 0}
                className={getNumericValidationClass(initialKWHrValid, isPrimaryFieldLocked('initialKWHr'))}
                style={{
                  backgroundColor: isPrimaryFieldLocked('initialKWHr') ? '#f0fdf4' : (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? '#f1f5f9' : '#ffffff',
                  cursor: (isPrimaryFieldLocked('initialKWHr') || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'not-allowed' : 'text',
                  opacity: isPrimaryFieldLocked('initialKWHr') ? 0.6 : 1,
                  pointerEvents: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'none' : 'auto'
                }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.totalUnits, primarySubmitted, true, isPrimaryFieldLocked('totalUnits'))}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
                handleValueFieldFocus(e);
              }
            }}
            style={{
              cursor: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'pointer' : 'default'
            }}
          >
            <label>
              Total Units
              {isPrimaryFieldLocked('totalUnits') && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
          <input
                ref={totalUnitsRef}
                type="number"
                value={primaryData.totalUnits}
                onChange={(e) => handlePrimaryChange('totalUnits', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, getNextAfterTotalUnits(), 'totalUnits')}
                placeholder="Enter value"
                step="0.01"
                readOnly={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || isPrimaryFieldLocked('totalUnits')}
                tabIndex={isPrimaryFieldLocked('totalUnits') ? -1 : 0}
                className={getNumericValidationClass(totalUnitsValid, isPrimaryFieldLocked('totalUnits'))}
                style={{
                  backgroundColor: isPrimaryFieldLocked('totalUnits') ? '#f0fdf4' : (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? '#f1f5f9' : '#ffffff',
                  cursor: (isPrimaryFieldLocked('totalUnits') || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'not-allowed' : 'text',
                  opacity: isPrimaryFieldLocked('totalUnits') ? 0.6 : 1,
                  pointerEvents: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'none' : 'auto'
                }}
            />
          </div>

          <div 
            className={`melting-log-form-group ${classFor(primaryData.cumulativeUnits, primarySubmitted, true, isPrimaryFieldLocked('cumulativeUnits'))}`}
            onMouseDownCapture={(e) => {
              if (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) {
                handleValueFieldFocus(e);
              }
            }}
            style={{
              cursor: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'pointer' : 'default'
            }}
          >
            <label>
              Cumulative Units
              {isPrimaryFieldLocked('cumulativeUnits') && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
          <input
                ref={cumulativeUnitsRef}
                type="number"
                value={primaryData.cumulativeUnits}
                onChange={(e) => handlePrimaryChange('cumulativeUnits', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, primarySaveButtonRef, 'cumulativeUnits')}
                placeholder="Enter value"
                step="0.01"
                readOnly={!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || isPrimaryFieldLocked('cumulativeUnits')}
                tabIndex={isPrimaryFieldLocked('cumulativeUnits') ? -1 : 0}
                className={getNumericValidationClass(cumulativeUnitsValid, isPrimaryFieldLocked('cumulativeUnits'))}
                style={{
                  backgroundColor: isPrimaryFieldLocked('cumulativeUnits') ? '#f0fdf4' : (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? '#f1f5f9' : '#ffffff',
                  cursor: (isPrimaryFieldLocked('cumulativeUnits') || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'not-allowed' : 'text',
                  opacity: isPrimaryFieldLocked('cumulativeUnits') ? 0.6 : 1,
                  pointerEvents: (!primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel) ? 'none' : 'auto'
                }}
            />
          </div>
        </div>

        <div className="melting-log-submit-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showPrimaryWarning && (
            <InlineLoader 
              message="Save Primary Data first" 
              size="medium" 
              variant="warning" 
            />
          )}
          <button
            ref={primarySaveButtonRef}
            className="cupola-holder-submit-btn"
            onClick={handlePrimarySubmit}
            disabled={fetchingPrimary || !primaryData.date || !primaryData.shift || !primaryData.furnaceNo || !primaryData.panel || !isPrimaryDirty() || hasInvalidNumericInput()}
          >
            <Save size={18} />
            {isPrimaryDataSaved ? 'Update Primary Data' : 'Save Primary'}
          </button>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 1 */}
      <div 
        style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, cursor: isPrimaryDataSaved ? 'default' : 'not-allowed', position: 'relative' }}
        onClickCapture={!isPrimaryDataSaved ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrimaryWarning(true);
          primarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => setShowPrimaryWarning(false), 3000);
        } : undefined}
      >
        <h3 className="section-header">Table 1 {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
          <div className="melting-log-form-group">
            <label>Heat No</label>
            <input
              ref={heatNoRef}
              type="text"
              value={table1.heatNo || ''}
              onChange={(e) => handleTableChange(1, 'heatNo', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, gradeRef)}
              onFocus={() => setFocusedField('table1.heatNo')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter heat no"
              className={getValidationClass('table1.heatNo', heatNoValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Grade</label>
            <input
              ref={gradeRef}
              type="text"
              value={table1.grade || ''}
              onChange={(e) => handleTableChange(1, 'grade', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, chargingTimeRef)}
              onFocus={() => setFocusedField('table1.grade')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter grade"
              className={getValidationClass('table1.grade', gradeValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Time</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table1.chargingTimeHour, table1.chargingTimeMinute)}
              onChange={(time) => handleTimeChange(1, 'chargingTimeHour', 'chargingTimeMinute', time)}
              className={getValidationClass('table1.chargingTime', chargingTimeValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>If Bath</label>
            <input
              ref={ifBathRef}
              type="text"
              value={table1.ifBath || ''}
              onChange={(e) => handleTableChange(1, 'ifBath', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, liquidMetalPressPourRef)}
              onFocus={() => setFocusedField('table1.ifBath')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter if bath"
              className={getValidationClass('table1.ifBath', ifBathValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Liquid Metal - Press Pour (kgs)</label>
            <input
              ref={liquidMetalPressPourRef}
              type="number"
              value={table1.liquidMetalPressPour || ''}
              onChange={(e) => handleTableChange(1, 'liquidMetalPressPour', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, liquidMetalHolderRef)}
              onFocus={() => setFocusedField('table1.liquidMetalPressPour')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table1.liquidMetalPressPour', liquidMetalPressPourValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Liquid Metal - Holder (kgs)</label>
            <input
              ref={liquidMetalHolderRef}
              type="number"
              value={table1.liquidMetalHolder || ''}
              onChange={(e) => handleTableChange(1, 'liquidMetalHolder', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, sgMsSteelRef)}
              onFocus={() => setFocusedField('table1.liquidMetalHolder')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table1.liquidMetalHolder', liquidMetalHolderValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>SG-MS Steel (400 - 2500 kgs)</label>
            <input
              ref={sgMsSteelRef}
              type="number"
              value={table1.sgMsSteel || ''}
              onChange={(e) => handleTableChange(1, 'sgMsSteel', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, greyMsSteelRef)}
              onFocus={() => setFocusedField('table1.sgMsSteel')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              min="400"
              max="2500"
              step="0.01"
              className={getValidationClass('table1.sgMsSteel', sgMsSteelValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Grey MS Steel (400 - 2500 kgs)</label>
            <input
              ref={greyMsSteelRef}
              type="number"
              value={table1.greyMsSteel || ''}
              onChange={(e) => handleTableChange(1, 'greyMsSteel', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, returnsSgRef)}
              onFocus={() => setFocusedField('table1.greyMsSteel')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              min="400"
              max="2500"
              step="0.01"
              className={getValidationClass('table1.greyMsSteel', greyMsSteelValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Returns SG (500 - 2500 kgs)</label>
            <input
              ref={returnsSgRef}
              type="number"
              value={table1.returnsSg || ''}
              onChange={(e) => handleTableChange(1, 'returnsSg', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, pigIronRef)}
              onFocus={() => setFocusedField('table1.returnsSg')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              min="500"
              max="2500"
              step="0.01"
              className={getValidationClass('table1.returnsSg', returnsSgValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Pig Iron (0 - 350 kgs)</label>
            <input
              ref={pigIronRef}
              type="number"
              value={table1.pigIron || ''}
              onChange={(e) => handleTableChange(1, 'pigIron', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, boringsRef)}
              onFocus={() => setFocusedField('table1.pigIron')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              min="0"
              max="350"
              step="0.01"
              className={getValidationClass('table1.pigIron', pigIronValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Borings (0 - 1900 kgs)</label>
            <input
              ref={boringsRef}
              type="number"
              value={table1.borings || ''}
              onChange={(e) => handleTableChange(1, 'borings', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, finalBathRef)}
              onFocus={() => setFocusedField('table1.borings')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              min="0"
              max="1900"
              step="0.01"
              className={getValidationClass('table1.borings', boringsValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Final Bath (kgs)</label>
            <input
              ref={finalBathRef}
              type="number"
              value={table1.finalBath || ''}
              onChange={(e) => handleTableChange(1, 'finalBath', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, charCoalRef)}
              onFocus={() => setFocusedField('table1.finalBath')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table1.finalBath', finalBathValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 2 */}
      <div 
        style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, cursor: isPrimaryDataSaved ? 'default' : 'not-allowed', position: 'relative' }}
        onClickCapture={!isPrimaryDataSaved ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrimaryWarning(true);
          primarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => setShowPrimaryWarning(false), 3000);
        } : undefined}
      >
        <h3 className="section-header">Table 2 {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
          <div className="melting-log-form-group">
            <label>CharCoal (kgs)</label>
            <input
              ref={charCoalRef}
              type="number"
              value={table2.charCoal || ''}
              onChange={(e) => handleTableChange(2, 'charCoal', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, cpcFurRef)}
              onFocus={() => setFocusedField('table2.charCoal')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.charCoal', charCoalValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>CPC - Fur (kgs)</label>
            <input
              ref={cpcFurRef}
              type="number"
              value={table2.cpcFur || ''}
              onChange={(e) => handleTableChange(2, 'cpcFur', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, cpcLcRef)}
              onFocus={() => setFocusedField('table2.cpcFur')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.cpcFur', cpcFurValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>CPC - LC (kgs)</label>
            <input
              ref={cpcLcRef}
              type="number"
              value={table2.cpcLc || ''}
              onChange={(e) => handleTableChange(2, 'cpcLc', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, siliconCarbideFurRef)}
              onFocus={() => setFocusedField('table2.cpcLc')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.cpcLc', cpcLcValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Silicon Carbide - Fur (kgs)</label>
            <input
              ref={siliconCarbideFurRef}
              type="number"
              value={table2.siliconCarbideFur || ''}
              onChange={(e) => handleTableChange(2, 'siliconCarbideFur', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, ferrosiliconFurRef)}
              onFocus={() => setFocusedField('table2.siliconCarbideFur')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value (0.03 to 0.09)"
              min="0.03"
              max="0.09"
              step="0.01"
              className={getValidationClass('table2.siliconCarbideFur', siliconCarbideFurValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Ferrosilicon - Fur (kgs)</label>
            <input
              ref={ferrosiliconFurRef}
              type="number"
              value={table2.ferrosiliconFur || ''}
              onChange={(e) => handleTableChange(2, 'ferrosiliconFur', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, ferrosiliconLcRef)}
              onFocus={() => setFocusedField('table2.ferrosiliconFur')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.ferrosiliconFur', ferrosiliconFurValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Ferrosilicon - LC (kgs)</label>
            <input
              ref={ferrosiliconLcRef}
              type="number"
              value={table2.ferrosiliconLc || ''}
              onChange={(e) => handleTableChange(2, 'ferrosiliconLc', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, ferroManganeseFurRef)}
              onFocus={() => setFocusedField('table2.ferrosiliconLc')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.ferrosiliconLc', ferrosiliconLcValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>FerroManganese - Fur (kgs)</label>
            <input
              ref={ferroManganeseFurRef}
              type="number"
              value={table2.ferroManganeseFur || ''}
              onChange={(e) => handleTableChange(2, 'ferroManganeseFur', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, ferroManganeseLcRef)}
              onFocus={() => setFocusedField('table2.ferroManganeseFur')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.ferroManganeseFur', ferroManganeseFurValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>FerroManganese - LC (kgs)</label>
            <input
              ref={ferroManganeseLcRef}
              type="number"
              value={table2.ferroManganeseLc || ''}
              onChange={(e) => handleTableChange(2, 'ferroManganeseLc', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, cuRef)}
              onFocus={() => setFocusedField('table2.ferroManganeseLc')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.ferroManganeseLc', ferroManganeseLcValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Cu (kgs)</label>
            <input
              ref={cuRef}
              type="number"
              value={table2.cu || ''}
              onChange={(e) => handleTableChange(2, 'cu', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, crRef)}
              onFocus={() => setFocusedField('table2.cu')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.cu', cuValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Cr (kgs)</label>
            <input
              ref={crRef}
              type="number"
              value={table2.cr || ''}
              onChange={(e) => handleTableChange(2, 'cr', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, pureMgRef)}
              onFocus={() => setFocusedField('table2.cr')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.cr', crValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Pure Mg (kgs)</label>
            <input
              ref={pureMgRef}
              type="number"
              value={table2.pureMg || ''}
              onChange={(e) => handleTableChange(2, 'pureMg', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, ironPyriteRef)}
              onFocus={() => setFocusedField('table2.pureMg')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.pureMg', pureMgValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Iron Pyrite (kgs)</label>
            <input
              ref={ironPyriteRef}
              type="number"
              value={table2.ironPyrite || ''}
              onChange={(e) => handleTableChange(2, 'ironPyrite', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, labCoinTimeRef)}
              onFocus={() => setFocusedField('table2.ironPyrite')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass('table2.ironPyrite', ironPyriteValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 3 */}
      <div 
        style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, cursor: isPrimaryDataSaved ? 'default' : 'not-allowed', position: 'relative' }}
        onClickCapture={!isPrimaryDataSaved ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrimaryWarning(true);
          primarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => setShowPrimaryWarning(false), 3000);
        } : undefined}
      >
        <h3 className="section-header">Table 3 {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ rowGap: '1.5rem', pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
          <div className="melting-log-form-group">
            <label>Lab Coin - Time</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.labCoinTimeHour, table3.labCoinTimeMinute)}
              onChange={(time) => handleTimeChange(3, 'labCoinTimeHour', 'labCoinTimeMinute', time)}
              className={getValidationClass('table3.labCoinTime', labCoinTimeValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Lab Coin - Temp (°C)</label>
            <input
              ref={labCoinTempCRef}
              type="number"
              value={table3.labCoinTempC || ''}
              onChange={(e) => handleTableChange(3, 'labCoinTempC', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, reasonRef)}
              onFocus={() => setFocusedField('table3.labCoinTempC')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter temperature in °C"
              step="0.01"
              className={getValidationClass('table3.labCoinTempC', labCoinTempCValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Deslaging Time - From</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.deslagingTimeFromHour, table3.deslagingTimeFromMinute)}
              onChange={(time) => handleTimeChange(3, 'deslagingTimeFromHour', 'deslagingTimeFromMinute', time)}
              className={getValidationClass('table3.deslagingTimeFrom', deslagingTimeFromValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Deslaging Time -To</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.deslagingTimeToHour, table3.deslagingTimeToMinute)}
              onChange={(time) => handleTimeChange(3, 'deslagingTimeToHour', 'deslagingTimeToMinute', time)}
              className={getValidationClass('table3.deslagingTimeTo', deslagingTimeToValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Metal Ready Time</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.metalReadyTimeHour, table3.metalReadyTimeMinute)}
              onChange={(time) => handleTimeChange(3, 'metalReadyTimeHour', 'metalReadyTimeMinute', time)}
              className={getValidationClass('table3.metalReadyTime', metalReadyTimeValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ rowGap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="melting-log-form-group">
            <label>Waiting for Tapping- From</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.waitingForTappingFromHour, table3.waitingForTappingFromMinute)}
              onChange={(time) => handleTimeChange(3, 'waitingForTappingFromHour', 'waitingForTappingFromMinute', time)}
              className={getValidationClass('table3.waitingForTappingFrom', waitingForTappingFromValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Waiting for Tapping -To</label>
            <CustomTimeInput
              value={createTimeFromHourMinute(table3.waitingForTappingToHour, table3.waitingForTappingToMinute)}
              onChange={(time) => handleTimeChange(3, 'waitingForTappingToHour', 'waitingForTappingToMinute', time)}
              className={getValidationClass('table3.waitingForTappingTo', waitingForTappingToValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group" />
          <div className="melting-log-form-group" />
          <div className="melting-log-form-group" />
        </div>

        <div className="melting-log-form-grid">
          <div className="melting-log-form-group" style={{ maxWidth: '40%' }}>
            <label>Reason</label>
            <input
              ref={reasonRef}
              type="text"
              value={table3.reason || ''}
              onChange={(e) => handleTableChange(3, 'reason', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, tempCSgRef)}
              onFocus={() => setFocusedField('table3.reason')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter reason"
              className={getValidationClass('table3.reason', reasonValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 4 - Metal Tapping in Kgs */}
      <div 
        style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, cursor: isPrimaryDataSaved ? 'default' : 'not-allowed', position: 'relative' }}
        onClickCapture={!isPrimaryDataSaved ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrimaryWarning(true);
          primarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => setShowPrimaryWarning(false), 3000);
        } : undefined}
      >
        <h3 className="section-header">Table 4 {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        
        <div className="melting-log-form-grid" style={{ pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="melting-log-form-group">
          <label>Time</label>
          <CustomTimeInput
            value={createTimeFromHourMinute(table4.timeHour, table4.timeMinute)}
            onChange={(time) => handleTimeChange(4, 'timeHour', 'timeMinute', time)}
            className={getValidationClass('table4.time', table4TimeValid)}
            disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Temp C - SG (0-2000°C)</label>
          <input
                ref={tempCSgRef}
                type="number"
                value={table4.tempCSg || ''}
                onChange={(e) => handleTableChange(4, 'tempCSg', e.target.value)}
                onKeyDown={(e) => handleTableEnterKey(e, directFurnaceRef)}
                onFocus={() => setFocusedField('table4.tempCSg')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter temperature"
                step="0.01"
                className={getValidationClass('table4.tempCSg', tempCSgValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Direct Furnace (kgs)</label>
          <input
                ref={directFurnaceRef}
                type="number"
                value={table4.directFurnace || ''}
                onChange={(e) => handleTableChange(4, 'directFurnace', e.target.value)}
                onKeyDown={(e) => handleTableEnterKey(e, holderToFurnaceRef)}
                onFocus={() => setFocusedField('table4.directFurnace')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass('table4.directFurnace', directFurnaceValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Holder To Furnace (kgs)</label>
          <input
                ref={holderToFurnaceRef}
                type="number"
                value={table4.holderToFurnace || ''}
                onChange={(e) => handleTableChange(4, 'holderToFurnace', e.target.value)}
                onKeyDown={(e) => handleTableEnterKey(e, furnaceToHolderRef)}
                onFocus={() => setFocusedField('table4.holderToFurnace')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass('table4.holderToFurnace', holderToFurnaceValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Furnace To Holder (kgs)</label>
          <input
                ref={furnaceToHolderRef}
                type="number"
                value={table4.furnaceToHolder || ''}
                onChange={(e) => handleTableChange(4, 'furnaceToHolder', e.target.value)}
                onKeyDown={(e) => handleTableEnterKey(e, itemRef)}
                onFocus={() => setFocusedField('table4.furnaceToHolder')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass('table4.furnaceToHolder', furnaceToHolderValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Disa No.</label>
          <DisaDropdown
                value={table4.disaNo || ''}
                onChange={(e) => handleTableChange(4, 'disaNo', e.target.value)}
                className={getValidationClass('table4.disaNo', disaNoValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Item</label>
          <input
                ref={itemRef}
                type="text"
                value={table4.item || ''}
                onChange={(e) => handleTableChange(4, 'item', e.target.value)}
                onKeyDown={(e) => handleTableEnterKey(e, furnace1KwRef)}
                onFocus={() => setFocusedField('table4.item')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter item"
                className={getValidationClass('table4.item', itemValid)}
                disabled={!isPrimaryDataSaved}
          />
        </div>
      </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 5 - Electrical Readings */}
      <div 
        style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, cursor: isPrimaryDataSaved ? 'default' : 'not-allowed', position: 'relative' }}
        onClickCapture={!isPrimaryDataSaved ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPrimaryWarning(true);
          primarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => setShowPrimaryWarning(false), 3000);
        } : undefined}
      >
        <h3 className="section-header">Table 5 {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>

        {/* Furnace 1,2,3 combined section */}
        <h4 className="melting-log-sub-section-title">Furnace 1,2,3</h4>
        <div className="melting-log-form-grid melting-log-table5-grid" style={{ pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
          <div className="melting-log-form-group">
            <label>Kw</label>
            <input
              ref={furnace1KwRef}
              type="number"
              value={table5.furnace1Kw || ''}
              onChange={(e) => handleTableChange(5, 'furnace1Kw', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, furnace1ARef)}
              onFocus={() => setFocusedField('table5.furnace1Kw')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter Kw"
              step="0.01"
              className={getValidationClass('table5.furnace1Kw', furnace1KwValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>A (2000-3500)</label>
            <input
              ref={furnace1ARef}
              type="number"
              value={table5.furnace1A || ''}
              onChange={(e) => handleTableChange(5, 'furnace1A', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, furnace1VRef)}
              onFocus={() => setFocusedField('table5.furnace1A')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter A"
              step="0.01"
              className={getValidationClass('table5.furnace1A', furnace1AValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>V (500-1000)</label>
            <input
              ref={furnace1VRef}
              type="number"
              value={table5.furnace1V || ''}
              onChange={(e) => handleTableChange(5, 'furnace1V', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, furnace4HzRef)}
              onFocus={() => setFocusedField('table5.furnace1V')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter V"
              step="0.01"
              className={getValidationClass('table5.furnace1V', furnace1VValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>

        {/* Furnace 4 section */}
        <h4 className="melting-log-sub-section-title">Furnace 4</h4>
        <div className="melting-log-form-grid melting-log-table5-grid" style={{ pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
          <div className="melting-log-form-group">
            <label>Hz</label>
            <input
              ref={furnace4HzRef}
              type="number"
              value={table5.furnace4Hz || ''}
              onChange={(e) => handleTableChange(5, 'furnace4Hz', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, furnace4GldRef)}
              onFocus={() => setFocusedField('table5.furnace4Hz')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter Hz"
              step="0.01"
              className={getValidationClass('table5.furnace4Hz', furnace4HzValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>GLD (0.6-95)</label>
            <input
              ref={furnace4GldRef}
              type="number"
              value={table5.furnace4Gld || ''}
              onChange={(e) => handleTableChange(5, 'furnace4Gld', e.target.value)}
              onKeyDown={(e) => handleTableEnterKey(e, furnace4KwHrRef)}
              onFocus={() => setFocusedField('table5.furnace4Gld')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter GLD"
              step="0.01"
              className={getValidationClass('table5.furnace4Gld', furnace4GldValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Kw/Hr</label>
            <input
              ref={furnace4KwHrRef}
              type="number"
              value={table5.furnace4KwHr || ''}
              onChange={(e) => handleTableChange(5, 'furnace4KwHr', e.target.value)}
              onFocus={() => setFocusedField('table5.furnace4KwHr')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter Kw/Hr"
              step="0.01"
              className={getValidationClass('table5.furnace4KwHr', furnace4KwHrValid)}
              disabled={!isPrimaryDataSaved}
            />
          </div>
        </div>
      </div>

      {/* All Tables Submit Button */}
      <div className="melting-log-submit-container" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
        {validationErrorMessage && (
          <InlineLoader 
            message={validationErrorMessage}
            variant="danger"
            size="medium"
          />
        )}
        <button
          className="cupola-holder-submit-btn"
          onClick={handleAllTablesSubmit}
          disabled={loadingStates.table1 || loadingStates.table2 || loadingStates.table3 || loadingStates.table4 || loadingStates.table5 || !isPrimaryDataSaved}
          title={!isPrimaryDataSaved ? 'Please save primary data first' : 'Save Entry'}
        >
          {(loadingStates.table1 || loadingStates.table2 || loadingStates.table3 || loadingStates.table4 || loadingStates.table5) ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving Entry...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Entry
            </>
          )}
        </button>
      </div>
    </div>
    </>
  );
};

export default MeltingLogSheet;
