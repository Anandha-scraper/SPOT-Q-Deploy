import React, { useState, useEffect, useMemo } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, CustomPagination } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Impact/ImpactReport.css';
import '../../styles/ComponentStyles/Table.css';

const ImpactReport = () => {
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
  const [fromDate, setFromDate] = useState('');               // Start date (optional — empty means no lower bound)
  const [toDate, setToDate] = useState(todayStr);             // End date (required — defaults to today)
  const [allEntries, setAllEntries] = useState([]);            // Full dataset fetched once from API
  const [filteredEntries, setFilteredEntries] = useState([]);  // Filtered subset shown in table
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);          // Pagination — reset to 1 on every filter/clear

  const itemsPerPage = 15;

  // FILTER BUTTON ENABLE LOGIC:
  // Enabled when: toDate exists AND (fromDate is empty OR toDate > fromDate)
  const isFilterEnabled = toDate && toDate.trim() !== '' && !(fromDate && fromDate.trim() !== '' && toDate <= fromDate);

  // STEP 1: Fetch ALL entries once on mount.
  // Store full dataset in `allEntries` (never mutated after fetch).
  // Apply initial filter: show only today's entries by default.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.impactTests}/filter?startDate=2000-01-01&endDate=2099-12-31`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch impact data');
        const result = await response.json();

        if (result.success && result.data) {
          setAllEntries(result.data);

          // Default view: only today's entries
          const todayFiltered = result.data.filter(r => {
            if (!r.date) return false;
            return formatDateLocal(r.date) === todayStr;
          });
          setFilteredEntries(todayFiltered);
        }
      } catch (error) {
        console.error('Error fetching impact data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // STEP 2: handleFilter — Client-side filtering of `allEntries`.
  // Filters by date range. Always resets pagination to page 1.
  const handleFilter = () => {
    if (!toDate) {
      setFilteredEntries([]);
      return;
    }

    const toDateStr = toDate;
    const fromDateStr = fromDate || '';

    // Date range filter:
    // - If fromDate is set: entry date must be >= fromDate AND <= toDate
    // - If fromDate is empty: show only entries matching toDate exactly
    const filtered = allEntries.filter(r => {
      if (!r.date) return false;
      const reportDate = formatDateLocal(r.date);
      if (fromDateStr) {
        return reportDate >= fromDateStr && reportDate <= toDateStr;
      }
      return reportDate === toDateStr;
    });

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  // STEP 3: handleClear — Reset all filters to defaults.
  // Shows only today's entries (same as initial load), resets dates and pagination.
  const handleClear = () => {
    setFromDate('');
    setToDate(todayStr);
    // Re-filter to today's entries only (not all entries)
    const todayFiltered = allEntries.filter(r => {
      if (!r.date) return false;
      return formatDateLocal(r.date) === todayStr;
    });
    setFilteredEntries(todayFiltered);
    setCurrentPage(1);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')} / ${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()}`;
  };

  // Sort entries by date descending
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredEntries]);

  // Pagination
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

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

  return (
    <>
      <div className="impact-report-header">
        <div className="impact-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Impact Test - Report
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="impact-filter-container">
        <div className="impact-filter-group">
          <label>From Date</label>
          <CustomDatePicker
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From date"
          />
        </div>
        <div className="impact-filter-group">
          <label>To Date</label>
          <CustomDatePicker
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To date"
          />
        </div>
        <FilterButton onClick={handleFilter} disabled={!isFilterEnabled} />
        <ClearButton onClick={handleClear} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="impact-loader-container">
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading...</div>
        </div>
      ) : (
        <div className="reusable-table-container">
          <table className="reusable-table" style={{ tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Part Name</th>
                <th style={{ width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>Date Code</th>
                <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Specification</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Observed Value</th>
                <th style={{ width: '15%', textAlign: 'center', whiteSpace: 'nowrap' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="reusable-table-no-records">No records found</td>
                </tr>
              ) : (
                paginatedEntries.map((item, idx) => {
                  const isDateGroupStart = dateGroups[idx];

                  return (
                    <tr key={item._id || idx}>
                      {isDateGroupStart ? (
                        <td
                          rowSpan={isDateGroupStart.rowspan}
                          style={{ textAlign: 'center', verticalAlign: 'middle' }}
                        >
                          {formatDisplayDate(item.date)}
                        </td>
                      ) : null}
                      <td style={{ textAlign: 'center' }}>{item.partName || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{item.dateCode || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{item.specification || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {item.observedValue !== undefined && item.observedValue !== null ? item.observedValue : '-'}
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.remarks || '-'}</td>
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
    </>
  );
};

export default ImpactReport;
