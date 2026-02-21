import React, { useState, useEffect, useMemo } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton, CustomPagination, FilterDisaDropdown } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import ProcessReportDetail from './ProcessReportDetail';
import Loader from '../../Components/Loader';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/Process/ProcessReport.css';

const ProcessReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDisa, setSelectedDisa] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredDateGroup, setHoveredDateGroup] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  
  // Detail view state
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailType, setDetailType] = useState(null); // 'date' or 'entry'
  
  // Data fetching states
  const [allEntries, setAllEntries] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 15; // Show 15 items per page

  // Fetch all entries from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.process, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch process data');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter out entries with empty disa
          const validEntries = result.data.filter(entry => entry.disa && entry.disa.trim() !== '');
          setAllEntries(validEntries);
          
          // Group entries by date and DISA
          const grouped = groupEntriesByDateAndDisa(validEntries);
          setReportData(grouped);
          setFilteredData(grouped);
        }
      } catch (error) {
        console.error('Error fetching process data:', error);
        alert('Failed to load process data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Group entries by date and DISA combination
  const groupEntriesByDateAndDisa = (entries) => {
    const groups = {};
    
    entries.forEach(entry => {
      const key = `${entry.date}_${entry.disa}`;
      
      if (!groups[key]) {
        groups[key] = {
          _id: key,
          date: entry.date,
          disa: entry.disa,
          entries: [],
          count: 0
        };
      }
      
      groups[key].entries.push(entry);
      groups[key].count++;
    });
    
    // Convert to array and sort by date (newest first) and then by disa
    return Object.values(groups).sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.disa.localeCompare(b.disa);
    });
  };

  // Get unique DISA values from all entries - recalculate when allEntries changes
  const disaOptions = useMemo(() => {
    const uniqueDisa = Array.from(new Set(allEntries.map(item => item.disa).filter(Boolean))).sort();
    return ['All', ...uniqueDisa];
  }, [allEntries]);

  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = () => {
    // Validate that end date is not before start date
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date');
      return;
    }

    if (!startDate) {
      return;
    }

    const filtered = reportData.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      const startD = new Date(startDate);
      startD.setHours(0, 0, 0, 0);

      // Date filter
      let dateMatch = false;
      if (endDate) {
        const endD = new Date(endDate);
        endD.setHours(23, 59, 59, 999);
        dateMatch = itemDate >= startD && itemDate <= endD;
      } else {
        dateMatch = itemDate.getTime() === startD.getTime();
      }

      // DISA filter
      const disaMatch = selectedDisa === 'All' || item.disa === selectedDisa;

      return dateMatch && disaMatch;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedDisa('All');
    setFilteredData(reportData);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate rowspans for date grouping
  const calculateDateGroups = () => {
    const groups = {};
    let currentDate = null;
    let groupStart = 0;
    
    currentData.forEach((item, index) => {
      if (item.date !== currentDate) {
        if (currentDate !== null) {
          groups[groupStart] = {
            rowspan: index - groupStart,
            date: currentDate
          };
        }
        currentDate = item.date;
        groupStart = index;
      }
      
      if (index === currentData.length - 1) {
        groups[groupStart] = {
          rowspan: index - groupStart + 1,
          date: currentDate
        };
      }
    });
    
    return groups;
  };

  const dateGroups = calculateDateGroups();

  // Check if a row belongs to a hovered date group
  const isRowInHoveredDateGroup = (rowIndex) => {
    if (!hoveredDateGroup) return false;
    return currentData[rowIndex]?.date === hoveredDateGroup;
  };

  // Get the date for a specific row (to highlight date cell when hovering row)
  const getDateForRow = (rowIndex) => {
    return currentData[rowIndex]?.date;
  };

  // Handle click on date to show all entries for that date
  const handleDateClick = (date) => {
    const dateEntries = allEntries.filter(item => item.date === date);
    setDetailData(dateEntries);
    setDetailType('date');
    setShowDetailView(true);
  };

  // Handle click on specific row to show detailed entry
  const handleRowClick = (item) => {
    // item.entries contains all entries for this date+disa combination
    setDetailData(item.entries);
    setDetailType('entry');
    setShowDetailView(true);
  };

  // Handle back to main view
  const handleBackToMain = () => {
    setShowDetailView(false);
    setDetailData(null);
    setDetailType(null);
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date', 
      width: '150px',
      align: 'center',
      render: (item) => formatDate(item.date)
    },
    { 
      key: 'disa', 
      label: 'DISA', 
      width: '150px', 
      align: 'center' 
    },
    { 
      key: 'entries', 
      label: 'No. of Entries', 
      width: '150px',
      align: 'center',
      render: (item) => item.count
    }
  ];

  // Show loading state
  if (loading) {
    return <Loader />;
  }

  // Render detail view if active
  if (showDetailView && detailData) {
    return (
      <ProcessReportDetail 
        detailData={detailData}
        detailType={detailType}
        onBack={handleBackToMain}
      />
    );
  }

  // Main report view
  return (
    <>
      <div className="impact-report-header">
        <div className="impact-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Process Control - Report
          </h2>
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
            min={startDate}
          />
        </div>
        <div className="impact-filter-group">
          <label>DISA</label>
          <FilterDisaDropdown
            value={selectedDisa}
            onChange={(e) => setSelectedDisa(e.target.value)}
            options={disaOptions.filter(disa => disa !== 'All')}
          />
        </div>
        <FilterButton onClick={handleFilter} disabled={!startDate}>
          Filter
        </FilterButton>
        <ClearButton onClick={handleClearFilter} disabled={!startDate && !endDate}>
          Clear
        </ClearButton>
      </div>

      {/* Custom Table with Grouped Date Hover */}
      <div className="reusable-table-container">
        <table 
          className="reusable-table"
          style={{ minWidth: '500px' }}
        >
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={col.key || index}
                  style={{
                    width: col.width || 'auto',
                    textAlign: col.align || 'center'
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="reusable-table-no-records"
                >
                  No records found
                </td>
              </tr>
            ) : (
              currentData.map((item, rowIndex) => {
                const isDateGroupStart = dateGroups[rowIndex];
                const isInHoveredGroup = isRowInHoveredDateGroup(rowIndex);
                const isRowHovered = hoveredRow === rowIndex;
                
                // Check if this date cell should be highlighted due to row hover
                const shouldHighlightDateCell = hoveredRow !== null && 
                  isDateGroupStart && 
                  getDateForRow(hoveredRow) === item.date;
                
                return (
                  <tr 
                    key={item._id || rowIndex}
                    className={`${isInHoveredGroup && !isRowHovered ? 'date-group-hovered' : ''} ${isRowHovered ? 'row-hovered' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRowClick(item)}
                  >
                    {isDateGroupStart ? (
                      <td 
                        rowSpan={isDateGroupStart.rowspan}
                        className={`date-cell ${shouldHighlightDateCell ? 'date-cell-row-hovered' : ''}`}
                        onMouseEnter={(e) => {
                          e.stopPropagation();
                          setHoveredDateGroup(item.date);
                          setHoveredRow(null);
                        }}
                        onMouseLeave={(e) => {
                          e.stopPropagation();
                          setHoveredDateGroup(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDateClick(item.date);
                        }}
                        style={{
                          ...{
                            width: '150px',
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            color: '#475569'
                          },
                          cursor: 'pointer'
                        }}
                      >
                        {formatDate(item.date)}
                      </td>
                    ) : null}
                    <td 
                      style={{
                        width: '150px',
                        textAlign: 'center',
                        color: '#475569'
                      }}
                      onMouseEnter={() => {
                        setHoveredRow(rowIndex);
                        setHoveredDateGroup(null);
                      }}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {item.disa}
                    </td>
                    <td 
                      style={{
                        width: '150px',
                        textAlign: 'center',
                        color: '#475569'
                      }}
                      onMouseEnter={() => {
                        setHoveredRow(rowIndex);
                        setHoveredDateGroup(null);
                      }}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {item.count}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <CustomPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default ProcessReport;
