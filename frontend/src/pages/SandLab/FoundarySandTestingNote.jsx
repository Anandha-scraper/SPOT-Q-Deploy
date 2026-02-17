import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, FileText, Loader2, RotateCcw } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { DisaDropdown, ShiftDropdown, SubmitButton } from '../../Components/Buttons';
import Table from '../../Components/Table';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Sandlab/FoundarySandTestingNote.css';

const initialFormData = {
  date: "",
  shift: "",
  sandPlant: "",
  compactibilitySetting: "",
  shearStrengthSetting: "",
  clayTests: {
    test1: { 
      totalClay: { input1: "", input2: "", input3: "", solution: "" }, 
      activeClay: { input1: "", input2: "", solution: "" }, 
      deadClay: { input1: "", input2: "", solution: "" }, 
      vcm: { input1: "", input2: "", input3: "", solution: "" }, 
      loi: { input1: "", input2: "", input3: "", solution: "" } 
    },
    test2: { 
      totalClay: { input1: "", input2: "", input3: "", solution: "" }, 
      activeClay: { input1: "", input2: "", solution: "" }, 
      deadClay: { input1: "", input2: "", solution: "" }, 
      vcm: { input1: "", input2: "", input3: "", solution: "" }, 
      loi: { input1: "", input2: "", input3: "", solution: "" } 
    }
  },
  sieveTesting: {
    test1: {
      sieveSize: {
        1700: "", 850: "", 600: "", 425: "", 300: "", 212: "", 
        150: "", 106: "", 75: "", pan: "", total: ""
      },
      mf: {
        5: "", 10: "", 20: "", 30: "", 50: "", 70: "", 
        100: "", 140: "", 200: "", pan: "", total: ""
      }
    },
    test2: {
      sieveSize: {
        1700: "", 850: "", 600: "", 425: "", 300: "", 212: "", 
        150: "", 106: "", 75: "", pan: "", total: ""
      },
      mf: {
        5: "", 10: "", 20: "", 30: "", 50: "", 70: "", 
        100: "", 140: "", 200: "", pan: "", total: ""
      }
    }
  },
  parameters: {
    test1: {
      compactability: "",
      permeability: "",
      gcs: "",
      wts: "",
      moisture: "",
      bentonite: "",
      coalDust: "",
      hopperLevel: "",
      shearStrength: "",
      dustCollectorSettings: "",
      returnSandMoisture: ""
    },
    test2: {
      compactability: "",
      permeability: "",
      gcs: "",
      wts: "",
      moisture: "",
      bentonite: "",
      coalDust: "",
      hopperLevel: "",
      shearStrength: "",
      dustCollectorSettings: "",
      returnSandMoisture: ""
    }
  },
  additionalData: {
    test1: { afsNo: "", fines: "", gd: "" },
    test2: { afsNo: "", fines: "", gd: "" }
  },
  remarks: ""
};

export default function FoundrySandTestingNote() {
  const navigate = useNavigate();
  
  // Primary data (must be saved first)
  const [primaryData, setPrimaryData] = useState({
    date: "",
    shift: "",
    sandPlant: "",
    compactibilitySetting: "",
    shearStrengthSetting: ""
  });
  const [checkingData, setCheckingData] = useState(false);
  const [primaryId, setPrimaryId] = useState(null);
  const [isPrimaryDataSaved, setIsPrimaryDataSaved] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    compactibilitySetting: false,
    shearStrengthSetting: false
  });

  // Fetch primary data when date, shift, or sandPlant changes
  useEffect(() => {
    if (primaryData.date && primaryData.shift && primaryData.sandPlant) {
      fetchPrimaryData(primaryData.date, primaryData.shift, primaryData.sandPlant);
    }
  }, [primaryData.date, primaryData.shift, primaryData.sandPlant]);

  // Fetch primary data from backend
  const fetchPrimaryData = async (date, shift, sandPlant) => {
    try {
      setCheckingData(true);
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const res = await fetch(buildApiUrl(`/api/v1/foundry-sand-testing-notes?startDate=${encodeURIComponent(dateStr)}&endDate=${encodeURIComponent(dateStr)}`), { credentials: 'include' });
      const response = await res.json();

      let record = null;
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Find the record matching the shift and sandPlant
        record = response.data.find(entry => entry.shift === shift && entry.sandPlant === sandPlant) || null;
      }

      if (record) {
        setPrimaryId(record._id || null);

        // Populate primary data
        setPrimaryData(prev => ({
          ...prev,
          sandPlant: record.sandPlant || '',
          compactibilitySetting: record.compactibilitySetting || '',
          shearStrengthSetting: record.shearStrengthSetting || ''
        }));

        // Lock fields that have values (sandPlant is a selection key, not locked)
        setLockedFields({
          compactibilitySetting: !!(record.compactibilitySetting && record.compactibilitySetting.trim()),
          shearStrengthSetting: !!(record.shearStrengthSetting && record.shearStrengthSetting.trim())
        });

        setIsPrimaryDataSaved(true);

        // Populate section data
        const locks = {
          clayTests: {},
          sieveTesting: {},
          parameters: {},
          additionalData: {},
          remarks: false
        };

        if (record.clayTests) {
          Object.keys(record.clayTests).forEach(test => {
            Object.keys(record.clayTests[test]).forEach(param => {
              Object.keys(record.clayTests[test][param] || {}).forEach(field => {
                const value = record.clayTests[test][param][field];
                if (value && String(value).trim() !== '') {
                  locks.clayTests[`${test}.${param}.${field}`] = true;
                }
              });
            });
          });
          setSectionData(prev => ({
            ...prev,
            clayTests: {
              test1: { ...prev.clayTests?.test1, ...record.clayTests.test1 },
              test2: { ...prev.clayTests?.test2, ...record.clayTests.test2 }
            }
          }));
        }

        if (record.sieveTesting) {
          if (record.sieveTesting.test1) {
            if (record.sieveTesting.test1.sieveSize) {
              Object.keys(record.sieveTesting.test1.sieveSize || {}).forEach(size => {
                const value = record.sieveTesting.test1.sieveSize[size];
                if (value && String(value).trim() !== '') locks.sieveTesting[`test1.sieveSize.${size}`] = true;
              });
            }
            if (record.sieveTesting.test1.mf) {
              Object.keys(record.sieveTesting.test1.mf || {}).forEach(mf => {
                const value = record.sieveTesting.test1.mf[mf];
                if (value && String(value).trim() !== '') locks.sieveTesting[`test1.mf.${mf}`] = true;
              });
            }
          }
          if (record.sieveTesting.test2) {
            if (record.sieveTesting.test2.sieveSize) {
              Object.keys(record.sieveTesting.test2.sieveSize || {}).forEach(size => {
                const value = record.sieveTesting.test2.sieveSize[size];
                if (value && String(value).trim() !== '') locks.sieveTesting[`test2.sieveSize.${size}`] = true;
              });
            }
            if (record.sieveTesting.test2.mf) {
              Object.keys(record.sieveTesting.test2.mf || {}).forEach(mf => {
                const value = record.sieveTesting.test2.mf[mf];
                if (value && String(value).trim() !== '') locks.sieveTesting[`test2.mf.${mf}`] = true;
              });
            }
          }
          setSectionData(prev => ({
            ...prev,
            sieveTesting: {
              test1: {
                ...prev.sieveTesting?.test1,
                sieveSize: { ...prev.sieveTesting?.test1?.sieveSize, ...record.sieveTesting.test1?.sieveSize },
                mf: { ...prev.sieveTesting?.test1?.mf, ...record.sieveTesting.test1?.mf }
              },
              test2: {
                ...prev.sieveTesting?.test2,
                sieveSize: { ...prev.sieveTesting?.test2?.sieveSize, ...record.sieveTesting.test2?.sieveSize },
                mf: { ...prev.sieveTesting?.test2?.mf, ...record.sieveTesting.test2?.mf }
              }
            }
          }));
        }

        if (record.parameters) {
          Object.keys(record.parameters.test1 || {}).forEach(param => {
            const value = record.parameters.test1[param];
            if (value && String(value).trim() !== '') locks.parameters[`test1.${param}`] = true;
          });
          Object.keys(record.parameters.test2 || {}).forEach(param => {
            const value = record.parameters.test2[param];
            if (value && String(value).trim() !== '') locks.parameters[`test2.${param}`] = true;
          });
          setSectionData(prev => ({
            ...prev,
            parameters: {
              ...prev.parameters,
              test1: { ...prev.parameters?.test1, ...record.parameters.test1 },
              test2: { ...prev.parameters?.test2, ...record.parameters.test2 }
            }
          }));
        }

        if (record.additionalData) {
          Object.keys(record.additionalData.test1 || {}).forEach(param => {
            const value = record.additionalData.test1[param];
            if (value && String(value).trim() !== '') locks.additionalData[`test1.${param}`] = true;
          });
          Object.keys(record.additionalData.test2 || {}).forEach(param => {
            const value = record.additionalData.test2[param];
            if (value && String(value).trim() !== '') locks.additionalData[`test2.${param}`] = true;
          });
          setSectionData(prev => ({
            ...prev,
            additionalData: {
              ...prev.additionalData,
              test1: { ...prev.additionalData?.test1, ...record.additionalData.test1 },
              test2: { ...prev.additionalData?.test2, ...record.additionalData.test2 }
            }
          }));
        }

        if (record.remarks !== undefined && record.remarks && String(record.remarks).trim() !== '') {
          locks.remarks = true;
          setSectionData(prev => ({ ...prev, remarks: String(record.remarks || '') }));
        }

        setFieldLocks(locks);
      } else {
        // No data found for this date+shift+sandPlant, reset
        setPrimaryId(null);
        setIsPrimaryDataSaved(false);
        setLockedFields({ compactibilitySetting: false, shearStrengthSetting: false });
        setPrimaryData(prev => ({
          ...prev,
          compactibilitySetting: '',
          shearStrengthSetting: ''
        }));
        setSectionData({
          clayTests: initialFormData.clayTests,
          sieveTesting: initialFormData.sieveTesting,
          parameters: initialFormData.parameters,
          additionalData: initialFormData.additionalData,
          remarks: ''
        });
        setFieldLocks({
          clayTests: {},
          sieveTesting: {},
          parameters: {},
          additionalData: {},
          remarks: false
        });
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
      setPrimaryId(null);
      setIsPrimaryDataSaved(false);
    } finally {
      setCheckingData(false);
    }
  };

  // Field locks for section data (not primary)
  const [fieldLocks, setFieldLocks] = useState({
    clayTests: {},
    sieveTesting: {},
    parameters: {},
    additionalData: {},
    remarks: false
  });

  // Helper function to check if a field is locked
  const isFieldLocked = (section, fieldPath) => {
    const locks = fieldLocks[section];
    if (!locks) return false;
    return locks[fieldPath] === true;
  };
  
  // Other sections data
  const [sectionData, setSectionData] = useState({
    clayTests: {
      test1: { 
        totalClay: { input1: "", input2: "", input3: "", solution: "" }, 
        activeClay: { input1: "", input2: "", solution: "" }, 
        deadClay: { input1: "", input2: "", solution: "" }, 
        vcm: { input1: "", input2: "", input3: "", solution: "" }, 
        loi: { input1: "", input2: "", input3: "", solution: "" } 
      },
      test2: { 
        totalClay: { input1: "", input2: "", input3: "", solution: "" }, 
        activeClay: { input1: "", input2: "", solution: "" }, 
        deadClay: { input1: "", input2: "", solution: "" }, 
        vcm: { input1: "", input2: "", input3: "", solution: "" }, 
        loi: { input1: "", input2: "", input3: "", solution: "" } 
      }
    },
    sieveTesting: {
    test1: {
      sieveSize: {
        1700: "", 850: "", 600: "", 425: "", 300: "", 212: "", 
        150: "", 106: "", 75: "", pan: "", total: ""
        },
        mf: {
          5: "", 10: "", 20: "", 30: "", 50: "", 70: "", 
          100: "", 140: "", 200: "", pan: "", total: ""
      }
    },
    test2: {
      sieveSize: {
        1700: "", 850: "", 600: "", 425: "", 300: "", 212: "", 
        150: "", 106: "", 75: "", pan: "", total: ""
    },
      mf: {
        5: "", 10: "", 20: "", 30: "", 50: "", 70: "", 
        100: "", 140: "", 200: "", pan: "", total: ""
        }
      }
    },
    parameters: {
      test1: {
        compactability: "",
        permeability: "",
        gcs: "",
        wts: "",
        moisture: "",
        bentonite: "",
        coalDust: "",
        hopperLevel: "",
        shearStrength: "",
        dustCollectorSettings: "",
        returnSandMoisture: ""
      },
      test2: {
        compactability: "",
        permeability: "",
        gcs: "",
        wts: "",
        moisture: "",
        bentonite: "",
        coalDust: "",
        hopperLevel: "",
        shearStrength: "",
        dustCollectorSettings: "",
        returnSandMoisture: ""
      }
    },
    additionalData: {
      test1: { afsNo: "", fines: "", gd: "" },
      test2: { afsNo: "", fines: "", gd: "" }
    },
    remarks: ""
  });
  
  const [loadingStates, setLoadingStates] = useState({
    primary: false,
    clayParameters: false,
    sieveTesting: false,
    testParameters: false,
    additionalData: false,
    remarks: false
  });

  // Refs for submit buttons
  const primarySubmitRef = useRef(null);
  const clayParametersSubmitRef = useRef(null);
  const sieveTestingSubmitRef = useRef(null);
  const testParametersSubmitRef = useRef(null);
  const additionalDataSubmitRef = useRef(null);
  const remarksSubmitRef = useRef(null);

  // Refs for first inputs of each section
  const primaryFirstInputRef = useRef(null);
  const clayParametersFirstInputRef = useRef(null);
  const sieveTestingFirstInputRef = useRef(null);
  const testParametersFirstInputRef = useRef(null);
  const additionalDataFirstInputRef = useRef(null);
  const remarksFirstInputRef = useRef(null);

  // Handle Enter key navigation for inputs
  const handleKeyDown = (e, submitButtonRef, firstInputRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Get all inputs in the current form/section
      const form = e.target.closest('.foundry-section');
      if (!form) return;
      
      const inputs = Array.from(form.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled])'));
      const currentInputIndex = inputs.indexOf(e.target);
      
      // If not the last input, move to next input
      if (currentInputIndex < inputs.length - 1) {
        inputs[currentInputIndex + 1].focus();
        return;
      }
      
      // If this is the last input, focus the submit button
      if (submitButtonRef && submitButtonRef.current) {
        submitButtonRef.current.focus();
      }
    }
  };

  // Handle Enter key on submit button
  const handleSubmitButtonKeyDown = (e, submitHandler) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitHandler();
    }
  };

  // Focus first input of a section
  const focusFirstInput = (firstInputRef) => {
    setTimeout(() => {
      if (firstInputRef && firstInputRef.current) {
        if (firstInputRef.current.focus) {
          firstInputRef.current.focus();
        } else if (firstInputRef.current.inputRef && firstInputRef.current.inputRef.current) {
          firstInputRef.current.inputRef.current.focus();
        }
      }
    }, 100);
  };

  // Handle primary data submission
  const handlePrimarySubmit = async () => {
    if (!primaryData.date || !primaryData.shift) {
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, primary: true }));
      
      const payload = {
        date: primaryData.date,
        shift: primaryData.shift,
        sandPlant: primaryData.sandPlant,
        section: 'primary'
      };
      
      if (primaryData.compactibilitySetting && primaryData.compactibilitySetting.trim() !== '') {
        payload.compactibilitySetting = primaryData.compactibilitySetting;
      }
      if (primaryData.shearStrengthSetting && primaryData.shearStrengthSetting.trim() !== '') {
        payload.shearStrengthSetting = primaryData.shearStrengthSetting;
      }

      const res = await fetch(API_ENDPOINTS.foundrySandTestingNotes, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const response = await res.json();
      
      if (response.success) {
        setPrimaryId(response.data?._id || null);
        // Lock fields that now have values (sandPlant is a selection key, not locked)
        setLockedFields({
          compactibilitySetting: !!(primaryData.compactibilitySetting && primaryData.compactibilitySetting.trim()),
          shearStrengthSetting: !!(primaryData.shearStrengthSetting && primaryData.shearStrengthSetting.trim())
        });
        setIsPrimaryDataSaved(true);
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
      alert('Failed to save: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingStates(prev => ({ ...prev, primary: false }));
    }
  };

  // Handle primary data changes
  const handlePrimaryChange = (field, value) => {
    setPrimaryData(prev => ({ ...prev, [field]: value }));
  };
  

  // Handle section data changes
  const handleInputChange = (section, field, value, subField = null, subSubField = null) => {
    if (subSubField) {
      // For nested structure like clayTests.test1.totalClay.input1
      setSectionData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: {
            ...prev[section][field],
            [subField]: {
              ...prev[section][field][subField],
              [subSubField]: value
            }
          }
        }
      }));
    } else if (subField) {
      setSectionData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: {
            ...prev[section][field],
            [subField]: value
          }
        }
      }));
    } else if (field) {
      setSectionData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setSectionData(prev => ({
        ...prev,
        [section]: value
      }));
    }
  };

  const calculateClaySolution = (param, testNum, changedField = null, changedValue = null) => {
    const testData = sectionData.clayTests[testNum]?.[param];
    if (!testData) return "";

    // Build a copy with the just-changed value so we don't rely on stale state
    const data = { ...testData };
    if (changedField) data[changedField] = changedValue;

    if (param === "activeClay") {
      // activeClay: input1 × input2 = Solution %
      const input1 = parseFloat(data.input1);
      const input2 = parseFloat(data.input2);
      if (isNaN(input1) || isNaN(input2)) return "";
      return (input1 * input2).toFixed(2);
    } else if (param === "deadClay") {
      // deadClay: input1 − input2 = Solution %
      const input1 = parseFloat(data.input1);
      const input2 = parseFloat(data.input2);
      if (isNaN(input1) || isNaN(input2)) return "";
      return (input1 - input2).toFixed(2);
    } else {
      // totalClay, vcm, loi: (input1 − input2) / input3 × 100 = Solution %
      const input1 = parseFloat(data.input1);
      const input2 = parseFloat(data.input2);
      const input3 = parseFloat(data.input3);
      if (isNaN(input1) || isNaN(input2) || isNaN(input3) || input3 === 0) return "";
      return (((input1 - input2) / input3) * 100).toFixed(2);
    }
  };


  // Helper function to filter out empty values from nested objects
  const filterEmptyValues = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => filterEmptyValues(item));
    }
    
    const filtered = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'string' && value.trim() !== '') {
          filtered[key] = value;
        } else if (typeof value === 'object') {
          const filteredNested = filterEmptyValues(value);
          if (Object.keys(filteredNested).length > 0) {
            filtered[key] = filteredNested;
          }
        } else if (value !== '' && value !== 0) {
          filtered[key] = value;
        }
      }
    });
    return filtered;
  };

  // Handle section-wise submissions - only send fields that have data
  const handleSectionSubmit = async (sectionName) => {
    if (!primaryData.date) {
      alert('Please enter a date first.');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [sectionName]: true }));
      
      let sectionPayload = {};
      
      // Filter and include only fields with data
      if (sectionName === 'clayParameters') {
        sectionPayload.clayTests = filterEmptyValues(sectionData.clayTests);
      } else if (sectionName === 'sieveTesting') {
        sectionPayload.sieveTesting = filterEmptyValues(sectionData.sieveTesting);
      } else if (sectionName === 'testParameters') {
        sectionPayload.parameters = filterEmptyValues(sectionData.parameters);
      } else if (sectionName === 'additionalData') {
        sectionPayload.additionalData = filterEmptyValues(sectionData.additionalData);
      } else if (sectionName === 'remarks') {
        if (sectionData.remarks && sectionData.remarks.trim() !== '') {
          sectionPayload.remarks = sectionData.remarks;
        }
      }
      
      const payload = {
        ...primaryData, // Include all primary data
        section: sectionName,
        ...sectionPayload
      };

      const res = await fetch(API_ENDPOINTS.foundrySandTestingNotes, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
      const response = await res.json();
      
      if (response.success) {
        alert(`${sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} saved successfully!`);
        // Refresh all locks from database
        if (primaryData.date && primaryData.shift && primaryData.sandPlant) {
          await fetchPrimaryData(primaryData.date, primaryData.shift, primaryData.sandPlant);
        }
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      console.error(`Error saving ${sectionName}:`, error);
      alert('Failed to save: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingStates(prev => ({ ...prev, [sectionName]: false }));
    }
  };

  // Reset primary data
  const resetPrimaryData = () => {
    if (!window.confirm('Are you sure you want to reset Primary data?')) return;
    setPrimaryData({
      date: "",
      shift: "",
      sandPlant: "",
      compactibilitySetting: "",
      shearStrengthSetting: ""
    });
    setLockedFields({
      compactibilitySetting: false,
      shearStrengthSetting: false
    });
    setIsPrimaryDataSaved(false);
    setPrimaryId(null);
    setFieldLocks({
      clayTests: {},
      sieveTesting: {},
      parameters: {},
      additionalData: {},
      remarks: false
    });
    setSectionData({
      clayTests: initialFormData.clayTests,
      sieveTesting: initialFormData.sieveTesting,
      parameters: initialFormData.parameters,
      additionalData: initialFormData.additionalData,
      remarks: ""
    });
  };

  // Handle section-wise resets
  const handleSectionReset = (sectionName) => {
    if (!window.confirm(`Are you sure you want to reset ${sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}?`)) return;
    
    if (sectionName === 'clayParameters') {
      setSectionData(prev => ({
        ...prev,
        clayTests: initialFormData.clayTests
      }));
    } else if (sectionName === 'sieveTesting') {
      setSectionData(prev => ({
        ...prev,
        sieveTesting: initialFormData.sieveTesting
      }));
    } else if (sectionName === 'testParameters') {
      setSectionData(prev => ({
        ...prev,
        parameters: initialFormData.parameters
      }));
    } else if (sectionName === 'additionalData') {
      setSectionData(prev => ({
        ...prev,
        additionalData: initialFormData.additionalData
      }));
    } else if (sectionName === 'remarks') {
      setSectionData(prev => ({
        ...prev,
        remarks: ""
      }));
    }
  };


  const handleViewReport = () => {
    navigate('/sand-lab/foundry-sand-testing-note/report');
  };

  const sieveData = [
    { size: 1700, mf: 5 },
    { size: 850, mf: 10 },
    { size: 600, mf: 20 },
    { size: 425, mf: 30 },
    { size: 300, mf: 40 },
    { size: 212, mf: 50 },
    { size: 150, mf: 70 },
    { size: 106, mf: 100 },
    { size: 75, mf: 140 },
    { size: 53, mf: 200 },
    { size: "Pan", mf: 300 },
  ];

  // === Column definitions for reusable Table component ===
  const clayColumns = [
    { key: 'parameter', label: 'Parameter', width: '180px', align: 'center' },
    { key: 'test1', label: 'TEST-1', align: 'center' },
    { key: 'test2', label: 'TEST-2', align: 'center' }
  ];

  const sieveColumns = [
    { key: 'sieveSize', label: 'Sieve Size (Mic)', width: '120px', align: 'center' },
    { key: 'wtTest1', label: '% Wt Retained - TEST-1', align: 'center' },
    { key: 'wtTest2', label: '% Wt Retained - TEST-2', align: 'center' },
    { key: 'mf', label: 'MF', width: '80px', align: 'center' },
    { key: 'prodTest1', label: 'Product - TEST-1', align: 'center' },
    { key: 'prodTest2', label: 'Product - TEST-2', align: 'center' }
  ];

  const testParamColumns = [
    { key: 'parameter', label: 'Parameter', width: '200px', align: 'center' },
    { key: 'test1', label: 'TEST-1', align: 'center' },
    { key: 'test2', label: 'TEST-2', align: 'center' }
  ];

  const additionalColumns = [
    { key: 'parameter', label: 'Parameter', width: '180px', align: 'center' },
    { key: 'test1', label: 'TEST-1', align: 'center' },
    { key: 'test2', label: 'TEST-2', align: 'center' }
  ];

  // === Clay Parameters config ===
  const clayParamKeys = ["totalClay", "activeClay", "deadClay", "vcm", "loi"];
  const clayParamLabels = ["Total Clay", "Active Clay", "Dead Clay", "VCM", "LOI"];

  const renderClayCell = (rowIndex, colIndex, colKey) => {
    const param = clayParamKeys[rowIndex];
    if (colKey === 'parameter') {
      return <strong style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{clayParamLabels[rowIndex]}</strong>;
    }
    const testNum = colKey;
    const isSimple = param === "activeClay" || param === "deadClay";
    if (isSimple) {
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            ref={param === "activeClay" && testNum === "test1" ? clayParametersFirstInputRef : null}
            type="number"
            step="0.01"
            placeholder="Input 1"
            value={sectionData.clayTests[testNum][param]?.input1 || ''}
            disabled={isFieldLocked('clayTests', `${testNum}.${param}.input1`)}
            onKeyDown={(e) => handleKeyDown(e, clayParametersSubmitRef, clayParametersFirstInputRef)}
            onChange={(e) => {
              const val = e.target.value;
              handleInputChange("clayTests", testNum, val, param, "input1");
              const solution = calculateClaySolution(param, testNum, "input1", val);
              handleInputChange("clayTests", testNum, solution, param, "solution");
            }}
            style={{ width: '80px', padding: '0.375rem' }}
          />
          <span>{param === "activeClay" ? "x" : "-"}</span>
          <input
            type="number"
            step="0.01"
            placeholder="Input 2"
            value={sectionData.clayTests[testNum][param]?.input2 || ''}
            disabled={isFieldLocked('clayTests', `${testNum}.${param}.input2`)}
            onKeyDown={(e) => handleKeyDown(e, clayParametersSubmitRef, clayParametersFirstInputRef)}
            onChange={(e) => {
              const val = e.target.value;
              handleInputChange("clayTests", testNum, val, param, "input2");
              const solution = calculateClaySolution(param, testNum, "input2", val);
              handleInputChange("clayTests", testNum, solution, param, "solution");
            }}
            style={{ width: '80px', padding: '0.375rem' }}
          />
          <span>=</span>
          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9375rem' }}>
            {sectionData.clayTests[testNum][param]?.solution || '0'}%
          </span>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="number"
          step="0.01"
          placeholder="Input 1"
          value={sectionData.clayTests[testNum][param]?.input1 || ''}
          disabled={isFieldLocked('clayTests', `${testNum}.${param}.input1`)}
          onKeyDown={(e) => handleKeyDown(e, clayParametersSubmitRef, clayParametersFirstInputRef)}
          onChange={(e) => {
            const val = e.target.value;
            handleInputChange("clayTests", testNum, val, param, "input1");
            const solution = calculateClaySolution(param, testNum, "input1", val);
            handleInputChange("clayTests", testNum, solution, param, "solution");
          }}
          style={{ width: '70px', padding: '0.375rem' }}
        />
        <span>-</span>
        <input
          type="number"
          step="0.01"
          placeholder="Input 2"
          value={sectionData.clayTests[testNum][param]?.input2 || ''}
          disabled={isFieldLocked('clayTests', `${testNum}.${param}.input2`)}
          onKeyDown={(e) => handleKeyDown(e, clayParametersSubmitRef, clayParametersFirstInputRef)}
          onChange={(e) => {
            const val = e.target.value;
            handleInputChange("clayTests", testNum, val, param, "input2");
            const solution = calculateClaySolution(param, testNum, "input2", val);
            handleInputChange("clayTests", testNum, solution, param, "solution");
          }}
          style={{ width: '70px', padding: '0.375rem' }}
        />
        <span>/</span>
        <input
          type="number"
          step="0.01"
          placeholder="Input 3"
          value={sectionData.clayTests[testNum][param]?.input3 || ''}
          disabled={isFieldLocked('clayTests', `${testNum}.${param}.input3`)}
          onKeyDown={(e) => handleKeyDown(e, clayParametersSubmitRef, clayParametersFirstInputRef)}
          onChange={(e) => {
            const val = e.target.value;
            handleInputChange("clayTests", testNum, val, param, "input3");
            const solution = calculateClaySolution(param, testNum, "input3", val);
            handleInputChange("clayTests", testNum, solution, param, "solution");
          }}
          style={{ width: '70px', padding: '0.375rem' }}
        />
        <span>x 100 =</span>
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9375rem' }}>
          {sectionData.clayTests[testNum][param]?.solution || '0'}%
        </span>
      </div>
    );
  };

  // === Sieve Testing config ===
  const renderSieveCell = (rowIndex, colIndex, colKey) => {
    const isTotal = rowIndex === sieveData.length;
    const row = isTotal ? null : sieveData[rowIndex];
    const sizeKey = isTotal ? 'total' : row.size;
    const mfKey = isTotal ? 'total' : row.mf;

    if (colKey === 'sieveSize') {
      return <strong style={{ fontWeight: isTotal ? 700 : 600, color: '#1e293b' }}>{isTotal ? 'Total' : row.size}</strong>;
    }
    if (colKey === 'mf') {
      return <strong style={{ fontWeight: isTotal ? 700 : 600, color: '#1e293b' }}>{isTotal ? 'Total' : row.mf}</strong>;
    }
    if (colKey === 'wtTest1') {
      return (
        <input
          type="text"
          placeholder={isTotal ? "Total" : "Enter %"}
          value={sectionData.sieveTesting?.test1?.sieveSize?.[sizeKey] || ''}
          onChange={(e) => handleInputChange("sieveTesting", "test1", e.target.value, "sieveSize", sizeKey)}
          onKeyDown={(e) => handleKeyDown(e, sieveTestingSubmitRef, sieveTestingFirstInputRef)}
          disabled={isFieldLocked('sieveTesting', `test1.sieveSize.${sizeKey}`)}
          readOnly={isFieldLocked('sieveTesting', `test1.sieveSize.${sizeKey}`)}
          ref={rowIndex === 0 ? sieveTestingFirstInputRef : null}
          style={{
            backgroundColor: isFieldLocked('sieveTesting', `test1.sieveSize.${sizeKey}`) ? '#f1f5f9' : '#ffffff',
            cursor: isFieldLocked('sieveTesting', `test1.sieveSize.${sizeKey}`) ? 'not-allowed' : 'text'
          }}
        />
      );
    }
    if (colKey === 'wtTest2') {
      return (
        <input
          type="text"
          placeholder={isTotal ? "Total" : "Enter %"}
          value={sectionData.sieveTesting?.test2?.sieveSize?.[sizeKey] || ''}
          onChange={(e) => handleInputChange("sieveTesting", "test2", e.target.value, "sieveSize", sizeKey)}
          onKeyDown={(e) => handleKeyDown(e, sieveTestingSubmitRef, sieveTestingFirstInputRef)}
          disabled={isFieldLocked('sieveTesting', `test2.sieveSize.${sizeKey}`)}
          readOnly={isFieldLocked('sieveTesting', `test2.sieveSize.${sizeKey}`)}
          style={{
            backgroundColor: isFieldLocked('sieveTesting', `test2.sieveSize.${sizeKey}`) ? '#f1f5f9' : '#ffffff',
            cursor: isFieldLocked('sieveTesting', `test2.sieveSize.${sizeKey}`) ? 'not-allowed' : 'text'
          }}
        />
      );
    }
    if (colKey === 'prodTest1') {
      return (
        <input
          type="text"
          placeholder={isTotal ? "Total" : "Product"}
          value={sectionData.sieveTesting?.test1?.mf?.[mfKey] || ''}
          onChange={(e) => handleInputChange("sieveTesting", "test1", e.target.value, "mf", mfKey)}
          onKeyDown={(e) => handleKeyDown(e, sieveTestingSubmitRef, sieveTestingFirstInputRef)}
          disabled={isFieldLocked('sieveTesting', `test1.mf.${mfKey}`)}
          readOnly={isFieldLocked('sieveTesting', `test1.mf.${mfKey}`)}
          style={{
            backgroundColor: isFieldLocked('sieveTesting', `test1.mf.${mfKey}`) ? '#f1f5f9' : '#ffffff',
            cursor: isFieldLocked('sieveTesting', `test1.mf.${mfKey}`) ? 'not-allowed' : 'text'
          }}
        />
      );
    }
    if (colKey === 'prodTest2') {
      return (
        <input
          type="text"
          placeholder={isTotal ? "Total" : "Product"}
          value={sectionData.sieveTesting?.test2?.mf?.[mfKey] || ''}
          onChange={(e) => handleInputChange("sieveTesting", "test2", e.target.value, "mf", mfKey)}
          onKeyDown={(e) => handleKeyDown(e, sieveTestingSubmitRef, sieveTestingFirstInputRef)}
          disabled={isFieldLocked('sieveTesting', `test2.mf.${mfKey}`)}
          readOnly={isFieldLocked('sieveTesting', `test2.mf.${mfKey}`)}
          style={{
            backgroundColor: isFieldLocked('sieveTesting', `test2.mf.${mfKey}`) ? '#f1f5f9' : '#ffffff',
            cursor: isFieldLocked('sieveTesting', `test2.mf.${mfKey}`) ? 'not-allowed' : 'text'
          }}
        />
      );
    }
    return null;
  };

  // === Test Parameters config ===
  const testParamConfig = [
    { key: "compactability", label: "Compactability" },
    { key: "permeability", label: "Permeability" },
    { key: "gcs", label: "GCS" },
    { key: "wts", label: "WTS" },
    { key: "moisture", label: "Moisture" },
    { key: "bentonite", label: "Bentonite" },
    { key: "coalDust", label: "CoalDust" },
    { key: "hopperLevel", label: "Hopper Level" },
    { key: "shearStrength", label: "Shear Strength" },
    { key: "dustCollectorSettings", label: "Dust Collector Settings" },
    { key: "returnSandMoisture", label: "Return Sand Moisture" }
  ];

  const renderTestParamCell = (rowIndex, colIndex, colKey) => {
    const paramConfig = testParamConfig[rowIndex];
    if (colKey === 'parameter') {
      return <strong style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{paramConfig.label}</strong>;
    }
    const testNum = colKey;
    return (
      <input
        type="text"
        placeholder="Enter value"
        value={sectionData.parameters?.[testNum]?.[paramConfig.key] || ''}
        onChange={(e) => handleInputChange("parameters", testNum, e.target.value, paramConfig.key)}
        onKeyDown={(e) => handleKeyDown(e, testParametersSubmitRef, testParametersFirstInputRef)}
        disabled={isFieldLocked('parameters', `${testNum}.${paramConfig.key}`)}
        readOnly={isFieldLocked('parameters', `${testNum}.${paramConfig.key}`)}
        ref={paramConfig.key === "compactability" && testNum === "test1" ? testParametersFirstInputRef : null}
        style={{
          backgroundColor: isFieldLocked('parameters', `${testNum}.${paramConfig.key}`) ? '#f1f5f9' : '#ffffff',
          cursor: isFieldLocked('parameters', `${testNum}.${paramConfig.key}`) ? 'not-allowed' : 'text'
        }}
      />
    );
  };

  // === Additional Data config ===
  const additionalParamKeys = ["afsNo", "fines", "gd"];
  const additionalParamLabels = ["AFSNO", "FINES", "GD"];

  const renderAdditionalCell = (rowIndex, colIndex, colKey) => {
    const param = additionalParamKeys[rowIndex];
    if (colKey === 'parameter') {
      return <strong style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e293b' }}>{additionalParamLabels[rowIndex]}</strong>;
    }
    const testNum = colKey;
    return (
      <input
        type="text"
        placeholder="Enter value"
        value={sectionData.additionalData?.[testNum]?.[param] || ''}
        onChange={(e) => handleInputChange("additionalData", testNum, e.target.value, param)}
        onKeyDown={(e) => handleKeyDown(e, additionalDataSubmitRef, additionalDataFirstInputRef)}
        disabled={isFieldLocked('additionalData', `${testNum}.${param}`)}
        readOnly={isFieldLocked('additionalData', `${testNum}.${param}`)}
        ref={param === "afsNo" && testNum === "test1" ? additionalDataFirstInputRef : null}
        style={{
          backgroundColor: isFieldLocked('additionalData', `${testNum}.${param}`) ? '#f1f5f9' : '#ffffff',
          cursor: isFieldLocked('additionalData', `${testNum}.${param}`) ? 'not-allowed' : 'text'
        }}
      />
    );
  };

  return (
    <div className="page-wrapper">
      {checkingData && (
        <div className="foundry-loader-overlay">
          <div>Loading...</div>
        </div>
      )}
      {/* Header */}
      <div className="foundry-header">
        <div className="foundry-header-text">
          <h2>
            <Save size={28} style={{ color: '#5B9AA9' }} />
            Foundry Sand Testing Note
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {primaryData.date ? (() => {
            const [y, m, d] = primaryData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      {/* Primary Section */}
      <div className="primary-header-container" style={{ marginBottom: '0.5rem' }}>
        <h3 className="foundry-section-title">PRIMARY</h3>
      </div>

      <div className="foundry-form-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="foundry-form-group">
          <label>Date <span style={{ color: '#ef4444' }}>*</span></label>
          <CustomDatePicker
            value={primaryData.date}
            onChange={(e) => handlePrimaryChange("date", e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="foundry-form-group">
          <label>Shift <span style={{ color: '#ef4444' }}>*</span></label>
          <ShiftDropdown
            value={primaryData.shift}
            onChange={(e) => handlePrimaryChange("shift", e.target.value)}
          />
        </div>
        <div className="foundry-form-group">
          <label>Sand Plant <span style={{ color: '#ef4444' }}>*</span></label>
          <DisaDropdown
            value={primaryData.sandPlant}
            onChange={(e) => handlePrimaryChange("sandPlant", e.target.value)}
            name="sandPlant"
            disabled={!primaryData.date || !primaryData.shift}
          />
        </div>
        <div className="foundry-form-group">
          <label>
            Compactability Setting
            {lockedFields.compactibilitySetting && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. J.C. mode"
            value={primaryData.compactibilitySetting}
            onChange={(e) => handlePrimaryChange("compactibilitySetting", e.target.value)}
            disabled={!primaryData.date || !primaryData.shift || !primaryData.sandPlant || lockedFields.compactibilitySetting}
            style={{ opacity: lockedFields.compactibilitySetting ? 0.6 : 1 }}
          />
        </div>
        <div className="foundry-form-group">
          <label>
            Shear/Mould Strength Setting
            {lockedFields.shearStrengthSetting && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
          </label>
          <input
            type="text"
            placeholder="e.g. MP.VOX"
            value={primaryData.shearStrengthSetting}
            onChange={(e) => handlePrimaryChange("shearStrengthSetting", e.target.value)}
            disabled={!primaryData.date || !primaryData.shift || !primaryData.sandPlant || lockedFields.shearStrengthSetting}
            style={{ opacity: lockedFields.shearStrengthSetting ? 0.6 : 1 }}
          />
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {checkingData ? (
          <div style={{ padding: '0.75rem 1.5rem', color: '#64748b', fontWeight: 500 }}>
            Loading...
          </div>
        ) : (
          <SubmitButton
            onClick={handlePrimarySubmit}
            disabled={!primaryData.date || !primaryData.shift || !primaryData.sandPlant || (lockedFields.compactibilitySetting && lockedFields.shearStrengthSetting)}
          >
            {isPrimaryDataSaved ? "Update Primary Data" : "Save Primary"}
          </SubmitButton>
        )}
      </div>

      {/* Clay Parameters */}
      <div className="foundry-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="foundry-section-title">Clay Parameters {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        <Table
          template
          bordered
          rows={5}
          minWidth={800}
          columns={clayColumns}
          renderCell={renderClayCell}
        />
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleSectionReset('clayParameters')}
          disabled={loadingStates.clayParameters}
          className="foundry-reset-btn"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          ref={clayParametersSubmitRef}
          type="button"
          onClick={() => handleSectionSubmit('clayParameters')}
          onKeyDown={(e) => handleSubmitButtonKeyDown(e, () => handleSectionSubmit('clayParameters'))}
          disabled={loadingStates.clayParameters}
          className="foundry-submit-btn"
        >
          {loadingStates.clayParameters ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loadingStates.clayParameters ? 'Saving...' : 'Save Clay Parameters'}
        </button>
      </div>
      </div>

      {/* Sieve Testing */}
      <div className="foundry-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="foundry-section-title">Sieve Testing {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        <Table
          template
          bordered
          rows={sieveData.length + 1}
          minWidth={900}
          columns={sieveColumns}
          renderCell={renderSieveCell}
        />
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleSectionReset('sieveTesting')}
          disabled={loadingStates.sieveTesting}
          className="foundry-reset-btn"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          ref={sieveTestingSubmitRef}
          type="button"
          onClick={() => handleSectionSubmit('sieveTesting')}
          onKeyDown={(e) => handleSubmitButtonKeyDown(e, () => handleSectionSubmit('sieveTesting'))}
          disabled={loadingStates.sieveTesting}
          className="foundry-submit-btn"
        >
          {loadingStates.sieveTesting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loadingStates.sieveTesting ? 'Saving...' : 'Save Sieve Testing'}
        </button>
      </div>
      </div>

      {/* Test Parameters */}
      <div className="foundry-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="foundry-section-title">Test Parameters {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        <Table
          template
          bordered
          rows={11}
          minWidth={800}
          columns={testParamColumns}
          renderCell={renderTestParamCell}
        />
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleSectionReset('testParameters')}
          disabled={loadingStates.testParameters}
          className="foundry-reset-btn"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          ref={testParametersSubmitRef}
          type="button"
          onClick={() => handleSectionSubmit('testParameters')}
          onKeyDown={(e) => handleSubmitButtonKeyDown(e, () => handleSectionSubmit('testParameters'))}
          disabled={loadingStates.testParameters}
          className="foundry-submit-btn"
        >
          {loadingStates.testParameters ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loadingStates.testParameters ? 'Saving...' : 'Save Test Parameters'}
        </button>
      </div>
      </div>

      {/* Additional Data */}
      <div className="foundry-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="foundry-section-title">Additional Data {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        <Table
          template
          bordered
          rows={3}
          minWidth={800}
          columns={additionalColumns}
          renderCell={renderAdditionalCell}
        />
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleSectionReset('additionalData')}
          disabled={loadingStates.additionalData}
          className="foundry-reset-btn"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button
          ref={additionalDataSubmitRef}
          type="button"
          onClick={() => handleSectionSubmit('additionalData')}
          onKeyDown={(e) => handleSubmitButtonKeyDown(e, () => handleSectionSubmit('additionalData'))}
          disabled={loadingStates.additionalData}
          className="foundry-submit-btn"
        >
          {loadingStates.additionalData ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loadingStates.additionalData ? 'Saving...' : 'Save Additional Data'}
        </button>
      </div>
      </div>

      {/* Remarks */}
      <div className="foundry-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="foundry-section-title">Remarks {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
        <div className="foundry-form-group">
          <label>Remarks</label>
          <input
            type="text"
            ref={remarksFirstInputRef}
            value={sectionData.remarks || ''}
            onChange={(e) => handleInputChange("remarks", null, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, remarksSubmitRef, remarksFirstInputRef)}
            placeholder="Enter any additional remarks..."
            maxLength={80}
            disabled={fieldLocks.remarks}
            readOnly={fieldLocks.remarks}
            style={{
              width: '100%',
              maxWidth: '500px',
              resize: 'none',
              backgroundColor: fieldLocks.remarks ? '#f1f5f9' : '#ffffff',
              cursor: fieldLocks.remarks ? 'not-allowed' : 'text'
            }}
          />
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleSectionReset('remarks')}
            disabled={loadingStates.remarks}
            className="foundry-reset-btn"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            ref={remarksSubmitRef}
            type="button"
            onClick={() => handleSectionSubmit('remarks')}
            onKeyDown={(e) => handleSubmitButtonKeyDown(e, () => handleSectionSubmit('remarks'))}
            disabled={loadingStates.remarks}
            className="foundry-submit-btn"
          >
            {loadingStates.remarks ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loadingStates.remarks ? 'Saving...' : 'Save Remarks'}
          </button>
        </div>
      </div>
    </div>
  );
}
