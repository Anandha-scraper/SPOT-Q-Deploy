import React, { useState, useEffect, useMemo } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, CustomPagination } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Tensile/TensileReport.css';

const TensileReport = () => {
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

  // Helper: display date in readable format (e.g., "23 / 01 / 2026")
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const isoDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr;
      const [y, m, d] = isoDate.split('-');
      return `${d} / ${m} / ${y}`;
    } catch {
      return dateStr;
    }
  };

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(todayStr);
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const isFilterEnabled = toDate && toDate.trim() !== '' && !(fromDate && fromDate.trim() !== '' && toDate <= fromDate);

  // Fetch ALL entries once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.tensile, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch tensile data');
        const result = await response.json();

        if (result.success && result.data) {
          setAllEntries(result.data);

          // Default: show only today's entries
          const todayFiltered = result.data.filter(r => {
            const d = r.date;
            if (!d) return false;
            return formatDateLocal(d) === todayStr;
          });
          setFilteredEntries(todayFiltered);
        }
      } catch (error) {
        console.error('Error fetching tensile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = () => {
    if (!toDate) { setFilteredEntries([]); return; }

    const toDateStr = toDate;
    const fromDateStr = fromDate || '';

    const filtered = allEntries.filter(r => {
      const d = r.date;
      if (!d) return false;
      const reportDate = formatDateLocal(d);
      if (fromDateStr) {
        return reportDate >= fromDateStr && reportDate <= toDateStr;
      }
      return reportDate === toDateStr;
    });

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFromDate('');
    setToDate(todayStr);

    const todayFiltered = allEntries.filter(r => {
      const d = r.date;
      if (!d) return false;
      return formatDateLocal(d) === todayStr;
    });
    setFilteredEntries(todayFiltered);
    setCurrentPage(1);
  };

  // Sort: date descending
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return db - da;
    });
  }, [filteredEntries]);

  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="tensile-report-header">
        <div className="tensile-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Tensile Test - Report
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          {loading ? 'Loading...' : `DATE : ${formatDateDisplay(todayStr)}`}
        </div>
      </div>

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

      {loading ? (
        <div className="impact-loader-container">
          <div>Loading...</div>
        </div>
      ) : (
        <Table
          columns={[
            {
              key: 'date',
              label: 'Date of Inspection',
              width: '140px',
              bold: true,
              align: 'center',
              render: (item) => {
                const dateToUse = item.date;
                if (!dateToUse) return '-';
                const dateStr = typeof dateToUse === 'string' ? dateToUse : dateToUse.toString();
                const isoDate = dateStr.split('T')[0];
                return formatDateDisplay(isoDate);
              }
            },
            { key: 'item', label: 'Item', width: '200px', align: 'center' },
            { key: 'dateCode', label: 'Date Code', width: '120px', align: 'center' },
            { key: 'heatCode', label: 'Heat Code', width: '120px', align: 'center' },
            { key: 'dia', label: 'Dia (mm)', width: '100px', align: 'center' },
            { key: 'lo', label: 'Lo (mm)', width: '100px', align: 'center' },
            { key: 'li', label: 'Li (mm)', width: '100px', align: 'center' },
            { key: 'breakingLoad', label: 'Breaking Load (kN)', width: '160px', align: 'center' },
            { key: 'yieldLoad', label: 'Yield Load (kN)', width: '140px', align: 'center' },
            { key: 'uts', label: 'UTS (N/mm²)', width: '120px', align: 'center' },
            { key: 'ys', label: 'YS (N/mm²)', width: '120px', align: 'center' },
            { key: 'elongation', label: 'Elongation (%)', width: '140px', align: 'center' },
            { key: 'testedBy', label: 'Tested By', width: '140px', align: 'center' },
            {
              key: 'remarks',
              label: 'Remarks',
              width: '200px',
              align: 'center'
            }
          ]}
          data={paginatedEntries}
          groupByColumn="date"
          noDataMessage="No records found"
        />
      )}

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

export default TensileReport;