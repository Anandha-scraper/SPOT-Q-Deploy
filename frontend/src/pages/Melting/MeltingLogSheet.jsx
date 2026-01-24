import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, RotateCcw } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { TimeInput } from '../../Components/Buttons';
import '../../styles/PageStyles/Melting/MeltingLogSheet.css';

const MeltingLogSheet = () => {
  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Primary: Date, Shift, Furnace No., Panel, Cumulative Liquid metal, Final KWHr, Initial KWHr, Total Units, Cumulative Units
  const [primaryData, setPrimaryData] = useState({
    date: getCurrentDate(),
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

  // Validation flag and helper for primary section
  const [primarySubmitted, setPrimarySubmitted] = useState(false);
  const classFor = (value, submitted, required = false) => {
    const has = value !== undefined && value !== null && String(value).trim() !== '';
    if (has) return 'melting-success-outline';
    if (submitted && required) return 'melting-error-outline';
    return '';
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
    gl: '',
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
    tempCGrey: '',
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

  // Refs for time inputs
  const chargingTimeHourRef = useRef(null);
  const chargingTimeMinuteRef = useRef(null);
  const labCoinTimeHourRef = useRef(null);
  const labCoinTimeMinuteRef = useRef(null);
  const deslagingTimeFromHourRef = useRef(null);
  const deslagingTimeFromMinuteRef = useRef(null);
  const deslagingTimeToHourRef = useRef(null);
  const deslagingTimeToMinuteRef = useRef(null);
  const metalReadyTimeHourRef = useRef(null);
  const metalReadyTimeMinuteRef = useRef(null);
  const waitingForTappingFromHourRef = useRef(null);
  const waitingForTappingFromMinuteRef = useRef(null);
  const waitingForTappingToHourRef = useRef(null);
  const waitingForTappingToMinuteRef = useRef(null);
  const table4TimeHourRef = useRef(null);
  const table4TimeMinuteRef = useRef(null);

  // Validation states (null = neutral, true = valid/green, false = invalid/red)
  // Primary validations
  const [shiftValid, setShiftValid] = useState(null);
  const [furnaceNoValid, setFurnaceNoValid] = useState(null);
  const [panelValid, setPanelValid] = useState(null);
  const [cumulativeLiquidMetalValid, setCumulativeLiquidMetalValid] = useState(null);
  const [finalKWHrValid, setFinalKWHrValid] = useState(null);
  const [initialKWHrValid, setInitialKWHrValid] = useState(null);
  const [totalUnitsValid, setTotalUnitsValid] = useState(null);
  const [cumulativeUnitsValid, setCumulativeUnitsValid] = useState(null);
  
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
  const [glValid, setGlValid] = useState(null);
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
  const [tempCGreyValid, setTempCGreyValid] = useState(null);
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

  const [loadingStates, setLoadingStates] = useState({
    table1: false,
    table2: false,
    table3: false,
    table4: false,
    table5: false
  });

  // Automatically fetch data for current date on component mount
  useEffect(() => {
    const currentDate = getCurrentDate();
    if (currentDate) {
      fetchPrimaryData(currentDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleTableChange = (tableNum, field, value) => {
    // Validation logic for Table 1
    if (tableNum === 1) {
      if (field === 'heatNo') {
        if (value.trim() === '') {
          setHeatNoValid(null);
        } else {
          setHeatNoValid(value.trim().length > 0);
        }
      }
      if (field === 'grade') {
        if (value.trim() === '') {
          setGradeValid(null);
        } else {
          setGradeValid(value.trim().length > 0);
        }
      }
      // Charging time validation
      if (field.includes('chargingTime')) {
        const updatedData = {...table1, [field]: value};
        const hasTime = updatedData.chargingTimeHour && updatedData.chargingTimeMinute;
        const allEmpty = !updatedData.chargingTimeHour && !updatedData.chargingTimeMinute;
        
        if (allEmpty) {
          setChargingTimeValid(null);
        } else if (hasTime) {
          setChargingTimeValid(true);
        } else {
          setChargingTimeValid(false);
        }
      }
      if (field === 'ifBath') {
        if (value.trim() === '') {
          setIfBathValid(null);
        } else {
          setIfBathValid(value.trim().length > 0);
        }
      }
      if (field === 'liquidMetalPressPour') {
        if (value.trim() === '') {
          setLiquidMetalPressPourValid(null);
        } else {
          setLiquidMetalPressPourValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'liquidMetalHolder') {
        if (value.trim() === '') {
          setLiquidMetalHolderValid(null);
        } else {
          setLiquidMetalHolderValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'sgMsSteel') {
        if (value.trim() === '') {
          setSgMsSteelValid(null);
        } else {
          const num = parseFloat(value);
          setSgMsSteelValid(!isNaN(value) && num >= 400 && num <= 2500);
        }
      }
      if (field === 'greyMsSteel') {
        if (value.trim() === '') {
          setGreyMsSteelValid(null);
        } else {
          const num = parseFloat(value);
          setGreyMsSteelValid(!isNaN(value) && num >= 400 && num <= 2500);
        }
      }
      if (field === 'returnsSg') {
        if (value.trim() === '') {
          setReturnsSgValid(null);
        } else {
          setReturnsSgValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'gl') {
        if (value.trim() === '') {
          setGlValid(null);
        } else {
          setGlValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'pigIron') {
        if (value.trim() === '') {
          setPigIronValid(null);
        } else {
          setPigIronValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'borings') {
        if (value.trim() === '') {
          setBoringsValid(null);
        } else {
          setBoringsValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'finalBath') {
        if (value.trim() === '') {
          setFinalBathValid(null);
        } else {
          setFinalBathValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

    // Validation logic for Table 2
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
      
      if (validations[field]) {
        if (value.trim() === '') {
          validations[field](null);
        } else {
          validations[field](!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

    // Validation logic for Table 3
    if (tableNum === 3) {
      if (field.includes('labCoinTime')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.labCoinTimeHour && updatedData.labCoinTimeMinute;
        const allEmpty = !updatedData.labCoinTimeHour && !updatedData.labCoinTimeMinute;
        
        if (allEmpty) {
          setLabCoinTimeValid(null);
        } else if (hasTime) {
          setLabCoinTimeValid(true);
        } else {
          setLabCoinTimeValid(false);
        }
      }
      if (field === 'labCoinTempC') {
        if (value.trim() === '') {
          setLabCoinTempCValid(null);
        } else {
          const num = parseFloat(value);
          setLabCoinTempCValid(!isNaN(value) && num >= 0 && num <= 2000);
        }
      }
      if (field.includes('deslagingTimeFrom')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.deslagingTimeFromHour && updatedData.deslagingTimeFromMinute;
        const allEmpty = !updatedData.deslagingTimeFromHour && !updatedData.deslagingTimeFromMinute;
        
        if (allEmpty) {
          setDeslagingTimeFromValid(null);
        } else if (hasTime) {
          setDeslagingTimeFromValid(true);
        } else {
          setDeslagingTimeFromValid(false);
        }
      }
      if (field.includes('deslagingTimeTo')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.deslagingTimeToHour && updatedData.deslagingTimeToMinute;
        const allEmpty = !updatedData.deslagingTimeToHour && !updatedData.deslagingTimeToMinute;
        
        if (allEmpty) {
          setDeslagingTimeToValid(null);
        } else if (hasTime) {
          setDeslagingTimeToValid(true);
        } else {
          setDeslagingTimeToValid(false);
        }
      }
      if (field.includes('metalReadyTime')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.metalReadyTimeHour && updatedData.metalReadyTimeMinute;
        const allEmpty = !updatedData.metalReadyTimeHour && !updatedData.metalReadyTimeMinute;
        
        if (allEmpty) {
          setMetalReadyTimeValid(null);
        } else if (hasTime) {
          setMetalReadyTimeValid(true);
        } else {
          setMetalReadyTimeValid(false);
        }
      }
      if (field.includes('waitingForTappingFrom')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.waitingForTappingFromHour && updatedData.waitingForTappingFromMinute;
        const allEmpty = !updatedData.waitingForTappingFromHour && !updatedData.waitingForTappingFromMinute;
        
        if (allEmpty) {
          setWaitingForTappingFromValid(null);
        } else if (hasTime) {
          setWaitingForTappingFromValid(true);
        } else {
          setWaitingForTappingFromValid(false);
        }
      }
      if (field.includes('waitingForTappingTo')) {
        const updatedData = {...table3, [field]: value};
        const hasTime = updatedData.waitingForTappingToHour && updatedData.waitingForTappingToMinute;
        const allEmpty = !updatedData.waitingForTappingToHour && !updatedData.waitingForTappingToMinute;
        
        if (allEmpty) {
          setWaitingForTappingToValid(null);
        } else if (hasTime) {
          setWaitingForTappingToValid(true);
        } else {
          setWaitingForTappingToValid(false);
        }
      }
      if (field === 'reason') {
        if (value.trim() === '') {
          setReasonValid(null);
        } else {
          setReasonValid(value.trim().length > 0);
        }
      }
    }

    // Validation logic for Table 4
    if (tableNum === 4) {
      if (field.includes('time')) {
        const updatedData = {...table4, [field]: value};
        const hasTime = updatedData.timeHour && updatedData.timeMinute;
        const allEmpty = !updatedData.timeHour && !updatedData.timeMinute;
        
        if (allEmpty) {
          setTable4TimeValid(null);
        } else if (hasTime) {
          setTable4TimeValid(true);
        } else {
          setTable4TimeValid(false);
        }
      }
      if (field === 'tempCSg') {
        if (value.trim() === '') {
          setTempCSgValid(null);
        } else {
          const num = parseFloat(value);
          setTempCSgValid(!isNaN(value) && num >= 0 && num <= 2000);
        }
      }
      if (field === 'tempCGrey') {
        if (value.trim() === '') {
          setTempCGreyValid(null);
        } else {
          const num = parseFloat(value);
          setTempCGreyValid(!isNaN(value) && num >= 0 && num <= 2000);
        }
      }
      if (field === 'directFurnace') {
        if (value.trim() === '') {
          setDirectFurnaceValid(null);
        } else {
          setDirectFurnaceValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'holderToFurnace') {
        if (value.trim() === '') {
          setHolderToFurnaceValid(null);
        } else {
          setHolderToFurnaceValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'furnaceToHolder') {
        if (value.trim() === '') {
          setFurnaceToHolderValid(null);
        } else {
          setFurnaceToHolderValid(!isNaN(value) && parseFloat(value) >= 0);
        }
      }
      if (field === 'disaNo') {
        if (value.trim() === '') {
          setDisaNoValid(null);
        } else {
          setDisaNoValid(value.trim().length > 0);
        }
      }
      if (field === 'item') {
        if (value.trim() === '') {
          setItemValid(null);
        } else {
          setItemValid(value.trim().length > 0);
        }
      }
    }

    // Validation logic for Table 5
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
      
      if (validations[field]) {
        if (value.trim() === '') {
          validations[field](null);
        } else {
          validations[field](!isNaN(value) && parseFloat(value) >= 0);
        }
      }
    }

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

  const handleTableSubmit = async (tableNum) => {
    // Ensure primary data exists first
    if (!primaryData.date) {
      alert('Please enter a date first.');
      return;
    }

    const tables = { 1: table1, 2: table2, 3: table3, 4: table4, 5: table5 };
    const tableData = tables[tableNum];
    
    setLoadingStates(prev => ({ ...prev, [`table${tableNum}`]: true }));
    
    try {
      // Send primary data + table data together
      const res = await fetch(`http://localhost:5000/api/v1/melting-logs/table-update`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({
        tableNum,
        primaryData: primaryData,
        data: tableData
      }) });
      const response = await res.json();
      
      if (response.success) {
        alert(`Table ${tableNum} saved successfully!`);
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error(`Error saving table ${tableNum}:`, error);
      alert(`Failed to save table ${tableNum}. Please try again.`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`table${tableNum}`]: false }));
    }
  };

  const handleAllTablesSubmit = async () => {
    // Validate only table fields (mark them as invalid if empty)
    let hasErrors = false;

    // Validate Table 1 fields
    if (!table1.heatNo || !table1.heatNo.trim()) {
      setHeatNoValid(false);
      hasErrors = true;
    }
    if (!table1.grade || !table1.grade.trim()) {
      setGradeValid(false);
      hasErrors = true;
    }
    if (!table1.chargingTimeHour || !table1.chargingTimeMinute) {
      setChargingTimeValid(false);
      hasErrors = true;
    }
    if (!table1.ifBath || !table1.ifBath.trim()) {
      setIfBathValid(false);
      hasErrors = true;
    }
    if (!table1.liquidMetalPressPour || table1.liquidMetalPressPour.trim() === '') {
      setLiquidMetalPressPourValid(false);
      hasErrors = true;
    }
    if (!table1.liquidMetalHolder || table1.liquidMetalHolder.trim() === '') {
      setLiquidMetalHolderValid(false);
      hasErrors = true;
    }
    if (!table1.sgMsSteel || table1.sgMsSteel.trim() === '') {
      setSgMsSteelValid(false);
      hasErrors = true;
    }
    if (!table1.greyMsSteel || table1.greyMsSteel.trim() === '') {
      setGreyMsSteelValid(false);
      hasErrors = true;
    }
    if (!table1.returnsSg || table1.returnsSg.trim() === '') {
      setReturnsSgValid(false);
      hasErrors = true;
    }
    if (!table1.gl || table1.gl.trim() === '') {
      setGlValid(false);
      hasErrors = true;
    }
    if (!table1.pigIron || table1.pigIron.trim() === '') {
      setPigIronValid(false);
      hasErrors = true;
    }
    if (!table1.borings || table1.borings.trim() === '') {
      setBoringsValid(false);
      hasErrors = true;
    }
    if (!table1.finalBath || table1.finalBath.trim() === '') {
      setFinalBathValid(false);
      hasErrors = true;
    }

    // Validate Table 2 fields
    if (!table2.charCoal || table2.charCoal.trim() === '') {
      setCharCoalValid(false);
      hasErrors = true;
    }
    if (!table2.cpcFur || table2.cpcFur.trim() === '') {
      setCpcFurValid(false);
      hasErrors = true;
    }
    if (!table2.cpcLc || table2.cpcLc.trim() === '') {
      setCpcLcValid(false);
      hasErrors = true;
    }
    if (!table2.siliconCarbideFur || table2.siliconCarbideFur.trim() === '') {
      setSiliconCarbideFurValid(false);
      hasErrors = true;
    }
    if (!table2.ferrosiliconFur || table2.ferrosiliconFur.trim() === '') {
      setFerrosiliconFurValid(false);
      hasErrors = true;
    }
    if (!table2.ferrosiliconLc || table2.ferrosiliconLc.trim() === '') {
      setFerrosiliconLcValid(false);
      hasErrors = true;
    }
    if (!table2.ferroManganeseFur || table2.ferroManganeseFur.trim() === '') {
      setFerroManganeseFurValid(false);
      hasErrors = true;
    }
    if (!table2.ferroManganeseLc || table2.ferroManganeseLc.trim() === '') {
      setFerroManganeseLcValid(false);
      hasErrors = true;
    }
    if (!table2.cu || table2.cu.trim() === '') {
      setCuValid(false);
      hasErrors = true;
    }
    if (!table2.cr || table2.cr.trim() === '') {
      setCrValid(false);
      hasErrors = true;
    }
    if (!table2.pureMg || table2.pureMg.trim() === '') {
      setPureMgValid(false);
      hasErrors = true;
    }
    if (!table2.ironPyrite || table2.ironPyrite.trim() === '') {
      setIronPyriteValid(false);
      hasErrors = true;
    }

    // Validate Table 3 fields
    if (!table3.labCoinTimeHour || !table3.labCoinTimeMinute) {
      setLabCoinTimeValid(false);
      hasErrors = true;
    }
    if (!table3.labCoinTempC || table3.labCoinTempC.trim() === '') {
      setLabCoinTempCValid(false);
      hasErrors = true;
    }
    if (!table3.deslagingTimeFromHour || !table3.deslagingTimeFromMinute) {
      setDeslagingTimeFromValid(false);
      hasErrors = true;
    }
    if (!table3.deslagingTimeToHour || !table3.deslagingTimeToMinute) {
      setDeslagingTimeToValid(false);
      hasErrors = true;
    }
    if (!table3.metalReadyTimeHour || !table3.metalReadyTimeMinute) {
      setMetalReadyTimeValid(false);
      hasErrors = true;
    }
    if (!table3.waitingForTappingFromHour || !table3.waitingForTappingFromMinute) {
      setWaitingForTappingFromValid(false);
      hasErrors = true;
    }
    if (!table3.waitingForTappingToHour || !table3.waitingForTappingToMinute) {
      setWaitingForTappingToValid(false);
      hasErrors = true;
    }
    if (!table3.reason || !table3.reason.trim()) {
      setReasonValid(false);
      hasErrors = true;
    }

    // Validate Table 4 fields
    if (!table4.timeHour || !table4.timeMinute) {
      setTable4TimeValid(false);
      hasErrors = true;
    }
    if (!table4.tempCSg || table4.tempCSg.trim() === '') {
      setTempCSgValid(false);
      hasErrors = true;
    }
    if (!table4.tempCGrey || table4.tempCGrey.trim() === '') {
      setTempCGreyValid(false);
      hasErrors = true;
    }
    if (!table4.directFurnace || table4.directFurnace.trim() === '') {
      setDirectFurnaceValid(false);
      hasErrors = true;
    }
    if (!table4.holderToFurnace || table4.holderToFurnace.trim() === '') {
      setHolderToFurnaceValid(false);
      hasErrors = true;
    }
    if (!table4.furnaceToHolder || table4.furnaceToHolder.trim() === '') {
      setFurnaceToHolderValid(false);
      hasErrors = true;
    }
    if (!table4.disaNo || !table4.disaNo.trim()) {
      setDisaNoValid(false);
      hasErrors = true;
    }
    if (!table4.item || !table4.item.trim()) {
      setItemValid(false);
      hasErrors = true;
    }

    // Validate Table 5 fields
    if (!table5.furnace1Kw || table5.furnace1Kw.trim() === '') {
      setFurnace1KwValid(false);
      hasErrors = true;
    }
    if (!table5.furnace1A || table5.furnace1A.trim() === '') {
      setFurnace1AValid(false);
      hasErrors = true;
    }
    if (!table5.furnace1V || table5.furnace1V.trim() === '') {
      setFurnace1VValid(false);
      hasErrors = true;
    }
    if (!table5.furnace4Hz || table5.furnace4Hz.trim() === '') {
      setFurnace4HzValid(false);
      hasErrors = true;
    }
    if (!table5.furnace4Gld || table5.furnace4Gld.trim() === '') {
      setFurnace4GldValid(false);
      hasErrors = true;
    }
    if (!table5.furnace4KwHr || table5.furnace4KwHr.trim() === '') {
      setFurnace4KwHrValid(false);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Set all tables as loading
    setLoadingStates({
      table1: true,
      table2: true,
      table3: true,
      table4: true,
      table5: true
    });

    try {
      // Submit all tables in parallel
      const promises = [
        fetch('http://localhost:5000/api/v1/melting-logs/table-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableNum: 1,
            primaryData: primaryData,
            data: table1
          })
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/v1/melting-logs/table-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableNum: 2,
            primaryData: primaryData,
            data: table2
          })
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/v1/melting-logs/table-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableNum: 3,
            primaryData: primaryData,
            data: table3
          })
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/v1/melting-logs/table-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableNum: 4,
            primaryData: primaryData,
            data: table4
          })
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/v1/melting-logs/table-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tableNum: 5,
            primaryData: primaryData,
            data: table5
          })
        }).then(res => res.json())
      ];

      const results = await Promise.all(promises);
      
      // Check if all succeeded
      const allSuccess = results.every(response => response.success);
      
      if (allSuccess) {
        alert('All tables saved successfully!');
      } else {
        const failedTables = results
          .map((response, index) => response.success ? null : index + 1)
          .filter(num => num !== null);
        alert(`Some tables failed to save: ${failedTables.join(', ')}`);
      }
    } catch (error) {
      console.error('Error saving tables:', error);
      alert('Failed to save tables. Please try again.');
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

  const handleAllTablesReset = () => {
    if (!window.confirm('Are you sure you want to reset all table entries?')) return;
    resetTable1();
    resetTable2();
    resetTable3();
    resetTable4();
    resetTable5();
  };

  const fetchPrimaryData = async (date) => {
    if (!date) return;
    
    setFetchingPrimary(true);
    try {
      // Format date for API (YYYY-MM-DD)
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await fetch(`http://localhost:5000/api/v1/melting-logs/primary/${dateStr}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const response = await res.json();
      
      if (response.success && response.data) {
        // Populate form with fetched data
        setPrimaryData({
          date: response.data.date ? new Date(response.data.date).toISOString().split('T')[0] : date,
          shift: response.data.shift || '',
          furnaceNo: response.data.furnaceNo || '',
          panel: response.data.panel || '',
          cumulativeLiquidMetal: response.data.cumulativeLiquidMetal || '',
          finalKWHr: response.data.finalKWHr || '',
          initialKWHr: response.data.initialKWHr || '',
          totalUnits: response.data.totalUnits || '',
          cumulativeUnits: response.data.cumulativeUnits || ''
        });
        setPrimaryId(response.data._id);
        
        // Lock all primary fields except date (date should remain changeable)
        const locks = {};
        if (response.data.shift !== undefined && response.data.shift !== null && response.data.shift !== '') {
          locks.shift = true;
        }
        if (response.data.furnaceNo !== undefined && response.data.furnaceNo !== null && response.data.furnaceNo !== '') {
          locks.furnaceNo = true;
        }
        if (response.data.panel !== undefined && response.data.panel !== null && response.data.panel !== '') {
          locks.panel = true;
        }
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
      } else {
        // No data found for this date, reset
        setPrimaryId(null);
        setPrimaryLocks({});
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
      // If error, assume no data exists for this date
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
    if (field === 'furnaceNo') {
      if (value.trim() === '') {
        setFurnaceNoValid(null);
      } else {
        setFurnaceNoValid(value.trim().length > 0);
      }
    }
    if (field === 'panel') {
      if (value.trim() === '') {
        setPanelValid(null);
      } else {
        setPanelValid(value.trim().length > 0);
      }
    }
    if (field === 'cumulativeLiquidMetal') {
      if (value.trim() === '') {
        setCumulativeLiquidMetalValid(null);
      } else {
        setCumulativeLiquidMetalValid(!isNaN(value) && parseFloat(value) >= 0);
      }
    }
    if (field === 'finalKWHr') {
      if (value.trim() === '') {
        setFinalKWHrValid(null);
      } else {
        setFinalKWHrValid(!isNaN(value) && parseFloat(value) >= 0);
      }
    }
    if (field === 'initialKWHr') {
      if (value.trim() === '') {
        setInitialKWHrValid(null);
      } else {
        setInitialKWHrValid(!isNaN(value) && parseFloat(value) >= 0);
      }
    }
    if (field === 'totalUnits') {
      if (value.trim() === '') {
        setTotalUnitsValid(null);
      } else {
        setTotalUnitsValid(!isNaN(value) && parseFloat(value) >= 0);
      }
    }
    if (field === 'cumulativeUnits') {
      if (value.trim() === '') {
        setCumulativeUnitsValid(null);
      } else {
        setCumulativeUnitsValid(!isNaN(value) && parseFloat(value) >= 0);
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
      setFurnaceNoValid(null);
      setPanelValid(null);
      setCumulativeLiquidMetalValid(null);
      setFinalKWHrValid(null);
      setInitialKWHrValid(null);
      setTotalUnitsValid(null);
      setCumulativeUnitsValid(null);
    }
  };

  const handlePrimarySubmit = async () => {
    setPrimarySubmitted(true);
    // Validate required fields
    if (!primaryData.date) {
      alert('Please fill in Date');
      return;
    }

    // Save primary data to database (without locking)
    setPrimaryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/v1/melting-logs/primary', {
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
        // Update primary data with response data to ensure consistency
        setPrimaryData(prev => ({
          ...prev,
          date: response.data.date ? new Date(response.data.date).toISOString().split('T')[0] : prev.date
        }));
        
        // Lock all primary fields except date after saving (only if they have values)
        const locks = {};
        if (primaryData.shift !== undefined && primaryData.shift !== null && primaryData.shift !== '') locks.shift = true;
        if (primaryData.furnaceNo !== undefined && primaryData.furnaceNo !== null && primaryData.furnaceNo !== '') locks.furnaceNo = true;
        if (primaryData.panel !== undefined && primaryData.panel !== null && primaryData.panel !== '') locks.panel = true;
        if (primaryData.cumulativeLiquidMetal !== undefined && primaryData.cumulativeLiquidMetal !== null && primaryData.cumulativeLiquidMetal !== 0 && primaryData.cumulativeLiquidMetal !== '') locks.cumulativeLiquidMetal = true;
        if (primaryData.finalKWHr !== undefined && primaryData.finalKWHr !== null && primaryData.finalKWHr !== 0 && primaryData.finalKWHr !== '') locks.finalKWHr = true;
        if (primaryData.initialKWHr !== undefined && primaryData.initialKWHr !== null && primaryData.initialKWHr !== 0 && primaryData.initialKWHr !== '') locks.initialKWHr = true;
        if (primaryData.totalUnits !== undefined && primaryData.totalUnits !== null && primaryData.totalUnits !== 0 && primaryData.totalUnits !== '') locks.totalUnits = true;
        if (primaryData.cumulativeUnits !== undefined && primaryData.cumulativeUnits !== null && primaryData.cumulativeUnits !== 0 && primaryData.cumulativeUnits !== '') locks.cumulativeUnits = true;
        setPrimaryLocks(locks);
        
        alert('Primary data saved successfully.');
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

  // Reset functions for each section
  const resetPrimaryData = () => {
    if (!window.confirm('Are you sure you want to reset Primary data?')) return;
    setPrimaryData({
      date: '',
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
    
    // Reset all validation states
    setShiftValid(null);
    setFurnaceNoValid(null);
    setPanelValid(null);
    setCumulativeLiquidMetalValid(null);
    setFinalKWHrValid(null);
    setInitialKWHrValid(null);
    setTotalUnitsValid(null);
    setCumulativeUnitsValid(null);
  };

  // Helper function to check if a primary field is locked
  const isPrimaryFieldLocked = (field) => {
    return primaryLocks[field] === true;
  };

  const handleEnterFocusNext = (e) => {
    if (e.key !== 'Enter') return;

    const target = e.target;
    if (!(target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA'))) return;

    const value = target.value != null ? String(target.value).trim() : '';
    if (value === '') return; // Only move when current field has a value

    e.preventDefault();
    const focusables = Array.from(document.querySelectorAll('input, select, textarea'))
      .filter(el => !el.disabled && el.type !== 'hidden' && el.offsetParent !== null);
    const idx = focusables.indexOf(document.activeElement);
    if (idx > -1 && idx < focusables.length - 1) {
      focusables[idx + 1].focus();
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
      gl: '',
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
      tempCGrey: '',
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
  const getValidationClass = (validationState) => {
    if (validationState === null) return '';
    return validationState ? 'valid-input' : 'invalid-input';
  };

  return (
    <div className="page-wrapper" onKeyDown={handleEnterFocusNext}>
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
      <div>
        <h3 className="section-header">Primary Data</h3>
        
        <div className="melting-log-form-grid">
          <div className={`melting-log-form-group ${classFor(primaryData.shift, primarySubmitted, true)}`}>
            <label>Shift</label>
            <select
              name="shift"
              value={primaryData.shift}
              onChange={(e) => handlePrimaryChange('shift', e.target.value)}
              onMouseDown={(e) => {
                if (isPrimaryFieldLocked('shift') || fetchingPrimary) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                if (isPrimaryFieldLocked('shift') || fetchingPrimary) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              disabled={isPrimaryFieldLocked('shift') || fetchingPrimary}
              readOnly={isPrimaryFieldLocked('shift')}
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
                opacity: isPrimaryFieldLocked('shift') ? 0.8 : 1,
                pointerEvents: isPrimaryFieldLocked('shift') ? 'none' : 'auto'
              }}
            >
              <option value="">Select Shift</option>
              <option value="Shift 1">Shift 1</option>
              <option value="Shift 2">Shift 2</option>
              <option value="Shift 3">Shift 3</option>
            </select>
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.furnaceNo, primarySubmitted, true)}`}>
            <label>Furnace No.</label>
          <input
                type="text"
                value={primaryData.furnaceNo}
                onChange={(e) => handlePrimaryChange('furnaceNo', e.target.value)}
                placeholder="Enter furnace no"
                disabled={isPrimaryFieldLocked('furnaceNo')}
                readOnly={isPrimaryFieldLocked('furnaceNo')}
                className={getValidationClass(furnaceNoValid)}
                style={{
                  backgroundColor: isPrimaryFieldLocked('furnaceNo') ? '#f1f5f9' : '#ffffff',
                  cursor: isPrimaryFieldLocked('furnaceNo') ? 'not-allowed' : 'text'
                }}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.panel, primarySubmitted, true)}`}>
            <label>Panel</label>
          <input
                type="text"
                value={primaryData.panel}
                onChange={(e) => handlePrimaryChange('panel', e.target.value)}
                placeholder="Enter panel"
                disabled={isPrimaryFieldLocked('panel')}
                readOnly={isPrimaryFieldLocked('panel')}
                className={getValidationClass(panelValid)}
                style={{
                  backgroundColor: isPrimaryFieldLocked('panel') ? '#f1f5f9' : '#ffffff',
                  cursor: isPrimaryFieldLocked('panel') ? 'not-allowed' : 'text'
                }}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.cumulativeLiquidMetal, primarySubmitted, true)}`}>
            <label>Cumulative Liquid Metal</label>
          <input
                type="number"
                value={primaryData.cumulativeLiquidMetal}
                onChange={(e) => handlePrimaryChange('cumulativeLiquidMetal', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                disabled={isPrimaryFieldLocked('cumulativeLiquidMetal')}
                readOnly={isPrimaryFieldLocked('cumulativeLiquidMetal')}
                className={getValidationClass(cumulativeLiquidMetalValid)}
                style={{
                  backgroundColor: isPrimaryFieldLocked('cumulativeLiquidMetal') ? '#f0fdf4' : '#ffffff',
                  cursor: isPrimaryFieldLocked('cumulativeLiquidMetal') ? 'not-allowed' : 'text'
                }}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.finalKWHr, primarySubmitted, true)}`}>
            <label>Final KWHr</label>
          <input
                type="number"
                value={primaryData.finalKWHr}
                onChange={(e) => handlePrimaryChange('finalKWHr', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                disabled={isPrimaryFieldLocked('finalKWHr')}
                readOnly={isPrimaryFieldLocked('finalKWHr')}
                className={getValidationClass(finalKWHrValid)}
                style={{
                  backgroundColor: isPrimaryFieldLocked('finalKWHr') ? '#f0fdf4' : '#ffffff',
                  cursor: isPrimaryFieldLocked('finalKWHr') ? 'not-allowed' : 'text'
                }}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.initialKWHr, primarySubmitted, true)}`}>
            <label>Initial KWHr</label>
          <input
                type="number"
                value={primaryData.initialKWHr}
                onChange={(e) => handlePrimaryChange('initialKWHr', e.target.value)}
                placeholder="Enter value"
                style={{
                  backgroundColor: isPrimaryFieldLocked('initialKWHr') ? '#f0fdf4' : '#ffffff',
                  cursor: isPrimaryFieldLocked('initialKWHr') ? 'not-allowed' : 'text'
                }}
                step="0.01"
                disabled={isPrimaryFieldLocked('initialKWHr')}
                readOnly={isPrimaryFieldLocked('initialKWHr')}
                className={getValidationClass(initialKWHrValid)}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.totalUnits, primarySubmitted, true)}`}>
            <label>Total Units</label>
          <input
                type="number"
                value={primaryData.totalUnits}
                onChange={(e) => handlePrimaryChange('totalUnits', e.target.value)}
                placeholder="Enter value"
                style={{
                  backgroundColor: isPrimaryFieldLocked('totalUnits') ? '#f0fdf4' : '#ffffff',
                  cursor: isPrimaryFieldLocked('totalUnits') ? 'not-allowed' : 'text'
                }}
                step="0.01"
                disabled={isPrimaryFieldLocked('totalUnits')}
                readOnly={isPrimaryFieldLocked('totalUnits')}
                className={getValidationClass(totalUnitsValid)}
            />
          </div>

          <div className={`melting-log-form-group ${classFor(primaryData.cumulativeUnits, primarySubmitted, true)}`}>
            <label>Cumulative Units</label>
          <input
                style={{
                  backgroundColor: isPrimaryFieldLocked('cumulativeUnits') ? '#f0fdf4' : '#ffffff',
                  cursor: isPrimaryFieldLocked('cumulativeUnits') ? 'not-allowed' : 'text'
                }}
                type="number"
                value={primaryData.cumulativeUnits}
                onChange={(e) => handlePrimaryChange('cumulativeUnits', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                disabled={isPrimaryFieldLocked('cumulativeUnits')}
                readOnly={isPrimaryFieldLocked('cumulativeUnits')}
                className={getValidationClass(cumulativeUnitsValid)}
            />
          </div>
        </div>

        <div className="melting-log-submit-container">
          <button
            type="button"
            className="melting-log-reset-btn"
            onClick={resetPrimaryData}
            disabled={primaryLoading || fetchingPrimary}
          >
            <RotateCcw size={18} />
            Reset Primary
          </button>

          <button
            className="cupola-holder-submit-btn"
            onClick={handlePrimarySubmit}
            disabled={primaryLoading || fetchingPrimary || !primaryData.date}
          >
            {primaryLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 1 */}
      <div>
        <h3 className="section-header">Table 1</h3>

        <div className="melting-log-form-grid melting-log-table5-grid">
          <div className="melting-log-form-group">
            <label>Heat No</label>
            <input
              type="text"
              value={table1.heatNo || ''}
              onChange={(e) => handleTableChange(1, 'heatNo', e.target.value)}
              placeholder="Enter heat no"
              className={getValidationClass(heatNoValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Grade</label>
            <input
              type="text"
              value={table1.grade || ''}
              onChange={(e) => handleTableChange(1, 'grade', e.target.value)}
              placeholder="Enter grade"
              className={getValidationClass(gradeValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Charging Time</label>
            <TimeInput
              hourRef={chargingTimeHourRef}
              minuteRef={chargingTimeMinuteRef}
              hourName="chargingTimeHour"
              minuteName="chargingTimeMinute"
              hourValue={table1.chargingTimeHour}
              minuteValue={table1.chargingTimeMinute}
              onChange={(e) => handleTableChange(1, e.target.name, e.target.value)}
              validationState={chargingTimeValid}
            />
          </div>

          <div className="melting-log-form-group">
            <label>If Bath</label>
            <input
              type="text"
              value={table1.ifBath || ''}
              onChange={(e) => handleTableChange(1, 'ifBath', e.target.value)}
              placeholder="Enter if bath"
              className={getValidationClass(ifBathValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Liquid Metal - Press Pour (kgs)</label>
            <input
              type="number"
              value={table1.liquidMetalPressPour || ''}
              onChange={(e) => handleTableChange(1, 'liquidMetalPressPour', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(liquidMetalPressPourValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Liquid Metal - Holder (kgs)</label>
            <input
              type="number"
              value={table1.liquidMetalHolder || ''}
              onChange={(e) => handleTableChange(1, 'liquidMetalHolder', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(liquidMetalHolderValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>SG-MS Steel (400 - 2500 kgs)</label>
            <input
              type="number"
              value={table1.sgMsSteel || ''}
              onChange={(e) => handleTableChange(1, 'sgMsSteel', e.target.value)}
              placeholder="Enter value"
              min="400"
              max="2500"
              step="0.01"
              className={getValidationClass(sgMsSteelValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Grey MS Steel (400 - 2500 kgs)</label>
            <input
              type="number"
              value={table1.greyMsSteel || ''}
              onChange={(e) => handleTableChange(1, 'greyMsSteel', e.target.value)}
              placeholder="Enter value"
              min="400"
              max="2500"
              step="0.01"
              className={getValidationClass(greyMsSteelValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Returns SG (500 - 2500 kgs)</label>
            <input
              type="number"
              value={table1.returnsSg || ''}
              onChange={(e) => handleTableChange(1, 'returnsSg', e.target.value)}
              placeholder="Enter value"
              min="500"
              max="2500"
              step="0.01"
              className={getValidationClass(returnsSgValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>GL (900 - 2250 kgs)</label>
            <input
              type="number"
              value={table1.gl || ''}
              onChange={(e) => handleTableChange(1, 'gl', e.target.value)}
              placeholder="Enter value"
              min="900"
              max="2250"
              step="0.01"
              className={getValidationClass(glValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Pig Iron (0 - 350 kgs)</label>
            <input
              type="number"
              value={table1.pigIron || ''}
              onChange={(e) => handleTableChange(1, 'pigIron', e.target.value)}
              placeholder="Enter value"
              min="0"
              max="350"
              step="0.01"
              className={getValidationClass(pigIronValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Borings (0 - 1900 kgs)</label>
            <input
              type="number"
              value={table1.borings || ''}
              onChange={(e) => handleTableChange(1, 'borings', e.target.value)}
              placeholder="Enter value"
              min="0"
              max="1900"
              step="0.01"
              className={getValidationClass(boringsValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Final Bath (kgs)</label>
            <input
              type="number"
              value={table1.finalBath || ''}
              onChange={(e) => handleTableChange(1, 'finalBath', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(finalBathValid)}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 2 */}
      <div>
        <h3 className="section-header">Table 2</h3>

        <div className="melting-log-form-grid melting-log-table5-grid">
          <div className="melting-log-form-group">
            <label>CharCoal (kgs)</label>
            <input
              type="number"
              value={table2.charCoal || ''}
              onChange={(e) => handleTableChange(2, 'charCoal', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(charCoalValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>CPC - Fur (kgs)</label>
            <input
              type="number"
              value={table2.cpcFur || ''}
              onChange={(e) => handleTableChange(2, 'cpcFur', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(cpcFurValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>CPC - LC (kgs)</label>
            <input
              type="number"
              value={table2.cpcLc || ''}
              onChange={(e) => handleTableChange(2, 'cpcLc', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(cpcLcValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Silicon Carbide - Fur (kgs)</label>
            <input
              type="number"
              value={table2.siliconCarbideFur || ''}
              onChange={(e) => handleTableChange(2, 'siliconCarbideFur', e.target.value)}
              placeholder="Enter value (0.03 to 0.09)"
              min="0.03"
              max="0.09"
              step="0.01"
              className={getValidationClass(siliconCarbideFurValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Ferrosilicon - Fur (kgs)</label>
            <input
              type="number"
              value={table2.ferrosiliconFur || ''}
              onChange={(e) => handleTableChange(2, 'ferrosiliconFur', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(ferrosiliconFurValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Ferrosilicon - LC (kgs)</label>
            <input
              type="number"
              value={table2.ferrosiliconLc || ''}
              onChange={(e) => handleTableChange(2, 'ferrosiliconLc', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(ferrosiliconLcValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>FerroManganese - Fur (kgs)</label>
            <input
              type="number"
              value={table2.ferroManganeseFur || ''}
              onChange={(e) => handleTableChange(2, 'ferroManganeseFur', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(ferroManganeseFurValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>FerroManganese - LC (kgs)</label>
            <input
              type="number"
              value={table2.ferroManganeseLc || ''}
              onChange={(e) => handleTableChange(2, 'ferroManganeseLc', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(ferroManganeseLcValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Cu (kgs)</label>
            <input
              type="number"
              value={table2.cu || ''}
              onChange={(e) => handleTableChange(2, 'cu', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(cuValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Cr (kgs)</label>
            <input
              type="number"
              value={table2.cr || ''}
              onChange={(e) => handleTableChange(2, 'cr', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(crValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Pure Mg (kgs)</label>
            <input
              type="number"
              value={table2.pureMg || ''}
              onChange={(e) => handleTableChange(2, 'pureMg', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(pureMgValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Iron Pyrite (kgs)</label>
            <input
              type="number"
              value={table2.ironPyrite || ''}
              onChange={(e) => handleTableChange(2, 'ironPyrite', e.target.value)}
              placeholder="Enter value"
              step="0.01"
              className={getValidationClass(ironPyriteValid)}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 3 */}
      <div>
        <h3 className="section-header">Table 3</h3>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ rowGap: '1.5rem' }}>
          <div className="melting-log-form-group">
            <label>Lab Coin - Time</label>
            <TimeInput
              hourRef={labCoinTimeHourRef}
              minuteRef={labCoinTimeMinuteRef}
              hourName="labCoinTimeHour"
              minuteName="labCoinTimeMinute"
              hourValue={table3.labCoinTimeHour}
              minuteValue={table3.labCoinTimeMinute}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
              validationState={labCoinTimeValid}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Lab Coin - Temp (°C) (0-2000)</label>
            <input
              type="number"
              value={table3.labCoinTempC || ''}
              onChange={(e) => handleTableChange(3, 'labCoinTempC', e.target.value)}
              placeholder="Enter temperature in °C"
              step="0.01"
              className={getValidationClass(labCoinTempCValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Deslaging Time - From</label>
            <TimeInput
              hourRef={deslagingTimeFromHourRef}
              minuteRef={deslagingTimeFromMinuteRef}
              hourName="deslagingTimeFromHour"
              minuteName="deslagingTimeFromMinute"
              hourValue={table3.deslagingTimeFromHour}
              minuteValue={table3.deslagingTimeFromMinute}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
              validationState={deslagingTimeFromValid}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Deslaging Time -To</label>
            <TimeInput
              hourRef={deslagingTimeToHourRef}
              minuteRef={deslagingTimeToMinuteRef}
              hourName="deslagingTimeToHour"
              minuteName="deslagingTimeToMinute"
              hourValue={table3.deslagingTimeToHour}
              minuteValue={table3.deslagingTimeToMinute}
              validationState={deslagingTimeToValid}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Metal Ready Time</label>
            <TimeInput
              hourRef={metalReadyTimeHourRef}
              minuteRef={metalReadyTimeMinuteRef}
              hourName="metalReadyTimeHour"
              minuteName="metalReadyTimeMinute"
              hourValue={table3.metalReadyTimeHour}
              minuteValue={table3.metalReadyTimeMinute}
              validationState={metalReadyTimeValid}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
            />
          </div>
        </div>

        <div className="melting-log-form-grid melting-log-table5-grid" style={{ rowGap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="melting-log-form-group">
            <label>Waiting for Tapping- From</label>
            <TimeInput
              hourRef={waitingForTappingFromHourRef}
              minuteRef={waitingForTappingFromMinuteRef}
              hourName="waitingForTappingFromHour"
              minuteName="waitingForTappingFromMinute"
              hourValue={table3.waitingForTappingFromHour}
              validationState={waitingForTappingFromValid}
              minuteValue={table3.waitingForTappingFromMinute}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Waiting for Tapping -To</label>
            <TimeInput
              hourRef={waitingForTappingToHourRef}
              minuteRef={waitingForTappingToMinuteRef}
              hourName="waitingForTappingToHour"
              minuteName="waitingForTappingToMinute"
              hourValue={table3.waitingForTappingToHour}
              validationState={waitingForTappingToValid}
              minuteValue={table3.waitingForTappingToMinute}
              onChange={(e) => handleTableChange(3, e.target.name, e.target.value)}
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
              type="text"
              value={table3.reason || ''}
              onChange={(e) => handleTableChange(3, 'reason', e.target.value)}
              placeholder="Enter reason"
              className={getValidationClass(reasonValid)}
            />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 4 - Metal Tapping in Kgs */}
      <div>
        <h3 className="section-header">Table 4</h3>
        
        <div className="melting-log-form-grid">
        <div className="melting-log-form-group">
          <label>Time</label>
          <TimeInput
            hourRef={table4TimeHourRef}
            minuteRef={table4TimeMinuteRef}
            hourName="timeHour"
            minuteName="timeMinute"
            hourValue={table4.timeHour}
            validationState={table4TimeValid}
            minuteValue={table4.timeMinute}
            onChange={(e) => handleTableChange(4, e.target.name, e.target.value)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Temp C - SG (0-2000°C)</label>
          <input
                type="number"
                value={table4.tempCSg || ''}
                onChange={(e) => handleTableChange(4, 'tempCSg', e.target.value)}
                placeholder="Enter temperature"
                step="0.01"
                className={getValidationClass(tempCSgValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Temp C - Grey (0-2000°C)</label>
          <input
                type="number"
                value={table4.tempCGrey || ''}
                onChange={(e) => handleTableChange(4, 'tempCGrey', e.target.value)}
                placeholder="Enter temperature"
                step="0.01"
                className={getValidationClass(tempCGreyValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Direct Furnace (kgs)</label>
          <input
                type="number"
                value={table4.directFurnace || ''}
                onChange={(e) => handleTableChange(4, 'directFurnace', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass(directFurnaceValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Holder To Furnace (kgs)</label>
          <input
                type="number"
                value={table4.holderToFurnace || ''}
                onChange={(e) => handleTableChange(4, 'holderToFurnace', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass(holderToFurnaceValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Furnace To Holder (kgs)</label>
          <input
                type="number"
                value={table4.furnaceToHolder || ''}
                onChange={(e) => handleTableChange(4, 'furnaceToHolder', e.target.value)}
                placeholder="Enter value"
                step="0.01"
                className={getValidationClass(furnaceToHolderValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Disa No.</label>
          <input
                type="text"
                value={table4.disaNo || ''}
                onChange={(e) => handleTableChange(4, 'disaNo', e.target.value)}
                placeholder="Enter Disa No."
                className={getValidationClass(disaNoValid)}
          />
        </div>

        <div className="melting-log-form-group">
          <label>Item</label>
          <input
                type="text"
                value={table4.item || ''}
                onChange={(e) => handleTableChange(4, 'item', e.target.value)}
                placeholder="Enter item"
                className={getValidationClass(itemValid)}
          />
        </div>
      </div>

        <div style={{ gridColumn: '1 / -1', height: '1px', backgroundColor: '#e2e8f0', margin: '1.5rem 0' }}></div>
      </div>

      {/* Table 5 - Electrical Readings */}
      <div>
        <h3 className="section-header">Table 5</h3>

        {/* Furnace 1,2,3 combined section */}
        <h4 className="melting-log-sub-section-title">Furnace 1,2,3</h4>
        <div className="melting-log-form-grid melting-log-table5-grid">
          <div className="melting-log-form-group">
            <label>Kw</label>
            <input
              type="number"
              value={table5.furnace1Kw || ''}
              onChange={(e) => handleTableChange(5, 'furnace1Kw', e.target.value)}
              placeholder="Enter Kw"
              step="0.01"
              className={getValidationClass(furnace1KwValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>A (2000-3500)</label>
            <input
              type="number"
              value={table5.furnace1A || ''}
              onChange={(e) => handleTableChange(5, 'furnace1A', e.target.value)}
              placeholder="Enter A"
              step="0.01"
              className={getValidationClass(furnace1AValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>V (500-1000)</label>
            <input
              type="number"
              value={table5.furnace1V || ''}
              onChange={(e) => handleTableChange(5, 'furnace1V', e.target.value)}
              placeholder="Enter V"
              step="0.01"
              className={getValidationClass(furnace1VValid)}
            />
          </div>
        </div>

        {/* Furnace 4 section */}
        <h4 className="melting-log-sub-section-title">Furnace 4</h4>
        <div className="melting-log-form-grid melting-log-table5-grid">
          <div className="melting-log-form-group">
            <label>Hz</label>
            <input
              type="number"
              value={table5.furnace4Hz || ''}
              onChange={(e) => handleTableChange(5, 'furnace4Hz', e.target.value)}
              placeholder="Enter Hz"
              step="0.01"
              className={getValidationClass(furnace4HzValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>GLD (0.6-95)</label>
            <input
              type="number"
              value={table5.furnace4Gld || ''}
              onChange={(e) => handleTableChange(5, 'furnace4Gld', e.target.value)}
              placeholder="Enter GLD"
              step="0.01"
              className={getValidationClass(furnace4GldValid)}
            />
          </div>

          <div className="melting-log-form-group">
            <label>Kw/Hr</label>
            <input
              type="number"
              value={table5.furnace4KwHr || ''}
              onChange={(e) => handleTableChange(5, 'furnace4KwHr', e.target.value)}
              placeholder="Enter Kw/Hr"
              step="0.01"
              className={getValidationClass(furnace4KwHrValid)}
            />
          </div>
        </div>
      </div>

      {/* All Tables Submit and Reset Buttons */}
      <div className="melting-log-submit-container" style={{ marginTop: '2rem' }}>
        <button
          className="melting-log-reset-btn"
          onClick={handleAllTablesReset}
          type="button"
        >
          <RotateCcw size={16} />
          Reset All Tables
        </button>
        <button
          className="cupola-holder-submit-btn"
          onClick={handleAllTablesSubmit}
          disabled={loadingStates.table1 || loadingStates.table2 || loadingStates.table3 || loadingStates.table4 || loadingStates.table5 || !primaryData.date}
          title={!primaryData.date ? 'Please enter a date first' : 'Save All Tables'}
        >
          {(loadingStates.table1 || loadingStates.table2 || loadingStates.table3 || loadingStates.table4 || loadingStates.table5) ? (
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

export default MeltingLogSheet;
