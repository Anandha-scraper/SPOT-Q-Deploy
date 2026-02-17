import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/Impact/ImpactReport.css';

const ImpactReport = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    fetchCurrentDateAndEntries();
  }, []);

  const fetchCurrentDateAndEntries = async () => {
    setLoading(true);
    try {
      // Get today's date in local timezone (YYYY-MM-DD format)
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      setCurrentDate(todayStr);

      // Fetch entries for current date
      const response = await fetch(buildApiUrl(`/api/v1/impact-tests/by-date?date=${todayStr}`), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        const list = Array.isArray(data.data) ? data.data.map(item => ({ ...item, date: todayStr })) : [];
        setEntries(list);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      setCurrentDate(todayStr);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    // Validate that end date is not before start date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/v1/impact-tests/by-date?date=${startDate}`), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        let list = Array.isArray(data.data) ? data.data.map(item => ({ ...item, date: startDate })) : [];
        
        // If end date is provided and different from start date, fetch additional dates
        if (endDate && endDate !== startDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const allEntries = [...list];
          
          // Fetch entries for each date in range
          const currentDate = new Date(start);
          currentDate.setDate(currentDate.getDate() + 1); // Start from day after start date
          
          while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            try {
              const dateResponse = await fetch(buildApiUrl(`/api/v1/impact-tests/by-date?date=${dateStr}`), {
                credentials: 'include'
              });
              const dateData = await dateResponse.json();
              if (dateData.success && Array.isArray(dateData.data)) {
                const dateEntries = dateData.data.map(item => ({ ...item, date: dateStr }));
                allEntries.push(...dateEntries);
              }
            } catch (err) {
              console.error(`Error fetching entries for ${dateStr}:`, err);
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          list = allEntries;
        }
        
        setEntries(list);
        setCurrentDate(startDate);
        setIsFiltered(true);
      }
    } catch (error) {
      console.error('Error fetching entries by date:', error);
      alert('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setIsFiltered(false);
    fetchCurrentDateAndEntries();
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
            Impact Test - Report
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
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Select start date"
          />
        </div>
        <div className="impact-filter-group">
          <label>End Date</label>
          <CustomDatePicker
            value={endDate || ''}
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
              render: (item) => {
                const raw = item.date || currentDate;
                const isoDate = typeof raw === 'string' ? raw.split('T')[0] : new Date(raw).toISOString().split('T')[0];
                return formatDateDisplay(isoDate);
              }
            },
            { key: 'partName', label: 'Part Name', width: '200px', align : 'center' },
            { key: 'dateCode', label: 'Date Code', width: '120px', align: 'center' },
            { 
              key: 'specification', 
              label: 'Specification', 
              width: '200px',
              align: 'center',
              render: (item) => item.specification || '-'
            },
            { 
              key: 'observedValue', 
              label: 'Observed Value', 
              width: '140px',
              align: 'center',
              render: (item) => item.observedValue !== undefined && item.observedValue !== null ? item.observedValue : '-'
            },
            { key: 'remarks', label: 'Remarks', width: '250px', align: 'center' }
          ]}
          data={entries}
          minWidth={1200}
          defaultAlign="left"
          groupByColumn="date"
          noDataMessage={isFiltered ? 'No entries found for the selected date' : 'No entries found for today'}
        />
      )}
    </>
  );
};

export default ImpactReport;
