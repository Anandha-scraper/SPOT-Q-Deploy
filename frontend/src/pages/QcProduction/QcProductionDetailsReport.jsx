import React, { useState, useEffect, useMemo } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, CustomPagination } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/QcProduction/QcProductionDetailsReport.css';

const QcProductionDetailsReport = () => {
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

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(todayStr);
  const [allEntries, setAllEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const isFilterEnabled = toDate && toDate.trim() !== '' && !(fromDate && fromDate.trim() !== '' && toDate <= fromDate);

  // Fetch ALL entries once on mount (server + localStorage)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.qcReports, { credentials: 'include' });
        const data = await response.json();

        let serverItems = [];
        if (data.success) serverItems = data.data || [];

        let localItems = [];
        try {
          const localRaw = localStorage.getItem('qcProductionLocalEntries');
          localItems = localRaw ? JSON.parse(localRaw) : [];
        } catch (e) {
          console.error('Error reading local QC entries:', e);
        }

        const combined = [...serverItems, ...localItems];
        setAllEntries(combined);

        // Default: show only today's entries
        const todayFiltered = combined.filter(r => {
          if (!r.date) return false;
          return formatDateLocal(r.date) === todayStr;
        });
        setFilteredEntries(todayFiltered);
      } catch (error) {
        console.error('Error fetching QC production details:', error);
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

  const handleClear = () => {
    setFromDate('');
    setToDate(todayStr);

    const todayFiltered = allEntries.filter(r => {
      if (!r.date) return false;
      return formatDateLocal(r.date) === todayStr;
    });
    setFilteredEntries(todayFiltered);
    setCurrentPage(1);
  };

  // Sort: date descending
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredEntries]);

  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = sortedEntries.slice(startIndex, startIndex + itemsPerPage);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day} / ${month} / ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Helper function to format range display - if max is 0, show only min
  const formatRangeDisplay = (rangeStr) => {
    if (!rangeStr) return '-';
    const trimmed = rangeStr.trim();
    
    // Check if it contains a hyphen (range format)
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const min = parts[0];
        const max = parts[1];
        // If max is 0 or empty, show only min
        if (max === '0' || max === '0.0' || max === '') {
          return min;
        }
        return `${min} - ${max}`;
      }
    }
    
    // Return as-is if not a range format
    return trimmed;
  };

  return (
    <>
      <div className="impact-report-header">
        <div className="impact-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            QC Production Details - Report
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
              label: 'Date', 
              width: '130px',
              align: 'center',
              render: (item) => formatDateDisplay(item.date)
            },
            { key: 'partName', label: 'Part Name', width: '180px', align: "center" },
            { key: 'noOfMoulds', label: 'No.Of Moulds', width: '130px', align: 'center' },
            { 
              key: 'cPercent', 
              label: 'C %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.cPercent)
            },
            { 
              key: 'siPercent', 
              label: 'Si %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.siPercent)
            },
            { 
              key: 'mnPercent', 
              label: 'Mn %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.mnPercent)
            },
            { 
              key: 'pPercent', 
              label: 'P %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.pPercent)
            },
            { 
              key: 'sPercent', 
              label: 'S %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.sPercent)
            },
            { 
              key: 'mgPercent', 
              label: 'Mg %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.mgPercent)
            },
            { 
              key: 'cuPercent', 
              label: 'Cu %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.cuPercent)
            },
            { 
              key: 'crPercent', 
              label: 'Cr %', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.crPercent)
            },
            { 
              key: 'nodularity', 
              label: 'Nodularity', 
              width: '150px', 
              align: 'center',
              render: (item) => formatRangeDisplay(item.nodularity)
            },
            { 
              key: 'graphiteType', 
              label: 'Graphite Type', 
              width: '150px', 
              align: 'center',
              render: (item) => formatRangeDisplay(item.graphiteType)
            },
            { 
              key: 'pearliteFerrite', 
              label: 'Pearlite Ferrite', 
              width: '160px', 
              align: 'center',
              render: (item) => formatRangeDisplay(item.pearliteFerrite)
            },
            { 
              key: 'hardnessBHN', 
              label: 'Hardness BHN', 
              width: '150px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.hardnessBHN)
            },
            { 
              key: 'ts', 
              label: 'TS', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.ts)
            },
            { 
              key: 'ys', 
              label: 'YS', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.ys)
            },
            { 
              key: 'el', 
              label: 'EL', 
              width: '130px',
              align: 'center',
              render: (item) => formatRangeDisplay(item.el)
            }
          ]}
          data={paginatedEntries}
          minWidth={2400}
          defaultAlign="left"
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

export default QcProductionDetailsReport;