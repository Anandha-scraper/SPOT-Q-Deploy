import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/Tensile/TensileReport.css';

const TensileReport = () => {
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

  const [currentDate, setCurrentDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    fetchCurrentDateAndEntries();
  }, []);

  const refreshData = async () => {
    if (isFilterActive && startDate) {
      // Re-fetch filtered data
      await fetchFilteredData();
    } else {
      // Re-fetch current date data
      await fetchCurrentDateAndEntries();
    }
  };

  const fetchFilteredData = async () => {
    try {
      setLoading(true);

      // Build query params
      let query = `startDate=${startDate}`;
      if (endDate) {
        query += `&endDate=${endDate}`;
      }

      const response = await fetch(buildApiUrl(`/api/v1/tensile/filter?${query}`), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Error filtering entries:', error);
      alert('Failed to filter entries: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDateAndEntries = async () => {
    try {
      setLoading(true);
      // Get current date (client-side)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      setCurrentDate(todayStr);

      // Fetch entries for current date
      const response = await fetch(buildApiUrl(`/api/v1/tensile/by-date?date=${todayStr}`), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tensile tests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helpers for remarks truncation and modal
  const splitIntoSentences = (text) => {
    if (!text) return [];
    return text
      .replace(/\n+/g, ' ')
      .trim()
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
  };

  const getTwoSentencePreview = (text) => {
    const sentences = splitIntoSentences(text);
    if (sentences.length <= 2) return { preview: text, truncated: false };
    const preview = sentences.slice(0, 2).join(' ');
    return { preview, truncated: true };
  };

  const handleFilter = async () => {
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    setIsFilterActive(true);
    await fetchFilteredData();
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setIsFilterActive(false);
    fetchCurrentDateAndEntries();
  };

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
              label: 'Date of Inspection', 
              width: '140px', 
              bold: true,
              align: 'center',
              render: (item) => {
                const dateToUse = item.date || currentDate;
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
          data={entries}
          groupByColumn="date"
          noDataMessage="No records found"
        />
      )}
    </>
  );
};

export default TensileReport;