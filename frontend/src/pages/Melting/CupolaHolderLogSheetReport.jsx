import React, { useEffect, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, EditButton, DeleteButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import '../../styles/PageStyles/Melting/CupolaHolderLogSheetReport.css';

const CupolaHolderLogSheetReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [show, setShow] = useState({ table1: false, table2: false, table3: false, remarks: false });
  
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
      const response = await fetch(`http://localhost:5000/api/v1/cupola-logs/filter?startDate=${currentDate}&endDate=${currentDate}`, {
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
      const response = await fetch(`http://localhost:5000/api/v1/cupola-logs/filter?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(filterEndDate)}`, {
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
  const [remarkModal, setRemarkModal] = useState({ open: false, text: '' });

  const requestDelete = (row) => {
    if (!row?._id) return;
    setConfirm({ open: true, row });
  };

  const closeConfirm = () => setConfirm({ open: false, row: null });

  const performDelete = async () => {
    const row = confirm.row;
    if (!row?._id) return;
    try {
      const response = await fetch(`/v1/cupola-holder-logs/${row._id}`, {
        method: 'DELETE',
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
      holderNumber: row.holderNumber || row.holderno || '',
      heatNo: row.heatNo || '',
      cpc: row.cpc ?? '',
      mFeSl: row.mFeSl ?? row.FeSl ?? '',
      feMn: row.feMn ?? '',
      sic: row.sic ?? '',
      pureMg: row.pureMg ?? '',
      cu: row.cu ?? '',
      feCr: row.feCr ?? '',
      actualTime: row.actualTime ?? row?.tapping?.time?.actualTime ?? '',
      tappingTime: row.tappingTime ?? row?.tapping?.time?.tappingTime ?? '',
      tappingTemp: row.tappingTemp ?? row?.tapping?.tempC ?? '',
      metalKg: row.metalKg ?? row?.tapping?.metalKgs ?? '',
      disaLine: row.disaLine ?? row?.pouring?.disaLine ?? '',
      indFur: row.indFur ?? row?.pouring?.indFur ?? '',
      bailNo: row.bailNo ?? row?.pouring?.bailNo ?? '',
      tap: row.tap ?? row?.electrical?.tap ?? '',
      kw: row.kw ?? row?.electrical?.kw ?? '',
      remarks: row.remarks || ''
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
      const response = await fetch(`/v1/cupola-holder-logs/${row._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      const res = await response.json();
      if (res?.success) {
        setEntries((prev) => prev.map((e) => (e._id === row._id ? { ...e, ...payload, _id: row._id } : e)));
        setEditModal({ open: false, row: null });
        setSaveConfirm({ open: false });
      }
    } catch (e) {
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
      { key: 'holderNumber', label: 'Holder No', width: '100px', render: (r) => r.holderNumber || r.holderno || '-' },
      { key: 'heatNo', label: 'Heat No', width: '90px', render: (r) => r.heatNo || '-' },
    ];

    if (show.table1) {
      columns.push(
        { key: 'cpc', label: 'CPC', width: '80px', render: (r) => r.cpc ?? '-' },
        { key: 'mFeSl', label: 'Fe Sl', width: '80px', render: (r) => r.mFeSl ?? r.FeSl ?? '-' },
        { key: 'feMn', label: 'Fe Mn', width: '80px', render: (r) => r.feMn ?? '-' },
        { key: 'sic', label: 'Sic', width: '80px', render: (r) => r.sic ?? '-' },
        { key: 'pureMg', label: 'Pure Mg', width: '90px', render: (r) => r.pureMg ?? '-' },
        { key: 'cu', label: 'Cu', width: '70px', render: (r) => r.cu ?? '-' },
        { key: 'feCr', label: 'Fe Cr', width: '80px', render: (r) => r.feCr ?? '-' },
      );
    }

    if (show.table2) {
      columns.push(
        { key: 'actualTime', label: 'Actual Time', width: '110px', render: (r) => r.actualTime ?? r?.tapping?.time?.actualTime ?? '-' },
        { key: 'tappingTime', label: 'Tapping Time', width: '110px', render: (r) => r.tappingTime ?? r?.tapping?.time?.tappingTime ?? '-' },
        { key: 'tappingTemp', label: 'Temp (°C)', width: '90px', render: (r) => r.tappingTemp ?? r?.tapping?.tempC ?? '-' },
        { key: 'metalKg', label: 'Metal (KG)', width: '100px', render: (r) => r.metalKg ?? r?.tapping?.metalKgs ?? '-' },
      );
    }

    if (show.table3) {
      columns.push(
        { key: 'disaLine', label: 'DISA LINE', width: '100px', render: (r) => r.disaLine ?? r?.pouring?.disaLine ?? '-' },
        { key: 'indFur', label: 'IND FUR', width: '90px', render: (r) => r.indFur ?? r?.pouring?.indFur ?? '-' },
        { key: 'bailNo', label: 'BAIL NO', width: '90px', render: (r) => r.bailNo ?? r?.pouring?.bailNo ?? '-' },
        { key: 'tap', label: 'TAP', width: '80px', render: (r) => r.tap ?? r?.electrical?.tap ?? '-' },
        { key: 'kw', label: 'KW', width: '70px', render: (r) => r.kw ?? r?.electrical?.kw ?? '-' },
      );
    }

    if (show.remarks) {
      columns.push({
        key: 'remarks',
        label: 'Remarks',
        width: '120px',
        render: (r) => {
          const value = r?.remarks || r?.remark || r?.notes || r?.note || '';
          if (!value) return '-';
          const short = value.length > 6 ? value.slice(0, 5) + '..' : value;
          return (
            <span
              onClick={() => setRemarkModal({ open: true, text: value })}
              title={value}
              style={{ cursor: 'pointer', color: '#0ea5e9', textDecoration: 'underline dotted' }}
            >
              {short}</span>
          );
        }
      });
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
        <div className="chr-section-title">Cupola Holder Log Sheet Report</div>
        <Table
          columns={columns}
          data={list}
          renderActions={renderActions}
          noDataMessage="No records found for the selected date range."
          minWidth={1600}
          striped={true}
          headerGradient={true}
        />
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="cupola-holder-report-header">
        <div className="cupola-holder-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Cupola Holder Log Sheet - Report
          </h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="cupola-holder-filter-container">
        <div className="cupola-holder-filter-group">
          <label>Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="cupola-holder-filter-group">
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
        <div className="chr-checklist-title">Checklist</div>
        <div className="chr-checklist">
          <label className="chr-check">
            <input type="checkbox" checked={show.table1} onChange={() => toggle('table1')} />
            <span>Table 1</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table2} onChange={() => toggle('table2')} />
            <span>Table 2</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.table3} onChange={() => toggle('table3')} />
            <span>Table 3</span>
          </label>
          <label className="chr-check">
            <input type="checkbox" checked={show.remarks} onChange={() => toggle('remarks')} />
            <span>Remarks</span>
          </label>
        </div>
      </div>

      <PrimaryTable list={entries} show={show} />

      {/* Error Display */}
      {error && (
        <div className="chr-error">{error}</div>
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
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Edit Cupola Holder Log</div>
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
                <label>Holder No</label>
                <input type="text" name="holderNumber" value={editForm.holderNumber || ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Heat No</label>
                <input type="text" name="heatNo" value={editForm.heatNo || ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>CPC</label>
                <input type="text" name="cpc" value={editForm.cpc ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Fe Sl</label>
                <input type="text" name="mFeSl" value={editForm.mFeSl ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Fe Mn</label>
                <input type="text" name="feMn" value={editForm.feMn ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Sic</label>
                <input type="text" name="sic" value={editForm.sic ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Pure Mg</label>
                <input type="text" name="pureMg" value={editForm.pureMg ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Cu</label>
                <input type="text" name="cu" value={editForm.cu ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Fe Cr</label>
                <input type="text" name="feCr" value={editForm.feCr ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>Actual Time</label>
                <input type="text" name="actualTime" value={editForm.actualTime ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Tapping Time</label>
                <input type="text" name="tappingTime" value={editForm.tappingTime ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Temp (°C)</label>
                <input type="text" name="tappingTemp" value={editForm.tappingTemp ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>Metal (KG)</label>
                <input type="text" name="metalKg" value={editForm.metalKg ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group">
                <label>DISA LINE</label>
                <input type="text" name="disaLine" value={editForm.disaLine ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>IND FUR</label>
                <input type="text" name="indFur" value={editForm.indFur ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>BAIL NO</label>
                <input type="text" name="bailNo" value={editForm.bailNo ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>TAP</label>
                <input type="text" name="tap" value={editForm.tap ?? ''} onChange={handleEditChange} />
              </div>
              <div className="microtensile-form-group">
                <label>KW</label>
                <input type="text" name="kw" value={editForm.kw ?? ''} onChange={handleEditChange} />
              </div>

              <div className="microtensile-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Remarks</label>
                <input type="text" name="remarks" value={editForm.remarks || ''} onChange={handleEditChange} />
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

      {remarkModal.open && (
        <div
          onClick={() => setRemarkModal({ open: false, text: '' })}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 10, padding: 16, width: 'min(520px, 95vw)', maxWidth: '95vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Remarks</div>
            <div style={{ color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{remarkModal.text}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupolaHolderLogSheetReport;
