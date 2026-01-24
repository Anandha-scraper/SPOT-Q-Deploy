import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock } from 'lucide-react';
import Table from '../../Components/Table';
import { PlusButton, MinusButton, TimeInput, SubmitButton, ResetButton } from '../../Components/Buttons';
import '../../styles/PageStyles/Sandlab/SandTestingRecord.css';

const SandTestingRecord = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Lock state for each table
  const [table1Locked, setTable1Locked] = useState(false);
  const [table2Locked, setTable2Locked] = useState(false);
  const [table3Locked, setTable3Locked] = useState(false);
  const [table4Locked, setTable4Locked] = useState(false);
  const [table5Locked, setTable5Locked] = useState(false);
  
  // S.No count from database (will be fetched and incremented automatically)
  const [currentSNo, setCurrentSNo] = useState(0); // This will come from database and auto-increment
  
  // Track locked fields for Table 5 (options, radios, dropdowns locked after first entry)
  const [table5LockedFields, setTable5LockedFields] = useState({
    gcsCheckpoint: null,
    bentoniteCheckpoint: null,
    premixCoalCheckpoint: null,
    compactabilitySetting: null,
    mouldStrengthSetting: null
  });
  
  // State for current Table 5 entry form
  const [table5FormData, setTable5FormData] = useState({
    timeHour: '',
    timeMinute: '',
    mixNo: '',
    permeability: '',
    gcsCheckpoint: '',
    gcsValue: '',
    wts: '',
    moisture: '',
    compactability: '',
    compressability: '',
    waterLitreKgMix: '',
    sandTempBC: '',
    sandTempWU: '',
    sandTempSSU: '',
    newSandKgsMould: '',
    bentoniteCheckpoint: '',
    bentoniteKgs: '',
    bentonitePercent: '',
    premixCoalCheckpoint: '',
    premixCoalKgs: '',
    premixCoalPercent: '',
    compactabilitySetting: '',
    compactabilityValue: '',
    mouldStrengthSetting: '',
    mouldStrengthValue: '',
    preparedSandLumpsKg: '',
    itemName: '',
    remarks: ''
  });

  // Validation states for Table 5 (null = neutral, true = valid/green, false = invalid/red)
  const [timeValid, setTimeValid] = useState(null);
  const [mixNoValid, setMixNoValid] = useState(null);
  const [permeabilityValid, setPermeabilityValid] = useState(null);
  const [gcsCheckpointValid, setGcsCheckpointValid] = useState(null);
  const [gcsValid, setGcsValid] = useState(null);
  const [wtsValid, setWtsValid] = useState(null);
  const [moistureValid, setMoistureValid] = useState(null);
  const [compactabilityValid, setCompactabilityValid] = useState(null);
  const [compressabilityValid, setCompressabilityValid] = useState(null);
  const [waterLitreValid, setWaterLitreValid] = useState(null);
  const [sandTempBCValid, setSandTempBCValid] = useState(null);
  const [sandTempWUValid, setSandTempWUValid] = useState(null);
  const [sandTempSSUValid, setSandTempSSUValid] = useState(null);
  const [newSandValid, setNewSandValid] = useState(null);
  const [bentoniteCheckpointValid, setBentoniteCheckpointValid] = useState(null);
  const [bentoniteKgsValid, setBentoniteKgsValid] = useState(null);
  const [bentonitePercentValid, setBentonitePercentValid] = useState(null);
  const [premixCoalCheckpointValid, setPremixCoalCheckpointValid] = useState(null);
  const [premixCoalKgsValid, setPremixCoalKgsValid] = useState(null);
  const [premixCoalPercentValid, setPremixCoalPercentValid] = useState(null);
  const [compactabilitySettingValid, setCompactabilitySettingValid] = useState(null);
  const [compactabilityValueValid, setCompactabilityValueValid] = useState(null);
  const [mouldStrengthSettingValid, setMouldStrengthSettingValid] = useState(null);
  const [mouldStrengthValueValid, setMouldStrengthValueValid] = useState(null);
  const [preparedSandLumpsKgValid, setPreparedSandLumpsKgValid] = useState(null);
  const [itemNameValid, setItemNameValid] = useState(null);

  // Refs for Table 5 form fields (for Enter key navigation)
  const timeHourRef = useRef(null);
  const timeMinuteRef = useRef(null);
  const mixNoRef = useRef(null);
  const permeabilityRef = useRef(null);
  const gcsValueRef = useRef(null);
  const wtsRef = useRef(null);
  const moistureRef = useRef(null);
  const compactabilityRef = useRef(null);
  const compressabilityRef = useRef(null);
  const waterLitreRef = useRef(null);
  const sandTempBCRef = useRef(null);
  const sandTempWURef = useRef(null);
  const sandTempSSURef = useRef(null);
  const newSandRef = useRef(null);
  const bentoniteKgsRef = useRef(null);
  const bentonitePercentRef = useRef(null);
  const premixCoalKgsRef = useRef(null);
  const premixCoalPercentRef = useRef(null);
  const compactabilitySettingRef = useRef(null);
  const compactabilityValueRef = useRef(null);
  const mouldStrengthSettingRef = useRef(null);
  const mouldStrengthValueRef = useRef(null);
  const preparedSandLumpsRef = useRef(null);
  const itemNameRef = useRef(null);
  const remarksRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Handle Enter key navigation
  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      }
    }
  };

  // Update form field with validation
  const updateFormField = (field, value) => {
    setTable5FormData({
      ...table5FormData,
      [field]: value
    });

    // Validate based on field type and range
    if (field === 'timeHour' || field === 'timeMinute') {
      const updatedData = {...table5FormData, [field]: value};
      const hasTime = updatedData.timeHour && updatedData.timeMinute;
      setTimeValid(hasTime ? true : (value ? false : null));
    }

    if (field === 'mixNo') {
      setMixNoValid(value.trim() ? true : null);
    }

    if (field === 'permeability') {
      if (!value.trim()) {
        setPermeabilityValid(null);
      } else {
        const num = parseFloat(value);
        setPermeabilityValid(!isNaN(num) && num >= 90 && num <= 160);
      }
    }

    if (field === 'gcsCheckpoint') {
      setGcsCheckpointValid(value ? true : null);
      // Also validate gcsValue if it exists
      const updatedData = {...table5FormData, [field]: value};
      if (updatedData.gcsValue && value) {
        const num = parseFloat(updatedData.gcsValue);
        const minValue = value === 'FDY-A' ? 1800 : 1900;
        setGcsValid(!isNaN(num) && num >= minValue);
      } else if (!value) {
        setGcsValid(null);
      }
    }

    if (field === 'gcsValue') {
      const updatedData = {...table5FormData, [field]: value};
      if (!value.trim()) {
        setGcsValid(null);
      } else if (updatedData.gcsCheckpoint) {
        const num = parseFloat(value);
        const minValue = updatedData.gcsCheckpoint === 'FDY-A' ? 1800 : 1900;
        setGcsValid(!isNaN(num) && num >= minValue);
      } else {
        setGcsValid(false);
      }
    }

    if (field === 'wts') {
      if (!value.trim()) {
        setWtsValid(null);
      } else {
        const num = parseFloat(value);
        setWtsValid(!isNaN(num) && num >= 0.15);
      }
    }

    if (field === 'moisture') {
      if (!value.trim()) {
        setMoistureValid(null);
      } else {
        const num = parseFloat(value);
        setMoistureValid(!isNaN(num) && num >= 3.0 && num <= 4.0);
      }
    }

    if (field === 'compactability') {
      if (!value.trim()) {
        setCompactabilityValid(null);
      } else {
        const num = parseFloat(value);
        setCompactabilityValid(!isNaN(num) && num >= 33 && num <= 40);
      }
    }

    if (field === 'compressability') {
      if (!value.trim()) {
        setCompressabilityValid(null);
      } else {
        const num = parseFloat(value);
        setCompressabilityValid(!isNaN(num) && num >= 20 && num <= 28);
      }
    }

    if (field === 'waterLitreKgMix') {
      setWaterLitreValid(value.trim() && !isNaN(value) && parseFloat(value) >= 0 ? true : (value.trim() ? false : null));
    }

    if (field === 'sandTempBC') {
      if (!value.trim()) {
        setSandTempBCValid(null);
      } else {
        const num = parseFloat(value);
        setSandTempBCValid(!isNaN(num) && num >= 0 && num <= 45);
      }
    }

    if (field === 'sandTempWU') {
      if (!value.trim()) {
        setSandTempWUValid(null);
      } else {
        const num = parseFloat(value);
        setSandTempWUValid(!isNaN(num) && num >= 0 && num <= 45);
      }
    }

    if (field === 'sandTempSSU') {
      if (!value.trim()) {
        setSandTempSSUValid(null);
      } else {
        const num = parseFloat(value);
        setSandTempSSUValid(!isNaN(num) && num >= 0 && num <= 45);
      }
    }

    if (field === 'newSandKgsMould') {
      if (!value.trim()) {
        setNewSandValid(null);
      } else {
        const num = parseFloat(value);
        setNewSandValid(!isNaN(num) && num >= 0.0 && num <= 5.0);
      }
    }

    if (field === 'bentoniteCheckpoint') {
      setBentoniteCheckpointValid(value ? true : null);
      // Reset sub-fields if checkpoint changes
      const updatedData = {...table5FormData, [field]: value};
      if (updatedData.bentoniteKgs && value) {
        setBentoniteKgsValid(!isNaN(parseFloat(updatedData.bentoniteKgs)) && parseFloat(updatedData.bentoniteKgs) >= 0);
      }
      if (updatedData.bentonitePercent && value) {
        const percent = parseFloat(updatedData.bentonitePercent);
        const range = value === '0.60-1.20' ? [0.60, 1.20] : [0.80, 2.20];
        setBentonitePercentValid(!isNaN(percent) && percent >= range[0] && percent <= range[1]);
      }
    }

    if (field === 'bentoniteKgs') {
      if (!value.trim()) {
        setBentoniteKgsValid(null);
      } else {
        const num = parseFloat(value);
        setBentoniteKgsValid(!isNaN(num) && num >= 0);
      }
    }

    if (field === 'bentonitePercent') {
      const updatedData = {...table5FormData, [field]: value};
      if (!value.trim()) {
        setBentonitePercentValid(null);
      } else if (updatedData.bentoniteCheckpoint) {
        const percent = parseFloat(value);
        const range = updatedData.bentoniteCheckpoint === '0.60-1.20' ? [0.60, 1.20] : [0.80, 2.20];
        setBentonitePercentValid(!isNaN(percent) && percent >= range[0] && percent <= range[1]);
      } else {
        setBentonitePercentValid(false);
      }
    }

    if (field === 'premixCoalCheckpoint') {
      setPremixCoalCheckpointValid(value ? true : null);
      // Reset sub-fields if checkpoint changes
      const updatedData = {...table5FormData, [field]: value};
      if (updatedData.premixCoalKgs && value) {
        setPremixCoalKgsValid(!isNaN(parseFloat(updatedData.premixCoalKgs)) && parseFloat(updatedData.premixCoalKgs) >= 0);
      }
      if (updatedData.premixCoalPercent && value) {
        const percent = parseFloat(updatedData.premixCoalPercent);
        const range = value === 'Premix' ? [0.60, 1.20] : [0.28, 0.70];
        setPremixCoalPercentValid(!isNaN(percent) && percent >= range[0] && percent <= range[1]);
      }
    }

    if (field === 'premixCoalKgs') {
      if (!value.trim()) {
        setPremixCoalKgsValid(null);
      } else {
        const num = parseFloat(value);
        setPremixCoalKgsValid(!isNaN(num) && num >= 0);
      }
    }

    if (field === 'premixCoalPercent') {
      const updatedData = {...table5FormData, [field]: value};
      if (!value.trim()) {
        setPremixCoalPercentValid(null);
      } else if (updatedData.premixCoalCheckpoint) {
        const percent = parseFloat(value);
        const range = updatedData.premixCoalCheckpoint === 'Premix' ? [0.60, 1.20] : [0.28, 0.70];
        setPremixCoalPercentValid(!isNaN(percent) && percent >= range[0] && percent <= range[1]);
      } else {
        setPremixCoalPercentValid(false);
      }
    }

    if (field === 'compactabilitySetting') {
      setCompactabilitySettingValid(value ? true : null);
      // Reset value validation if setting changes
      const updatedData = {...table5FormData, [field]: value};
      if (!value) {
        setCompactabilityValueValid(null);
      } else if (updatedData.compactabilityValue) {
        setCompactabilityValueValid(!isNaN(parseFloat(updatedData.compactabilityValue)) && parseFloat(updatedData.compactabilityValue) >= 0);
      }
    }

    if (field === 'compactabilityValue') {
      if (!value.trim()) {
        setCompactabilityValueValid(null);
      } else {
        const num = parseFloat(value);
        setCompactabilityValueValid(!isNaN(num) && num >= 0);
      }
    }

    if (field === 'mouldStrengthSetting') {
      setMouldStrengthSettingValid(value ? true : null);
      // Reset value validation if setting changes
      const updatedData = {...table5FormData, [field]: value};
      if (!value) {
        setMouldStrengthValueValid(null);
      } else if (updatedData.mouldStrengthValue) {
        setMouldStrengthValueValid(!isNaN(parseFloat(updatedData.mouldStrengthValue)) && parseFloat(updatedData.mouldStrengthValue) >= 0);
      }
    }

    if (field === 'mouldStrengthValue') {
      if (!value.trim()) {
        setMouldStrengthValueValid(null);
      } else {
        const num = parseFloat(value);
        setMouldStrengthValueValid(!isNaN(num) && num >= 0);
      }
    }

    if (field === 'preparedSandLumpsKg') {
      setPreparedSandLumpsKgValid(value.trim() && !isNaN(value) && parseFloat(value) >= 0 ? true : (value.trim() ? false : null));
    }

    if (field === 'itemName') {
      setItemNameValid(value.trim() ? true : null);
    }

    // Remarks is optional, no validation needed
  };

  // Handle time change
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    updateFormField(name, value);
  };

  // Handle form submission
  const handleTable5Submit = async () => {
    let hasErrors = false;

    // Validate Time (required)
    if (!table5FormData.timeHour || !table5FormData.timeMinute) {
      setTimeValid(false);
      hasErrors = true;
    }

    // Validate Mix No (required)
    if (!table5FormData.mixNo || !table5FormData.mixNo.trim()) {
      setMixNoValid(false);
      hasErrors = true;
    }

    // Validate Permeability (required, range 90-160)
    if (!table5FormData.permeability) {
      setPermeabilityValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.permeability);
      if (isNaN(num) || num < 90 || num > 160) {
        setPermeabilityValid(false);
        hasErrors = true;
      }
    }

    // Validate G.C.S (required)
    if (!table5FormData.gcsCheckpoint || !table5FormData.gcsValue) {
      setGcsValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.gcsValue);
      const minValue = table5FormData.gcsCheckpoint === 'FDY-A' ? 1800 : 1900;
      if (isNaN(num) || num < minValue) {
        setGcsValid(false);
        hasErrors = true;
      }
    }

    // Validate WTS (required, min 0.15)
    if (!table5FormData.wts) {
      setWtsValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.wts);
      if (isNaN(num) || num < 0.15) {
        setWtsValid(false);
        hasErrors = true;
      }
    }

    // Validate Moisture (required, range 3.0-4.0)
    if (!table5FormData.moisture) {
      setMoistureValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.moisture);
      if (isNaN(num) || num < 3.0 || num > 4.0) {
        setMoistureValid(false);
        hasErrors = true;
      }
    }

    // Validate Compactability (required, range 33-40)
    if (!table5FormData.compactability) {
      setCompactabilityValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.compactability);
      if (isNaN(num) || num < 33 || num > 40) {
        setCompactabilityValid(false);
        hasErrors = true;
      }
    }

    // Validate Compressability (required, range 20-28)
    if (!table5FormData.compressability) {
      setCompressabilityValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.compressability);
      if (isNaN(num) || num < 20 || num > 28) {
        setCompressabilityValid(false);
        hasErrors = true;
      }
    }

    // Validate Water Litre/Kg Mix (required)
    if (!table5FormData.waterLitreKgMix || isNaN(table5FormData.waterLitreKgMix) || parseFloat(table5FormData.waterLitreKgMix) < 0) {
      setWaterLitreValid(false);
      hasErrors = true;
    }

    // Validate Sand Temp BC (required, max 45)
    if (!table5FormData.sandTempBC) {
      setSandTempBCValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.sandTempBC);
      if (isNaN(num) || num < 0 || num > 45) {
        setSandTempBCValid(false);
        hasErrors = true;
      }
    }

    // Validate Sand Temp WU (required, max 45)
    if (!table5FormData.sandTempWU) {
      setSandTempWUValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.sandTempWU);
      if (isNaN(num) || num < 0 || num > 45) {
        setSandTempWUValid(false);
        hasErrors = true;
      }
    }

    // Validate Sand Temp SSU (required, max 45)
    if (!table5FormData.sandTempSSU) {
      setSandTempSSUValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.sandTempSSU);
      if (isNaN(num) || num < 0 || num > 45) {
        setSandTempSSUValid(false);
        hasErrors = true;
      }
    }

    // Validate New Sand Kgs/Mould (required, range 0.0-5.0)
    if (!table5FormData.newSandKgsMould) {
      setNewSandValid(false);
      hasErrors = true;
    } else {
      const num = parseFloat(table5FormData.newSandKgsMould);
      if (isNaN(num) || num < 0.0 || num > 5.0) {
        setNewSandValid(false);
        hasErrors = true;
      }
    }

    // Validate Bentonite (required)
    if (!table5FormData.bentoniteCheckpoint) {
      setBentoniteCheckpointValid(false);
      hasErrors = true;
    }
    if (!table5FormData.bentoniteKgs) {
      setBentoniteKgsValid(false);
      hasErrors = true;
    }
    if (!table5FormData.bentonitePercent) {
      setBentonitePercentValid(false);
      hasErrors = true;
    } else if (table5FormData.bentoniteCheckpoint && table5FormData.bentonitePercent) {
      const percent = parseFloat(table5FormData.bentonitePercent);
      const range = table5FormData.bentoniteCheckpoint === '0.60-1.20' ? [0.60, 1.20] : [0.80, 2.20];
      if (isNaN(percent) || percent < range[0] || percent > range[1]) {
        setBentonitePercentValid(false);
        hasErrors = true;
      }
    }

    // Validate Premix/Coal Dust (required)
    if (!table5FormData.premixCoalCheckpoint) {
      setPremixCoalCheckpointValid(false);
      hasErrors = true;
    }
    if (!table5FormData.premixCoalKgs) {
      setPremixCoalKgsValid(false);
      hasErrors = true;
    }
    if (!table5FormData.premixCoalPercent) {
      setPremixCoalPercentValid(false);
      hasErrors = true;
    } else if (table5FormData.premixCoalCheckpoint && table5FormData.premixCoalPercent) {
      const percent = parseFloat(table5FormData.premixCoalPercent);
      const range = table5FormData.premixCoalCheckpoint === 'Premix' ? [0.60, 1.20] : [0.28, 0.70];
      if (isNaN(percent) || percent < range[0] || percent > range[1]) {
        setPremixCoalPercentValid(false);
        hasErrors = true;
      }
    }

    // Validate Compactability Setting (required)
    if (!table5FormData.compactabilitySetting) {
      setCompactabilitySettingValid(false);
      hasErrors = true;
    }
    if (!table5FormData.compactabilityValue) {
      setCompactabilityValueValid(false);
      hasErrors = true;
    } else if (isNaN(table5FormData.compactabilityValue) || parseFloat(table5FormData.compactabilityValue) < 0) {
      setCompactabilityValueValid(false);
      hasErrors = true;
    }

    // Validate Mould Strength Setting (required)
    if (!table5FormData.mouldStrengthSetting) {
      setMouldStrengthSettingValid(false);
      hasErrors = true;
    }
    if (!table5FormData.mouldStrengthValue) {
      setMouldStrengthValueValid(false);
      hasErrors = true;
    } else if (isNaN(table5FormData.mouldStrengthValue) || parseFloat(table5FormData.mouldStrengthValue) < 0) {
      setMouldStrengthValueValid(false);
      hasErrors = true;
    }

    // Validate Prepared Sand Lumps/Kg (required)
    if (!table5FormData.preparedSandLumpsKg || isNaN(table5FormData.preparedSandLumpsKg) || parseFloat(table5FormData.preparedSandLumpsKg) < 0) {
      setPreparedSandLumpsKgValid(false);
      hasErrors = true;
    }

    // Validate Item Name (required)
    if (!table5FormData.itemName || !table5FormData.itemName.trim()) {
      setItemNameValid(false);
      hasErrors = true;
    }

    // Remarks is optional, no validation needed

    if (hasErrors) {
      alert('Please fill in all required fields correctly with valid values.');
      return;
    }

    try {
      // Combine time fields into HH:MM format
      const time = `${String(table5FormData.timeHour).padStart(2, '0')}:${String(table5FormData.timeMinute).padStart(2, '0')}`;

      // Transform data to match backend model structure
      const dataToSave = {
        date: selectedDate,
        sno: currentSNo === 0 ? 1 : currentSNo + 1,
        time: parseInt(table5FormData.timeHour) * 100 + parseInt(table5FormData.timeMinute), // Convert to number format
        mixno: parseFloat(table5FormData.mixNo) || 0,
        permeability: parseFloat(table5FormData.permeability) || 0,
        gcsFdyA: table5FormData.gcsCheckpoint === 'FDY-A' ? parseFloat(table5FormData.gcsValue) || 0 : 0,
        gcsFdyB: table5FormData.gcsCheckpoint === 'FDY-B' ? parseFloat(table5FormData.gcsValue) || 0 : 0,
        wts: parseFloat(table5FormData.wts) || 0,
        moisture: parseFloat(table5FormData.moisture) || 0,
        compactability: parseFloat(table5FormData.compactability) || 0,
        compressibility: parseFloat(table5FormData.compressability) || 0,
        waterLitre: parseFloat(table5FormData.waterLitreKgMix) || 0,
        sandTemp: {
          BC: parseFloat(table5FormData.sandTempBC) || 0,
          WU: parseFloat(table5FormData.sandTempWU) || 0,
          SSUmax: parseFloat(table5FormData.sandTempSSU) || 0
        },
        newSandKgs: parseFloat(table5FormData.newSandKgsMould) || 0,
        mould: 0, // Not in form
        bentonite: {
          Kgs: parseFloat(table5FormData.bentoniteKgs) || 0,
          Percent: parseFloat(table5FormData.bentonitePercent) || 0
        },
        premix: table5FormData.premixCoalCheckpoint === 'Premix' ? {
          Kgs: parseFloat(table5FormData.premixCoalKgs) || 0,
          Percent: parseFloat(table5FormData.premixCoalPercent) || 0
        } : { Kgs: 0, Percent: 0 },
        coalDust: table5FormData.premixCoalCheckpoint === 'CoalDust' ? {
          Kgs: parseFloat(table5FormData.premixCoalKgs) || 0,
          Percent: parseFloat(table5FormData.premixCoalPercent) || 0
        } : { Kgs: 0, Percent: 0 },
        lc: table5FormData.compactabilitySetting === 'LC' ? parseFloat(table5FormData.compactabilityValue) || 0 : 0,
        CompactabilitySettings: table5FormData.compactabilitySetting === 'SMC42' ? parseFloat(table5FormData.compactabilityValue) || 0 : 0,
        mouldStrength: table5FormData.mouldStrengthSetting === 'SMC23' ? parseFloat(table5FormData.mouldStrengthValue) || 0 : 0,
        shearStrengthSetting: table5FormData.mouldStrengthSetting === 'At15' ? parseFloat(table5FormData.mouldStrengthValue) || 0 : 0,
        preparedSandlumps: parseFloat(table5FormData.preparedSandLumpsKg) || 0,
        itemName: table5FormData.itemName || '',
        remarks: table5FormData.remarks || ''
      };

      console.log('Saving data:', dataToSave);

      const response = await fetch('http://localhost:5000/api/v1/sand-testing-records/table/5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Table 5 data submitted successfully!');
        
        // If this is the first entry, lock the option fields
        if (currentSNo === 0) {
          setTable5LockedFields({
            gcsCheckpoint: table5FormData.gcsCheckpoint,
            bentoniteCheckpoint: table5FormData.bentoniteCheckpoint,
            premixCoalCheckpoint: table5FormData.premixCoalCheckpoint,
            compactabilitySetting: table5FormData.compactabilitySetting,
            mouldStrengthSetting: table5FormData.mouldStrengthSetting
          });
        }
        
        // Increment S.No
        setCurrentSNo(currentSNo === 0 ? 1 : currentSNo + 1);
        
        // Reset form and validation states
        handleTable5Reset();
        
        // Focus on first input (time hour)
        setTimeout(() => {
          if (timeHourRef && timeHourRef.current) {
            timeHourRef.current.focus();
          }
        }, 100);
      } else {
        alert('Failed to submit Table 5 data: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving Table 5 data:', error);
      alert('Error submitting Table 5 data');
    }
  };

  // Handle form reset
  const handleTable5Reset = () => {
    setTable5FormData({
      timeHour: '',
      timeMinute: '',
      mixNo: '',
      permeability: '',
      gcsCheckpoint: currentSNo > 0 ? table5LockedFields.gcsCheckpoint : '',
      gcsValue: '',
      wts: '',
      moisture: '',
      compactability: '',
      compressability: '',
      waterLitreKgMix: '',
      sandTempBC: '',
      sandTempWU: '',
      sandTempSSU: '',
      newSandKgsMould: '',
      bentoniteCheckpoint: currentSNo > 0 ? table5LockedFields.bentoniteCheckpoint : '',
      bentoniteKgs: '',
      bentonitePercent: '',
      premixCoalCheckpoint: currentSNo > 0 ? table5LockedFields.premixCoalCheckpoint : '',
      premixCoalKgs: '',
      premixCoalPercent: '',
      compactabilitySetting: currentSNo > 0 ? table5LockedFields.compactabilitySetting : '',
      compactabilityValue: '',
      mouldStrengthSetting: currentSNo > 0 ? table5LockedFields.mouldStrengthSetting : '',
      mouldStrengthValue: '',
      preparedSandLumpsKg: '',
      itemName: '',
      remarks: ''
    });

    // Reset all validation states
    setTimeValid(null);
    setMixNoValid(null);
    setPermeabilityValid(null);
    setGcsCheckpointValid(currentSNo > 0 ? true : null);
    setGcsValid(null);
    setWtsValid(null);
    setMoistureValid(null);
    setCompactabilityValid(null);
    setCompressabilityValid(null);
    setWaterLitreValid(null);
    setSandTempBCValid(null);
    setSandTempWUValid(null);
    setSandTempSSUValid(null);
    setNewSandValid(null);
    setBentoniteCheckpointValid(currentSNo > 0 ? true : null);
    setBentoniteKgsValid(null);
    setBentonitePercentValid(null);
    setPremixCoalCheckpointValid(currentSNo > 0 ? true : null);
    setPremixCoalKgsValid(null);
    setPremixCoalPercentValid(null);
    setCompactabilitySettingValid(currentSNo > 0 ? true : null);
    setCompactabilityValueValid(null);
    setMouldStrengthSettingValid(currentSNo > 0 ? true : null);
    setMouldStrengthValueValid(null);
    setPreparedSandLumpsKgValid(null);
    setItemNameValid(null);
  };

  // State for Table 1a - array of inputs per cell with locked status
  const [table1aInputs, setTable1aInputs] = useState({
    '0_1': [{ value: '', locked: false }], 
    '0_2': [{ value: '', locked: false }], 
    '0_3': [{ value: '', locked: false }], // R. Sand row
    '1_1': [{ value: '', locked: false }], 
    '1_2': [{ value: '', locked: false }], 
    '1_3': [{ value: '', locked: false }], // N. Sand row
    '2_1': [{ value: '', locked: false }], 
    '2_2': [{ value: '', locked: false }], 
    '2_3': [{ value: '', locked: false }], // Mixing Mode row
    '3_1': [{ value: '', locked: false }], 
    '3_2': [{ value: '', locked: false }], 
    '3_3': [{ value: '', locked: false }], // Bentonite row
    '4_1': [{ value: '', locked: false }], 
    '4_2': [{ value: '', locked: false }], 
    '4_3': [{ value: '', locked: false }]  // Coal Dust/Premix row
  });

  // State for Table 1b - Batch No. inputs with independent locked states
  const [table1bInputs, setTable1bInputs] = useState({
    batchType: '', // 'coalDust' or 'premix'
    bentonite: '',
    value: '', // either coalDust or premix value based on radio selection
    bentoniteLocked: false,
    valueLocked: false
  });

  const addTable1aInput = (rowIndex, colIndex) => {
    const key = `${rowIndex}_${colIndex}`;
    const currentInputs = table1aInputs[key] || [];
    
    // Maximum limit of 4 inputs
    if (currentInputs.length >= 4) {
      return;
    }
    
    setTable1aInputs({
      ...table1aInputs,
      [key]: [...currentInputs, { value: '', locked: false }]
    });
  };

  const removeTable1aInput = (rowIndex, colIndex, inputIndex) => {
    const key = `${rowIndex}_${colIndex}`;
    const currentValues = table1aInputs[key];
    // Only allow removing if not locked and more than 1 entry
    if (currentValues.length > 1 && !currentValues[inputIndex].locked) {
      setTable1aInputs({
        ...table1aInputs,
        [key]: currentValues.filter((_, i) => i !== inputIndex)
      });
    }
  };

  // State for Table 2 - clayShifts with locked status
  const [table2Inputs, setTable2Inputs] = useState({
    // Row index_Column index: { value, locked }
    // Rows: 0=Total Clay, 1=Active Clay, 2=Dead Clay, 3=V.C.M., 4=L.O.I., 5=AFS No., 6=Fines
    // Columns: 0=Shift I, 1=Shift II, 2=Shift III
    '0_0': { value: '', locked: false }, '0_1': { value: '', locked: false }, '0_2': { value: '', locked: false },
    '1_0': { value: '', locked: false }, '1_1': { value: '', locked: false }, '1_2': { value: '', locked: false },
    '2_0': { value: '', locked: false }, '2_1': { value: '', locked: false }, '2_2': { value: '', locked: false },
    '3_0': { value: '', locked: false }, '3_1': { value: '', locked: false }, '3_2': { value: '', locked: false },
    '4_0': { value: '', locked: false }, '4_1': { value: '', locked: false }, '4_2': { value: '', locked: false },
    '5_0': { value: '', locked: false }, '5_1': { value: '', locked: false }, '5_2': { value: '', locked: false },
    '6_0': { value: '', locked: false }, '6_1': { value: '', locked: false }, '6_2': { value: '', locked: false }
  });

  // State for Table 3 - array of inputs per cell with locked status
  const [table3Inputs, setTable3Inputs] = useState({
    '0_0': [{ value: '', locked: false }], '0_1': [{ value: '', locked: false }], '0_2': [{ value: '', locked: false }], '0_3': [{ value: '', locked: false }], '0_4': [{ value: '', locked: false }], // Shift I
    '1_0': [{ value: '', locked: false }], '1_1': [{ value: '', locked: false }], '1_2': [{ value: '', locked: false }], '1_3': [{ value: '', locked: false }], '1_4': [{ value: '', locked: false }], // Shift II
    '2_0': [{ value: '', locked: false }], '2_1': [{ value: '', locked: false }], '2_2': [{ value: '', locked: false }], '2_3': [{ value: '', locked: false }], '2_4': [{ value: '', locked: false }]  // Shift III
  });

  // State for Table 4 - sandLump, newSandWt, and sandFriability with locked status
  const [table4Inputs, setTable4Inputs] = useState({
    sandLump: { value: '', locked: false },
    newSandWt: { value: '', locked: false },
    friabilityShiftI: { value: '', locked: false },
    friabilityShiftII: { value: '', locked: false },
    friabilityShiftIII: { value: '', locked: false }
  });

  const addTable3Input = (rowIndex, colIndex) => {
    const key = `${rowIndex}_${colIndex}`;
    const currentInputs = table3Inputs[key] || [];
    
    // Maximum limit of 4 inputs
    if (currentInputs.length >= 4) {
      return;
    }
    
    setTable3Inputs({
      ...table3Inputs,
      [key]: [...currentInputs, { value: '', locked: false }]
    });
  };

  const removeTable3Input = (rowIndex, colIndex, inputIndex) => {
    const key = `${rowIndex}_${colIndex}`;
    const currentValues = table3Inputs[key];
    // Only allow removing if not locked and more than 1 entry
    if (currentValues.length > 1 && !currentValues[inputIndex].locked) {
      setTable3Inputs({
        ...table3Inputs,
        [key]: currentValues.filter((_, i) => i !== inputIndex)
      });
    }
  };
  const checkExistingData = async (date) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/sand-testing-records/date/${date}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const existingData = result.data[0];
          
          // Load Table 1 data - mark existing entries as locked
          if (existingData.sandShifts) {
            const newTable1aInputs = { ...table1aInputs };
            
            // Map shift data to table cells
            const shifts = ['shiftI', 'shiftII', 'shiftIII'];
            const fields = ['rSand', 'nSand', 'mixingMode', 'bentonite', 'coalDustPremix'];
            
            shifts.forEach((shift, shiftIndex) => {
              fields.forEach((field, fieldIndex) => {
                const key = `${fieldIndex}_${shiftIndex + 1}`;
                const existingValues = existingData.sandShifts[shift]?.[field] || [];
                
                if (existingValues.length > 0) {
                  // Existing values are locked
                  const lockedEntries = existingValues.map(val => ({ value: val, locked: true }));
                  // Add one empty unlocked entry for new data only if less than 4 entries
                  if (lockedEntries.length < 4) {
                    newTable1aInputs[key] = [...lockedEntries, { value: '', locked: false }];
                  } else {
                    newTable1aInputs[key] = lockedEntries;
                  }
                } else {
                  newTable1aInputs[key] = [{ value: '', locked: false }];
                }
              });
            });
            
            setTable1aInputs(newTable1aInputs);
            
            // Load Table 1b data
            if (existingData.sandShifts.batchNo) {
              const batchNo = existingData.sandShifts.batchNo;
              const hasCoalDust = batchNo.coalDust && batchNo.coalDust.trim() !== '';
              const hasPremix = batchNo.premix && batchNo.premix.trim() !== '';
              const hasBentonite = batchNo.bentonite && batchNo.bentonite.trim() !== '';
              
              setTable1bInputs({
                batchType: hasCoalDust ? 'coalDust' : (hasPremix ? 'premix' : ''),
                bentonite: batchNo.bentonite || '',
                value: batchNo.coalDust || batchNo.premix || '',
                bentoniteLocked: hasBentonite,
                valueLocked: hasCoalDust || hasPremix
              });
              setTable1Locked(hasBentonite || hasCoalDust || hasPremix);
            }
          } else {
            // Reset to default unlocked state
            setTable1Locked(false);
          }

          // Check other tables...
          const hasTable2Data = existingData.clayShifts && (
            existingData.clayShifts.shiftI?.totalClay ||
            existingData.clayShifts.ShiftII?.totalClay ||
            existingData.clayShifts.ShiftIII?.totalClay
          );
          setTable2Locked(hasTable2Data);
          
          // Load Table 2 data - mark existing entries as locked
          if (existingData.clayShifts) {
            const newTable2Inputs = {};
            
            const shifts = ['shiftI', 'ShiftII', 'ShiftIII'];
            const fields = ['totalClay', 'activeClay', 'deadClay', 'vcm', 'loi', 'afsNo', 'fines'];
            
            shifts.forEach((shift, shiftIndex) => {
              fields.forEach((field, fieldIndex) => {
                const key = `${fieldIndex}_${shiftIndex}`;
                const existingValue = existingData.clayShifts[shift]?.[field] || '';
                const hasValue = existingValue && existingValue.trim() !== '';
                
                newTable2Inputs[key] = {
                  value: existingValue,
                  locked: hasValue
                };
              });
            });
            
            setTable2Inputs(newTable2Inputs);
          }

          const hasTable3Data = existingData.mixshifts && (
            existingData.mixshifts.ShiftI?.mixno?.start ||
            existingData.mixshifts.ShiftII?.mixno?.start ||
            existingData.mixshifts.ShiftIII?.mixno?.start
          );
          setTable3Locked(hasTable3Data);
          
          // Load Table 3 data - mark existing entries as locked
          if (existingData.mixshifts) {
            const newTable3Inputs = { ...table3Inputs };
            
            const shifts = ['ShiftI', 'ShiftII', 'ShiftIII'];
            const fieldMappings = [
              { key: 0, path: 'mixno.start' },
              { key: 1, path: 'mixno.end' },
              { key: 2, path: 'mixno.total' },
              { key: 3, path: 'numberOfMixRejected' },
              { key: 4, path: 'returnSandHopperLevel' }
            ];
            
            shifts.forEach((shift, shiftIndex) => {
              fieldMappings.forEach(({ key, path }) => {
                const cellKey = `${shiftIndex}_${key}`;
                const pathParts = path.split('.');
                let existingValues = existingData.mixshifts[shift];
                
                for (const part of pathParts) {
                  existingValues = existingValues?.[part];
                }
                
                existingValues = existingValues || [];
                
                if (existingValues.length > 0) {
                  const lockedEntries = existingValues.map(val => ({ value: val, locked: true }));
                  // Add one empty unlocked entry for new data only if less than 4 entries
                  if (lockedEntries.length < 4) {
                    newTable3Inputs[cellKey] = [...lockedEntries, { value: '', locked: false }];
                  } else {
                    newTable3Inputs[cellKey] = lockedEntries;
                  }
                } else {
                  newTable3Inputs[cellKey] = [{ value: '', locked: false }];
                }
              });
            });
            
            setTable3Inputs(newTable3Inputs);
          }

          const hasTable4Data = existingData.sandLump || existingData.newSandWt;
          setTable4Locked(hasTable4Data);
          
          // Load Table 4 data - mark existing entries as locked
          const newTable4Inputs = {
            sandLump: {
              value: existingData.sandLump || '',
              locked: !!(existingData.sandLump && existingData.sandLump.trim() !== '')
            },
            newSandWt: {
              value: existingData.newSandWt || '',
              locked: !!(existingData.newSandWt && existingData.newSandWt.trim() !== '')
            },
            friabilityShiftI: {
              value: existingData.sandFriability?.shiftI || '',
              locked: !!(existingData.sandFriability?.shiftI && existingData.sandFriability.shiftI.trim() !== '')
            },
            friabilityShiftII: {
              value: existingData.sandFriability?.shiftII || '',
              locked: !!(existingData.sandFriability?.shiftII && existingData.sandFriability.shiftII.trim() !== '')
            },
            friabilityShiftIII: {
              value: existingData.sandFriability?.shiftIII || '',
              locked: !!(existingData.sandFriability?.shiftIII && existingData.sandFriability.shiftIII.trim() !== '')
            }
          };
          setTable4Inputs(newTable4Inputs);

          const hasTable5Data = existingData.testParameter && existingData.testParameter.length > 0;
          setTable5Locked(hasTable5Data);
          
          // Load Table 5 data - set S.No and locked fields based on first entry
          if (hasTable5Data && existingData.testParameter.length > 0) {
            // Get the highest S.No to continue from
            const maxSNo = Math.max(...existingData.testParameter.map(entry => entry.sno || 0));
            setCurrentSNo(maxSNo);
            
            // Get the first entry to determine locked field values
            const firstEntry = existingData.testParameter[0];
            
            // Determine which options were selected in first entry
            const lockedFields = {
              gcsCheckpoint: firstEntry.gcsFdyA > 0 ? 'FDY-A' : (firstEntry.gcsFdyB > 0 ? 'FDY-B' : null),
              bentoniteCheckpoint: firstEntry.bentonite?.Percent ? 
                (firstEntry.bentonite.Percent <= 1.20 ? '0.60-1.20' : '0.80-2.20') : null,
              premixCoalCheckpoint: firstEntry.premix?.Kgs > 0 ? 'Premix' : 
                (firstEntry.coalDust?.Kgs > 0 ? 'CoalDust' : null),
              compactabilitySetting: firstEntry.lc > 0 ? 'LC' : 
                (firstEntry.CompactabilitySettings > 0 ? 'SMC42' : null),
              mouldStrengthSetting: firstEntry.mouldStrength > 0 ? 'SMC23' : 
                (firstEntry.shearStrengthSetting > 0 ? 'At15' : null)
            };
            
            setTable5LockedFields(lockedFields);
            
            // Pre-populate form with locked field values for next entry
            setTable5FormData(prev => ({
              ...prev,
              gcsCheckpoint: lockedFields.gcsCheckpoint || '',
              bentoniteCheckpoint: lockedFields.bentoniteCheckpoint || '',
              premixCoalCheckpoint: lockedFields.premixCoalCheckpoint || '',
              compactabilitySetting: lockedFields.compactabilitySetting || '',
              mouldStrengthSetting: lockedFields.mouldStrengthSetting || ''
            }));
          } else {
            // Reset if no Table 5 data
            setCurrentSNo(0);
            setTable5LockedFields({
              gcsCheckpoint: null,
              bentoniteCheckpoint: null,
              premixCoalCheckpoint: null,
              compactabilitySetting: null,
              mouldStrengthSetting: null
            });
          }

        } else {
          // No data exists, reset to unlocked default state
          setTable1Locked(false);
          setTable2Locked(false);
          setTable3Locked(false);
          setTable4Locked(false);
          setTable5Locked(false);
          
          // Reset Table 1 to default empty state
          setTable1aInputs({
            '0_1': [{ value: '', locked: false }], '0_2': [{ value: '', locked: false }], '0_3': [{ value: '', locked: false }],
            '1_1': [{ value: '', locked: false }], '1_2': [{ value: '', locked: false }], '1_3': [{ value: '', locked: false }],
            '2_1': [{ value: '', locked: false }], '2_2': [{ value: '', locked: false }], '2_3': [{ value: '', locked: false }],
            '3_1': [{ value: '', locked: false }], '3_2': [{ value: '', locked: false }], '3_3': [{ value: '', locked: false }],
            '4_1': [{ value: '', locked: false }], '4_2': [{ value: '', locked: false }], '4_3': [{ value: '', locked: false }]
          });
          
          setTable1bInputs({
            batchType: '',
            bentonite: '',
            value: '',
            bentoniteLocked: false,
            valueLocked: false
          });
          
          // Reset Table 3 to default empty state
          setTable3Inputs({
            '0_0': [{ value: '', locked: false }], '0_1': [{ value: '', locked: false }], '0_2': [{ value: '', locked: false }], '0_3': [{ value: '', locked: false }], '0_4': [{ value: '', locked: false }],
            '1_0': [{ value: '', locked: false }], '1_1': [{ value: '', locked: false }], '1_2': [{ value: '', locked: false }], '1_3': [{ value: '', locked: false }], '1_4': [{ value: '', locked: false }],
            '2_0': [{ value: '', locked: false }], '2_1': [{ value: '', locked: false }], '2_2': [{ value: '', locked: false }], '2_3': [{ value: '', locked: false }], '2_4': [{ value: '', locked: false }]
          });
          
          // Reset Table 2 to default empty state
          setTable2Inputs({
            '0_0': { value: '', locked: false }, '0_1': { value: '', locked: false }, '0_2': { value: '', locked: false },
            '1_0': { value: '', locked: false }, '1_1': { value: '', locked: false }, '1_2': { value: '', locked: false },
            '2_0': { value: '', locked: false }, '2_1': { value: '', locked: false }, '2_2': { value: '', locked: false },
            '3_0': { value: '', locked: false }, '3_1': { value: '', locked: false }, '3_2': { value: '', locked: false },
            '4_0': { value: '', locked: false }, '4_1': { value: '', locked: false }, '4_2': { value: '', locked: false },
            '5_0': { value: '', locked: false }, '5_1': { value: '', locked: false }, '5_2': { value: '', locked: false },
            '6_0': { value: '', locked: false }, '6_1': { value: '', locked: false }, '6_2': { value: '', locked: false }
          });
          
          // Reset Table 4 to default empty state
          setTable4Inputs({
            sandLump: { value: '', locked: false },
            newSandWt: { value: '', locked: false },
            friabilityShiftI: { value: '', locked: false },
            friabilityShiftII: { value: '', locked: false },
            friabilityShiftIII: { value: '', locked: false }
          });
        }
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    }
  };

  // Check existing data when date changes
  useEffect(() => {
    checkExistingData(selectedDate);
  }, [selectedDate]);

  // Handlers for Table 1
  const handleTable1Submit = async () => {
    try {
      // Transform table1aInputs to match backend structure - only submit unlocked (new) entries
      const sandShifts = {
        shiftI: {
          rSand: table1aInputs['0_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          nSand: table1aInputs['1_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          mixingMode: table1aInputs['2_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          bentonite: table1aInputs['3_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          coalDustPremix: table1aInputs['4_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        },
        shiftII: {
          rSand: table1aInputs['0_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          nSand: table1aInputs['1_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          mixingMode: table1aInputs['2_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          bentonite: table1aInputs['3_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          coalDustPremix: table1aInputs['4_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        },
        shiftIII: {
          rSand: table1aInputs['0_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          nSand: table1aInputs['1_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          mixingMode: table1aInputs['2_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          bentonite: table1aInputs['3_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          coalDustPremix: table1aInputs['4_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        },
        batchNo: {
          bentonite: (!table1bInputs.bentoniteLocked && table1bInputs.bentonite && table1bInputs.bentonite.trim() !== '') ? table1bInputs.bentonite : '',
          coalDust: (!table1bInputs.valueLocked && table1bInputs.batchType === 'coalDust' && table1bInputs.value && table1bInputs.value.trim() !== '') ? table1bInputs.value : '',
          premix: (!table1bInputs.valueLocked && table1bInputs.batchType === 'premix' && table1bInputs.value && table1bInputs.value.trim() !== '') ? table1bInputs.value : ''
        }
      };

      const response = await fetch('http://localhost:5000/api/v1/sand-testing-records/table/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: sends authentication cookie
        body: JSON.stringify({
          date: selectedDate,
          ...sandShifts
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Table 1 data submitted successfully!');
        console.log('Table 1 submitted:', result.data);
        // Reload data to lock newly submitted entries
        await checkExistingData(selectedDate);
      } else {
        alert('Failed to submit Table 1 data: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting Table 1:', error);
      alert('Error submitting Table 1 data');
    }
  };

  const handleTable1Reset = () => {
    // Only reset unlocked entries
    const resetInputs = {};
    Object.keys(table1aInputs).forEach(key => {
      const lockedEntries = table1aInputs[key].filter(v => v.locked);
      resetInputs[key] = lockedEntries.length > 0 
        ? [...lockedEntries, { value: '', locked: false }]
        : [{ value: '', locked: false }];
    });
    setTable1aInputs(resetInputs);
    
    // Reset Table 1b only unlocked fields
    if (!table1bInputs.bentoniteLocked || !table1bInputs.valueLocked) {
      setTable1bInputs({
        batchType: table1bInputs.valueLocked ? table1bInputs.batchType : '',
        bentonite: table1bInputs.bentoniteLocked ? table1bInputs.bentonite : '',
        value: table1bInputs.valueLocked ? table1bInputs.value : '',
        bentoniteLocked: table1bInputs.bentoniteLocked,
        valueLocked: table1bInputs.valueLocked
      });
    }
  };

  // Handlers for Table 2
  const handleTable2Submit = async () => {
    try {
      // Transform table2Inputs to match backend structure - only submit unlocked (new) entries
      const clayShifts = {
        shiftI: {
          totalClay: !table2Inputs['0_0'].locked && table2Inputs['0_0'].value.trim() !== '' ? table2Inputs['0_0'].value : '',
          activeClay: !table2Inputs['1_0'].locked && table2Inputs['1_0'].value.trim() !== '' ? table2Inputs['1_0'].value : '',
          deadClay: !table2Inputs['2_0'].locked && table2Inputs['2_0'].value.trim() !== '' ? table2Inputs['2_0'].value : '',
          vcm: !table2Inputs['3_0'].locked && table2Inputs['3_0'].value.trim() !== '' ? table2Inputs['3_0'].value : '',
          loi: !table2Inputs['4_0'].locked && table2Inputs['4_0'].value.trim() !== '' ? table2Inputs['4_0'].value : '',
          afsNo: !table2Inputs['5_0'].locked && table2Inputs['5_0'].value.trim() !== '' ? table2Inputs['5_0'].value : '',
          fines: !table2Inputs['6_0'].locked && table2Inputs['6_0'].value.trim() !== '' ? table2Inputs['6_0'].value : ''
        },
        ShiftII: {
          totalClay: !table2Inputs['0_1'].locked && table2Inputs['0_1'].value.trim() !== '' ? table2Inputs['0_1'].value : '',
          activeClay: !table2Inputs['1_1'].locked && table2Inputs['1_1'].value.trim() !== '' ? table2Inputs['1_1'].value : '',
          deadClay: !table2Inputs['2_1'].locked && table2Inputs['2_1'].value.trim() !== '' ? table2Inputs['2_1'].value : '',
          vcm: !table2Inputs['3_1'].locked && table2Inputs['3_1'].value.trim() !== '' ? table2Inputs['3_1'].value : '',
          loi: !table2Inputs['4_1'].locked && table2Inputs['4_1'].value.trim() !== '' ? table2Inputs['4_1'].value : '',
          afsNo: !table2Inputs['5_1'].locked && table2Inputs['5_1'].value.trim() !== '' ? table2Inputs['5_1'].value : '',
          fines: !table2Inputs['6_1'].locked && table2Inputs['6_1'].value.trim() !== '' ? table2Inputs['6_1'].value : ''
        },
        ShiftIII: {
          totalClay: !table2Inputs['0_2'].locked && table2Inputs['0_2'].value.trim() !== '' ? table2Inputs['0_2'].value : '',
          activeClay: !table2Inputs['1_2'].locked && table2Inputs['1_2'].value.trim() !== '' ? table2Inputs['1_2'].value : '',
          deadClay: !table2Inputs['2_2'].locked && table2Inputs['2_2'].value.trim() !== '' ? table2Inputs['2_2'].value : '',
          vcm: !table2Inputs['3_2'].locked && table2Inputs['3_2'].value.trim() !== '' ? table2Inputs['3_2'].value : '',
          loi: !table2Inputs['4_2'].locked && table2Inputs['4_2'].value.trim() !== '' ? table2Inputs['4_2'].value : '',
          afsNo: !table2Inputs['5_2'].locked && table2Inputs['5_2'].value.trim() !== '' ? table2Inputs['5_2'].value : '',
          fines: !table2Inputs['6_2'].locked && table2Inputs['6_2'].value.trim() !== '' ? table2Inputs['6_2'].value : ''
        }
      };

      const response = await fetch('http://localhost:5000/api/v1/sand-testing-records/table/2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          ...clayShifts
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Table 2 data submitted successfully!');
        console.log('Table 2 submitted:', result.data);
        // Reload data to lock newly submitted entries
        await checkExistingData(selectedDate);
      } else {
        alert('Failed to submit Table 2 data: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting Table 2:', error);
      alert('Error submitting Table 2 data');
    }
  };

  const handleTable2Reset = () => {
    // Only reset unlocked entries
    const resetInputs = {};
    Object.keys(table2Inputs).forEach(key => {
      if (!table2Inputs[key].locked) {
        resetInputs[key] = { value: '', locked: false };
      } else {
        resetInputs[key] = table2Inputs[key];
      }
    });
    setTable2Inputs(resetInputs);
  };

  // Handlers for Table 3
  const handleTable3Submit = async () => {
    try {
      // Transform table3Inputs to match backend structure - only submit unlocked (new) entries
      const mixshifts = {
        ShiftI: {
          mixno: {
            start: table3Inputs['0_0'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            end: table3Inputs['0_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            total: table3Inputs['0_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
          },
          numberOfMixRejected: table3Inputs['0_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          returnSandHopperLevel: table3Inputs['0_4'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        },
        ShiftII: {
          mixno: {
            start: table3Inputs['1_0'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            end: table3Inputs['1_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            total: table3Inputs['1_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
          },
          numberOfMixRejected: table3Inputs['1_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          returnSandHopperLevel: table3Inputs['1_4'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        },
        ShiftIII: {
          mixno: {
            start: table3Inputs['2_0'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            end: table3Inputs['2_1'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
            total: table3Inputs['2_2'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
          },
          numberOfMixRejected: table3Inputs['2_3'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value),
          returnSandHopperLevel: table3Inputs['2_4'].filter(v => !v.locked && v.value.trim() !== '').map(v => v.value)
        }
      };

      const response = await fetch('http://localhost:5000/api/v1/sand-testing-records/table/3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          ...mixshifts
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Table 3 data submitted successfully!');
        console.log('Table 3 submitted:', result.data);
        // Reload data to lock newly submitted entries
        await checkExistingData(selectedDate);
      } else {
        alert('Failed to submit Table 3 data: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting Table 3:', error);
      alert('Error submitting Table 3 data');
    }
  };

  const handleTable3Reset = () => {
    // Only reset unlocked entries
    const resetInputs = {};
    Object.keys(table3Inputs).forEach(key => {
      const lockedEntries = table3Inputs[key].filter(v => v.locked);
      resetInputs[key] = lockedEntries.length > 0 
        ? [...lockedEntries, { value: '', locked: false }]
        : [{ value: '', locked: false }];
    });
    setTable3Inputs(resetInputs);
  };

  // Handlers for Table 4
  const handleTable4Submit = async () => {
    try {
      // Build table4Data object with only non-empty unlocked values
      const table4Data = {};
      
      // Only include sandLump if it's unlocked and has a value
      if (!table4Inputs.sandLump.locked && table4Inputs.sandLump.value.trim() !== '') {
        table4Data.sandLump = table4Inputs.sandLump.value;
      }
      
      // Only include newSandWt if it's unlocked and has a value
      if (!table4Inputs.newSandWt.locked && table4Inputs.newSandWt.value.trim() !== '') {
        table4Data.newSandWt = table4Inputs.newSandWt.value;
      }
      
      // Build sandFriability object only with non-empty unlocked shift values
      const friabilityData = {};
      if (!table4Inputs.friabilityShiftI.locked && table4Inputs.friabilityShiftI.value.trim() !== '') {
        friabilityData.shiftI = table4Inputs.friabilityShiftI.value;
      }
      if (!table4Inputs.friabilityShiftII.locked && table4Inputs.friabilityShiftII.value.trim() !== '') {
        friabilityData.shiftII = table4Inputs.friabilityShiftII.value;
      }
      if (!table4Inputs.friabilityShiftIII.locked && table4Inputs.friabilityShiftIII.value.trim() !== '') {
        friabilityData.shiftIII = table4Inputs.friabilityShiftIII.value;
      }
      
      // Only include sandFriability if at least one shift has data
      if (Object.keys(friabilityData).length > 0) {
        table4Data.sandFriability = friabilityData;
      }

      const response = await fetch('http://localhost:5000/api/v1/sand-testing-records/table/4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: selectedDate,
          ...table4Data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Table 4 data submitted successfully!');
        console.log('Table 4 submitted:', result.data);
        // Reload data to lock newly submitted entries
        await checkExistingData(selectedDate);
      } else {
        alert('Failed to submit Table 4 data: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting Table 4:', error);
      alert('Error submitting Table 4 data');
    }
  };

  const handleTable4Reset = () => {
    // Only reset unlocked entries
    const resetInputs = {};
    Object.keys(table4Inputs).forEach(key => {
      if (!table4Inputs[key].locked) {
        resetInputs[key] = { value: '', locked: false };
      } else {
        resetInputs[key] = table4Inputs[key];
      }
    });
    setTable4Inputs(resetInputs);
  };

  return (
    <>
      {/* Header */}
      <div className="sand-header">     
        <div className="sand-header-text">
          <h2>
            <BookOpen size={28} style={{ color: '#5B9AA9' }} />
            Sand Testing Record
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c', fontSize: '1.125rem' }}>
          DATE : {selectedDate ? (() => {
            const date = new Date(selectedDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day} / ${month} / ${year}`;
          })() : 'Loading...'}
        </div>
      </div>

      {/* Table 1 */}
      <div className="sand-section-header">
        <h3>Table 1</h3>
      </div>

      {/* Table 1a - with Shift headers and input fields */}
      <div style={{ marginBottom: '1rem' }}>
        <Table
          template
          showHeader={true}
          rows={5}
          columns={[
            { key: 'col1', label: 'Shift', bold: true, align: 'center' },
            { key: 'col2', label: 'I', align: 'center' },
            { key: 'col3', label: 'II', align: 'center' },
            { key: 'col4', label: 'III', align: 'center' }
          ]}
          renderCell={(rowIndex, colIndex) => {
            // First column: row labels
            if (colIndex === 0) {
              const labels = [
                'R. Sand ( Kgs. / Mix )',
                'N. Sand ( Kgs. / Mould )',
                'Mixing Mode',
                'Bentonite ( Kgs. / Mix )',
                'Coal Dust / Premix ( Kgs. / Mix )'
              ];
              return <strong style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#1e293b' }}>{labels[rowIndex]}</strong>;
            }

            // Other columns: input fields
            const key = `${rowIndex}_${colIndex}`;
            const values = table1aInputs[key] || [{ value: '', locked: false }];

            return (
              <div style={{ padding: '8px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: values.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  gap: '8px'
                }}>
                  {values.map((item, inputIndex) => (
                    <div key={inputIndex} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item.value}
                        placeholder={item.locked ? "Locked" : "Enter value"}
                        disabled={item.locked}
                        onChange={(e) => {
                          const newValues = [...values];
                          newValues[inputIndex].value = e.target.value;
                          setTable1aInputs({
                            ...table1aInputs,
                            [key]: newValues
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          backgroundColor: item.locked ? '#f1f5f9' : 'white',
                          cursor: item.locked ? 'not-allowed' : 'text'
                        }}
                      />
                      {!item.locked && inputIndex === values.length - 1 && values.length > 1 && (
                        <MinusButton 
                          onClick={() => removeTable1aInput(rowIndex, colIndex, inputIndex)} 
                          title="Remove entry" 
                        />
                      )}
                      {!item.locked && inputIndex === values.length - 1 && values.length < 4 && (
                        <PlusButton 
                          onClick={() => addTable1aInput(rowIndex, colIndex)} 
                          title="Add entry" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
          minWidth="800px"
        />
      </div>

      {/* Table 1b - BATCH No. with Bentonite and radio buttons */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '600px' }}>
            <tbody>
              <tr style={{ height: '50px' }}>
                <td rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>BATCH No.</td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Bentonite</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'nowrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: table1bInputs.valueLocked ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: table1bInputs.valueLocked ? 0.6 : 1, fontSize: '1rem', fontWeight: '500' }}>
                      <input 
                        type="radio" 
                        name="table1b_type" 
                        value="coalDust" 
                        checked={table1bInputs.batchType === 'coalDust'}
                        onChange={(e) => setTable1bInputs({...table1bInputs, batchType: e.target.value})}
                        disabled={table1bInputs.valueLocked}
                        style={{ cursor: table1bInputs.valueLocked ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }} 
                      />
                      <span style={{ fontSize: '1rem' }}>Coal Dust</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: table1bInputs.valueLocked ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: table1bInputs.valueLocked ? 0.6 : 1, fontSize: '1rem', fontWeight: '500' }}>
                      <input 
                        type="radio" 
                        name="table1b_type" 
                        value="premix" 
                        checked={table1bInputs.batchType === 'premix'}
                        onChange={(e) => setTable1bInputs({...table1bInputs, batchType: e.target.value})}
                        disabled={table1bInputs.valueLocked}
                        style={{ cursor: table1bInputs.valueLocked ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }} 
                      />
                      <span style={{ fontSize: '1rem' }}>Premix</span>
                    </label>
                  </div>
                </td>
              </tr>
              <tr style={{ height: '50px' }}>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <input 
                    type="text" 
                    value={table1bInputs.bentonite}
                    onChange={(e) => setTable1bInputs({...table1bInputs, bentonite: e.target.value})}
                    placeholder={table1bInputs.bentoniteLocked ? "Locked" : "Enter bentonite value"}
                    disabled={table1bInputs.bentoniteLocked}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '4px', 
                      fontSize: '1rem', 
                      textAlign: 'center',
                      backgroundColor: table1bInputs.bentoniteLocked ? '#f1f5f9' : 'white',
                      cursor: table1bInputs.bentoniteLocked ? 'not-allowed' : 'text'
                    }} 
                  />
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <input 
                    type="text" 
                    value={table1bInputs.value}
                    onChange={(e) => setTable1bInputs({...table1bInputs, value: e.target.value})}
                    placeholder={table1bInputs.valueLocked ? "Locked" : (table1bInputs.batchType === 'coalDust' ? 'Enter coal dust value' : 'Enter premix value')}
                    disabled={table1bInputs.valueLocked || !table1bInputs.batchType}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '4px', 
                      fontSize: '1rem', 
                      textAlign: 'center',
                      backgroundColor: (table1bInputs.valueLocked || !table1bInputs.batchType) ? '#f1f5f9' : 'white',
                      cursor: (table1bInputs.valueLocked || !table1bInputs.batchType) ? 'not-allowed' : 'text'
                    }} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Table 1 Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <ResetButton onClick={handleTable1Reset} />
          <SubmitButton onClick={handleTable1Submit} />
        </div>
      </div>

      {/* Table 2 */}
      <div className="sand-section-header">
        <h3>Table 2</h3>
      </div>

      {/* Table 2 - 8x4 with header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '800px' }}>
            <tbody>
              {/* Header Row */}
              <tr style={{ height: '40px' }}>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SHIFT</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>I</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>II</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>III</td>
              </tr>
              {/* Data Rows */}
              {[
                'Total Clay (11.0-14.5%)',
                'Active Clay (8.5-11.0%)',
                'Dead Clay (2.0-4.0%)',
                'V.C.M. (2.0-3.2%)',
                'L.O.I. (4.5-6.0%)',
                'AFS No. (Min. 48)',
                'Fines (10% Max)'
              ].map((label, rowIndex) => (
                <tr key={rowIndex} style={{ height: '50px' }}>
                  <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>{label}</td>
                  {[0, 1, 2].map((colIndex) => {
                    const key = `${rowIndex}_${colIndex}`;
                    const cellData = table2Inputs[key] || { value: '', locked: false };
                    
                    return (
                      <td key={colIndex} style={{ textAlign: 'center', padding: '10px' }}>
                        <input 
                          type="text" 
                          value={cellData.value}
                          placeholder={cellData.locked ? "Locked" : "Enter value"}
                          disabled={cellData.locked}
                          onChange={(e) => {
                            setTable2Inputs({
                              ...table2Inputs,
                              [key]: { value: e.target.value, locked: cellData.locked }
                            });
                          }}
                          style={{ 
                            width: '100%', 
                            border: '1px solid #cbd5e1', 
                            padding: '10px',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            outline: 'none',
                            textAlign: 'center',
                            backgroundColor: cellData.locked ? '#f1f5f9' : 'white',
                            cursor: cellData.locked ? 'not-allowed' : 'text'
                          }} 
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table 2 Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <ResetButton onClick={handleTable2Reset} />
          <SubmitButton onClick={handleTable2Submit} />
        </div>
      </div>

      {/* Table 3 */}
      <div className="sand-section-header">
        <h3>Table 3</h3>
      </div>

      {/* Table 3 - 4x4 empty table with custom column widths */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '800px', width: '100%' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '300px' }} />
              <col />
              <col />
            </colgroup>
            <tbody>
              {/* Header Row */}
              <tr style={{ height: '40px' }}>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>Shift</td>
                <td colSpan={3} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', borderBottom: '1px solid #ddd' }}>
                  Mix No.
                </td>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>No. Of Rejected</td>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>Return Sand Hopper level</td>
              </tr>
              <tr style={{ height: '40px' }}>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Start</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>End</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Total</td>
              </tr>
              {/* Data Rows */}
              {['I', 'II', 'III'].map((shift, rowIndex) => {
                const columns = [0, 1, 2, 3, 4]; // Start, End, Total, No. Of Rejected, Return Sand Hopper level
                return (
                  <tr key={rowIndex} style={{ height: '50px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>{shift}</td>
                    {columns.map((colIndex) => {
                      const key = `${rowIndex}_${colIndex}`;
                      const values = table3Inputs[key] || [{ value: '', locked: false }];
                      
                      return (
                        <td key={colIndex} style={{ textAlign: 'center', padding: '10px' }}>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: values.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                            gap: '8px'
                          }}>
                            {values.map((item, inputIndex) => (
                              <div key={inputIndex} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="text"
                                  value={item.value}
                                  placeholder={item.locked ? "Locked" : "Enter value"}
                                  disabled={item.locked}
                                  onChange={(e) => {
                                    const newValues = [...values];
                                    newValues[inputIndex].value = e.target.value;
                                    setTable3Inputs({
                                      ...table3Inputs,
                                      [key]: newValues
                                    });
                                  }}
                                  style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    textAlign: 'center',
                                    backgroundColor: item.locked ? '#f1f5f9' : 'white',
                                    cursor: item.locked ? 'not-allowed' : 'text'
                                  }}
                                />
                                {!item.locked && inputIndex === values.length - 1 && values.length > 1 && (
                                  <MinusButton 
                                    onClick={() => removeTable3Input(rowIndex, colIndex, inputIndex)} 
                                    title="Remove entry" 
                                  />
                                )}
                                {!item.locked && inputIndex === values.length - 1 && values.length < 4 && (
                                  <PlusButton 
                                    onClick={() => addTable3Input(rowIndex, colIndex)} 
                                    title="Add entry" 
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Table 3 Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <ResetButton onClick={handleTable3Reset} />
          <SubmitButton onClick={handleTable3Submit} />
        </div>
      </div>

      {/* Table 4 */}
      <div className="sand-section-header">
        <h3>Table 4</h3>
      </div>

      {/* Table 4a and 4b - Side by Side */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Table 4a - 2x2 */}
          <div>
            <div className="reusable-table-container">
              <table className="reusable-table table-template table-bordered">
                <tbody>
                  <tr style={{ height: '60px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SAND LUMPS</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="text"
                        value={table4Inputs.sandLump.value}
                        placeholder={table4Inputs.sandLump.locked ? "Locked" : "Enter value"}
                        disabled={table4Inputs.sandLump.locked}
                        onChange={(e) => setTable4Inputs({...table4Inputs, sandLump: { value: e.target.value, locked: table4Inputs.sandLump.locked }})}
                        style={{ 
                          width: '100%', 
                          border: '1px solid #cbd5e1', 
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          textAlign: 'center',
                          backgroundColor: table4Inputs.sandLump.locked ? '#f1f5f9' : 'white',
                          cursor: table4Inputs.sandLump.locked ? 'not-allowed' : 'text'
                        }} 
                      />
                    </td>
                  </tr>
                  <tr style={{ height: '60px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>NEW SAND WT</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="text"
                        value={table4Inputs.newSandWt.value}
                        placeholder={table4Inputs.newSandWt.locked ? "Locked" : "Enter value"}
                        disabled={table4Inputs.newSandWt.locked}
                        onChange={(e) => setTable4Inputs({...table4Inputs, newSandWt: { value: e.target.value, locked: table4Inputs.newSandWt.locked }})}
                        style={{ 
                          width: '100%', 
                          border: '1px solid #cbd5e1', 
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          textAlign: 'center',
                          backgroundColor: table4Inputs.newSandWt.locked ? '#f1f5f9' : 'white',
                          cursor: table4Inputs.newSandWt.locked ? 'not-allowed' : 'text'
                        }} 
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4b - 4x2 */}
          <div>
            <div className="reusable-table-container">
              <table className="reusable-table table-template table-bordered">
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SHIFT</td>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Prepared Sand Friability ( 8.0 % - 13.0 % )</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>I</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="text"
                        value={table4Inputs.friabilityShiftI.value}
                        placeholder={table4Inputs.friabilityShiftI.locked ? "Locked" : "Enter value"}
                        disabled={table4Inputs.friabilityShiftI.locked}
                        onChange={(e) => setTable4Inputs({...table4Inputs, friabilityShiftI: { value: e.target.value, locked: table4Inputs.friabilityShiftI.locked }})}
                        style={{ 
                          width: '100%', 
                          border: '1px solid #cbd5e1', 
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          textAlign: 'center',
                          backgroundColor: table4Inputs.friabilityShiftI.locked ? '#f1f5f9' : 'white',
                          cursor: table4Inputs.friabilityShiftI.locked ? 'not-allowed' : 'text'
                        }} 
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>II</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="text"
                        value={table4Inputs.friabilityShiftII.value}
                        placeholder={table4Inputs.friabilityShiftII.locked ? "Locked" : "Enter value"}
                        disabled={table4Inputs.friabilityShiftII.locked}
                        onChange={(e) => setTable4Inputs({...table4Inputs, friabilityShiftII: { value: e.target.value, locked: table4Inputs.friabilityShiftII.locked }})}
                        style={{ 
                          width: '100%', 
                          border: '1px solid #cbd5e1', 
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          textAlign: 'center',
                          backgroundColor: table4Inputs.friabilityShiftII.locked ? '#f1f5f9' : 'white',
                          cursor: table4Inputs.friabilityShiftII.locked ? 'not-allowed' : 'text'
                        }} 
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>III</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <input 
                        type="text"
                        value={table4Inputs.friabilityShiftIII.value}
                        placeholder={table4Inputs.friabilityShiftIII.locked ? "Locked" : "Enter value"}
                        disabled={table4Inputs.friabilityShiftIII.locked}
                        onChange={(e) => setTable4Inputs({...table4Inputs, friabilityShiftIII: { value: e.target.value, locked: table4Inputs.friabilityShiftIII.locked }})}
                        style={{ 
                          width: '100%', 
                          border: '1px solid #cbd5e1', 
                          padding: '10px',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          outline: 'none',
                          textAlign: 'center',
                          backgroundColor: table4Inputs.friabilityShiftIII.locked ? '#f1f5f9' : 'white',
                          cursor: table4Inputs.friabilityShiftIII.locked ? 'not-allowed' : 'text'
                        }} 
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Table 4 Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <ResetButton onClick={handleTable4Reset} />
          <SubmitButton onClick={handleTable4Submit} />
        </div>
      </div>

      {/* Table 5: Sand Properties & Test Parameters */}
      <div className="sand-section-header">
        <h3>Sand Properties & Test Parameters</h3>
      </div>

      {/* Table 5 Form */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
        {/* S.No Display */}
        <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
          S.No: {currentSNo}
        </div>
        {/* Table 5 Form Grid */}
        <div className="sand-table5-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', rowGap: '2rem' }}>
          <div className="sand-form-field">
            <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Time (HH:MM)</label>
            <TimeInput
              hourRef={timeHourRef}
              minuteRef={timeMinuteRef}
              hourName="timeHour"
              minuteName="timeMinute"
              hourValue={table5FormData.timeHour}
              minuteValue={table5FormData.timeMinute}
              onChange={handleTimeChange}
              onHourKeyDown={(e) => handleKeyDown(e, timeMinuteRef)}
              onMinuteKeyDown={(e) => handleKeyDown(e, mixNoRef)}
              validationState={timeValid}
            />
          </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Mix No</label>
              <input 
                ref={mixNoRef}
                type="number" 
                placeholder="Enter Mix No" 
                value={table5FormData.mixNo}
                onChange={(e) => updateFormField('mixNo', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, permeabilityRef)}
                className={mixNoValid === null ? "" : mixNoValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Permeability (90 - 160)</label>
              <input 
                ref={permeabilityRef}
                type="number" 
                placeholder="Enter value" 
                value={table5FormData.permeability}
                onChange={(e) => updateFormField('permeability', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, gcsValueRef)}
                className={permeabilityValid === null ? "" : permeabilityValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>
                G.C.S Gm / cm<sup>2</sup>
                {currentSNo > 0 && <Lock size={16} style={{ marginLeft: '0.5rem', color: '#64748b' }} />}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div 
                  className={gcsCheckpointValid === null ? "" : gcsCheckpointValid ? "valid-input" : "invalid-input"}
                  style={{ 
                    display: 'flex', 
                    gap: '1rem',
                    padding: '0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-A') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-A') ? 0.5 : 1 }}>
                    <input
                      type="radio"
                      name={`gcsCheckpoint`}
                      value="FDY-A"
                      checked={table5FormData.gcsCheckpoint === 'FDY-A'}
                      onChange={(e) => updateFormField('gcsCheckpoint', e.target.value)}
                      disabled={currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-A'}
                      style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-A') ? 'not-allowed' : 'pointer' }}
                    />
                    FDY - A (Min 1800)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-B') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-B') ? 0.5 : 1 }}>
                    <input
                      type="radio"
                      name={`gcsCheckpoint`}
                      value="FDY-B"
                      checked={table5FormData.gcsCheckpoint === 'FDY-B'}
                      onChange={(e) => updateFormField('gcsCheckpoint', e.target.value)}
                      disabled={currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-B'}
                      style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.gcsCheckpoint !== 'FDY-B') ? 'not-allowed' : 'pointer' }}
                    />
                    FDY - B (Min 1900)
                  </label>
                </div>
                <input
                  ref={gcsValueRef}
                  type="number"
                  placeholder="Enter value"
                  value={table5FormData.gcsValue}
                  onChange={(e) => updateFormField('gcsValue', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, wtsRef)}
                  disabled={!table5FormData.gcsCheckpoint}
                  className={gcsValid === null ? "" : gcsValid ? "valid-input" : "invalid-input"}
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    backgroundColor: !table5FormData.gcsCheckpoint ? '#f1f5f9' : 'white',
                    cursor: !table5FormData.gcsCheckpoint ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>WTS N/cm<sup>2</sup> (Min 0.15)</label>
              <input 
                ref={wtsRef}
                type="number" 
                placeholder="Enter value" 
                value={table5FormData.wts}
                onChange={(e) => updateFormField('wts', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, moistureRef)}
                className={wtsValid === null ? "" : wtsValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Moisture ( 3.0 - 4.0 % )</label>
              <input 
                ref={moistureRef}
                type="number" 
                placeholder="Enter value" 
                value={table5FormData.moisture}
                onChange={(e) => updateFormField('moisture', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, compactabilityRef)}
                className={moistureValid === null ? "" : moistureValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div className="sand-form-field">
              <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Compactability At Dmm ( 33 - 40 %)</label>
              <input 
                ref={compactabilityRef}
                type="number" 
                placeholder="Enter value" 
                value={table5FormData.compactability}
                onChange={(e) => updateFormField('compactability', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, compressabilityRef)}
                className={compactabilityValid === null ? "" : compactabilityValid ? "valid-input" : "invalid-input"}
              />
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Compressability At Dmm ( 20 - 28 % )</label>
          <input 
            ref={compressabilityRef}
            type="number" 
            placeholder="Enter value"
            value={table5FormData.compressability}
            onChange={(e) => updateFormField('compressability', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, waterLitreRef)}
            className={compressabilityValid === null ? "" : compressabilityValid ? "valid-input" : "invalid-input"}
          />
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Water Litre/Kg Mix</label>
          <input 
            ref={waterLitreRef}
            type="number" 
            placeholder="Enter value"
            value={table5FormData.waterLitreKgMix}
            onChange={(e) => updateFormField('waterLitreKgMix', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, sandTempBCRef)}
            className={waterLitreValid === null ? "" : waterLitreValid ? "valid-input" : "invalid-input"}
          />
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Sand Temp °C <span style={{ fontSize: '0.875rem', color: '#64748b' }}></span></label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>BC</label>
              <input
                ref={sandTempBCRef}
                type="number"
                placeholder="Enter value"
                value={table5FormData.sandTempBC}
                onChange={(e) => updateFormField('sandTempBC', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sandTempWURef)}
                max="45"
                className={sandTempBCValid === null ? "" : sandTempBCValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>WU</label>
              <input
                ref={sandTempWURef}
                type="number"
                placeholder="Enter value"
                value={table5FormData.sandTempWU}
                onChange={(e) => updateFormField('sandTempWU', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, sandTempSSURef)}
                max="45"
                className={sandTempWUValid === null ? "" : sandTempWUValid ? "valid-input" : "invalid-input"}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>SSU MAX 45°</label>
              <input
                ref={sandTempSSURef}
                type="number"
                placeholder="Enter value"
                value={table5FormData.sandTempSSU}
                onChange={(e) => updateFormField('sandTempSSU', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, newSandRef)}
                max="45"
                className={sandTempSSUValid === null ? "" : sandTempSSUValid ? "valid-input" : "invalid-input"}
              />
            </div>
          </div>
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>New Sand Kgs / Mould ( 0.0 - 5.0 )</label>
          <input 
            ref={newSandRef}
            type="number" 
            placeholder="Enter value"
            value={table5FormData.newSandKgsMould}
            onChange={(e) => updateFormField('newSandKgsMould', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, bentoniteKgsRef)}
            className={newSandValid === null ? "" : newSandValid ? "valid-input" : "invalid-input"}
          />
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>
            Bentonite Kgs / Mix
            {currentSNo > 0 && <Lock size={16} style={{ marginLeft: '0.5rem', color: '#64748b' }} />}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div 
              className={bentoniteCheckpointValid === null ? "" : bentoniteCheckpointValid ? "valid-input" : "invalid-input"}
              style={{ 
                display: 'flex', 
                gap: '1rem',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.60-1.20') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.60-1.20') ? 0.5 : 1 }}>
                <input
                  type="radio"
                  name={`bentoniteCheckpoint`}
                  value="0.60-1.20"
                  checked={table5FormData.bentoniteCheckpoint === '0.60-1.20'}
                  onChange={(e) => updateFormField('bentoniteCheckpoint', e.target.value)}
                  disabled={currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.60-1.20'}
                  style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.60-1.20') ? 'not-allowed' : 'pointer' }}
                />
                0.60 - 1.20 %
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.80-2.20') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.80-2.20') ? 0.5 : 1 }}>
                <input
                  type="radio"
                  name={`bentoniteCheckpoint`}
                  value="0.80-2.20"
                  checked={table5FormData.bentoniteCheckpoint === '0.80-2.20'}
                  onChange={(e) => updateFormField('bentoniteCheckpoint', e.target.value)}
                  disabled={currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.80-2.20'}
                  style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.bentoniteCheckpoint !== '0.80-2.20') ? 'not-allowed' : 'pointer' }}
                />
                0.80 - 2.20 %
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>Kgs</label>
                <input
                  ref={bentoniteKgsRef}
                  type="number"
                  placeholder="Enter Kgs"
                  value={table5FormData.bentoniteKgs}
                  onChange={(e) => updateFormField('bentoniteKgs', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, bentonitePercentRef)}
                  disabled={!table5FormData.bentoniteCheckpoint}
                  className={bentoniteKgsValid === null ? "" : bentoniteKgsValid ? "valid-input" : "invalid-input"}
                  style={{
                    backgroundColor: !table5FormData.bentoniteCheckpoint ? '#f1f5f9' : 'white',
                    cursor: !table5FormData.bentoniteCheckpoint ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>%</label>
                <input
                  ref={bentonitePercentRef}
                  type="number"
                  placeholder="Enter %"
                  value={table5FormData.bentonitePercent}
                  onChange={(e) => updateFormField('bentonitePercent', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, premixCoalKgsRef)}
                  disabled={!table5FormData.bentoniteCheckpoint}
                  className={bentonitePercentValid === null ? "" : bentonitePercentValid ? "valid-input" : "invalid-input"}
                  style={{
                    backgroundColor: !table5FormData.bentoniteCheckpoint ? '#f1f5f9' : 'white',
                    cursor: !table5FormData.bentoniteCheckpoint ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>
            Premix / Coal Dust Kgs / Mix
            {currentSNo > 0 && <Lock size={16} style={{ marginLeft: '0.5rem', color: '#64748b' }} />}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div 
              className={premixCoalCheckpointValid === null ? "" : premixCoalCheckpointValid ? "valid-input" : "invalid-input"}
              style={{ 
                display: 'flex', 
                gap: '1rem',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'Premix') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'Premix') ? 0.5 : 1 }}>
                <input
                  type="radio"
                  name={`premixCoalCheckpoint`}
                  value="Premix"
                  checked={table5FormData.premixCoalCheckpoint === 'Premix'}
                  onChange={(e) => updateFormField('premixCoalCheckpoint', e.target.value)}
                  disabled={currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'Premix'}
                  style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'Premix') ? 'not-allowed' : 'pointer' }}
                />
                Premix 0.60 - 1.20 %
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500', fontSize: '1rem', cursor: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'CoalDust') ? 'not-allowed' : 'pointer', opacity: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'CoalDust') ? 0.5 : 1 }}>
                <input
                  type="radio"
                  name={`premixCoalCheckpoint`}
                  value="CoalDust"
                  checked={table5FormData.premixCoalCheckpoint === 'CoalDust'}
                  onChange={(e) => updateFormField('premixCoalCheckpoint', e.target.value)}
                  disabled={currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'CoalDust'}
                  style={{ width: '18px', height: '18px', cursor: (currentSNo > 0 && table5FormData.premixCoalCheckpoint !== 'CoalDust') ? 'not-allowed' : 'pointer' }}
                />
                Coal Dust 0.28 - 0.70 %
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>Kgs</label>
                <input
                  ref={premixCoalKgsRef}
                  type="number"
                  placeholder="Enter Kgs"
                  value={table5FormData.premixCoalKgs}
                  onChange={(e) => updateFormField('premixCoalKgs', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, premixCoalPercentRef)}
                  disabled={!table5FormData.premixCoalCheckpoint}
                  className={premixCoalKgsValid === null ? "" : premixCoalKgsValid ? "valid-input" : "invalid-input"}
                  style={{
                    backgroundColor: !table5FormData.premixCoalCheckpoint ? '#f1f5f9' : 'white',
                    cursor: !table5FormData.premixCoalCheckpoint ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>%</label>
                <input
                  ref={premixCoalPercentRef}
                  type="number"
                  placeholder="Enter %"
                  value={table5FormData.premixCoalPercent}
                  onChange={(e) => updateFormField('premixCoalPercent', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, compactabilitySettingRef)}
                  disabled={!table5FormData.premixCoalCheckpoint}
                  className={premixCoalPercentValid === null ? "" : premixCoalPercentValid ? "valid-input" : "invalid-input"}
                  style={{
                    backgroundColor: !table5FormData.premixCoalCheckpoint ? '#f1f5f9' : 'white',
                    cursor: !table5FormData.premixCoalCheckpoint ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>
            Compactability Setting
            {currentSNo > 0 && <Lock size={16} style={{ marginLeft: '0.5rem', color: '#64748b' }} />}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <select
              ref={compactabilitySettingRef}
              value={table5FormData.compactabilitySetting}
              onChange={(e) => updateFormField('compactabilitySetting', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, compactabilityValueRef)}
              disabled={currentSNo > 0}
              className={compactabilitySettingValid === null ? "" : compactabilitySettingValid ? "valid-input" : "invalid-input"}
              style={{
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: currentSNo > 0 ? '#f1f5f9' : 'white',
                cursor: currentSNo > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Select Setting</option>
              <option value="LC">LC</option>
              <option value="SMC42">Compact ability Setting SMC 42 ± 3</option>
              <option value="At140">At1 40 ± 3</option>
            </select>
            <input
              ref={compactabilityValueRef}
              type="number"
              placeholder="Enter value"
              value={table5FormData.compactabilityValue}
              onChange={(e) => updateFormField('compactabilityValue', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, mouldStrengthSettingRef)}
              disabled={!table5FormData.compactabilitySetting}
              className={compactabilityValueValid === null ? "" : compactabilityValueValid ? "valid-input" : "invalid-input"}
              style={{
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: !table5FormData.compactabilitySetting ? '#f1f5f9' : 'white',
                cursor: !table5FormData.compactabilitySetting ? 'not-allowed' : 'text'
              }}
            />
          </div>
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>
            Mould Strength Setting
            {currentSNo > 0 && <Lock size={16} style={{ marginLeft: '0.5rem', color: '#64748b' }} />}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <select
              ref={mouldStrengthSettingRef}
              value={table5FormData.mouldStrengthSetting}
              onChange={(e) => updateFormField('mouldStrengthSetting', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, mouldStrengthValueRef)}
              disabled={currentSNo > 0}
              className={mouldStrengthSettingValid === null ? "" : mouldStrengthSettingValid ? "valid-input" : "invalid-input"}
              style={{
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: currentSNo > 0 ? '#f1f5f9' : 'white',
                cursor: currentSNo > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Select Setting</option>
              <option value="SMC23">SMC - 23 ± 3</option>
              <option value="At15">Shear Strength Setting At1 5.0 ± 1 %</option>
            </select>
            <input
              ref={mouldStrengthValueRef}
              type="number"
              placeholder="Enter value"
              value={table5FormData.mouldStrengthValue}
              onChange={(e) => updateFormField('mouldStrengthValue', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, preparedSandLumpsRef)}
              disabled={!table5FormData.mouldStrengthSetting}
              className={mouldStrengthValueValid === null ? "" : mouldStrengthValueValid ? "valid-input" : "invalid-input"}
              style={{
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: !table5FormData.mouldStrengthSetting ? '#f1f5f9' : 'white',
                cursor: !table5FormData.mouldStrengthSetting ? 'not-allowed' : 'text'
              }}
            />
          </div>
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Prepared Sand Lumps/Kg</label>
          <input 
            ref={preparedSandLumpsRef}
            type="number" 
            placeholder="Enter value"
            value={table5FormData.preparedSandLumpsKg}
            onChange={(e) => updateFormField('preparedSandLumpsKg', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, itemNameRef)}
            className={preparedSandLumpsKgValid === null ? "" : preparedSandLumpsKgValid ? "valid-input" : "invalid-input"}
          />
        </div>
        <div className="sand-form-field">
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Item Name</label>
          <input 
            ref={itemNameRef}
            type="text" 
            placeholder="Enter item name"
            value={table5FormData.itemName}
            onChange={(e) => updateFormField('itemName', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, remarksRef)}
            className={itemNameValid === null ? "" : itemNameValid ? "valid-input" : "invalid-input"}
          />
        </div>
        <div className="sand-form-field" style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontWeight: '700', fontSize: '1.0625rem', color: '#1e293b' }}>Remarks</label>
          <textarea 
            ref={remarksRef}
            placeholder="Enter remarks" 
            rows="3" 
            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '1rem' }}
            value={table5FormData.remarks}
            onChange={(e) => updateFormField('remarks', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (submitButtonRef && submitButtonRef.current) {
                  submitButtonRef.current.focus();
                }
              }
            }}
          />
        </div>
      </div>

      {/* Submit and Reset Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <ResetButton onClick={handleTable5Reset} />
        <SubmitButton ref={submitButtonRef} onClick={handleTable5Submit} />
      </div>
    </div>
    </>
  );
};
export default SandTestingRecord;
