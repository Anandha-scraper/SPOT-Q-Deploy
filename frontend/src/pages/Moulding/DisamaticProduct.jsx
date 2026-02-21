import React, { useState, useEffect, useRef } from "react";
import { Save, Plus, X } from "lucide-react";
import CustomDatePicker from "../../Components/CustomDatePicker";
import { CustomTimeInput, Time, PlusButton, MinusButton, SubmitButton, ShiftDropdown } from "../../Components/Buttons";
import { InlineLoader } from "../../Components/Alert";
import { API_ENDPOINTS } from "../../config/api";
import "../../styles/PageStyles/Moulding/DisamaticProduct.css";

const initialFormData = {
  date: "",
  shift: "",
  incharge: "",
  ppOperator: "",
  members: [""],
  productionTable: [{ counterNo: "", componentName: "", produced: "", poured: "", cycleTime: "", mouldsPerHour: "", remarks: "" }],
  nextShiftPlanTable: [{ componentName: "", plannedMoulds: "", remarks: "" }],
  delaysTable: [{ delays: "", durationMinutes: [""], fromTime: [""], toTime: [""] }],
  mouldHardnessTable: [{ componentName: "", mpPP: [["", ""]], mpSP: [["", ""]], bsPP: [["", ""]], bsSP: [["", ""]], remarks: "" }],
  patternTempTable: [{ item: "", pp: "", sp: "" }],
  significantEvent: "",
  maintenance: "",
  supervisorName: "",
};

// Helper function to create Time object from time string (e.g., "08:30 AM" or "08:30")
const createTimeFromString = (timeStr) => {
  if (!timeStr) return null;
  try {
    // Check if it has AM/PM
    const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10);
      const minute = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3].toUpperCase();
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return new Time(hour, minute);
    }
    // 24-hour format
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      return new Time(hour, minute);
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function to convert Time object to string format (e.g., "08:30 AM")
const formatTimeToString = (timeObj) => {
  if (!timeObj) return '';
  let hour = timeObj.hour;
  const minute = timeObj.minute;
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};

const DisamaticProduct = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isPrimaryDataSaved, setIsPrimaryDataSaved] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    incharge: false,
    ppOperator: false
  });
  const [lockedMembersCount, setLockedMembersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [productionErrors, setProductionErrors] = useState({});
  const [nextShiftPlanErrors, setNextShiftPlanErrors] = useState({});
  const [delaysErrors, setDelaysErrors] = useState({});
  const [mouldHardnessErrors, setMouldHardnessErrors] = useState({});
  const [patternTempErrors, setPatternTempErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [nextSNo, setNextSNo] = useState(1);
  const [nextShiftPlanSNo, setNextShiftPlanSNo] = useState(1);
  const [delaysSNo, setDelaysSNo] = useState(1);
  const [mouldHardnessSNo, setMouldHardnessSNo] = useState(1);
  const [patternTempSNo, setPatternTempSNo] = useState(1);
  const [isEventsSaved, setIsEventsSaved] = useState(false);
  const [lockedEventsFields, setLockedEventsFields] = useState({
    significantEvent: false,
    maintenance: false,
    supervisorName: false
  });
  const [delaysSubmitError, setDelaysSubmitError] = useState('');
  const [mouldHardnessSubmitError, setMouldHardnessSubmitError] = useState('');

  // Sequential validation highlighting
  const [dateErrorHighlight, setDateErrorHighlight] = useState(false);
  const [shiftErrorHighlight, setShiftErrorHighlight] = useState(false);
  const [inchargeErrorHighlight, setInchargeErrorHighlight] = useState(false);
  const [ppOperatorErrorHighlight, setPpOperatorErrorHighlight] = useState(false);
  const [membersErrorHighlight, setMembersErrorHighlight] = useState(false);

  // Validation flag for primary section
  const [primarySubmitted, setPrimarySubmitted] = useState(false);

  // Refs for navigation
  const dateRef = useRef(null);
  const shiftRef = useRef(null);
  const inchargeRef = useRef(null);
  const ppOperatorRef = useRef(null);
  const primarySaveButtonRef = useRef(null);

  // Helper function for primary field validation classes (no green success outline, only error)
  const classFor = (value, submitted, required = false, locked = false) => {
    if (locked) return '';
    const has = value !== undefined && value !== null && String(value).trim() !== '';
    if (has) return ''; // No green success outline
    if (submitted && required) return 'disa-error-outline';
    return '';
  };

  // Handle Enter/Tab key navigation for primary section
  const handlePrimaryKeyDown = (e, nextRef, currentField = null) => {
    // Block e, E, +, - keys for numeric inputs
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
      return;
    }
    
    // Handle Enter and Tab for navigation within primary section
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      // Navigate to next field
      if (nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // Get next available field after date
  const getNextAfterDate = () => {
    if (formData.date) return shiftRef;
    return dateRef; // Stay on date if not filled
  };

  // Get next available field after shift
  const getNextAfterShift = () => {
    if (formData.date && formData.shift) {
      if (!lockedFields.incharge) return inchargeRef;
      if (!lockedFields.ppOperator) return ppOperatorRef;
      return primarySaveButtonRef;
    }
    if (!formData.date) return dateRef;
    return shiftRef; // Stay on shift if not filled
  };

  // Get next available field after incharge
  const getNextAfterIncharge = () => {
    if (!lockedFields.ppOperator) return ppOperatorRef;
    return primarySaveButtonRef;
  };

  // Get next available field after ppOperator
  const getNextAfterPpOperator = () => {
    return primarySaveButtonRef;
  };

  // Fetch primary data when date or shift changes
  useEffect(() => {
    if (formData.date && formData.shift) {
      fetchPrimaryData(formData.date, formData.shift);
    }
  }, [formData.date, formData.shift]);

  // Fetch primary data from backend
  const fetchPrimaryData = async (date, shift) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_ENDPOINTS.mouldingDisa}/primary?date=${date}&shift=${shift}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication required');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success && result.data) {
        const { incharge, ppOperator, memberspresent, productionCount, nextShiftPlanCount, delaysCount, mouldHardnessCount, patternTempCount, significantEvent, maintenance, supervisorName } = result.data;
        
        // Set next S.No based on existing production data count
        const newNextSNo = (productionCount || 0) + 1;
        setNextSNo(newNextSNo);
        
        // Set next shift plan S.No
        const newNextShiftPlanSNo = (nextShiftPlanCount || 0) + 1;
        setNextShiftPlanSNo(newNextShiftPlanSNo);
        
        // Set delays S.No
        const newDelaysSNo = (delaysCount || 0) + 1;
        setDelaysSNo(newDelaysSNo);
        
        // Set mould hardness S.No
        const newMouldHardnessSNo = (mouldHardnessCount || 0) + 1;
        setMouldHardnessSNo(newMouldHardnessSNo);
        
        // Set pattern temperature S.No
        const newPatternTempSNo = (patternTempCount || 0) + 1;
        setPatternTempSNo(newPatternTempSNo);
        
        // Determine saved members count
        const savedMembersCount = (memberspresent && memberspresent.length > 0) ? memberspresent.length : 0;
        
        // Update form data with fetched values - start with one empty field if no saved members
        const currentMembers = memberspresent && memberspresent.length > 0 ? [...memberspresent] : [''];
        
        setFormData(prev => ({
          ...prev,
          incharge: incharge || '',
          ppOperator: ppOperator || '',
          members: currentMembers,
          productionTable: [{ counterNo: "", componentName: "", produced: "", poured: "", cycleTime: "", mouldsPerHour: "", remarks: "" }],
          nextShiftPlanTable: [{ componentName: "", plannedMoulds: "", remarks: "" }],
          delaysTable: [{ delays: "", durationMinutes: [""], fromTime: [""], toTime: [""] }],
          significantEvent: significantEvent || '',
          maintenance: maintenance || '',
          supervisorName: supervisorName || ''
        }));

        // Lock fields that have values
        setLockedFields({
          incharge: !!incharge,
          ppOperator: !!ppOperator
        });
        
        // Set count of locked members
        setLockedMembersCount(savedMembersCount);

        // Check if any primary data exists
        const hasAnyData = incharge || ppOperator || savedMembersCount > 0;
        setIsPrimaryDataSaved(hasAnyData);
        
        // Lock individual events fields based on what has data
        setLockedEventsFields({
          significantEvent: !!(significantEvent && significantEvent.trim()),
          maintenance: !!(maintenance && maintenance.trim()),
          supervisorName: !!(supervisorName && supervisorName.trim())
        });
        
        // Check if all events fields are locked
        const allEventsLocked = !!(significantEvent && significantEvent.trim()) && 
                               !!(maintenance && maintenance.trim()) && 
                               !!(supervisorName && supervisorName.trim());
        setIsEventsSaved(allEventsLocked);
      } else {
        // No data found - reset to defaults
        setFormData(prev => ({
          ...prev,
          incharge: '',
          ppOperator: '',
          members: [''],
          productionTable: [{ counterNo: "", componentName: "", produced: "", poured: "", cycleTime: "", mouldsPerHour: "", remarks: "" }],
          nextShiftPlanTable: [{ componentName: "", plannedMoulds: "", remarks: "" }],
          delaysTable: [{ delays: "", durationMinutes: [""], fromTime: [""], toTime: [""] }],
          significantEvent: '',
          maintenance: '',
          supervisorName: ''
        }));
        setLockedFields({
          incharge: false,
          ppOperator: false
        });
        setLockedMembersCount(0);
        setIsPrimaryDataSaved(false);
        setIsEventsSaved(false);
        setLockedEventsFields({
          significantEvent: false,
          maintenance: false,
          supervisorName: false
        });
        setNextSNo(1);
        setNextShiftPlanSNo(1);
        setDelaysSNo(1);
        setMouldHardnessSNo(1);
        setPatternTempSNo(1);
      }
    } catch (error) {
      console.error('Error fetching primary data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle basic field changes
  const handleChange = (field, value) => {
    // Remove error highlight when filling the field
    if (field === 'date' && value) {
      setDateErrorHighlight(false);
    }
    if (field === 'shift' && value) {
      setShiftErrorHighlight(false);
    }

    // When date changes, reset everything
    if (field === 'date') {
      setFormData({
        ...initialFormData,
        date: value
      });
      setIsPrimaryDataSaved(false);
      setLockedFields({
        incharge: false,
        ppOperator: false
      });
      setLockedMembersCount(0);
      setPrimarySubmitted(false);
      // Reset error highlights
      setDateErrorHighlight(false);
      setShiftErrorHighlight(false);
      // Reset all S.No counters
      setNextSNo(1);
      setNextShiftPlanSNo(1);
      setDelaysSNo(1);
      setMouldHardnessSNo(1);
      setPatternTempSNo(1);
      // Reset events
      setIsEventsSaved(false);
      setLockedEventsFields({
        significantEvent: false,
        maintenance: false,
        supervisorName: false
      });
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for when value fields are focused - check if prerequisites are filled
  const handleValueFieldFocus = (e) => {
    if (!formData.date) {
      setDateErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
    if (!formData.shift) {
      setShiftErrorHighlight(true);
      e?.preventDefault();
      e?.stopPropagation();
      return;
    }
  };

  // Members management
  const handleMemberChange = (index, value) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const addMemberField = () => {
    if (formData.members.length < 4) {
      setFormData(prev => ({ ...prev, members: [...prev.members, ""] }));
    }
  };

  const removeMemberField = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  // Production Table
  const addProductionRow = () => {
    setFormData(prev => ({
      ...prev,
      productionTable: [...prev.productionTable, { counterNo: "", componentName: "", produced: "", poured: "", cycleTime: "", mouldsPerHour: "", remarks: "" }]
    }));
  };

  const deleteProductionRow = (index) => {
    setFormData(prev => ({
      ...prev,
      productionTable: prev.productionTable.filter((_, i) => i !== index)
    }));
  };

  const handleProductionChange = (index, field, value) => {
    const newTable = [...formData.productionTable];
    newTable[index][field] = value;
    setFormData(prev => ({ ...prev, productionTable: newTable }));
    
    // Clear error for this field when user enters data
    if (productionErrors[index]?.[field]) {
      setProductionErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  const getBorderColor = (rowIndex, fieldName) => {
    const fieldKey = `${rowIndex}-${fieldName}`;
    const hasError = productionErrors[rowIndex]?.[fieldName];
    const isFocused = focusedField === fieldKey;
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    return '#e2e8f0'; // default gray
  };

  // Handle Enter key to move to next input
  const handleProductionKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Navigation fields
      const fields = ['counterNo', 'componentName', 'produced', 'poured', 'cycleTime', 'mouldsPerHour', 'remarks'];
      const currentFieldIndex = fields.indexOf(currentField);
      
      // Move to next field in same row
      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        setFocusedField(`${currentRowIndex}-${nextField}`);
        // Focus the next input using setTimeout to ensure state update
        setTimeout(() => {
          // Special handling for cycleTime field (CustomTimeInput component)
          if (nextField === 'cycleTime') {
            const timeContainer = document.querySelector(`div[data-field="${currentRowIndex}-cycleTime"]`);
            if (timeContainer) {
              const timeInput = timeContainer.querySelector('[data-slot="input"]');
              if (timeInput) {
                const firstSegment = timeInput.querySelector('[data-slot="segment"]');
                if (firstSegment) {
                  firstSegment.focus();
                  return;
                }
              }
            }
          }
          
          // Regular input handling
          const nextInput = document.querySelector(`input[data-field="${currentRowIndex}-${nextField}"]`);
          if (nextInput) {
            nextInput.focus();
          }
        }, 0);
      } 
      // Move to first field of next row
      else if (currentRowIndex < formData.productionTable.length - 1) {
        const nextRowIndex = currentRowIndex + 1;
        setFocusedField(`${nextRowIndex}-counterNo`);
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-field="${nextRowIndex}-counterNo"]`);
          if (nextInput) nextInput.focus();
        }, 0);
      }
    }
  };

  // Submit Production Data
  const handleSubmitProduction = async () => {
    // Validate all fields in production table
    const errors = {};
    let hasCompleteRow = false;
    let hasAnyData = false;
    
    formData.productionTable.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if row has any data
      const hasRowData = row.counterNo || row.componentName || row.produced || row.poured || row.cycleTime || row.mouldsPerHour || row.remarks;
      
      if (hasRowData) {
        hasAnyData = true;
        // If row has some data, all fields must be filled
        if (!row.counterNo) rowErrors.counterNo = true;
        if (!row.componentName) rowErrors.componentName = true;
        if (!row.produced) rowErrors.produced = true;
        if (!row.poured) rowErrors.poured = true;
        if (!row.cycleTime) rowErrors.cycleTime = true;
        if (!row.mouldsPerHour) rowErrors.mouldsPerHour = true;
        if (!row.remarks) rowErrors.remarks = true;
        
        if (Object.keys(rowErrors).length === 0) {
          hasCompleteRow = true;
        } else {
          errors[index] = rowErrors;
        }
      }
    });

    // If no data at all in any row, show errors on all rows
    if (!hasAnyData) {
      formData.productionTable.forEach((row, index) => {
        errors[index] = {
          counterNo: true,
          componentName: true,
          produced: true,
          poured: true,
          cycleTime: true,
          mouldsPerHour: true,
          remarks: true
        };
      });
      setProductionErrors(errors);
      return;
    }

    // If validation errors exist, set them and return
    if (Object.keys(errors).length > 0) {
      setProductionErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      
      // Filter out empty rows before sending
      const validRows = formData.productionTable.filter(row => 
        row.counterNo || row.componentName || row.produced || row.poured || row.cycleTime || row.mouldsPerHour || row.remarks
      );
      
      // Save production data to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          section: 'production',
          productionTable: validRows
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save production data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        
        // Calculate new nextSNo based on saved rows
        const newNextSNo = nextSNo + validRows.length;
        setNextSNo(newNextSNo);
        
        // Clear production table and add one row
        setFormData(prev => ({
          ...prev,
          productionTable: [{ counterNo: "", componentName: "", produced: "", poured: "", cycleTime: "", mouldsPerHour: "", remarks: "" }]
        }));
        
        // Clear errors
        setProductionErrors({});
      } else {
        alert('Failed to save production data: ' + (result.message || 'Unknown error'));
      }
      setProductionErrors({});
    } catch (error) {
      console.error('Error saving production data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Next Shift Plan Table
  const addNextShiftPlanRow = () => {
    setFormData(prev => ({
      ...prev,
      nextShiftPlanTable: [...prev.nextShiftPlanTable, { componentName: "", plannedMoulds: "", remarks: "" }]
    }));
  };

  const deleteNextShiftPlanRow = (index) => {
    setFormData(prev => ({
      ...prev,
      nextShiftPlanTable: prev.nextShiftPlanTable.filter((_, i) => i !== index)
    }));
  };

  const handleNextShiftPlanChange = (index, field, value) => {
    const newTable = [...formData.nextShiftPlanTable];
    newTable[index][field] = value;
    setFormData(prev => ({ ...prev, nextShiftPlanTable: newTable }));
    
    // Clear error for this field when user enters data
    if (nextShiftPlanErrors[index]?.[field]) {
      setNextShiftPlanErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  const getBorderColorNextShiftPlan = (rowIndex, fieldName) => {
    const fieldKey = `${rowIndex}-nextShiftPlan-${fieldName}`;
    const isFocused = focusedField === fieldKey;
    const hasError = nextShiftPlanErrors[rowIndex]?.[fieldName];
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    return '#e2e8f0'; // default gray
  };

  // Handle Enter key navigation for Next Shift Plan
  const handleNextShiftPlanKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const fields = ['componentName', 'plannedMoulds', 'remarks'];
      const currentFieldIndex = fields.indexOf(currentField);
      
      // Move to next field in same row
      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        setFocusedField(`${currentRowIndex}-nextShiftPlan-${nextField}`);
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-field="${currentRowIndex}-nextShiftPlan-${nextField}"]`);
          if (nextInput) {
            nextInput.focus();
          }
        }, 0);
      } 
      // Move to first field of next row
      else if (currentRowIndex < formData.nextShiftPlanTable.length - 1) {
        const nextRowIndex = currentRowIndex + 1;
        setFocusedField(`${nextRowIndex}-nextShiftPlan-componentName`);
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-field="${nextRowIndex}-nextShiftPlan-componentName"]`);
          if (nextInput) nextInput.focus();
        }, 0);
      }
    }
  };

  // Submit Next Shift Plan Data
  const handleSubmitNextShiftPlan = async () => {
    // Validate all fields
    const errors = {};
    let hasCompleteRow = false;
    let hasAnyData = false;
    
    formData.nextShiftPlanTable.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if row has any data
      const hasRowData = row.componentName || row.plannedMoulds || row.remarks;
      
      if (hasRowData) {
        hasAnyData = true;
        // If row has some data, all fields must be filled
        if (!row.componentName) rowErrors.componentName = true;
        if (!row.plannedMoulds) rowErrors.plannedMoulds = true;
        if (!row.remarks) rowErrors.remarks = true;
        
        if (Object.keys(rowErrors).length === 0) {
          hasCompleteRow = true;
        } else {
          errors[index] = rowErrors;
        }
      }
    });

    // If no data at all, show errors on all rows
    if (!hasAnyData) {
      formData.nextShiftPlanTable.forEach((row, index) => {
        errors[index] = {
          componentName: true,
          plannedMoulds: true,
          remarks: true
        };
      });
      setNextShiftPlanErrors(errors);
      return;
    }

    // If validation errors exist, set them and return
    if (Object.keys(errors).length > 0) {
      setNextShiftPlanErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      
      // Filter out empty rows
      const validRows = formData.nextShiftPlanTable.filter(row => 
        row.componentName || row.plannedMoulds || row.remarks
      );
      
      // Save to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          section: 'nextShiftPlan',
          nextShiftPlanTable: validRows
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save next shift plan: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        
        // Update next S.No
        const newNextShiftPlanSNo = nextShiftPlanSNo + validRows.length;
        setNextShiftPlanSNo(newNextShiftPlanSNo);
        
        // Clear table
        setFormData(prev => ({
          ...prev,
          nextShiftPlanTable: [{ componentName: "", plannedMoulds: "", remarks: "" }]
        }));
        
        // Clear errors
        setNextShiftPlanErrors({});
      } else {
        alert('Failed to save: ' + (result.message || 'Unknown error'));
      }
      setNextShiftPlanErrors({});
    } catch (error) {
      console.error('Error saving next shift plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delays Table
  
  // Helper: Calculate time difference in minutes
  const calculateMinutesDifference = (fromTimeStr, toTimeStr) => {
    if (!fromTimeStr || !toTimeStr) return 0;
    
    try {
      const fromTime = createTimeFromString(fromTimeStr);
      const toTime = createTimeFromString(toTimeStr);
      
      if (!fromTime || !toTime) return 0;
      
      let fromMinutes = fromTime.hour * 60 + fromTime.minute;
      let toMinutes = toTime.hour * 60 + toTime.minute;
      
      // Handle overnight times
      if (toMinutes < fromMinutes) {
        toMinutes += 24 * 60;
      }
      
      return toMinutes - fromMinutes;
    } catch {
      return 0;
    }
  };
  
  // Helper: Add minutes to time
  const addMinutesToTime = (timeStr, minutes) => {
    if (!timeStr || !minutes) return '';
    
    try {
      const time = createTimeFromString(timeStr);
      if (!time) return '';
      
      const totalMinutes = time.hour * 60 + time.minute + parseInt(minutes);
      const newHour = Math.floor(totalMinutes / 60) % 24;
      const newMinute = totalMinutes % 60;
      
      return formatTimeToString(new Time(newHour, newMinute));
    } catch {
      return '';
    }
  };
  
  const addDelaysRow = () => {
    setDelaysSubmitError('');
    setFormData(prev => ({
      ...prev,
      delaysTable: [...prev.delaysTable, { delays: "", durationMinutes: [""], fromTime: [""], toTime: [""] }]
    }));
  };

  const deleteDelaysRow = (index) => {
    setDelaysSubmitError('');
    setFormData(prev => ({
      ...prev,
      delaysTable: prev.delaysTable.filter((_, i) => i !== index)
    }));
  };

  const handleDelaysChange = (index, field, value) => {
    const newTable = [...formData.delaysTable];
    newTable[index][field] = value;
    setFormData(prev => ({ ...prev, delaysTable: newTable }));
    
    // Clear submit error
    setDelaysSubmitError('');
    
    // Clear error for this field
    if (delaysErrors[index]?.[field]) {
      setDelaysErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  // Add/Remove duration minute inputs
  const addDurationInput = (rowIndex) => {
    setDelaysSubmitError('');
    const newTable = [...formData.delaysTable];
    if (newTable[rowIndex].durationMinutes.length < 10) {
      newTable[rowIndex].durationMinutes = [...newTable[rowIndex].durationMinutes, ""];
      newTable[rowIndex].fromTime = [...newTable[rowIndex].fromTime, ""];
      newTable[rowIndex].toTime = [...newTable[rowIndex].toTime, ""];
      setFormData(prev => ({ ...prev, delaysTable: newTable }));
    }
  };

  const removeDurationInput = (rowIndex, inputIndex) => {
    setDelaysSubmitError('');
    const newTable = [...formData.delaysTable];
    if (newTable[rowIndex].durationMinutes.length > 1) {
      newTable[rowIndex].durationMinutes = newTable[rowIndex].durationMinutes.filter((_, i) => i !== inputIndex);
      newTable[rowIndex].fromTime = newTable[rowIndex].fromTime.filter((_, i) => i !== inputIndex);
      newTable[rowIndex].toTime = newTable[rowIndex].toTime.filter((_, i) => i !== inputIndex);
      setFormData(prev => ({ ...prev, delaysTable: newTable }));
    }
  };

  const handleDurationInputChange = (rowIndex, inputIndex, value) => {
    const newTable = [...formData.delaysTable];
    newTable[rowIndex].durationMinutes[inputIndex] = value;
    
    // Clear submit error
    setDelaysSubmitError('');
    
    // Auto-calculate toTime if fromTime exists and duration is entered
    if (value && newTable[rowIndex].fromTime[inputIndex]) {
      const calculatedToTime = addMinutesToTime(newTable[rowIndex].fromTime[inputIndex], value);
      if (calculatedToTime) {
        newTable[rowIndex].toTime[inputIndex] = calculatedToTime;
      }
    }
    
    setFormData(prev => ({ ...prev, delaysTable: newTable }));
    
    // Validate duration <= 30 minutes
    if (value && parseInt(value) > 30) {
      setDelaysErrors(prev => ({
        ...prev,
        [rowIndex]: {
          ...prev[rowIndex],
          durationMinutes: {
            ...prev[rowIndex]?.durationMinutes,
            [inputIndex]: 'Duration cannot exceed 30 minutes'
          }
        }
      }));
    } else {
      // Clear errors
      if (delaysErrors[rowIndex]?.durationMinutes?.[inputIndex]) {
        setDelaysErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors[rowIndex]?.durationMinutes) {
            delete newErrors[rowIndex].durationMinutes[inputIndex];
            if (Object.keys(newErrors[rowIndex].durationMinutes).length === 0) {
              delete newErrors[rowIndex].durationMinutes;
            }
          }
          return newErrors;
        });
      }
    }
  };

  const handleTimeInputChange = (rowIndex, inputIndex, field, value) => {
    const newTable = [...formData.delaysTable];
    newTable[rowIndex][field][inputIndex] = value;
    
    // Clear submit error
    setDelaysSubmitError('');
    
    let calculatedDuration = 0;
    
    // Auto-calculate based on what was changed
    if (field === 'fromTime') {
      // fromTime changed
      if (value && newTable[rowIndex].durationMinutes[inputIndex]) {
        // If duration exists, calculate toTime
        const calculatedToTime = addMinutesToTime(value, newTable[rowIndex].durationMinutes[inputIndex]);
        if (calculatedToTime) {
          newTable[rowIndex].toTime[inputIndex] = calculatedToTime;
        }
      } else if (value && newTable[rowIndex].toTime[inputIndex]) {
        // If toTime exists, calculate duration
        calculatedDuration = calculateMinutesDifference(value, newTable[rowIndex].toTime[inputIndex]);
        if (calculatedDuration > 0) {
          newTable[rowIndex].durationMinutes[inputIndex] = String(calculatedDuration);
        }
      }
    } else if (field === 'toTime') {
      // toTime changed
      if (value && newTable[rowIndex].fromTime[inputIndex]) {
        // Calculate duration from fromTime to toTime
        calculatedDuration = calculateMinutesDifference(newTable[rowIndex].fromTime[inputIndex], value);
        if (calculatedDuration > 0) {
          newTable[rowIndex].durationMinutes[inputIndex] = String(calculatedDuration);
        }
      }
    }
    
    setFormData(prev => ({ ...prev, delaysTable: newTable }));
    
    // Validate calculated duration
    if (calculatedDuration > 30) {
      setDelaysErrors(prev => ({
        ...prev,
        [rowIndex]: {
          ...prev[rowIndex],
          durationMinutes: {
            ...prev[rowIndex]?.durationMinutes,
            [inputIndex]: 'Duration cannot exceed 30 minutes'
          }
        }
      }));
    } else {
      // Clear errors
      if (delaysErrors[rowIndex]?.fromTime?.[inputIndex] || delaysErrors[rowIndex]?.toTime?.[inputIndex] || delaysErrors[rowIndex]?.durationMinutes?.[inputIndex]) {
        setDelaysErrors(prev => {
          const newErrors = { ...prev };
          if (newErrors[rowIndex]?.fromTime) {
            delete newErrors[rowIndex].fromTime[inputIndex];
          }
          if (newErrors[rowIndex]?.toTime) {
            delete newErrors[rowIndex].toTime[inputIndex];
          }
          if (newErrors[rowIndex]?.durationMinutes) {
            delete newErrors[rowIndex].durationMinutes[inputIndex];
          }
          return newErrors;
        });
      }
    }
  };
  
  // Submit Delays Data
  const handleSubmitDelays = async () => {
    const errors = {};
    let hasCompleteRow = false;
    let hasAnyData = false;
    
    formData.delaysTable.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if row has any data
      const hasRowData = row.delays || row.durationMinutes.some(m => m) || row.fromTime.some(t => t) || row.toTime.some(t => t);
      
      if (hasRowData) {
        hasAnyData = true;
        
        // Validate delays field
        if (!row.delays) rowErrors.delays = true;
        
        // Validate each duration entry
        rowErrors.durationMinutes = {};
        rowErrors.fromTime = {};
        rowErrors.toTime = {};
        let hasEntryError = false;
        
        row.durationMinutes.forEach((minutes, idx) => {
          const hasEntryData = minutes || row.fromTime[idx] || row.toTime[idx];
          if (hasEntryData) {
            if (!minutes) {
              rowErrors.durationMinutes[idx] = true;
              hasEntryError = true;
            } else if (parseInt(minutes) > 30) {
              rowErrors.durationMinutes[idx] = 'Duration cannot exceed 30 minutes';
              hasEntryError = true;
            }
            if (!row.fromTime[idx]) {
              rowErrors.fromTime[idx] = true;
              hasEntryError = true;
            }
            if (!row.toTime[idx]) {
              rowErrors.toTime[idx] = true;
              hasEntryError = true;
            }
          }
        });
        
        if (Object.keys(rowErrors.durationMinutes).length === 0) delete rowErrors.durationMinutes;
        if (Object.keys(rowErrors.fromTime).length === 0) delete rowErrors.fromTime;
        if (Object.keys(rowErrors.toTime).length === 0) delete rowErrors.toTime;
        
        if (Object.keys(rowErrors).length === 0) {
          hasCompleteRow = true;
        } else {
          errors[index] = rowErrors;
        }
      }
    });
    
    // If no data, show errors
    if (!hasAnyData) {
      formData.delaysTable.forEach((row, index) => {
        errors[index] = {
          delays: true,
          durationMinutes: { 0: true },
          fromTime: { 0: true },
          toTime: { 0: true }
        };
      });
      setDelaysErrors(errors);
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      setDelaysErrors(errors);
      // Check if there are any duration > 30 errors
      const hasDurationError = Object.values(errors).some(rowError => 
        rowError.durationMinutes && Object.values(rowError.durationMinutes).some(err => typeof err === 'string')
      );
      if (hasDurationError) {
        setDelaysSubmitError("Duration cannot exceed 30 minutes. Please check the highlighted fields.");
      } else {
        setDelaysSubmitError("Please fill all required fields in rows with data.");
      }
      return;
    }
    
    // Clear submit error if validation passes
    setDelaysSubmitError('');
    
    try {
      setIsLoading(true);
      
      // Filter out empty rows
      const validRows = formData.delaysTable.filter(row => 
        row.delays || row.durationMinutes.some(m => m) || row.fromTime.some(t => t) || row.toTime.some(t => t)
      );
      
      // Save to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          section: 'delays',
          delaysTable: validRows
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save delays: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update next S.No
        const newDelaysSNo = delaysSNo + validRows.length;
        setDelaysSNo(newDelaysSNo);
        
        // Clear table
        setFormData(prev => ({
          ...prev,
          delaysTable: [{ delays: "", durationMinutes: [""], fromTime: [""], toTime: [""] }]
        }));
        
        setDelaysErrors({});
        setDelaysSubmitError('');
      } else {
        alert('Failed to save: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving delays:', error);
      alert('Error saving data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getBorderColorDelays = (rowIndex, fieldName) => {
    const fieldKey = `${rowIndex}-delays-${fieldName}`;
    const isFocused = focusedField === fieldKey;
    const hasError = delaysErrors[rowIndex]?.[fieldName];
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    return '#e2e8f0'; // default gray
  };
  
  const getDurationInputBorderColor = (rowIndex, inputIndex) => {
    const hasError = delaysErrors[rowIndex]?.durationMinutes?.[inputIndex];
    return hasError ? '#ef4444' : '#e2e8f0';
  };
  
  // Handle Enter key navigation for Delays table
  const handleDelaysKeyDown = (e, currentRowIndex, currentField, currentInputIndex = null) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const row = formData.delaysTable[currentRowIndex];
      const totalDurationInputs = row.durationMinutes.length;
      
      // Determine next field
      let nextField = null;
      let nextInputIndex = null;
      
      if (currentField === 'delays') {
        // Move to first duration minutes input
        nextField = 'durationMinutes';
        nextInputIndex = 0;
      } else if (currentField === 'durationMinutes') {
        // Move to corresponding fromTime
        nextField = 'fromTime';
        nextInputIndex = currentInputIndex;
      } else if (currentField === 'fromTime') {
        // Move to corresponding toTime
        nextField = 'toTime';
        nextInputIndex = currentInputIndex;
      } else if (currentField === 'toTime') {
        // Check if there's another duration entry
        if (currentInputIndex < totalDurationInputs - 1) {
          // Move to next duration entry
          nextField = 'durationMinutes';
          nextInputIndex = currentInputIndex + 1;
        } else {
          // Move to next row's delays field
          if (currentRowIndex < formData.delaysTable.length - 1) {
            const nextRowIndex = currentRowIndex + 1;
            setFocusedField(`${nextRowIndex}-delays-delays`);
            setTimeout(() => {
              const nextInput = document.querySelector(`input[data-field="${nextRowIndex}-delays-delays"]`);
              if (nextInput) nextInput.focus();
            }, 0);
            return;
          }
          return;
        }
      }
      
      // Focus next field
      if (nextField) {
        setFocusedField(`${currentRowIndex}-delays-${nextField}-${nextInputIndex}`);
        setTimeout(() => {
          if (nextField === 'durationMinutes') {
            const nextInput = document.querySelector(`input[data-field="${currentRowIndex}-delays-durationMinutes-${nextInputIndex}"]`);
            if (nextInput) nextInput.focus();
          } else if (nextField === 'fromTime' || nextField === 'toTime') {
            // Handle CustomTimeInput
            const timeContainer = document.querySelector(`div[data-field="${currentRowIndex}-delays-${nextField}-${nextInputIndex}"]`);
            if (timeContainer) {
              const timeInput = timeContainer.querySelector('[data-slot="input"]');
              if (timeInput) {
                const firstSegment = timeInput.querySelector('[data-slot="segment"]');
                if (firstSegment) {
                  firstSegment.focus();
                }
              }
            }
          }
        }, 0);
      }
    }
  };

  // Mould Hardness Table
  const addMouldHardnessRow = () => {
    setMouldHardnessSubmitError('');
    setFormData(prev => ({
      ...prev,
      mouldHardnessTable: [...prev.mouldHardnessTable, { componentName: "", mpPP: [["", ""]], mpSP: [["", ""]], bsPP: [["", ""]], bsSP: [["", ""]], remarks: "" }]
    }));
  };

  const deleteMouldHardnessRow = (index) => {
    setMouldHardnessSubmitError('');
    setFormData(prev => ({
      ...prev,
      mouldHardnessTable: prev.mouldHardnessTable.filter((_, i) => i !== index)
    }));
  };

  const handleMouldHardnessChange = (index, field, value, pairIndex = null, fieldIndex = null) => {
    const newTable = [...formData.mouldHardnessTable];
    if (pairIndex !== null && fieldIndex !== null && Array.isArray(newTable[index][field])) {
      newTable[index][field][pairIndex][fieldIndex] = value;
    } else {
      newTable[index][field] = value;
    }
    setFormData(prev => ({ ...prev, mouldHardnessTable: newTable }));
    
    // Clear submit error
    setMouldHardnessSubmitError('');
    
    // First, clear existing errors for this field
    if (mouldHardnessErrors[index]) {
      setMouldHardnessErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          if (pairIndex !== null && fieldIndex !== null) {
            // For array fields (mpPP, mpSP, bsPP, bsSP)
            if (newErrors[index][field]?.[pairIndex]) {
              const position = fieldIndex === 0 ? 'from' : 'to';
              delete newErrors[index][field][pairIndex][position];
              // If both from and to are cleared, remove the pair error
              if (Object.keys(newErrors[index][field][pairIndex]).length === 0) {
                delete newErrors[index][field][pairIndex];
              }
              // If no more pair errors, remove the field error
              if (Object.keys(newErrors[index][field]).length === 0) {
                delete newErrors[index][field];
              }
            }
          } else {
            // For simple fields (componentName, remarks)
            delete newErrors[index][field];
          }
          // If no more errors for this row, remove the row error
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
    
    // Dynamic validation for from-to pairs
    if (pairIndex !== null && fieldIndex !== null && ['mpPP', 'mpSP', 'bsPP', 'bsSP'].includes(field)) {
      const pair = newTable[index][field][pairIndex];
      const fromVal = parseFloat(pair[0]);
      const toVal = parseFloat(pair[1]);
      
      // Check if both values exist and to > from (from >= to is okay)
      if (pair[0] && pair[1] && !isNaN(fromVal) && !isNaN(toVal) && toVal > fromVal) {
        setMouldHardnessErrors(prev => ({
          ...prev,
          [index]: {
            ...prev[index],
            [field]: {
              ...prev[index]?.[field],
              [pairIndex]: {
                from: 'From cannot be less than To',
                to: 'To cannot be greater than From'
              }
            }
          }
        }));
      }
    }
  };

  // Format PP/SP values to one decimal place
  const formatDecimal = (value) => {
    if (!value || value === '') return value;
    // Remove any trailing dots
    let cleaned = value.replace(/\.+$/, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return value;
    return num.toFixed(1);
  };

  // Validate decimal input (allow digits and single decimal point)
  const cleanDecimalInput = (value) => {
    // Remove non-numeric characters except first decimal point
    let cleaned = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  // Handle Enter key navigation for Mould Hardness table
  const handleMouldHardnessKeyDown = (e, currentRowIndex, currentField, pairIdx = null, fieldIdx = null) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Auto-format to decimal if it's a PP/SP field
      if (pairIdx !== null && fieldIdx !== null && ['mpPP', 'mpSP', 'bsPP', 'bsSP'].includes(currentField)) {
        const currentValue = formData.mouldHardnessTable[currentRowIndex][currentField][pairIdx][fieldIdx];
        if (currentValue) {
          const formatted = formatDecimal(currentValue);
          handleMouldHardnessChange(currentRowIndex, currentField, formatted, pairIdx, fieldIdx);
        }
      }
      
      const row = formData.mouldHardnessTable[currentRowIndex];
      const totalPairs = row.mpPP.length;
      
      // Define navigation order
      const fields = ['componentName'];
      
      // Add all pair fields
      for (let i = 0; i < totalPairs; i++) {
        fields.push(`mpPP-${i}-0`, `mpPP-${i}-1`);
      }
      for (let i = 0; i < totalPairs; i++) {
        fields.push(`mpSP-${i}-0`, `mpSP-${i}-1`);
      }
      for (let i = 0; i < totalPairs; i++) {
        fields.push(`bsPP-${i}-0`, `bsPP-${i}-1`);
      }
      for (let i = 0; i < totalPairs; i++) {
        fields.push(`bsSP-${i}-0`, `bsSP-${i}-1`);
      }
      fields.push('remarks');
      
      // Determine current field key
      let currentFieldKey;
      if (pairIdx !== null && fieldIdx !== null) {
        currentFieldKey = `${currentField}-${pairIdx}-${fieldIdx}`;
      } else {
        currentFieldKey = currentField;
      }
      
      const currentFieldIndex = fields.indexOf(currentFieldKey);
      
      // Move to next field in same row
      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextFieldKey = fields[currentFieldIndex + 1];
        const nextFieldParts = nextFieldKey.split('-');
        
        if (nextFieldParts.length === 3) {
          // It's a pair field
          const fieldName = nextFieldParts[0];
          const pairIndex = nextFieldParts[1];
          const fieldIndex = nextFieldParts[2];
          setFocusedField(`${currentRowIndex}-mouldHardness-${fieldName}-${pairIndex}-${fieldIndex === '0' ? 'from' : 'to'}`);
          setTimeout(() => {
            const selector = `[data-field="${currentRowIndex}-mouldHardness-${fieldName}-${pairIndex}-${fieldIndex === '0' ? 'from' : 'to'}"]`;
            const nextInput = document.querySelector(selector);
            if (nextInput) nextInput.focus();
          }, 0);
        } else {
          // It's componentName or remarks
          setFocusedField(`${currentRowIndex}-mouldHardness-${nextFieldKey}`);
          setTimeout(() => {
            const selector = `[data-field="${currentRowIndex}-mouldHardness-${nextFieldKey}"]`;
            const nextInput = document.querySelector(selector);
            if (nextInput) nextInput.focus();
          }, 0);
        }
      }
      // Move to first field of next row
      else if (currentRowIndex < formData.mouldHardnessTable.length - 1) {
        const nextRowIndex = currentRowIndex + 1;
        setFocusedField(`${nextRowIndex}-mouldHardness-componentName`);
        setTimeout(() => {
          const nextInput = document.querySelector(`[data-field="${nextRowIndex}-mouldHardness-componentName"]`);
          if (nextInput) nextInput.focus();
        }, 0);
      }
    }
  };

  // Add a new pair to a specific row in mould hardness table
  const addMouldHardnessPair = (rowIndex) => {
    setMouldHardnessSubmitError('');
    const newTable = [...formData.mouldHardnessTable];
    newTable[rowIndex].mpPP.push(["", ""]);
    newTable[rowIndex].mpSP.push(["", ""]);
    newTable[rowIndex].bsPP.push(["", ""]);
    newTable[rowIndex].bsSP.push(["", ""]);
    setFormData(prev => ({ ...prev, mouldHardnessTable: newTable }));
  };

  // Remove the last pair from a specific row in mould hardness table
  const removeMouldHardnessPair = (rowIndex) => {
    setMouldHardnessSubmitError('');
    const newTable = [...formData.mouldHardnessTable];
    if (newTable[rowIndex].mpPP.length > 1) {
      newTable[rowIndex].mpPP.pop();
      newTable[rowIndex].mpSP.pop();
      newTable[rowIndex].bsPP.pop();
      newTable[rowIndex].bsSP.pop();
      setFormData(prev => ({ ...prev, mouldHardnessTable: newTable }));
    }
  };

  // Submit Mould Hardness Data
  const handleSubmitMouldHardness = async () => {
    // Validate all fields in mould hardness table
    const errors = {};
    let hasCompleteRow = false;
    let hasAnyData = false;
    let hasRangeError = false;

    formData.mouldHardnessTable.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if row has any data
      const hasRowData = row.componentName || row.remarks || 
        row.mpPP.some(pair => pair[0] || pair[1]) ||
        row.mpSP.some(pair => pair[0] || pair[1]) ||
        row.bsPP.some(pair => pair[0] || pair[1]) ||
        row.bsSP.some(pair => pair[0] || pair[1]);
      
      if (hasRowData) {
        hasAnyData = true;
        // If row has some data, validate all required fields
        if (!row.componentName) rowErrors.componentName = true;
        if (!row.remarks) rowErrors.remarks = true;
        
        // Validate each pair in arrays
        const mpPPErrors = {};
        const mpSPErrors = {};
        const bsPPErrors = {};
        const bsSPErrors = {};
        
        row.mpPP.forEach((pair, pairIdx) => {
          if (!pair[0] || !pair[1]) {
            mpPPErrors[pairIdx] = { from: !pair[0], to: !pair[1] };
          } else if (parseFloat(pair[1]) > parseFloat(pair[0])) {
            mpPPErrors[pairIdx] = { from: 'From cannot be less than To', to: 'To cannot be greater than From' };
            hasRangeError = true;
          }
        });
        
        row.mpSP.forEach((pair, pairIdx) => {
          if (!pair[0] || !pair[1]) {
            mpSPErrors[pairIdx] = { from: !pair[0], to: !pair[1] };
          } else if (parseFloat(pair[1]) > parseFloat(pair[0])) {
            mpSPErrors[pairIdx] = { from: 'From cannot be less than To', to: 'To cannot be greater than From' };
            hasRangeError = true;
          }
        });
        
        row.bsPP.forEach((pair, pairIdx) => {
          if (!pair[0] || !pair[1]) {
            bsPPErrors[pairIdx] = { from: !pair[0], to: !pair[1] };
          } else if (parseFloat(pair[1]) > parseFloat(pair[0])) {
            bsPPErrors[pairIdx] = { from: 'From cannot be less than To', to: 'To cannot be greater than From' };
            hasRangeError = true;
          }
        });
        
        row.bsSP.forEach((pair, pairIdx) => {
          if (!pair[0] || !pair[1]) {
            bsSPErrors[pairIdx] = { from: !pair[0], to: !pair[1] };
          } else if (parseFloat(pair[1]) > parseFloat(pair[0])) {
            bsSPErrors[pairIdx] = { from: 'From cannot be less than To', to: 'To cannot be greater than From' };
            hasRangeError = true;
          }
        });
        
        if (Object.keys(mpPPErrors).length > 0) rowErrors.mpPP = mpPPErrors;
        if (Object.keys(mpSPErrors).length > 0) rowErrors.mpSP = mpSPErrors;
        if (Object.keys(bsPPErrors).length > 0) rowErrors.bsPP = bsPPErrors;
        if (Object.keys(bsSPErrors).length > 0) rowErrors.bsSP = bsSPErrors;
        
        // Check if all required fields are filled
        if (Object.keys(rowErrors).length === 0) {
          hasCompleteRow = true;
        } else {
          errors[index] = rowErrors;
        }
      }
    });

    // If no data at all in any row, show errors on all rows
    if (!hasAnyData) {
      formData.mouldHardnessTable.forEach((row, index) => {
        const mpPPErrors = {};
        const mpSPErrors = {};
        const bsPPErrors = {};
        const bsSPErrors = {};
        
        row.mpPP.forEach((pair, pairIdx) => {
          mpPPErrors[pairIdx] = { from: true, to: true };
        });
        
        row.mpSP.forEach((pair, pairIdx) => {
          mpSPErrors[pairIdx] = { from: true, to: true };
        });
        
        row.bsPP.forEach((pair, pairIdx) => {
          bsPPErrors[pairIdx] = { from: true, to: true };
        });
        
        row.bsSP.forEach((pair, pairIdx) => {
          bsSPErrors[pairIdx] = { from: true, to: true };
        });
        
        errors[index] = {
          componentName: true,
          remarks: true,
          mpPP: mpPPErrors,
          mpSP: mpSPErrors,
          bsPP: bsPPErrors,
          bsSP: bsSPErrors
        };
      });
      setMouldHardnessErrors(errors);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setMouldHardnessErrors(errors);
      if (hasRangeError) {
        setMouldHardnessSubmitError('To value cannot be greater than From value. Please check the highlighted fields.');
      } else {
        setMouldHardnessSubmitError('Please fill all required fields in rows with data.');
      }
      return;
    }

    if (!hasCompleteRow) {
      return;
    }
    
    // Clear submit error if validation passes
    setMouldHardnessSubmitError('');

    // Proceed with save
    try {
      setIsLoading(true);
      
      // Filter out empty rows
      const validRows = formData.mouldHardnessTable.filter(row => 
        row.componentName || row.remarks ||
        row.mpPP.some(pair => pair[0] || pair[1]) ||
        row.mpSP.some(pair => pair[0] || pair[1]) ||
        row.bsPP.some(pair => pair[0] || pair[1]) ||
        row.bsSP.some(pair => pair[0] || pair[1])
      );
      
      // Save to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          section: 'mouldHardness',
          mouldHardnessTable: validRows
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save mould hardness: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        
        // Update next S.No
        const newMouldHardnessSNo = mouldHardnessSNo + validRows.length;
        setMouldHardnessSNo(newMouldHardnessSNo);
        
        // Clear table
        setFormData(prev => ({
          ...prev,
          mouldHardnessTable: [{ componentName: "", mpPP: [["", ""]], mpSP: [["", ""]], bsPP: [["", ""]], bsSP: [["", ""]], remarks: "" }]
        }));
        
        setMouldHardnessErrors({});
        setMouldHardnessSubmitError('');
      } else {
        alert('Failed to save: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving mould hardness:', error);
      alert('Error saving data');
    } finally {
      setIsLoading(false);
    }
  };

  const getBorderColorMouldHardness = (rowIndex, fieldName) => {
    const fieldKey = `${rowIndex}-mouldHardness-${fieldName}`;
    const isFocused = focusedField === fieldKey;
    const hasError = mouldHardnessErrors[rowIndex]?.[fieldName];
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    return '#e2e8f0'; // default gray
  };

  const getPairInputBorderColor = (rowIndex, fieldName, pairIdx, position) => {
    const fieldKey = `${rowIndex}-mouldHardness-${fieldName}-${pairIdx}-${position}`;
    const isFocused = focusedField === fieldKey;
    const hasError = mouldHardnessErrors[rowIndex]?.[fieldName]?.[pairIdx]?.[position];
    
    // Get the pair values
    const pair = formData.mouldHardnessTable[rowIndex]?.[fieldName]?.[pairIdx];
    const fromVal = pair ? parseFloat(pair[0]) : NaN;
    const toVal = pair ? parseFloat(pair[1]) : NaN;
    const bothExist = pair && pair[0] && pair[1] && !isNaN(fromVal) && !isNaN(toVal);
    const isValid = bothExist && fromVal >= toVal;
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    if (isValid) {
      return '#10b981'; // green when valid
    }
    return '#e2e8f0'; // default gray
  };

  // Pattern Temp Table
  const addPatternTempRow = () => {
    setFormData(prev => ({
      ...prev,
      patternTempTable: [...prev.patternTempTable, { item: "", pp: "", sp: "" }]
    }));
  };

  const deletePatternTempRow = (index) => {
    setFormData(prev => ({
      ...prev,
      patternTempTable: prev.patternTempTable.filter((_, i) => i !== index)
    }));
  };

  const handlePatternTempChange = (index, field, value) => {
    const newTable = [...formData.patternTempTable];
    newTable[index][field] = value;
    setFormData(prev => ({ ...prev, patternTempTable: newTable }));
    
    // Clear error for this field when user enters data
    if (patternTempErrors[index]) {
      setPatternTempErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[index]) {
          delete newErrors[index][field];
          if (Object.keys(newErrors[index]).length === 0) {
            delete newErrors[index];
          }
        }
        return newErrors;
      });
    }
  };

  const getBorderColorPatternTemp = (rowIndex, fieldName) => {
    const fieldKey = `${rowIndex}-patternTemp-${fieldName}`;
    const isFocused = focusedField === fieldKey;
    const hasError = patternTempErrors[rowIndex]?.[fieldName];
    
    if (isFocused) {
      return '#10b981'; // green when focused
    }
    if (hasError) {
      return '#ef4444'; // red when error
    }
    return '#e2e8f0'; // default gray
  };

  // Handle Enter key navigation for Pattern Temperature table
  const handlePatternTempKeyDown = (e, currentRowIndex, currentField) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Auto-format to decimal if it's a PP/SP field
      if (['pp', 'sp'].includes(currentField)) {
        const currentValue = formData.patternTempTable[currentRowIndex][currentField];
        if (currentValue) {
          const formatted = formatDecimal(currentValue);
          handlePatternTempChange(currentRowIndex, currentField, formatted);
        }
      }
      
      const fields = ['item', 'pp', 'sp'];
      const currentFieldIndex = fields.indexOf(currentField);
      
      // Move to next field in same row
      if (currentFieldIndex >= 0 && currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        setFocusedField(`${currentRowIndex}-patternTemp-${nextField}`);
        setTimeout(() => {
          const nextInput = document.querySelector(`[data-field="${currentRowIndex}-patternTemp-${nextField}"]`);
          if (nextInput) nextInput.focus();
        }, 0);
      }
      // Move to first field of next row
      else if (currentRowIndex < formData.patternTempTable.length - 1) {
        const nextRowIndex = currentRowIndex + 1;
        setFocusedField(`${nextRowIndex}-patternTemp-item`);
        setTimeout(() => {
          const nextInput = document.querySelector(`[data-field="${nextRowIndex}-patternTemp-item"]`);
          if (nextInput) nextInput.focus();
        }, 0);
      }
    }
  };

  // Submit Pattern Temperature Data
  const handleSubmitPatternTemp = async () => {
    const errors = {};
    let hasCompleteRow = false;
    let hasAnyData = false;

    formData.patternTempTable.forEach((row, index) => {
      const rowErrors = {};
      
      // Check if row has any data
      const hasRowData = row.item || row.pp || row.sp;
      
      if (hasRowData) {
        hasAnyData = true;
        // If row has some data, all fields must be filled
        if (!row.item) rowErrors.item = true;
        if (!row.pp) rowErrors.pp = true;
        if (!row.sp) rowErrors.sp = true;
        
        if (Object.keys(rowErrors).length === 0) {
          hasCompleteRow = true;
        } else {
          errors[index] = rowErrors;
        }
      }
    });

    // If no data at all in any row, show errors on all rows
    if (!hasAnyData) {
      formData.patternTempTable.forEach((row, index) => {
        errors[index] = {
          item: true,
          pp: true,
          sp: true
        };
      });
      setPatternTempErrors(errors);
      return;
    }

    if (Object.keys(errors).length > 0) {
      setPatternTempErrors(errors);
      return;
    }

    if (!hasCompleteRow) {
      return;
    }

    // Proceed with save
    try {
      setIsLoading(true);
      
      // Filter out empty rows
      const validRows = formData.patternTempTable.filter(row => 
        row.item || row.pp || row.sp
      );
      
      // Save to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          shift: formData.shift,
          section: 'patternTemp',
          patternTempTable: validRows
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save pattern temperature data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {

        
        // Calculate new patternTempSNo based on saved rows
        const newPatternTempSNo = patternTempSNo + validRows.length;
        setPatternTempSNo(newPatternTempSNo);
        
        // Reset pattern temp table
        setFormData(prev => ({
          ...prev,
          patternTempTable: [{ item: "", pp: "", sp: "" }]
        }));
        
        // Clear errors
        setPatternTempErrors({});
      } else {
        throw new Error(result.message || 'Failed to save pattern temperature data');
      }
    } catch (error) {
      console.error('Error saving pattern temperature data:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Primary Data Handler
  const handleSavePrimary = async () => {
    setPrimarySubmitted(true);
    // Only validate date and shift (required to identify the entry)
    if (!formData.date) {
      return;
    }
    if (!formData.shift) {
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data to send - filter out empty members
      const filteredMembers = formData.members.filter(m => m && m.trim() !== '');
      
      // Validate max 4 members
      if (filteredMembers.length > 4) {
        return;
      }
      
      const dataToSend = {
        date: formData.date,
        shift: formData.shift,
        incharge: formData.incharge,
        ppOperator: formData.ppOperator,
        members: filteredMembers.length > 0 ? filteredMembers : null
      };

      const response = await fetch(`${API_ENDPOINTS.mouldingDisa}/primary`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Lock fields that now have values
        setLockedFields({
          incharge: !!(formData.incharge && formData.incharge.trim()),
          ppOperator: !!(formData.ppOperator && formData.ppOperator.trim())
        });
        
        // Update locked members count
        setLockedMembersCount(filteredMembers.length);
        
        // Add empty field if less than 4 to allow adding more
        if (filteredMembers.length < 4) {
          setFormData(prev => ({
            ...prev,
            members: [...filteredMembers, '']
          }));
        }

        setIsPrimaryDataSaved(true);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error saving primary data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Events Handler
  const handleSubmitEvents = async () => {
    // Check if there's any unlocked field with data to save
    const hasNewData = (!lockedEventsFields.significantEvent && formData.significantEvent?.trim()) ||
                       (!lockedEventsFields.maintenance && formData.maintenance?.trim()) ||
                       (!lockedEventsFields.supervisorName && formData.supervisorName?.trim());
    
    if (!hasNewData) {
      alert("Please fill in at least one unlocked field to save");
      return;
    }

    try {
      setIsLoading(true);
      
      // Save events data to backend
      const response = await fetch(API_ENDPOINTS.mouldingDisa, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formData.date,
          shift: formData.shift,
          section: 'events',
          significantEvent: formData.significantEvent,
          maintenance: formData.maintenance,
          supervisorName: formData.supervisorName
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save events data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Lock individual fields that now have data
        const newLockedFields = {
          significantEvent: !!(formData.significantEvent?.trim()),
          maintenance: !!(formData.maintenance?.trim()),
          supervisorName: !!(formData.supervisorName?.trim())
        };
        setLockedEventsFields(newLockedFields);
        
        // Check if all fields are now locked
        const allLocked = newLockedFields.significantEvent && 
                         newLockedFields.maintenance && 
                         newLockedFields.supervisorName;
        setIsEventsSaved(allLocked);
      } else {
        throw new Error(result.message || 'Failed to save events data');
      }
    } catch (error) {
      console.error('Error saving events data:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler (placeholder)
  const handleSubmit = () => {
    if (!isPrimaryDataSaved) {
      return;
    }
    console.log("Form Data:", formData);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="disamatic-header">
        <div className="disamatic-header-text">
          <h2>
            <Save size={27} style={{ color: '#5B9AA9' }} />
            Disamatic Product - Entry Form
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          DATE : {formData.date ? (() => {
            const [y, m, d] = formData.date.split('-');
            return `${d} / ${m} / ${y}`;
          })() : '-'}
        </div>
      </div>

      {/* Primary Section */}
      <div className="primary-header-container">
        <h3 className="primary-section-title">PRIMARY</h3>
      </div>
      
      {/* First Row: Date, Shift, Incharge, PP Operator */}
      <div className="primary-fields-row">
        <div className={`disamatic-form-group ${classFor(formData.date, primarySubmitted, true)} ${dateErrorHighlight ? 'error-highlight' : ''}`}>
          <label>Date <span style={{ color: '#ef4444',width: '2px' }}>*</span></label>
          <CustomDatePicker
            ref={dateRef}
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            onKeyDown={(e) => handlePrimaryKeyDown(e, getNextAfterDate(), 'date')}
          />
        </div>
        <div 
          className={`disamatic-form-group ${classFor(formData.shift, primarySubmitted, true)} ${shiftErrorHighlight ? 'error-highlight' : ''}`}
          onMouseDownCapture={(e) => {
            if (!formData.date && e.target.tagName !== 'SELECT') {
              setDateErrorHighlight(true);
            }
          }}
        >
          <label>Shift <span style={{ color: '#ef4444' }}>*</span></label>
          <ShiftDropdown
            ref={shiftRef}
            value={formData.shift}
            onChange={e => handleChange("shift", e.target.value)}
            disabled={!formData.date}
            onKeyDown={(e) => handlePrimaryKeyDown(e, getNextAfterShift(), 'shift')}
            onMouseDown={(e) => {
              if (!formData.date) {
                setDateErrorHighlight(true);
              }
            }}
          />
        </div>
        <div 
          className={`disamatic-form-group ${classFor(formData.incharge, primarySubmitted, false, lockedFields.incharge)} ${inchargeErrorHighlight ? 'error-highlight' : ''}`}
          onMouseDownCapture={(e) => {
            if (e.target.tagName !== 'INPUT') {
              if (!formData.date) {
                setDateErrorHighlight(true);
                setInchargeErrorHighlight(true);
                setTimeout(() => setInchargeErrorHighlight(false), 600);
              } else if (!formData.shift) {
                setShiftErrorHighlight(true);
                setInchargeErrorHighlight(true);
                setTimeout(() => setInchargeErrorHighlight(false), 600);
              }
            }
          }}
        >
          <label>
            Incharge 
            {lockedFields.incharge && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
          </label>
          <input 
            ref={inchargeRef}
            type="text" 
            value={formData.incharge} 
            onChange={e => handleChange("incharge", e.target.value)}
            placeholder="Enter incharge name"
            disabled={!formData.date || !formData.shift || lockedFields.incharge}
            style={{ opacity: lockedFields.incharge ? 0.6 : 1 }}
            onKeyDown={(e) => handlePrimaryKeyDown(e, getNextAfterIncharge(), 'incharge')}
            onMouseDown={(e) => {
              if (!formData.date) {
                setDateErrorHighlight(true);
                setInchargeErrorHighlight(true);
                setTimeout(() => setInchargeErrorHighlight(false), 600);
              } else if (!formData.shift) {
                setShiftErrorHighlight(true);
                setInchargeErrorHighlight(true);
                setTimeout(() => setInchargeErrorHighlight(false), 600);
              }
            }}
          />
        </div>
        <div 
          className={`disamatic-form-group ${classFor(formData.ppOperator, primarySubmitted, false, lockedFields.ppOperator)} ${ppOperatorErrorHighlight ? 'error-highlight' : ''}`}
          onMouseDownCapture={(e) => {
            if (e.target.tagName !== 'INPUT') {
              if (!formData.date) {
                setDateErrorHighlight(true);
                setPpOperatorErrorHighlight(true);
                setTimeout(() => setPpOperatorErrorHighlight(false), 600);
              } else if (!formData.shift) {
                setShiftErrorHighlight(true);
                setPpOperatorErrorHighlight(true);
                setTimeout(() => setPpOperatorErrorHighlight(false), 600);
              }
            }
          }}
        >
          <label>
            PP Operator
            {lockedFields.ppOperator && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
          </label>
          <input 
            ref={ppOperatorRef}
            type="text" 
            value={formData.ppOperator} 
            onChange={e => handleChange("ppOperator", e.target.value)}
            placeholder="Enter PP Operator name"
            disabled={!formData.date || !formData.shift || lockedFields.ppOperator}
            style={{ opacity: lockedFields.ppOperator ? 0.6 : 1 }}
            onKeyDown={(e) => handlePrimaryKeyDown(e, getNextAfterPpOperator(), 'ppOperator')}
            onMouseDown={(e) => {
              if (!formData.date) {
                setDateErrorHighlight(true);
                setPpOperatorErrorHighlight(true);
                setTimeout(() => setPpOperatorErrorHighlight(false), 600);
              } else if (!formData.shift) {
                setShiftErrorHighlight(true);
                setPpOperatorErrorHighlight(true);
                setTimeout(() => setPpOperatorErrorHighlight(false), 600);
              }
            }}
          />
        </div>
      </div>
      
      {/* Second Row: Members Present */}
      <div className="primary-fields-row">
        <div 
          className={`disamatic-form-group ${membersErrorHighlight ? 'error-highlight' : ''}`} 
          style={{ gridColumn: '1 / -1' }}
          onMouseDownCapture={(e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
              if (!formData.date) {
                setDateErrorHighlight(true);
                setMembersErrorHighlight(true);
                setTimeout(() => setMembersErrorHighlight(false), 600);
              } else if (!formData.shift) {
                setShiftErrorHighlight(true);
                setMembersErrorHighlight(true);
                setTimeout(() => setMembersErrorHighlight(false), 600);
              }
            }
          }}
        >
          <label>
            Members Present
            {lockedMembersCount > 0 && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ {lockedMembersCount} Locked</span>}
          </label>
          <div className="disamatic-members-container">
            {formData.members.map((member, index) => (
              <div key={index} className="disamatic-member-input-wrapper">
                <input
                  type="text"
                  value={member}
                  onChange={e => handleMemberChange(index, e.target.value)}
                  placeholder={`Enter member name ${index + 1}`}
                  className="disamatic-member-input"
                  disabled={!formData.date || !formData.shift || index < lockedMembersCount}
                  style={{ opacity: index < lockedMembersCount ? 0.6 : 1 }}
                  onMouseDown={(e) => {
                    if (!formData.date) {
                      setDateErrorHighlight(true);
                      setMembersErrorHighlight(true);
                      setTimeout(() => setMembersErrorHighlight(false), 600);
                    } else if (!formData.shift) {
                      setShiftErrorHighlight(true);
                      setMembersErrorHighlight(true);
                      setTimeout(() => setMembersErrorHighlight(false), 600);
                    }
                  }}
                />
                {formData.members.length > 1 && index >= lockedMembersCount && (
                  <button
                    type="button"
                    onClick={() => removeMemberField(index)}
                    className="disamatic-remove-member-btn"
                    title="Remove member"
                    disabled={!formData.date || !formData.shift}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            {formData.members.length < 4 && (
              <button
                type="button"
                onClick={addMemberField}
                className="disamatic-add-member-btn"
                title="Add another member"
                disabled={!formData.date || !formData.shift}
              >
                <Plus size={16} />
                Add Member
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Primary Submit Container */}
      <div className="disamatic-submit-container" style={{ gap: '1rem' }}>
        {isLoading ? (
          <div style={{ padding: '0.75rem 1.5rem', color: '#64748b', fontWeight: 500 }}>
            Loading...
          </div>
        ) : (
          <SubmitButton ref={primarySaveButtonRef} onClick={handleSavePrimary}>
            {isPrimaryDataSaved ? "Update Primary Data" : "Save Primary"}
          </SubmitButton>
        )}
      </div>

      {/* Production Table */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="disamatic-section-header">
          <h3 className="disamatic-section-title">Production Table {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}</h3>
          <div className="disamatic-section-actions">
            {formData.productionTable.length > 1 && (
              <button
                type="button"
                onClick={() => deleteProductionRow(formData.productionTable.length - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="button" onClick={addProductionRow} className="disamatic-add-row-btn">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Mould Counter No.</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Component Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Produced </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Poured </th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Cycle Time</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Moulds/Hour</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {formData.productionTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 500, color: '#475569' }}>{nextSNo + index}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.counterNo}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleProductionChange(index, 'counterNo', value);
                      }}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'counterNo')}
                      data-field={`${index}-counterNo`}
                      placeholder="Counter No"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'counterNo')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-counterNo`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.componentName}
                      onChange={e => handleProductionChange(index, 'componentName', e.target.value)}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'componentName')}
                      data-field={`${index}-componentName`}
                      placeholder="Component Name"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'componentName')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-componentName`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.produced}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleProductionChange(index, 'produced', value);
                      }}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'produced')}
                      data-field={`${index}-produced`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'produced')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-produced`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.poured}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleProductionChange(index, 'poured', value);
                      }}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'poured')}
                      data-field={`${index}-poured`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'poured')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-poured`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div data-field={`${index}-cycleTime`}>
                      <CustomTimeInput
                        value={createTimeFromString(row.cycleTime)}
                        onChange={(timeObj) => handleProductionChange(index, 'cycleTime', formatTimeToString(timeObj))}
                        hasError={productionErrors[index]?.cycleTime && focusedField !== `${index}-cycleTime`}
                        onFocus={() => setFocusedField(`${index}-cycleTime`)}
                        onBlur={() => setFocusedField(null)}
                        onEnterPress={(e) => handleProductionKeyDown(e, index, 'cycleTime')}
                        aria-label="Cycle Time"
                      />
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.mouldsPerHour}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleProductionChange(index, 'mouldsPerHour', value);
                      }}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'mouldsPerHour')}
                      data-field={`${index}-mouldsPerHour`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'mouldsPerHour')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-mouldsPerHour`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={e => handleProductionChange(index, 'remarks', e.target.value)}
                      onKeyDown={e => handleProductionKeyDown(e, index, 'remarks')}
                      data-field={`${index}-remarks`}
                      placeholder="Remarks"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColor(index, 'remarks')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-remarks`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0' }}>
          <SubmitButton onClick={handleSubmitProduction} disabled={!isPrimaryDataSaved}>
            Save Production Data
          </SubmitButton>
        </div>
      </div>

      {/* Next Shift Plan Table */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="disamatic-section-header">
          <h3 className="disamatic-section-title">Next Shift Plan {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked)</span>}</h3>
          <div className="disamatic-section-actions">
            {formData.nextShiftPlanTable.length > 1 && (
              <button
                type="button"
                onClick={() => deleteNextShiftPlanRow(formData.nextShiftPlanTable.length - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="button" onClick={addNextShiftPlanRow} className="disamatic-add-row-btn">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Component Name</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Planned Moulds</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {formData.nextShiftPlanTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 500, color: '#475569' }}>{nextShiftPlanSNo + index}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.componentName}
                      onChange={e => handleNextShiftPlanChange(index, 'componentName', e.target.value)}
                      onKeyDown={e => handleNextShiftPlanKeyDown(e, index, 'componentName')}
                      data-field={`${index}-nextShiftPlan-componentName`}
                      placeholder="Component Name"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorNextShiftPlan(index, 'componentName')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-nextShiftPlan-componentName`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.plannedMoulds}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleNextShiftPlanChange(index, 'plannedMoulds', value);
                      }}
                      onKeyDown={e => handleNextShiftPlanKeyDown(e, index, 'plannedMoulds')}
                      data-field={`${index}-nextShiftPlan-plannedMoulds`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorNextShiftPlan(index, 'plannedMoulds')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-nextShiftPlan-plannedMoulds`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={e => handleNextShiftPlanChange(index, 'remarks', e.target.value)}
                      onKeyDown={e => handleNextShiftPlanKeyDown(e, index, 'remarks')}
                      data-field={`${index}-nextShiftPlan-remarks`}
                      placeholder="Remarks"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorNextShiftPlan(index, 'remarks')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-nextShiftPlan-remarks`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <SubmitButton onClick={handleSubmitNextShiftPlan} disabled={!isPrimaryDataSaved}>
            Save Next Shift Plan
          </SubmitButton>
        </div>
      </div>

      {/* Delays Table */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="disamatic-section-header">
          <h3 className="disamatic-section-title">Delays {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked)</span>}</h3>
          <div className="disamatic-section-actions">
            {formData.delaysTable.length > 1 && (
              <button
                type="button"
                onClick={() => deleteDelaysRow(formData.delaysTable.length - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="button" onClick={addDelaysRow} className="disamatic-add-row-btn">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Delays</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Duration (Minutes)</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Duration (From - To)</th>
              </tr>
            </thead>
            <tbody>
              {formData.delaysTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 500, color: '#475569' }}>{delaysSNo + index}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.delays}
                      onChange={e => handleDelaysChange(index, 'delays', e.target.value)}
                      onKeyDown={e => handleDelaysKeyDown(e, index, 'delays')}
                      data-field={`${index}-delays-delays`}
                      placeholder="Delay reason"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorDelays(index, 'delays')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-delays-delays`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.25rem' }}>
                        <PlusButton
                          onClick={() => addDurationInput(index)}
                          title="Add entry"
                          disabled={row.durationMinutes.length >= 10}
                        />
                        {row.durationMinutes.length > 1 && (
                          <MinusButton
                            onClick={() => removeDurationInput(index, row.durationMinutes.length - 1)}
                            title="Remove entry"
                          />
                        )}
                      </div>
                      <div style={{ 
                        flex: 1,
                        display: 'grid', 
                        gridTemplateColumns: row.durationMinutes.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                        gap: '0.5rem' 
                      }}>
                        {row.durationMinutes.map((value, inputIndex) => (
                          <input
                            key={inputIndex}
                            type="text"
                            value={value}
                            onChange={e => {
                              const numValue = e.target.value.replace(/[^0-9]/g, '');
                              const limitedValue = numValue && parseInt(numValue) > 30 ? '30' : numValue;
                              handleDurationInputChange(index, inputIndex, limitedValue);
                            }}
                            onKeyDown={e => handleDelaysKeyDown(e, index, 'durationMinutes', inputIndex)}
                            data-field={`${index}-delays-durationMinutes-${inputIndex}`}
                            placeholder="0"
                            maxLength="2"
                            style={{ 
                              width: '100%', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getDurationInputBorderColor(index, inputIndex)}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-delays-durationMinutes-${inputIndex}`)}
                            onBlur={() => setFocusedField(null)}
                            disabled={!isPrimaryDataSaved}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: row.fromTime.length === 1 ? '1fr' : 'repeat(2, 1fr)', 
                      gap: '0.5rem',
                      alignItems: 'start'
                    }}>
                      {row.fromTime.map((fromValue, inputIndex) => (
                        <div key={inputIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <div data-field={`${index}-delays-fromTime-${inputIndex}`} style={{ flex: 1 }}>
                            <CustomTimeInput
                              value={createTimeFromString(fromValue)}
                              onChange={(timeObj) => handleTimeInputChange(index, inputIndex, 'fromTime', formatTimeToString(timeObj))}
                              hasError={delaysErrors[index]?.fromTime?.[inputIndex]}
                              onFocus={() => setFocusedField(`${index}-delays-fromTime-${inputIndex}`)}
                              onBlur={() => setFocusedField(null)}
                              onEnterPress={(e) => handleDelaysKeyDown(e, index, 'fromTime', inputIndex)}
                              aria-label="From Time"
                            />
                          </div>
                          <span style={{ color: '#64748b', fontWeight: 600 }}>-</span>
                          <div data-field={`${index}-delays-toTime-${inputIndex}`} style={{ flex: 1 }}>
                            <CustomTimeInput
                              value={createTimeFromString(row.toTime[inputIndex])}
                              onChange={(timeObj) => handleTimeInputChange(index, inputIndex, 'toTime', formatTimeToString(timeObj))}
                              hasError={delaysErrors[index]?.toTime?.[inputIndex]}
                              onFocus={() => setFocusedField(`${index}-delays-toTime-${inputIndex}`)}
                              onBlur={() => setFocusedField(null)}
                              onEnterPress={(e) => handleDelaysKeyDown(e, index, 'toTime', inputIndex)}
                              aria-label="To Time"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          {delaysSubmitError && (
            <InlineLoader 
              message={delaysSubmitError}
              variant="danger"
              size="medium"
            />
          )}
          <SubmitButton onClick={handleSubmitDelays} disabled={!isPrimaryDataSaved}>
            Save Delays
          </SubmitButton>
        </div>
      </div>

      {/* Mould Hardness Table */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="disamatic-section-header">
          <h3 className="disamatic-section-title">Mould Hardness {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked)</span>}</h3>
          <div className="disamatic-section-actions">
            {formData.mouldHardnessTable.length > 1 && (
              <button
                type="button"
                onClick={() => deleteMouldHardnessRow(formData.mouldHardnessTable.length - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="button" onClick={addMouldHardnessRow} className="disamatic-add-row-btn">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th rowSpan={2} style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600, verticalAlign: 'middle' }}>S.No</th>
                <th rowSpan={2} style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600, verticalAlign: 'middle' }}>Component Name</th>
                <th colSpan={2} style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>Mould Penetrant tester (N/cm²)</th>
                <th colSpan={2} style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>B - Scale</th>
                <th rowSpan={2} style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600, verticalAlign: 'middle' }}>Remarks</th>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>PP</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>SP</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>PP</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', fontWeight: 600 }}>SP</th>
              </tr>
            </thead>
            <tbody>
              {formData.mouldHardnessTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{mouldHardnessSNo + index}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <PlusButton
                          onClick={() => addMouldHardnessPair(index)}
                          title="Add pair"
                        />
                        {row.mpPP.length > 1 && (
                          <MinusButton
                            onClick={() => removeMouldHardnessPair(index)}
                            title="Remove pair"
                          />
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <input
                      type="text"
                      value={row.componentName}
                      onChange={e => handleMouldHardnessChange(index, 'componentName', e.target.value)}
                      onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'componentName')}
                      data-field={`${index}-mouldHardness-componentName`}
                      placeholder="Component Name"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorMouldHardness(index, 'componentName')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-mouldHardness-componentName`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {row.mpPP.map((pair, pairIdx) => (
                        <div key={pairIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <input
                            type="text"
                            value={pair[0]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'mpPP', value, pairIdx, 0);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'mpPP', pairIdx, 0)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'mpPP', formatted, pairIdx, 0);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-mpPP-${pairIdx}-from`}
                            placeholder="From"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'mpPP', pairIdx, 'from')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-mpPP-${pairIdx}-from`)}
                            disabled={!isPrimaryDataSaved}
                          />
                          <span style={{ fontWeight: 600, color: '#64748b' }}>-</span>
                          <input
                            type="text"
                            value={pair[1]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'mpPP', value, pairIdx, 1);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'mpPP', pairIdx, 1)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'mpPP', formatted, pairIdx, 1);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-mpPP-${pairIdx}-to`}
                            placeholder="To"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'mpPP', pairIdx, 'to')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-mpPP-${pairIdx}-to`)}
                            disabled={!isPrimaryDataSaved}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {row.mpSP.map((pair, pairIdx) => (
                        <div key={pairIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <input
                            type="text"
                            value={pair[0]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'mpSP', value, pairIdx, 0);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'mpSP', pairIdx, 0)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'mpSP', formatted, pairIdx, 0);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-mpSP-${pairIdx}-from`}
                            placeholder="From"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'mpSP', pairIdx, 'from')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-mpSP-${pairIdx}-from`)}
                            disabled={!isPrimaryDataSaved}
                          />
                          <span style={{ fontWeight: 600, color: '#64748b' }}>-</span>
                          <input
                            type="text"
                            value={pair[1]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'mpSP', value, pairIdx, 1);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'mpSP', pairIdx, 1)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'mpSP', formatted, pairIdx, 1);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-mpSP-${pairIdx}-to`}
                            placeholder="To"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'mpSP', pairIdx, 'to')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-mpSP-${pairIdx}-to`)}
                            disabled={!isPrimaryDataSaved}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {row.bsPP.map((pair, pairIdx) => (
                        <div key={pairIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <input
                            type="text"
                            value={pair[0]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'bsPP', value, pairIdx, 0);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'bsPP', pairIdx, 0)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'bsPP', formatted, pairIdx, 0);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-bsPP-${pairIdx}-from`}
                            placeholder="From"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'bsPP', pairIdx, 'from')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-bsPP-${pairIdx}-from`)}
                            disabled={!isPrimaryDataSaved}
                          />
                          <span style={{ fontWeight: 600, color: '#64748b' }}>-</span>
                          <input
                            type="text"
                            value={pair[1]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'bsPP', value, pairIdx, 1);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'bsPP', pairIdx, 1)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'bsPP', formatted, pairIdx, 1);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-bsPP-${pairIdx}-to`}
                            placeholder="To"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'bsPP', pairIdx, 'to')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-bsPP-${pairIdx}-to`)}
                            disabled={!isPrimaryDataSaved}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {row.bsSP.map((pair, pairIdx) => (
                        <div key={pairIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <input
                            type="text"
                            value={pair[0]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'bsSP', value, pairIdx, 0);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'bsSP', pairIdx, 0)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'bsSP', formatted, pairIdx, 0);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-bsSP-${pairIdx}-from`}
                            placeholder="From"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'bsSP', pairIdx, 'from')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-bsSP-${pairIdx}-from`)}
                            disabled={!isPrimaryDataSaved}
                          />
                          <span style={{ fontWeight: 600, color: '#64748b' }}>-</span>
                          <input
                            type="text"
                            value={pair[1]}
                            onChange={e => {
                              const value = cleanDecimalInput(e.target.value);
                              handleMouldHardnessChange(index, 'bsSP', value, pairIdx, 1);
                            }}
                            onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'bsSP', pairIdx, 1)}
                            onBlur={e => {
                              const formatted = formatDecimal(e.target.value);
                              if (formatted !== e.target.value) {
                                handleMouldHardnessChange(index, 'bsSP', formatted, pairIdx, 1);
                              }
                              setFocusedField(null);
                            }}
                            data-field={`${index}-mouldHardness-bsSP-${pairIdx}-to`}
                            placeholder="To"
                            style={{ 
                              width: '70px', 
                              padding: '0.5rem', 
                              borderRadius: '4px', 
                              textAlign: 'center',
                              border: `2px solid ${getPairInputBorderColor(index, 'bsSP', pairIdx, 'to')}`,
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={() => setFocusedField(`${index}-mouldHardness-bsSP-${pairIdx}-to`)}
                            disabled={!isPrimaryDataSaved}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={e => handleMouldHardnessChange(index, 'remarks', e.target.value)}
                      onKeyDown={e => handleMouldHardnessKeyDown(e, index, 'remarks')}
                      data-field={`${index}-mouldHardness-remarks`}
                      placeholder="Remarks"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorMouldHardness(index, 'remarks')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-mouldHardness-remarks`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          {mouldHardnessSubmitError && (
            <InlineLoader 
              message={mouldHardnessSubmitError}
              variant="danger"
              size="medium"
            />
          )}
          <SubmitButton onClick={handleSubmitMouldHardness} disabled={!isPrimaryDataSaved}>
            Save Mould Hardness
          </SubmitButton>
        </div>
      </div>

      {/* Pattern Temp Table */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <div className="disamatic-section-header">
          <h3 className="disamatic-section-title">Pattern Temperature {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked)</span>}</h3>
          <div className="disamatic-section-actions">
            {formData.patternTempTable.length > 1 && (
              <button
                type="button"
                onClick={() => deletePatternTempRow(formData.patternTempTable.length - 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="button" onClick={addPatternTempRow} className="disamatic-add-row-btn">
              <Plus size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>S.No</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>Item</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>PP</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #e2e8f0', fontWeight: 600 }}>SP</th>
              </tr>
            </thead>
            <tbody>
              {formData.patternTempTable.map((row, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>{patternTempSNo + index}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.item}
                      onChange={e => handlePatternTempChange(index, 'item', e.target.value)}
                      onKeyDown={e => handlePatternTempKeyDown(e, index, 'item')}
                      data-field={`${index}-patternTemp-item`}
                      placeholder="Item"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorPatternTemp(index, 'item')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-patternTemp-item`)}
                      onBlur={() => setFocusedField(null)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.pp}
                      onChange={e => {
                        const value = cleanDecimalInput(e.target.value);
                        handlePatternTempChange(index, 'pp', value);
                      }}
                      onKeyDown={e => handlePatternTempKeyDown(e, index, 'pp')}
                      onBlur={e => {
                        const formatted = formatDecimal(e.target.value);
                        if (formatted !== e.target.value) {
                          handlePatternTempChange(index, 'pp', formatted);
                        }
                        setFocusedField(null);
                      }}
                      data-field={`${index}-patternTemp-pp`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorPatternTemp(index, 'pp')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-patternTemp-pp`)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <input
                      type="text"
                      value={row.sp}
                      onChange={e => {
                        const value = cleanDecimalInput(e.target.value);
                        handlePatternTempChange(index, 'sp', value);
                      }}
                      onKeyDown={e => handlePatternTempKeyDown(e, index, 'sp')}
                      onBlur={e => {
                        const formatted = formatDecimal(e.target.value);
                        if (formatted !== e.target.value) {
                          handlePatternTempChange(index, 'sp', formatted);
                        }
                        setFocusedField(null);
                      }}
                      data-field={`${index}-patternTemp-sp`}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '0.5rem', 
                        borderRadius: '4px',
                        border: `2px solid ${getBorderColorPatternTemp(index, 'sp')}`,
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={() => setFocusedField(`${index}-patternTemp-sp`)}
                      disabled={!isPrimaryDataSaved}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <SubmitButton onClick={handleSubmitPatternTemp} disabled={!isPrimaryDataSaved}>
            Save Pattern Temperature
          </SubmitButton>
        </div>
      </div>

      {/* Event Section */}
      <div className="disamatic-section" style={{ opacity: isPrimaryDataSaved ? 1 : 0.6, pointerEvents: isPrimaryDataSaved ? 'auto' : 'none' }}>
        <h3 className="disamatic-section-title">
          Significant Events & Maintenance 
          {!isPrimaryDataSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#ef4444' }}>(Locked - Save Primary Data First)</span>}
          {isPrimaryDataSaved && isEventsSaved && <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#10b981' }}>(Saved)</span>}
        </h3>
        
        <div className="disamatic-form-grid" style={{ marginTop: '1rem' }}>
          <div className="disamatic-form-group full-width">
            <label>
              Significant Event :
              {lockedEventsFields.significantEvent && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
            <textarea
              value={formData.significantEvent}
              onChange={e => handleChange("significantEvent", e.target.value)}
              placeholder="Enter any significant events"
              className="disamatic-textarea"
              rows={3}
              disabled={!isPrimaryDataSaved || lockedEventsFields.significantEvent}
            />
          </div>
          
          <div className="disamatic-form-group full-width">
            <label>
              Maintenance :
              {lockedEventsFields.maintenance && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
            <textarea
              value={formData.maintenance}
              onChange={e => handleChange("maintenance", e.target.value)}
              placeholder="Enter maintenance details"
              className="disamatic-textarea"
              rows={3}
              disabled={!isPrimaryDataSaved || lockedEventsFields.maintenance}
            />
          </div>
          
          <div className="disamatic-form-group">
            <label>
              Supervisor Name :
              {lockedEventsFields.supervisorName && <span style={{ fontSize: '0.75rem', color: '#10b981', marginLeft: '0.5rem' }}>✓ Locked</span>}
            </label>
            <input
              type="text"
              value={formData.supervisorName}
              onChange={e => handleChange("supervisorName", e.target.value)}
              placeholder="Enter supervisor name"
              disabled={!isPrimaryDataSaved || lockedEventsFields.supervisorName}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <SubmitButton onClick={handleSubmitEvents} disabled={!isPrimaryDataSaved || isEventsSaved}>
            Save Events
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

export default DisamaticProduct;
