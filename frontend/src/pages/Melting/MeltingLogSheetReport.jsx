import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, EditButton, DeleteButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import '../../styles/PageStyles/Melting/MeltingLogSheetReport.css';

const MeltingLogSheetReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [show, setShow] = useState({ table0: true, table1: true, table2: true, table3: true, table4: true, table5: true });
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load current data on mount
  useEffect(() => {
    loadCurrentData();
  }, []);

  const loadCurrentData = async () => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/v1/melting-logs/filter?startDate=${currentDate}&endDate=${currentDate}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data?.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.date || a.createdAt || 0).getTime();
          const db = new Date(b.date || b.createdAt || 0).getTime();
          return db - da;
        });
        setEntries(sorted);
      } else {
        setEntries([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch current data');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    if (!startDate) {
      alert('Please select at least a start date');
      return;
    }
    
    // Use endDate if provided, otherwise use startDate for single day filter
    const filterEndDate = endDate || startDate;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/v1/melting-logs/filter?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(filterEndDate)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data?.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.date || a.createdAt || 0).getTime();
          const db = new Date(b.date || b.createdAt || 0).getTime();
          return db - da;
        });
        setEntries(sorted);
      } else {
        setEntries([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch report data');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    loadCurrentData(); // Reload current data when filters are cleared
  };

  const toggle = (key) => setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  const [confirm, setConfirm] = useState({ open: false, row: null });
  const [editModal, setEditModal] = useState({ open: false, row: null });
  const [editForm, setEditForm] = useState({});
  const [saveConfirm, setSaveConfirm] = useState({ open: false });

  const requestDelete = (row) => {
    if (!row?._id) return;
    setConfirm({ open: true, row });
  };

  const closeConfirm = () => setConfirm({ open: false, row: null });

  const performDelete = async () => {
    const row = confirm.row;
    if (!row?._id) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/melting-logs/${row._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (response.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== row._id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete the record');
      }
    } catch (e) {
      alert(e.message || 'Failed to delete the record');
    } finally {
      closeConfirm();
    }
  };

  const requestEdit = (row) => {
    if (!row?._id) return;
    setEditForm({
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      shift: row.shift || '',
      furnaceNo: row.furnaceNo || '',
      panel: row.panel || '',
      cumulativeLiquidMetal: row.cumulativeLiquidMetal ?? '',
      finalKWHr: row.finalKWHr ?? '',
      initialKWHr: row.initialKWHr ?? '',
      totalUnits: row.totalUnits ?? '',
      cumulativeUnits: row.cumulativeUnits ?? '',
      heatNo: row.heatNo ?? '',
      grade: row.grade ?? '',
      chargingTime: row.chargingTime ?? '',
      ifBath: row.ifBath ?? '',
      liquidMetalPressPour: row.liquidMetalPressPour ?? '',
      liquidMetalHolder: row.liquidMetalHolder ?? '',
      sgMsSteel: row.sgMsSteel ?? '',
      greyMsSteel: row.greyMsSteel ?? '',
      returnsSg: row.returnsSg ?? '',
      gl: row.gl ?? '',
      pigIron: row.pigIron ?? '',
      borings: row.borings ?? '',
      finalBath: row.finalBath ?? '',
      charCoal: row.charCoal ?? '',
      cpcFur: row.cpcFur ?? '',
      cpcLc: row.cpcLc ?? '',
      siliconCarbideFur: row.siliconCarbideFur ?? '',
      ferrosiliconFur: row.ferrosiliconFur ?? '',
      ferrosiliconLc: row.ferrosiliconLc ?? '',
      ferroManganeseFur: row.ferroManganeseFur ?? '',
      ferroManganeseLc: row.ferroManganeseLc ?? '',
      cu: row.cu ?? '',
      cr: row.cr ?? '',
      pureMg: row.pureMg ?? '',
      labCoinTime: row.labCoinTime ?? '',
      labCoinTempC: row.labCoinTempC ?? '',
      deslagingTimeFrom: row.deslagingTimeFrom ?? '',
      deslagingTimeTo: row.deslagingTimeTo ?? '',
      metalReadyTime: row.metalReadyTime ?? '',
      waitingForTappingFrom: row.waitingForTappingFrom ?? '',
      waitingForTappingTo: row.waitingForTappingTo ?? '',
      reason: row.reason ?? '',
      time: row.time ?? '',
      tempCSg: row.tempCSg ?? '',
      tempCGrey: row.tempCGrey ?? '',
      directFurnace: row.directFurnace ?? '',
      holderToFurnace: row.holderToFurnace ?? '',
      furnaceToHolder: row.furnaceToHolder ?? '',
      disaNo: row.disaNo ?? '',
      item: row.item ?? '',
      furnace1Kw: row.furnace1Kw ?? '',
      furnace1A: row.furnace1A ?? '',
      furnace1V: row.furnace1V ?? '',
      furnace4Hz: row.furnace4Hz ?? '',
      furnace4Gld: row.furnace4Gld ?? '',
      furnace4KwHr: row.furnace4KwHr ?? ''
    });
    setEditModal({ open: true, row });
  };

  const closeEditModal = () => setEditModal({ open: false, row: null });
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const openSaveConfirm = () => setSaveConfirm({ open: true });
  const closeSaveConfirm = () => setSaveConfirm({ open: false });
  const performSave = async () => {
    const row = editModal.row;
    if (!row?._id) return;
    try {
      const payload = { ...editForm };
      
      // Convert numeric string fields to numbers, and remove empty fields
      const numericFields = ['cumulativeLiquidMetal', 'finalKWHr', 'initialKWHr', 'totalUnits', 'cumulativeUnits'];
      numericFields.forEach(field => {
        if (payload[field] === '' || payload[field] == null) {
          // Don't send empty values - keep existing value in DB
          delete payload[field];
        } else {
          // Convert to number
          payload[field] = Number(payload[field]);
        }
      });
      
      console.log('Sending payload:', payload); // Debug log
      
      const response = await fetch(`http://localhost:5000/api/v1/melting-logs/${row._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      const res = await response.json();
      console.log('Response from server:', res); // Debug log
      if (res?.success) {
        // Reload the data to get the correct values from backend
        if (startDate && endDate) {
          loadFilteredData();
        }
        setEditModal({ open: false, row: null });
        setSaveConfirm({ open: false });
      } else {
        alert(res?.message || 'Failed to update the record');
      }
    } catch (e) {
      console.error('Save error:', e); // Debug log
      alert(e.message || 'Failed to update the record');
    } finally {
      setSaveConfirm({ open: false });
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('en-GB');
  };

  const buildColumns = () => {
    const columns = [
      { key: 'date', label: 'Date', width: '100px', render: (r) => formatDate(r.date) },
      { key: 'shift', label: 'Shift', width: '80px', render: (r) => r.shift || '-' },
      { key: 'furnaceNo', label: 'Furnace No', width: '100px', render: (r) => r.furnaceNo || '-' },
      { key: 'panel', label: 'Panel', width: '80px', render: (r) => r.panel || '-' },
    ];

    if (show.table0) {
      columns.push(
        { key: 'finalKWHr', label: 'Final KW/Hr', width: '100px', render: (r) => r.finalKWHr ?? '-' },
        { key: 'initialKWHr', label: 'Initial KW/Hr', width: '100px', render: (r) => r.initialKWHr ?? '-' },
        { key: 'totalUnits', label: 'Total Units', width: '100px', render: (r) => r.totalUnits ?? '-' },
        { key: 'cumulativeUnits', label: 'Cumulative Units', width: '130px', render: (r) => r.cumulativeUnits ?? '-' },
        { key: 'cumulativeLiquidMetal', label: 'Cumulative Liquid Metal (kgs)', width: '180px', render: (r) => r.cumulativeLiquidMetal ?? '-' }
      );
    }

    if (show.table1) {
      columns.push(
        { key: 'heatNo', label: 'Heat No', width: '80px', render: (r) => r.heatNo ?? '-' },
        { key: 'grade', label: 'Grade', width: '80px', render: (r) => r.grade ?? '-' },
        { key: 'chargingTime', label: 'Time', width: '80px', render: (r) => r.chargingTime ?? '-' },
        { key: 'liquidMetalHolder', label: 'Holder (kgs)', width: '110px', render: (r) => r.liquidMetalHolder ?? '-' },
        { key: 'liquidMetalPressPour', label: 'Liquid Metal (kgs)', width: '130px', render: (r) => r.liquidMetalPressPour ?? '-' },
        { key: 'sgMsSteel', label: 'SG-MS Steel', width: '110px', render: (r) => r.sgMsSteel ?? '-' },
        { key: 'greyMsSteel', label: 'MS Steel (100% Grey)', width: '150px', render: (r) => r.greyMsSteel ?? '-' },
        { key: 'returnsSg', label: 'Pig Iron (100% SG)', width: '140px', render: (r) => r.returnsSg ?? '-' },
        { key: 'pigIron', label: 'Pig Iron', width: '90px', render: (r) => r.pigIron ?? '-' },
        { key: 'borings', label: 'Borings', width: '80px', render: (r) => r.borings ?? '-' },
        { key: 'gl', label: 'GL', width: '70px', render: (r) => r.gl ?? '-' },
        { key: 'ifBath', label: 'If Bath', width: '80px', render: (r) => r.ifBath ?? '-' },
        { key: 'finalBath', label: 'Final (Kgs)', width: '100px', render: (r) => r.finalBath ?? '-' }
      );
    }

    if (show.table2) {
      columns.push(
        { key: 'charCoal', label: 'Char Coal', width: '90px', render: (r) => r.charCoal ?? '-' },
        { key: 'cpcFur', label: 'CPC (Fur)', width: '90px', render: (r) => r.cpcFur ?? '-' },
        { key: 'cpcLc', label: 'CPC (LC)', width: '90px', render: (r) => r.cpcLc ?? '-' },
        { key: 'ferrosiliconFur', label: 'Ferro Silicon (Fur)', width: '140px', render: (r) => r.ferrosiliconFur ?? '-' },
        { key: 'ferrosiliconLc', label: 'Ferro Silicon (LC)', width: '140px', render: (r) => r.ferrosiliconLc ?? '-' },
        { key: 'ferroManganeseFur', label: 'Fe Mn (Fur)', width: '110px', render: (r) => r.ferroManganeseFur ?? '-' },
        { key: 'ferroManganeseLc', label: 'Fe Mn (LC)', width: '110px', render: (r) => r.ferroManganeseLc ?? '-' },
        { key: 'siliconCarbideFur', label: 'SIC', width: '70px', render: (r) => r.siliconCarbideFur ?? '-' },
        { key: 'pureMg', label: 'Pure Mg', width: '80px', render: (r) => r.pureMg ?? '-' },
        { key: 'cu', label: 'Cu', width: '70px', render: (r) => r.cu ?? '-' },
        { key: 'cr', label: 'FE-Cr', width: '70px', render: (r) => r.cr ?? '-' }
      );
    }

    if (show.table3) {
      columns.push(
        { key: 'labCoinTime', label: 'Lab Coin Time', width: '110px', render: (r) => r.labCoinTime ?? '-' },
        { key: 'labCoinTempC', label: 'Temp (°C)', width: '90px', render: (r) => r.labCoinTempC ?? '-' },
        { key: 'deslagingTimeFrom', label: 'Deslagging From', width: '130px', render: (r) => r.deslagingTimeFrom ?? '-' },
        { key: 'deslagingTimeTo', label: 'Deslagging To', width: '120px', render: (r) => r.deslagingTimeTo ?? '-' },
        { key: 'metalReadyTime', label: 'Metal Ready', width: '110px', render: (r) => r.metalReadyTime ?? '-' },
        { key: 'waitingForTappingFrom', label: 'Wait for Tapping From', width: '160px', render: (r) => r.waitingForTappingFrom ?? '-' },
        { key: 'waitingForTappingTo', label: 'Wait for Tapping To', width: '150px', render: (r) => r.waitingForTappingTo ?? '-' },
        { key: 'reason', label: 'Reason', width: '100px', render: (r) => r.reason ?? '-' }
      );
    }

    if (show.table4) {
      columns.push(
        { key: 'time', label: 'Time', width: '80px', render: (r) => r.time ?? '-' },
        { key: 'tempCSg', label: 'Temp °C (Non-SG)', width: '130px', render: (r) => r.tempCSg ?? '-' },
        { key: 'tempCGrey', label: 'Temp °C (Grey)', width: '120px', render: (r) => r.tempCGrey ?? '-' },
        { key: 'directFurnace', label: 'Direct Furnace', width: '120px', render: (r) => r.directFurnace ?? '-' },
        { key: 'holderToFurnace', label: 'Holder → Furnace', width: '140px', render: (r) => r.holderToFurnace ?? '-' },
        { key: 'furnaceToHolder', label: 'Furnace → Holder', width: '140px', render: (r) => r.furnaceToHolder ?? '-' },
        { key: 'disaNo', label: 'DISA No', width: '90px', render: (r) => r.disaNo ?? '-' },
        { key: 'item', label: 'Item', width: '90px', render: (r) => r.item ?? '-' }
      );
    }

    if (show.table5) {
      columns.push(
        { key: 'furnace1Kw', label: 'Furnace 1-2-3 kW', width: '140px', render: (r) => r.furnace1Kw ?? '-' },
        { key: 'furnace1A', label: 'Furnace 1-2-3 A (2000-3500)', width: '200px', render: (r) => r.furnace1A ?? '-' },
        { key: 'furnace1V', label: 'Furnace 1-2-3 V (500-1000)', width: '200px', render: (r) => r.furnace1V ?? '-' },
        { key: 'furnace4Hz', label: 'F4 Hz', width: '80px', render: (r) => r.furnace4Hz ?? '-' },
        { key: 'furnace4Gld', label: 'F4 GLD (0.6000-95.00)', width: '170px', render: (r) => r.furnace4Gld ?? '-' },
        { key: 'furnace4KwHr', label: 'F4 kW/Hr', width: '100px', render: (r) => r.furnace4KwHr ?? '-' }
      );
    }

    return columns;
  };

  const renderActions = (row) => (
    <>
      <EditButton onClick={() => requestEdit(row)} />
      <DeleteButton onClick={() => requestDelete(row)} />
    </>
  );

  const PrimaryTable = ({ list, show }) => {
    const columns = buildColumns();

    return (
      <div className="chr-primary-table-wrap"> 
        <Table
          columns={columns}
          data={list}
          renderActions={renderActions}
          noDataMessage="No records found for the selected date range."
          minWidth={2000}
          striped={true}
          headerGradient={true}
        />
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="melting-log-report-header">
        <div className="melting-log-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Melting Log Sheet - Report
          </h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="melting-log-filter-container">
        <div className="melting-log-filter-group">
          <label>Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="melting-filter-group">
          <label>End Date</label>
          <CustomDatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <FilterButton onClick={loadFilteredData} disabled={loading}>
          {loading ? 'Loading...' : 'Filter'}
        </FilterButton>
        <ClearButton onClick={clearFilters}>
          Clear
        </ClearButton>
      </div>

      {/* Show/Hide Sections */}
      <div className="chr-checklist-container">
        <div className="chr-checklist-title">Show/Hide Sections</div>
        <div className="chr-checklist">
          <label className="chr-check">
            <input type="checkbox" checked={show.table0} onChange={() => toggle('table0')} />
            <span>Power & Cumulative</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table1} onChange={() => toggle('table1')} />
            <span>Charging (kgs)</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table2} onChange={() => toggle('table2')} />
            <span>Ferro Additions</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table3} onChange={() => toggle('table3')} />
            <span>Lab Coin & Timing</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table4} onChange={() => toggle('table4')} />
            <span>Metal Tapping</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table5} onChange={() => toggle('table5')} />
            <span>Electrical Readings</span>
          </label>
        </div>
      </div>

      {/* Results Table */}
      <PrimaryTable list={entries} show={show} />

      {/* Error Display */}
      {error && (
        <div className="chr-error">{error}
        </div>
      )}

      {/* Delete Confirmation Modal */}

      {confirm.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 20, width: 'min(420px, 95vw)', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Confirm Deletion</div>
            <div style={{ color: '#334155' }}>Are you sure you want to delete this record?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={closeConfirm} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
              <button onClick={performDelete} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {editModal.open && (
        <div
          onClick={closeEditModal}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 12, padding: 20, width: 'min(900px, 95vw)', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Edit Melting Log</div>
            </div>

            <div className="microtensile-form-grid">
              <div className="microtensile-form-group">
                <label>Date</label>
                <input type="date" name="date" value={editForm.date || ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Shift</label>
                <input type="text" name="shift" value={editForm.shift || ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Furnace No</label>
                <input type="text" name="furnaceNo" value={editForm.furnaceNo || ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Panel</label>
                <input type="text" name="panel" value={editForm.panel || ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Cumulative Liquid Metal</label>
                <input type="number" name="cumulativeLiquidMetal" value={editForm.cumulativeLiquidMetal ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Final KWHr</label>
                <input type="number" name="finalKWHr" value={editForm.finalKWHr ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Initial KWHr</label>
                <input type="number" name="initialKWHr" value={editForm.initialKWHr ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Total Units</label>
                <input type="number" name="totalUnits" value={editForm.totalUnits ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Cumulative Units</label>
                <input type="number" name="cumulativeUnits" value={editForm.cumulativeUnits ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Heat No</label>
                <input type="text" name="heatNo" value={editForm.heatNo ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Grade</label>
                <input type="text" name="grade" value={editForm.grade ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Charging Time</label>
                <input type="text" name="chargingTime" value={editForm.chargingTime ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>If Bath</label>
                <input type="text" name="ifBath" value={editForm.ifBath ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Press Pour (kgs)</label>
                <input type="text" name="liquidMetalPressPour" value={editForm.liquidMetalPressPour ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Holder (kgs)</label>
                <input type="text" name="liquidMetalHolder" value={editForm.liquidMetalHolder ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>SG-MS Steel</label>
                <input type="text" name="sgMsSteel" value={editForm.sgMsSteel ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Grey MS Steel</label>
                <input type="text" name="greyMsSteel" value={editForm.greyMsSteel ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Returns SG</label>
                <input type="text" name="returnsSg" value={editForm.returnsSg ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>GL</label>
                <input type="text" name="gl" value={editForm.gl ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Pig Iron</label>
                <input type="text" name="pigIron" value={editForm.pigIron ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Borings</label>
                <input type="text" name="borings" value={editForm.borings ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Final Bath</label>
                <input type="text" name="finalBath" value={editForm.finalBath ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>CharCoal</label>
                <input type="text" name="charCoal" value={editForm.charCoal ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>CPC (Fur)</label>
                <input type="text" name="cpcFur" value={editForm.cpcFur ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>CPC (LC)</label>
                <input type="text" name="cpcLc" value={editForm.cpcLc ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Silicon Carbide (Fur)</label>
                <input type="text" name="siliconCarbideFur" value={editForm.siliconCarbideFur ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Ferrosilicon (Fur)</label>
                <input type="text" name="ferrosiliconFur" value={editForm.ferrosiliconFur ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Ferrosilicon (LC)</label>
                <input type="text" name="ferrosiliconLc" value={editForm.ferrosiliconLc ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Fe Mn (Fur)</label>
                <input type="text" name="ferroManganeseFur" value={editForm.ferroManganeseFur ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Fe Mn (LC)</label>
                <input type="text" name="ferroManganeseLc" value={editForm.ferroManganeseLc ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Cu</label>
                <input type="text" name="cu" value={editForm.cu ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Cr</label>
                <input type="text" name="cr" value={editForm.cr ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Pure Mg</label>
                <input type="text" name="pureMg" value={editForm.pureMg ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Iron Pyrite</label>
                <input type="text" name="ironPyrite" value={editForm.ironPyrite ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Lab Coin Time</label>
                <input type="text" name="labCoinTime" value={editForm.labCoinTime ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Lab Coin Temp (°C)</label>
                <input type="text" name="labCoinTempC" value={editForm.labCoinTempC ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Deslag From</label>
                <input type="text" name="deslagingTimeFrom" value={editForm.deslagingTimeFrom ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Deslag To</label>
                <input type="text" name="deslagingTimeTo" value={editForm.deslagingTimeTo ?? ''} onChange={handleEditChange} />
              </div>
              
              <div className="microtensile-form-group">
                <label>Metal Ready Time</label>
                <input type="text" name="metalReadyTime" value={editForm.metalReadyTime ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Wait Tap From</label>
                <input type="text" name="waitingForTappingFrom" value={editForm.waitingForTappingFrom ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Wait Tap To</label>
                <input type="text" name="waitingForTappingTo" value={editForm.waitingForTappingTo ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Reason</label>
                <input type="text" name="reason" value={editForm.reason ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Time</label>
                <input type="text" name="time" value={editForm.time ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Temp C (SG)</label>
                <input type="text" name="tempCSg" value={editForm.tempCSg ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Temp C (Grey)</label>
                <input type="text" name="tempCGrey" value={editForm.tempCGrey ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Direct Furnace</label>
                <input type="text" name="directFurnace" value={editForm.directFurnace ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Holder to Furnace</label>
                <input type="text" name="holderToFurnace" value={editForm.holderToFurnace ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Furnace to Holder</label>
                <input type="text" name="furnaceToHolder" value={editForm.furnaceToHolder ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>DISA No</label>
                <input type="text" name="disaNo" value={editForm.disaNo ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Item</label>
                <input type="text" name="item" value={editForm.item ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Furnace 1-2-3 kW</label>
                <input type="text" name="furnace1Kw" value={editForm.furnace1Kw ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Furnace 1-2-3 A (2000-3500)</label>
                <input type="text" name="furnace1A" value={editForm.furnace1A ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Furnace 1-2-3 V (500-1000)</label>
                <input type="text" name="furnace1V" value={editForm.furnace1V ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>F4 Hz</label>
                <input type="text" name="furnace4Hz" value={editForm.furnace4Hz ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>F4 GLD (0.6000-95.00)</label>
                <input type="text" name="furnace4Gld" value={editForm.furnace4Gld ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>F4 kW/Hr</label>
                <input type="text" name="furnace4KwHr" value={editForm.furnace4KwHr ?? ''} onChange={handleEditChange} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={closeEditModal} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
              <button onClick={openSaveConfirm} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #bbf7d0', background: '#dcfce7', color: '#166534', cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {saveConfirm.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 20, width: 'min(420px, 95vw)', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Confirm Save</div>
            <div style={{ color: '#334155' }}>Do you want to save the changes?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={closeSaveConfirm} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>No</button>
              <button onClick={performSave} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #bbf7d0', background: '#dcfce7', color: '#166534', cursor: 'pointer' }}>Yes, Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeltingLogSheetReport;
