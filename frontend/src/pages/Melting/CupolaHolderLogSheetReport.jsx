import React, { useEffect, useState, useMemo } from 'react';
import { BookOpenCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterButton, ClearButton, ShiftDropdown, HolderDropdown } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import '../../styles/PageStyles/Melting/CupolaHolderLogSheetReport.css';

const ITEMS_PER_PAGE = 20;

const CupolaHolderLogSheetReport = () => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedHolder, setSelectedHolder] = useState('');

  // Section visibility toggles
  const [show, setShow] = useState({
    additions: false,
    tapping: false,
    pouring: false,
    electrical: false,
    remarks: false
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Remark modal
  const [remarkModal, setRemarkModal] = useState({ open: false, text: '' });

  // Load today's data on mount
  useEffect(() => {
    loadCurrentData();
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadCurrentData = async () => {
    const currentDate = getCurrentDate();
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/cupola-logs/filter?startDate=${currentDate}&endDate=${currentDate}`,
        { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data?.success) {
        setEntries(Array.isArray(data.data) ? data.data : []);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const isFilterEnabled = startDate || selectedShift || selectedHolder;

  const loadFilteredData = async () => {
    if (!isFilterEnabled) return;

    const filterStart = startDate || getCurrentDate();
    const filterEnd = endDate || filterStart;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/cupola-logs/filter?startDate=${encodeURIComponent(filterStart)}&endDate=${encodeURIComponent(filterEnd)}`,
        { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      );
      const data = await response.json();
      if (data?.success) {
        let list = Array.isArray(data.data) ? data.data : [];
        // Client-side filtering
        if (selectedShift) list = list.filter(r => r.shift === selectedShift);
        if (selectedHolder) list = list.filter(r => String(r.holderNumber || r.holderno) === selectedHolder);
        setEntries(list);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedShift('');
    setSelectedHolder('');
    setCurrentPage(1);
    loadCurrentData();
  };

  const toggle = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));

  const anySection = Object.values(show).some(Boolean);
  const clearSections = () => setShow({ additions: false, tapping: false, pouring: false, electrical: false, remarks: false });

  // Format date to DD/MM/YYYY
  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('en-GB');
  };

  // Format value — show '-' for 0 or empty
  const fmtVal = (v) => (v !== undefined && v !== null && v !== '' && v !== 0) ? v : '-';

  // Column count for no-data row
  const totalCols = useMemo(() => {
    let c = 4; // date, shift, holder, heatNo
    if (show.additions) c += 7;
    if (show.tapping) c += 4;
    if (show.pouring) c += 3;
    if (show.electrical) c += 2;
    if (show.remarks) c += 1;
    return c;
  }, [show]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(entries.length / ITEMS_PER_PAGE));
  const paginatedData = entries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const sectionConfig = [
    { key: 'additions', label: 'Additions' },
    { key: 'tapping', label: 'Tapping' },
    { key: 'pouring', label: 'Pouring' },
    { key: 'electrical', label: 'Electrical' },
    { key: 'remarks', label: 'Remarks' }
  ];

  // Styles matching the entry page
  const thStyle = {
    padding: '0.5rem 0.4rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
    borderBottom: '2px solid #cbd5e1',
    borderRight: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
    background: '#f8fafc'
  };

  const groupThStyle = {
    ...thStyle,
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#1e293b',
    background: '#eef4f7',
    letterSpacing: '0.03em',
    borderBottom: '1px solid #cbd5e1'
  };

  const tdStyle = {
    padding: '0.5rem 0.4rem',
    textAlign: 'center',
    borderBottom: '1px solid #e5e7eb',
    borderRight: '1px solid #e5e7eb',
    fontSize: '0.825rem',
    color: '#475569',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
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
          <CustomDatePicker value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="cupola-holder-filter-group">
          <label>End Date</label>
          <CustomDatePicker value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="cupola-holder-filter-group">
          <label>Shift</label>
          <ShiftDropdown value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} />
        </div>
        <div className="cupola-holder-filter-group">
          <label>Holder No</label>
          <HolderDropdown value={selectedHolder} onChange={(e) => setSelectedHolder(e.target.value)} />
        </div>
        <FilterButton onClick={loadFilteredData} disabled={loading || !isFilterEnabled}>
          {loading ? 'Loading...' : 'Filter'}
        </FilterButton>
        <ClearButton onClick={clearFilters}>Clear</ClearButton>
      </div>

      {/* Section Checkboxes */}
      <div className="chr-checklist-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {sectionConfig.map(({ key, label }) => (
            <label
              key={key}
              className="chr-check"
              style={{
                background: show[key] ? '#0ea5e9' : '#ffffff',
                color: show[key] ? '#ffffff' : '#334155',
                borderColor: show[key] ? '#0ea5e9' : '#e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={show[key]}
                onChange={() => toggle(key)}
                style={{ width: '17px', height: '17px', accentColor: '#fff' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'inherit' }}>{label}</span>
            </label>
          ))}
          {anySection && (
            <button
              onClick={clearSections}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.85rem', border: '1.5px solid #fca5a5',
                borderRadius: '6px', background: '#fef2f2', color: '#dc2626',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease', minHeight: '38px'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : (
        <div className="chr-primary-table-wrap">
          <div style={{ overflowX: 'auto', border: '1.5px solid #cbd5e1', borderRadius: '10px', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                {/* Group Headers Row */}
                <tr>
                  <th rowSpan={2} style={{ ...groupThStyle, borderLeft: 'none' }}>Date</th>
                  <th rowSpan={2} style={groupThStyle}>Shift</th>
                  <th rowSpan={2} style={groupThStyle}>Holder No</th>
                  <th rowSpan={2} style={groupThStyle}>Heat No</th>
                  {show.additions && <th colSpan={7} style={groupThStyle}>ADDITIONS</th>}
                  {show.tapping && <th colSpan={4} style={groupThStyle}>TAPPING</th>}
                  {show.pouring && <th colSpan={3} style={groupThStyle}>POURING</th>}
                  {show.electrical && <th colSpan={2} style={groupThStyle}>ELECTRICAL</th>}
                  {show.remarks && <th rowSpan={2} style={{ ...groupThStyle, borderRight: 'none' }}>Remarks</th>}
                </tr>
                {/* Sub Headers Row */}
                {(show.additions || show.tapping || show.pouring || show.electrical) && (
                  <tr>
                    {show.additions && (
                      <>
                        <th style={thStyle}>CPC</th>
                        <th style={thStyle}>Fe Sl</th>
                        <th style={thStyle}>Fe Mn</th>
                        <th style={thStyle}>SIC</th>
                        <th style={thStyle}>Pure Mg</th>
                        <th style={thStyle}>Cu</th>
                        <th style={thStyle}>Fe Cr</th>
                      </>
                    )}
                    {show.tapping && (
                      <>
                        <th style={thStyle}>Actual Time</th>
                        <th style={thStyle}>Tapping Time</th>
                        <th style={thStyle}>Temp °C</th>
                        <th style={thStyle}>Metal (KG)</th>
                      </>
                    )}
                    {show.pouring && (
                      <>
                        <th style={thStyle}>DISA LINE</th>
                        <th style={thStyle}>IND FUR</th>
                        <th style={thStyle}>BAIL NO</th>
                      </>
                    )}
                    {show.electrical && (
                      <>
                        <th style={thStyle}>TAP</th>
                        <th style={{ ...thStyle, borderRight: show.remarks ? '1px solid #e2e8f0' : 'none' }}>KW</th>
                      </>
                    )}
                  </tr>
                )}
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={totalCols} style={{ ...tdStyle, borderRight: 'none', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      {entries.length === 0 ? 'No records found. Use the filters above to search.' : 'No data on this page'}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, idx) => (
                    <tr key={`${row._id || idx}`} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ ...tdStyle, borderLeft: 'none' }}>{formatDate(row.date)}</td>
                      <td style={tdStyle}>{fmtVal(row.shift)}</td>
                      <td style={tdStyle}>{fmtVal(row.holderNumber || row.holderno)}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#0ea5e9' }}>{fmtVal(row.heatNo)}</td>
                      {show.additions && (
                        <>
                          <td style={tdStyle}>{fmtVal(row.cpc)}</td>
                          <td style={tdStyle}>{fmtVal(row.FeSl ?? row.mFeSl)}</td>
                          <td style={tdStyle}>{fmtVal(row.feMn)}</td>
                          <td style={tdStyle}>{fmtVal(row.sic)}</td>
                          <td style={tdStyle}>{fmtVal(row.pureMg)}</td>
                          <td style={tdStyle}>{fmtVal(row.cu)}</td>
                          <td style={tdStyle}>{fmtVal(row.feCr)}</td>
                        </>
                      )}
                      {show.tapping && (
                        <>
                          <td style={tdStyle}>{fmtVal(row.actualTime)}</td>
                          <td style={tdStyle}>{fmtVal(row.tappingTime)}</td>
                          <td style={tdStyle}>{fmtVal(row.tappingTemp)}</td>
                          <td style={tdStyle}>{fmtVal(row.metalKg)}</td>
                        </>
                      )}
                      {show.pouring && (
                        <>
                          <td style={tdStyle}>{fmtVal(row.disaLine)}</td>
                          <td style={tdStyle}>{fmtVal(row.indFur)}</td>
                          <td style={tdStyle}>{fmtVal(row.bailNo)}</td>
                        </>
                      )}
                      {show.electrical && (
                        <>
                          <td style={tdStyle}>{fmtVal(row.tap)}</td>
                          <td style={tdStyle}>{fmtVal(row.kw)}</td>
                        </>
                      )}
                      {show.remarks && (
                        <td style={{ ...tdStyle, borderRight: 'none' }}>
                          {row.remarks ? (
                            <span
                              onClick={() => setRemarkModal({ open: true, text: row.remarks })}
                              title={row.remarks}
                              style={{ cursor: 'pointer', color: '#0ea5e9', textDecoration: 'underline dotted' }}
                            >
                              {row.remarks.length > 8 ? row.remarks.slice(0, 7) + '..' : row.remarks}
                            </span>
                          ) : '-'}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', border: '1px solid #e2e8f0',
              borderRadius: '8px', background: currentPage === 1 ? '#f1f5f9' : '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#94a3b8' : '#334155'
            }}
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: '36px', height: '36px', border: '1px solid',
                borderColor: page === currentPage ? '#0ea5e9' : '#e2e8f0',
                borderRadius: '8px',
                background: page === currentPage ? '#0ea5e9' : '#fff',
                color: page === currentPage ? '#fff' : '#334155',
                fontWeight: page === currentPage ? 700 : 500,
                fontSize: '0.875rem', cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', border: '1px solid #e2e8f0',
              borderRadius: '8px', background: currentPage === totalPages ? '#f1f5f9' : '#fff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#94a3b8' : '#334155'
            }}
          >
            <ChevronRight size={18} />
          </button>
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
            {entries.length} record{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Remark Modal */}
      {remarkModal.open && (
        <div
          onClick={() => setRemarkModal({ open: false, text: '' })}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '12px', padding: '1.5rem',
              maxWidth: '420px', width: '90%', boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#1e293b' }}>Remarks</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, wordBreak: 'break-word' }}>
              {remarkModal.text}
            </p>
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button
                onClick={() => setRemarkModal({ open: false, text: '' })}
                style={{
                  padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px',
                  background: '#0ea5e9', color: '#fff', fontSize: '0.875rem',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CupolaHolderLogSheetReport;
