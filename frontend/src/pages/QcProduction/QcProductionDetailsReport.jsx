import React, { useState, useEffect } from 'react';
import { PencilLine, BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/QcProduction/QcProductionDetailsReport.css';

const QcProductionDetailsReport = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  // Helper function to validate range format (e.g., "3.50-3.75" or "3.50")
  const isValidRange = (value) => {
    if (!value || value.trim() === '') return false;
    const trimmed = value.trim();
    // Check if it's a range (e.g., "3.50-3.75") or single number
    const rangePattern = /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/;
    const numberPattern = /^\d+(\.\d+)?$/;
    return rangePattern.test(trimmed) || numberPattern.test(trimmed);
  };

  const fetchItems = async () => {

    try {
      setLoading(true);
      
      // Get today's date in local timezone (YYYY-MM-DD format)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      setCurrentDate(todayStr);
      
      const response = await fetch(API_ENDPOINTS.qcReports, { credentials: 'include' });
      const data = await response.json();

      let serverItems = [];
      if (data.success) {
        serverItems = data.data || [];
      }

      // Merge with locally stored QC entries (frontend-only fallback)
      let localItems = [];
      try {
        const localRaw = localStorage.getItem('qcProductionLocalEntries');
        localItems = localRaw ? JSON.parse(localRaw) : [];
      } catch (e) {
        console.error('Error reading local QC entries:', e);
      }

      const combined = [...serverItems, ...localItems];
      setItems(combined);
      
      // Filter to show today's entries by default
      const todaysEntries = combined.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === todayStr;
      });
      setFilteredItems(todaysEntries);

    } catch (error) {
      console.error('Error fetching QC production details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      // If end date is provided, filter by date range
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      } else {
        // If only start date is provided, show only records from that exact date
        return itemDate.getTime() === start.getTime();
      }
    });

    setFilteredItems(filtered);
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    
    // Show today's entries again when clearing
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const todaysEntries = items.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      return itemDate === todayStr;
    });
    setFilteredItems(todaysEntries);
  };

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
          {loading ? 'Loading...' : `DATE : ${formatDateDisplay(currentDate)}`}
        </div>
      </div>

      <div className="impact-filter-container">
        <div className="impact-filter-group">
          <label>Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Select start date"
          />
        </div>
        <div className="impact-filter-group">
          <label>End Date</label>
          <CustomDatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Select end date"
          />
        </div>
        <FilterButton onClick={handleFilter} disabled={!startDate}>
          Filter
        </FilterButton>
        <ClearButton onClick={handleClearFilter} disabled={!startDate && !endDate}>
          Clear
        </ClearButton>
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
              width: '120px',
              align: 'center',
              render: (item) => formatDateDisplay(item.date)
            },
            { key: 'partName', label: 'Part Name', width: '180px',align : "center"  },
            { key: 'noOfMoulds', label: 'No.Of Moulds', width: '130px', align: 'center' },
            { 
              key: 'cPercent', 
              label: 'C %', 
              width: '80px',
              align: 'center',
              render: (item) => item.cPercent !== undefined && item.cPercent !== null ? item.cPercent : '-'
            },
            { 
              key: 'siPercent', 
              label: 'Si %', 
              width: '80px',
              align: 'center',
              render: (item) => item.siPercent !== undefined && item.siPercent !== null ? item.siPercent : '-'
            },
            { 
              key: 'mnPercent', 
              label: 'Mn %', 
              width: '80px',
              align: 'center',
              render: (item) => item.mnPercent !== undefined && item.mnPercent !== null ? item.mnPercent : '-'
            },
            { 
              key: 'pPercent', 
              label: 'P %', 
              width: '80px',
              align: 'center',
              render: (item) => item.pPercent !== undefined && item.pPercent !== null ? item.pPercent : '-'
            },
            { 
              key: 'sPercent', 
              label: 'S %', 
              width: '80px',
              align: 'center',
              render: (item) => item.sPercent !== undefined && item.sPercent !== null ? item.sPercent : '-'
            },
            { 
              key: 'mgPercent', 
              label: 'Mg %', 
              width: '80px',
              align: 'center',
              render: (item) => item.mgPercent !== undefined && item.mgPercent !== null ? item.mgPercent : '-'
            },
            { 
              key: 'cuPercent', 
              label: 'Cu %', 
              width: '80px',
              align: 'center',
              render: (item) => item.cuPercent !== undefined && item.cuPercent !== null ? item.cuPercent : '-'
            },
            { 
              key: 'crPercent', 
              label: 'Cr %', 
              width: '80px',
              align: 'center',
              render: (item) => item.crPercent !== undefined && item.crPercent !== null ? item.crPercent : '-'
            },
            { key: 'nodularity', label: 'Nodularity', width: '110px', align: 'center' },
            { key: 'graphiteType', label: 'Graphite Type', width: '130px', align: 'center' },
            { key: 'pearliteFerrite', label: 'Pearlite Ferrite', width: '140px', align: 'center' },
            { 
              key: 'hardnessBHN', 
              label: 'Hardness BHN', 
              width: '130px',
              align: 'center',
              render: (item) => item.hardnessBHN !== undefined && item.hardnessBHN !== null ? item.hardnessBHN : '-'
            },
            { 
              key: 'ts', 
              label: 'TS', 
              width: '80px',
              align: 'center',
              render: (item) => item.ts !== undefined && item.ts !== null ? item.ts : '-'
            },
            { 
              key: 'ys', 
              label: 'YS', 
              width: '80px',
              align: 'center',
              render: (item) => item.ys !== undefined && item.ys !== null ? item.ys : '-'
            },
            { 
              key: 'el', 
              label: 'EL', 
              width: '80px',
              align: 'center',
              render: (item) => item.el !== undefined && item.el !== null ? item.el : '-'
            }
          ]}
          data={filteredItems}
          minWidth={2000}
          defaultAlign="left"
          groupByColumn="date"
          noDataMessage="No records found"
        />
      )}
    </>
  );
};

export default QcProductionDetailsReport;