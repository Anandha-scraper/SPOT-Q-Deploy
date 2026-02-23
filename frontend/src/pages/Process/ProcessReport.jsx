import React, { useState, useEffect, useMemo } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, FilterDisaDropdown, CustomPagination, SectionToggles } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Process/ProcessReport.css';
import '../../styles/ComponentStyles/Table.css';

const ProcessReport = () => {

  // ========================================================================
  // FILTER SYSTEM — Reusable pattern for date-range + optional dropdown filter
  // ========================================================================
  //
  // HOW IT WORKS:
  // 1. On mount, ALL entries are fetched once from the API and stored in `allEntries`.
  // 2. `filteredEntries` is a subset of `allEntries` — this is what the table renders.
  // 3. By default, only today's entries are shown (filtered on mount).
  //
  // FILTER STATES:
  //   - fromDate  : Start of date range (optional — if empty, no lower bound)
  //   - toDate    : End of date range (required — defaults to today)
  //   - selectedX : Any additional dropdown filter (e.g., DISA, Part Name, etc.)
  //
  // FILTER BUTTON ENABLE LOGIC:
  //   - Enabled when toDate is set AND toDate > fromDate (if fromDate is provided).
  //   - This prevents filtering with an invalid/empty range.
  //
  // handleFilter():
  //   - Filters `allEntries` client-side by comparing each entry's date (converted
  //     to 'YYYY-MM-DD' string) against the fromDate–toDate range.
  //   - If fromDate is empty, shows only entries matching toDate exactly.
  //   - Then applies any additional dropdown filter (e.g., DISA).
  //   - Resets pagination to page 1.
  //
  // handleClear():
  //   - Resets fromDate to '', toDate to today, dropdown to 'All'.
  //   - Re-filters to today's entries only (same as initial load, NOT all entries).
  //   - Resets pagination to page 1.
  //
  // TO REUSE IN OTHER PAGES:
  //   1. Copy the state declarations: fromDate, toDate, allEntries, filteredEntries, currentPage.
  //   2. Copy formatDateLocal() helper for consistent date comparison.
  //   3. Copy the useEffect fetch — store full data in allEntries, filter today's into filteredEntries.
  //   4. Copy handleFilter() — adjust the additional dropdown filter condition as needed.
  //   5. Copy handleClear() — adjust the dropdown reset value.
  //   6. Copy isFilterEnabled logic.
  //   7. In JSX, use the same filter bar layout: CustomDatePicker x2 + optional dropdown + FilterButton + ClearButton.
  //   8. Render `paginatedEntries` (sliced from sorted filteredEntries) in the table.
  // ========================================================================

  // Helper: Convert any date value to 'YYYY-MM-DD' string in local timezone
  // Used for consistent date comparisons (avoids timezone issues with toISOString)
  const formatDateLocal = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayLocal();

  // --- Filter States ---
  const [fromDate, setFromDate] = useState('');           // Start date (optional — empty means no lower bound)
  const [toDate, setToDate] = useState(todayStr);         // End date (required — defaults to today)
  const [selectedDisa, setSelectedDisa] = useState('All'); // Additional dropdown filter (replace with your own field)
  const [allEntries, setAllEntries] = useState([]);        // Full dataset fetched once from API
  const [filteredEntries, setFilteredEntries] = useState([]); // Filtered subset shown in table
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);      // Pagination — reset to 1 on every filter/clear
  const [show, setShow] = useState({ metalComposition: true, correctiveAdditions: true });
  const toggle = (key) => setShow(prev => ({ ...prev, [key]: !prev[key] }));
  const [remarksModal, setRemarksModal] = useState({ show: false, content: '', title: 'Remarks' });

  const itemsPerPage = 15;

  // FILTER BUTTON ENABLE LOGIC:
  // Enabled when: toDate exists AND (fromDate is empty OR toDate > fromDate)
  // This prevents users from filtering with an invalid range (e.g., toDate before fromDate)
  const isFilterEnabled = toDate && toDate.trim() !== '' && !(fromDate && fromDate.trim() !== '' && toDate <= fromDate);

  // Get unique DISA values
  const disaOptions = useMemo(() => {
    return Array.from(new Set(allEntries.map(item => item.disa).filter(Boolean))).sort();
  }, [allEntries]);

  // STEP 1: Fetch ALL entries once on mount.
  // Store full dataset in `allEntries` (never mutated after fetch).
  // Apply initial filter: show only today's entries by default.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.process, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch process data');
        const result = await response.json();

        if (result.success && result.data) {
          // Optional: pre-filter invalid entries (adjust condition per page)
          const validEntries = result.data.filter(entry => entry.disa && entry.disa.trim() !== '');
          setAllEntries(validEntries); // Store full dataset

          // Default view: only today's entries
          const todayFiltered = validEntries.filter(r => {
            if (!r.date) return false;
            return formatDateLocal(r.date) === todayStr;
          });
          setFilteredEntries(todayFiltered);
        }
      } catch (error) {
        console.error('Error fetching process data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // STEP 2: handleFilter — Client-side filtering of `allEntries`.
  // Filters by date range first, then by any additional dropdown selection.
  // Always resets pagination to page 1.
  const handleFilter = () => {
    // Guard: toDate is required
    if (!toDate) {
      setFilteredEntries([]);
      return;
    }

    const toDateStr = toDate;
    const fromDateStr = fromDate || '';

    // Date range filter:
    // - If fromDate is set: entry date must be >= fromDate AND <= toDate
    // - If fromDate is empty: show only entries matching toDate exactly
    let filtered = allEntries.filter(r => {
      if (!r.date) return false;
      const reportDate = formatDateLocal(r.date);
      if (fromDateStr) {
        return reportDate >= fromDateStr && reportDate <= toDateStr;
      }
      return reportDate === toDateStr;
    });

    // Additional dropdown filter (e.g., DISA) — skip if 'All' is selected
    // Replace `r.disa` and `selectedDisa` with your own field when reusing
    if (selectedDisa && selectedDisa !== 'All') {
      filtered = filtered.filter(r => r.disa === selectedDisa);
    }

    setFilteredEntries(filtered);
    setCurrentPage(1); // Always reset to first page after filtering
  };

  // STEP 3: handleClear — Reset all filters to defaults.
  // Shows only today's entries (same as initial load), resets dates, dropdown, and pagination.
  const handleClear = () => {
    setFromDate('');              // Clear start date
    setToDate(todayStr);          // Reset end date to today
    setSelectedDisa('All');       // Reset dropdown to 'All'
    // Re-filter to today's entries only (not all entries)
    const todayFiltered = allEntries.filter(r => {
      if (!r.date) return false;
      return formatDateLocal(r.date) === todayStr;
    });
    setFilteredEntries(todayFiltered);
    setCurrentPage(1);            // Reset pagination
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
  };

  // Sort entries by date descending, then by disa
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.disa || '').localeCompare(b.disa || '');
    });
  }, [filteredEntries]);

  // Pagination
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  const showRemarksPopup = (content, title = 'Remarks') => {
    setRemarksModal({ show: true, content, title });
  };

  const closeRemarksModal = () => {
    setRemarksModal({ show: false, content: '', title: 'Remarks' });
  };

  // Calculate column count for colSpan
  const baseColCount = 22;
  const metalColCount = show.metalComposition ? 8 : 0;
  const correctiveColCount = show.correctiveAdditions ? 7 : 0;
  const totalColCount = baseColCount + metalColCount + correctiveColCount;

  // Group calculation for date rowSpan
  const getGroupInfo = () => {
    const groups = {};
    let currentDate = null;
    let groupStartIdx = 0;

    paginatedEntries.forEach((item, idx) => {
      const itemDate = formatDateLocal(item.date);
      if (itemDate !== currentDate) {
        if (currentDate !== null) {
          groups[groupStartIdx] = { rowspan: idx - groupStartIdx, date: currentDate };
        }
        currentDate = itemDate;
        groupStartIdx = idx;
      }
      if (idx === paginatedEntries.length - 1) {
        groups[groupStartIdx] = { rowspan: idx - groupStartIdx + 1, date: currentDate };
      }
    });
    return groups;
  };

  const dateGroups = getGroupInfo();

  // Group calculation for DISA rowSpan (consecutive same date+disa)
  const getDisaGroupInfo = () => {
    const groups = {};
    let currentKey = null;
    let groupStartIdx = 0;

    paginatedEntries.forEach((item, idx) => {
      const itemDate = formatDateLocal(item.date);
      const itemDisa = item.disa || '';
      const key = `${itemDate}|${itemDisa}`;

      if (key !== currentKey) {
        if (currentKey !== null) {
          groups[groupStartIdx] = { rowspan: idx - groupStartIdx, disa: currentKey.split('|')[1] };
        }
        currentKey = key;
        groupStartIdx = idx;
      }
      if (idx === paginatedEntries.length - 1) {
        groups[groupStartIdx] = { rowspan: idx - groupStartIdx + 1, disa: currentKey.split('|')[1] };
      }
    });
    return groups;
  };

  const disaGroups = getDisaGroupInfo();

  return (
    <div className="page-wrapper">
      <div className="process-report-header">
        <div className="process-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Process Control - Report
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="process-report-filter-wrapper">
        <div className="process-filter-group">
          <label className="process-report-filter-label">From Date</label>
          <CustomDatePicker value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="From date" />
        </div>
        <div className="process-filter-group">
          <label className="process-report-filter-label">To Date</label>
          <CustomDatePicker value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="To date" />
        </div>
        <div className="process-filter-group">
          <label className="process-report-filter-label">DISA (Optional)</label>
          <FilterDisaDropdown
            value={selectedDisa}
            onChange={(e) => setSelectedDisa(e.target.value)}
            options={disaOptions}
          />
        </div>
        <FilterButton onClick={handleFilter} disabled={!isFilterEnabled} />
        <ClearButton onClick={handleClear} />
      </div>

      {/* Section Toggles */}
      <SectionToggles
        sections={[
          { key: 'metalComposition', label: 'Metal Composition (%)' },
          { key: 'correctiveAdditions', label: 'Corrective Additions (Kgs)' }
        ]}
        show={show}
        onToggle={toggle}
        onClear={() => setShow({ metalComposition: false, correctiveAdditions: false })}
      />

      {/* Table */}
      {loading ? (
        <div className="process-loader-container"><div>Loading...</div></div>
      ) : (
        <div className="reusable-table-container">
          <table className="reusable-table" style={{ tableLayout: 'auto' }}>
            <thead>
              {/* Group Headers */}
              <tr>
                <th rowSpan={2} style={{ minWidth: '150px', textAlign: 'center', whiteSpace: 'nowrap' }}>Date</th>
                <th rowSpan={2} style={{ minWidth: '80px', textAlign: 'center', whiteSpace: 'nowrap' }}>DISA</th>
                <th rowSpan={2} style={{ minWidth: '200px', textAlign: 'center', whiteSpace: 'nowrap' }}>Part Name</th>
                <th rowSpan={2} style={{ minWidth: '80px', textAlign: 'center', whiteSpace: 'nowrap' }}>Date Code</th>
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Heat Code</th>
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Qty of Moulds</th>
                {show.metalComposition && <th colSpan={8} style={{ textAlign: 'center' }}>Metal Composition (%)</th>}
                <th rowSpan={2} style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }}>Pouring Temp</th>
                <th rowSpan={2} style={{ minWidth: '200px', textAlign: 'center', whiteSpace: 'nowrap' }}>Time of Pouring</th>
                <th rowSpan={2} style={{ minWidth: '80px', textAlign: 'center', whiteSpace: 'nowrap' }}>PP Code</th>
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Treatment No</th>
                <th rowSpan={2} style={{ minWidth: '70px', textAlign: 'center', whiteSpace: 'nowrap' }}>FC No</th>
                <th rowSpan={2} style={{ minWidth: '80px', textAlign: 'center', whiteSpace: 'nowrap' }}>Heat No</th>
                <th rowSpan={2} style={{ minWidth: '70px', textAlign: 'center', whiteSpace: 'nowrap' }}>Con No</th>
                {show.correctiveAdditions && <th colSpan={7} style={{ textAlign: 'center' }}>Corrective Additions (Kgs)</th>}
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Tapping Wt</th>
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Tapping Time</th>
                <th rowSpan={2} style={{ minWidth: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>Mg</th>
                <th rowSpan={2} style={{ minWidth: '110px', textAlign: 'center', whiteSpace: 'nowrap' }}>Res Mg Convertor</th>
                <th rowSpan={2} style={{ minWidth: '90px', textAlign: 'center', whiteSpace: 'nowrap' }}>Rec of Mg</th>
                <th rowSpan={2} style={{ minWidth: '110px', textAlign: 'center', whiteSpace: 'nowrap' }}>Stream Inoculant</th>
                <th rowSpan={2} style={{ minWidth: '70px', textAlign: 'center', whiteSpace: 'nowrap' }}>P Time</th>
                <th rowSpan={2} style={{ minWidth: '100px', textAlign: 'center', whiteSpace: 'nowrap' }}>Remarks</th>
              </tr>
              {/* Sub Headers */}
              <tr>
                {show.metalComposition && (
                  <>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>C</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Si</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Mn</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>P</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>S</th>
                    <th style={{ minWidth: '90px', textAlign: 'center' }}>Mg FL</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Cu</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Cr</th>
                  </>
                )}
                {show.correctiveAdditions && (
                  <>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>C</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Si</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Mn</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>S</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Cr</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Cu</th>
                    <th style={{ minWidth: '60px', textAlign: 'center' }}>Sn</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={totalColCount} className="reusable-table-no-records">No records found</td>
                </tr>
              ) : (
                paginatedEntries.map((item, idx) => {
                  const isDateGroupStart = dateGroups[idx];
                  const itemDate = formatDateLocal(item.date);

                  const prevItem = idx > 0 ? paginatedEntries[idx - 1] : null;
                  const nextItem = idx < paginatedEntries.length - 1 ? paginatedEntries[idx + 1] : null;
                  const isFirstInGroup = !prevItem || formatDateLocal(prevItem.date) !== itemDate;
                  const isLastInGroup = !nextItem || formatDateLocal(nextItem.date) !== itemDate;
                  const isDisaGroupStart = disaGroups[idx];

                  return (
                    <tr
                      key={item._id || idx}
                      className={`process-report-data-row${isFirstInGroup && idx > 0 ? ' group-first' : ''}`}
                    >
                      {isDateGroupStart ? (
                        <td
                          rowSpan={isDateGroupStart.rowspan}
                          className={`process-report-date-cell${idx > 0 ? ' border-top' : ''}`}
                        >
                          {formatDisplayDate(item.date)}
                        </td>
                      ) : null}
                      {isDisaGroupStart ? (
                        <td
                          rowSpan={isDisaGroupStart.rowspan}
                          className="process-report-disa-cell"
                        >
                          {item.disa || '-'}
                        </td>
                      ) : null}
                      <td>{item.partName || '-'}</td>
                      <td>{item.datecode || '-'}</td>
                      <td>{item.heatcode || '-'}</td>
                      <td>{item.quantityOfMoulds || '-'}</td>
                      {show.metalComposition && (
                        <>
                          <td>{item.metalCompositionC || '-'}</td>
                          <td>{item.metalCompositionSi || '-'}</td>
                          <td>{item.metalCompositionMn || '-'}</td>
                          <td>{item.metalCompositionP || '-'}</td>
                          <td>{item.metalCompositionS || '-'}</td>
                          <td>{item.metalCompositionMgFL || '-'}</td>
                          <td>{item.metalCompositionCu || '-'}</td>
                          <td>{item.metalCompositionCr || '-'}</td>
                        </>
                      )}
                      <td>
                        {item.pouringTemperatureMin && item.pouringTemperatureMax
                          ? `${item.pouringTemperatureMin} - ${item.pouringTemperatureMax}`
                          : '-'}
                      </td>
                      <td>{item.timeOfPouring || '-'}</td>
                      <td>{item.ppCode || '-'}</td>
                      <td>{item.treatmentNo || '-'}</td>
                      <td>{item.fcNo || '-'}</td>
                      <td>{item.heatNo || '-'}</td>
                      <td>{item.conNo || '-'}</td>
                      {show.correctiveAdditions && (
                        <>
                          <td>{item.correctiveAdditionC || '-'}</td>
                          <td>{item.correctiveAdditionSi || '-'}</td>
                          <td>{item.correctiveAdditionMn || '-'}</td>
                          <td>{item.correctiveAdditionS || '-'}</td>
                          <td>{item.correctiveAdditionCr || '-'}</td>
                          <td>{item.correctiveAdditionCu || '-'}</td>
                          <td>{item.correctiveAdditionSn || '-'}</td>
                        </>
                      )}
                      <td>{item.tappingWt || '-'}</td>
                      <td>{item.tappingTime || '-'}</td>
                      <td>{item.mg || '-'}</td>
                      <td>{item.resMgConvertor || '-'}</td>
                      <td>{item.recOfMg || '-'}</td>
                      <td>{item.streamInoculant || '-'}</td>
                      <td>{item.pTime || '-'}</td>
                      <td
                        className={`process-report-remarks-cell ${item.remarks ? 'clickable' : 'empty'}`}
                        onClick={() => item.remarks && showRemarksPopup(item.remarks)}
                        title={item.remarks || 'No remarks'}
                      >
                        {item.remarks || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && sortedEntries.length > itemsPerPage && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Remarks Modal */}
      {remarksModal.show && (
        <div className="process-report-modal-overlay" onClick={closeRemarksModal}>
          <div className="process-report-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="process-report-modal-header">
              <h3 className="process-report-modal-title">{remarksModal.title}</h3>
              <button onClick={closeRemarksModal} className="process-report-modal-close">&times;</button>
            </div>
            <p className="process-report-modal-text">{remarksModal.content}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessReport;
