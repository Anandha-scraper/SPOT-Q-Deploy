import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, CustomPagination } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/Moulding/DisamaticProductReport.css';
import '../../styles/ComponentStyles/Buttons.css';

const MeltingLogSheetReport = () => {
  const formatDateKey = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedFurnace, setSelectedFurnace] = useState('');
  const [selectedPanel, setSelectedPanel] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarksModal, setRemarksModal] = useState({ show: false, content: '', title: 'Reason' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [show, setShow] = useState({ primary: false, table1: false, table2: false, table3: false, table4: false, table5: false });
  const toggle = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));
  const anySection = show.primary || show.table1 || show.table2 || show.table3 || show.table4 || show.table5;

  // Filter is enabled if at least one filter is set
  const isFilterEnabled = (fromDate && fromDate.trim() !== '') || (selectedShift && selectedShift.trim() !== '') || (selectedFurnace && selectedFurnace.trim() !== '') || (selectedPanel && selectedPanel.trim() !== '');

  // Helper: get date 90 days ago as YYYY-MM-DD
  const get90DaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return formatDateKey(d);
  };
  const getToday = () => formatDateKey(new Date());

  const showRemarksPopup = (content, title = 'Reason') => {
    setRemarksModal({ show: true, content, title });
  };
  const closeRemarksModal = () => {
    setRemarksModal({ show: false, content: '', title: 'Reason' });
  };

  const applyFilters = async () => {
    // Determine date range: if fromDate given use it, otherwise last 90 days
    let startDateStr, endDateStr;
    if (fromDate && fromDate.trim() !== '') {
      startDateStr = fromDate;
      endDateStr = (toDate && toDate.trim() !== '') ? toDate : fromDate;
    } else {
      // No date selected — use last 90 days
      startDateStr = get90DaysAgo();
      endDateStr = getToday();
    }
    try {
      setLoading(true);
      const resp = await fetch(buildApiUrl(`/api/v1/melting-logs/filter?startDate=${startDateStr}&endDate=${endDateStr}`), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await resp.json();
      if (data.success) {
        let filtered = data.data || [];
        if (selectedShift && selectedShift.trim() !== '') {
          filtered = filtered.filter(r => String(r.shift) === String(selectedShift));
        }
        if (selectedFurnace && selectedFurnace.trim() !== '') {
          filtered = filtered.filter(r => String(r.furnaceNo) === String(selectedFurnace));
        }
        if (selectedPanel && selectedPanel.trim() !== '') {
          filtered = filtered.filter(r => String(r.panel) === String(selectedPanel));
        }
        setFilteredReports(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch filtered data', err);
    } finally { setLoading(false); }
  };

  const handleFilter = () => {
    if (isFilterEnabled) {
      applyFilters();
      setCurrentPage(1);
    }
  };

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setSelectedShift('');
    setSelectedFurnace('');
    setSelectedPanel('');
    setFilteredReports([]);
    setCurrentPage(1);
  };

  const rows = filteredReports;
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = rows.slice(startIndex, startIndex + itemsPerPage);

  const fmtDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  // Group key: date + shift + furnaceNo + panel
  const getGroupKey = (row) => `${row.date}-${row.shift}-${row.furnaceNo}-${row.panel}`.replace(/[^a-zA-Z0-9]/g, '-');

  const getGroupSize = (startIdx) => {
    const key = getGroupKey(paginatedRows[startIdx]);
    let size = 1;
    for (let i = startIdx + 1; i < paginatedRows.length; i++) {
      if (getGroupKey(paginatedRows[i]) === key) size++;
      else break;
    }
    return size;
  };

  const isFirstInGroup = (idx) => {
    if (idx === 0) return true;
    return getGroupKey(paginatedRows[idx]) !== getGroupKey(paginatedRows[idx - 1]);
  };

  const isLastInGroup = (idx) => {
    if (idx === paginatedRows.length - 1) return true;
    return getGroupKey(paginatedRows[idx]) !== getGroupKey(paginatedRows[idx + 1]);
  };

  const thStyle = { padding: '14px 18px', textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' };

  const groupedCellStyle = (idx) => ({
    padding: '12px 18px',
    textAlign: 'center',
    fontWeight: 500,
    verticalAlign: 'middle',
    borderTop: idx > 0 ? '2px solid #e2e8f0' : 'none',
    borderBottom: '2px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const dataCellStyle = (idx, first, last) => ({
    padding: '12px 18px',
    textAlign: 'center',
    borderTop: first && idx > 0 ? '2px solid #e2e8f0' : 'none',
    borderBottom: last ? '2px solid #e2e8f0' : 'none',
    transition: 'background-color 0.2s ease'
  });

  const hoverIn = (groupId) => {
    document.querySelectorAll(`.group-${groupId}`).forEach(r => r.style.backgroundColor = '#e0f2fe');
  };
  const hoverOut = (groupId) => {
    document.querySelectorAll(`.group-${groupId}`).forEach(r => r.style.backgroundColor = '');
  };
  const rowHoverIn = (e) => { e.target.closest('tr').style.backgroundColor = '#e0f2fe'; };
  const rowHoverOut = (e) => { e.target.closest('tr').style.backgroundColor = ''; };

  const renderGroupedTd = (idx, groupSize, groupId, content) => (
    <td rowSpan={groupSize} style={groupedCellStyle(idx)} className={`grouped-cell group-${groupId}-cell`}
      onMouseEnter={() => hoverIn(groupId)} onMouseLeave={() => hoverOut(groupId)}>{content}</td>
  );

  const renderTd = (idx, first, last, content, extra = {}) => (
    <td style={{ ...dataCellStyle(idx, first, last), ...extra }} onMouseEnter={rowHoverIn} onMouseLeave={rowHoverOut}>{content}</td>
  );

  return (
    <div className="page-wrapper">
      <div className="impact-report-header">
        <div className="impact-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Melting Log Sheet - Report
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div className="impact-filter-group">
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>From Date</label>
          <CustomDatePicker value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="From date" />
        </div>
        <div className="impact-filter-group">
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>To Date</label>
          <CustomDatePicker value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="To date" />
        </div>
        <div className="impact-filter-group">
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Shift (Optional)</label>
          <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}
            style={{ padding: '0.625rem 0.875rem', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#ffffff', cursor: 'pointer', minWidth: '150px' }}>
            <option value="">All Shifts</option>
            <option value="Shift 1">Shift 1</option>
            <option value="Shift 2">Shift 2</option>
            <option value="Shift 3">Shift 3</option>
          </select>
        </div>
        <div className="impact-filter-group">
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Furnace (Optional)</label>
          <select value={selectedFurnace} onChange={(e) => setSelectedFurnace(e.target.value)}
            style={{ padding: '0.625rem 0.875rem', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#ffffff', cursor: 'pointer', minWidth: '150px' }}>
            <option value="">All Furnaces</option>
            <option value="1">Furnace 1</option>
            <option value="2">Furnace 2</option>
            <option value="3">Furnace 3</option>
            <option value="4">Furnace 4</option>
          </select>
        </div>
        <div className="impact-filter-group">
          <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Panel (Optional)</label>
          <select value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)}
            style={{ padding: '0.625rem 0.875rem', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#ffffff', cursor: 'pointer', minWidth: '150px' }}>
            <option value="">All Panels</option>
            <option value="A">Panel A</option>
            <option value="B">Panel B</option>
            <option value="C">Panel C</option>
            <option value="D">Panel D</option>
          </select>
        </div>
        <FilterButton onClick={handleFilter} disabled={!isFilterEnabled} />
        <ClearButton onClick={handleClear} />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginLeft: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'table1', label: 'Table 1' },
            { key: 'table2', label: 'Table 2' },
            { key: 'table3', label: 'Table 3' },
            { key: 'table4', label: 'Table 4' },
            { key: 'table5', label: 'Table 5' }
          ].map(({ key, label }) => (
            <label key={key} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
              fontSize: '0.9rem', fontWeight: 600, color: show[key] ? '#0f766e' : '#64748b',
              userSelect: 'none', whiteSpace: 'nowrap',
              padding: '0.35rem 0.65rem', borderRadius: '6px',
              background: show[key] ? '#f0fdfa' : 'transparent',
              border: show[key] ? '1.5px solid #99f6e4' : '1.5px solid transparent',
              transition: 'all 0.2s ease'
            }}>
              <input type="checkbox" checked={show[key]} onChange={() => toggle(key)}
                style={{ accentColor: '#0f766e', width: '17px', height: '17px', cursor: 'pointer' }} />
              {label}
            </label>
          ))}
          {anySection && (
            <button onClick={() => setShow({ primary: false, table1: false, table2: false, table3: false, table4: false, table5: false })}
              style={{
                padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1.5px solid #fca5a5',
                background: '#fef2f2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease'
              }}>Clear</button>
          )}
        </div>
      </div>

      {loading ? <div className="impact-loader-container"><div>Loading...</div></div> : (
        <div className="impact-table-container" style={{ overflowX: 'auto' }}>
          <table className="impact-table">
            <thead>
              <tr>
                {/* Always visible */}
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Shift</th>
                <th style={thStyle}>Furnace No</th>
                <th style={thStyle}>Panel</th>
                {/* Primary */}
                {show.primary && <><th style={thStyle}>Cumul. Liquid Metal (kgs)</th><th style={thStyle}>Final KW/Hr</th><th style={thStyle}>Initial KW/Hr</th><th style={thStyle}>Total Units</th><th style={thStyle}>Cumul. Units</th></>}
                {/* Table 1 - Charging */}
                {show.table1 && <><th style={thStyle}>Heat No</th><th style={thStyle}>Grade</th><th style={thStyle}>Time</th><th style={thStyle}>If Bath</th><th style={thStyle}>Liquid Metal (kgs)</th><th style={thStyle}>Holder (kgs)</th><th style={thStyle}>SG-MS Steel</th><th style={thStyle}>MS Steel (Grey)</th><th style={thStyle}>Returns SG</th><th style={thStyle}>Pig Iron</th><th style={thStyle}>Borings</th><th style={thStyle}>Final (Kgs)</th></>}
                {/* Table 2 - Ferro Additions */}
                {show.table2 && <><th style={thStyle}>Char Coal</th><th style={thStyle}>CPC (Fur)</th><th style={thStyle}>CPC (LC)</th><th style={thStyle}>SiC</th><th style={thStyle}>FeSi (Fur)</th><th style={thStyle}>FeSi (LC)</th><th style={thStyle}>FeMn (Fur)</th><th style={thStyle}>FeMn (LC)</th><th style={thStyle}>Cu</th><th style={thStyle}>FE-Cr</th><th style={thStyle}>Pure Mg</th></>}
                {/* Table 3 - Lab Coin & Timing */}
                {show.table3 && <><th style={thStyle}>Lab Coin Time</th><th style={thStyle}>Temp (°C)</th><th style={thStyle}>Deslagging From</th><th style={thStyle}>Deslagging To</th><th style={thStyle}>Metal Ready</th><th style={thStyle}>Wait Tapping From</th><th style={thStyle}>Wait Tapping To</th><th style={thStyle}>Reason</th></>}
                {/* Table 4 - Metal Tapping */}
                {show.table4 && <><th style={thStyle}>Tapping Time</th><th style={thStyle}>Temp °C (Non-SG)</th><th style={thStyle}>Direct Furnace</th><th style={thStyle}>Holder → Furnace</th><th style={thStyle}>Furnace → Holder</th><th style={thStyle}>DISA No</th><th style={thStyle}>Item</th></>}
                {/* Table 5 - Electrical Readings */}
                {show.table5 && <><th style={thStyle}>F1-2-3 kW</th><th style={thStyle}>F1-2-3 A</th><th style={thStyle}>F1-2-3 V</th><th style={thStyle}>F4 Hz</th><th style={thStyle}>F4 GLD</th><th style={thStyle}>F4 kW/Hr</th></>}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={4 + (show.primary ? 5 : 0) + (show.table1 ? 12 : 0) + (show.table2 ? 11 : 0) + (show.table3 ? 8 : 0) + (show.table4 ? 7 : 0) + (show.table5 ? 6 : 0)} className="impact-no-records">{rows.length === 0 ? 'No records found' : 'No data on this page'}</td></tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const first = isFirstInGroup(idx);
                  const last = isLastInGroup(idx);
                  const groupId = getGroupKey(row);
                  const groupSize = first ? getGroupSize(idx) : 0;

                  return (
                    <tr key={`${row._id}-${idx}`} className={`group-row group-${groupId}`}
                        style={{ transition: 'background-color 0.2s ease', borderTop: first && idx > 0 ? '2px solid #e2e8f0' : 'none' }}>
                      {/* Always visible */}
                      {first && renderGroupedTd(idx, groupSize, groupId, fmtDate(row.date))}
                      {first && renderGroupedTd(idx, groupSize, groupId, row.shift || '-')}
                      {first && renderGroupedTd(idx, groupSize, groupId, row.furnaceNo || '-')}
                      {first && renderGroupedTd(idx, groupSize, groupId, row.panel || '-')}
                      {/* Primary */}
                      {show.primary && first && renderGroupedTd(idx, groupSize, groupId, row.cumulativeLiquidMetal ?? '-')}
                      {show.primary && first && renderGroupedTd(idx, groupSize, groupId, row.finalKWHr ?? '-')}
                      {show.primary && first && renderGroupedTd(idx, groupSize, groupId, row.initialKWHr ?? '-')}
                      {show.primary && first && renderGroupedTd(idx, groupSize, groupId, row.totalUnits ?? '-')}
                      {show.primary && first && renderGroupedTd(idx, groupSize, groupId, row.cumulativeUnits ?? '-')}
                      {/* Table 1 */}
                      {show.table1 && renderTd(idx, first, last, row.heatNo ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.grade ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.chargingTime ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.ifBath ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.liquidMetalPressPour ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.liquidMetalHolder ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.sgMsSteel ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.greyMsSteel ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.returnsSg ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.pigIron ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.borings ?? '-')}
                      {show.table1 && renderTd(idx, first, last, row.finalBath ?? '-')}
                      {/* Table 2 */}
                      {show.table2 && renderTd(idx, first, last, row.charCoal ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.cpcFur ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.cpcLc ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.siliconCarbideFur ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.ferrosiliconFur ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.ferrosiliconLc ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.ferroManganeseFur ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.ferroManganeseLc ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.cu ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.cr ?? '-')}
                      {show.table2 && renderTd(idx, first, last, row.pureMg ?? '-')}
                      {/* Table 3 */}
                      {show.table3 && renderTd(idx, first, last, row.labCoinTime ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.labCoinTempC ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.deslagingTimeFrom ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.deslagingTimeTo ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.metalReadyTime ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.waitingForTappingFrom ?? '-')}
                      {show.table3 && renderTd(idx, first, last, row.waitingForTappingTo ?? '-')}
                      {show.table3 && (
                        <td
                          style={{
                            cursor: row.reason ? 'pointer' : 'default',
                            maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            padding: '12px 18px', textAlign: 'center',
                            color: row.reason ? '#5B9AA9' : '#94a3b8',
                            textDecoration: row.reason ? 'underline' : 'none',
                            borderTop: first && idx > 0 ? '2px solid #e2e8f0' : 'none',
                            borderBottom: last ? '2px solid #e2e8f0' : 'none',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={() => row.reason && showRemarksPopup(row.reason)}
                          onMouseEnter={rowHoverIn} onMouseLeave={rowHoverOut}
                          title={row.reason || 'No reason'}
                        >{row.reason || '-'}</td>
                      )}
                      {/* Table 4 */}
                      {show.table4 && renderTd(idx, first, last, row.time ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.tempCSg ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.directFurnace ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.holderToFurnace ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.furnaceToHolder ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.disaNo ?? '-')}
                      {show.table4 && renderTd(idx, first, last, row.item ?? '-')}
                      {/* Table 5 */}
                      {show.table5 && renderTd(idx, first, last, row.furnace1Kw ?? '-')}
                      {show.table5 && renderTd(idx, first, last, row.furnace1A ?? '-')}
                      {show.table5 && renderTd(idx, first, last, row.furnace1V ?? '-')}
                      {show.table5 && renderTd(idx, first, last, row.furnace4Hz ?? '-')}
                      {show.table5 && renderTd(idx, first, last, row.furnace4Gld ?? '-')}
                      {show.table5 && renderTd(idx, first, last, row.furnace4KwHr ?? '-')}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Reason/Remarks Modal */}
      {remarksModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={closeRemarksModal}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '8px',
            maxWidth: '500px', width: '90%', maxHeight: '300px', overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{remarksModal.title}</h3>
              <button onClick={closeRemarksModal} style={{
                background: 'none', border: 'none', fontSize: '1.5rem',
                cursor: 'pointer', padding: '0', color: '#64748b'
              }}>&times;</button>
            </div>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#334155' }}>{remarksModal.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeltingLogSheetReport;
