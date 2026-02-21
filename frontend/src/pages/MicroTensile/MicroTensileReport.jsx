import React, { useEffect, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { RemarksCard } from '../../Components/PopUp';
import { API_ENDPOINTS } from '../../config/api';
import '../../styles/PageStyles/MicroTensile/MicroTensileReport.css';


const MicroTensileReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [remarkModal, setRemarkModal] = useState({ open: false, text: '' });
  
  const disaOptions = ['DISA 1', 'DISA 2', 'DISA 3', 'DISA 4'];

  const formatDate = (d) => {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
      const [y, m, rest] = d.split('-');
      const day = rest.slice(0, 2);
      return `${day} / ${m} / ${y}`;
    }
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return String(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  };

  const handleFilter = async () => {
    if (!startDate) return;
    
    // Validate that end date is not before start date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const start = startDate;
      const end = endDate || startDate;
      const resp = await fetch(`${API_ENDPOINTS.microTensile}/filter?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const data = await resp.json();
      if (data?.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.dateOfInspection || a.createdAt || 0).getTime();
          const db = new Date(b.dateOfInspection || b.createdAt || 0).getTime();
          return db - da;
        });
        setEntries(sorted); // Show all filtered entries
      } else {
        setEntries([]);
      }
    } catch (e) {
      setError(e.message || 'Failed to fetch report data');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      
      const resp = await fetch(`${API_ENDPOINTS.microTensile}/filter?startDate=${encodeURIComponent(todayString)}&endDate=${encodeURIComponent(todayString)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      const res = await resp.json();
      if (res?.success && Array.isArray(res.data)) {
        // Filter to ensure we only get today's entries
        const todaysEntries = res.data.filter(entry => {
          const entryDate = entry.dateOfInspection || entry.date;
          if (!entryDate) return false;
          
          // Normalize the date for comparison
          const entryDateStr = typeof entryDate === 'string' 
            ? entryDate.split('T')[0] 
            : new Date(entryDate).toISOString().split('T')[0];
          
          return entryDateStr === todayString;
        });
        
        const sorted = [...todaysEntries].sort((a, b) => {
          const da = new Date(a.dateOfInspection || a.createdAt || 0).getTime();
          const db = new Date(b.dateOfInspection || b.createdAt || 0).getTime();
          return db - da;
        });
        setEntries(sorted);
      } else {
        setEntries([]);
      }
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setError('');
    setEntries([]);
    loadRecent();
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const PrimaryTable = ({ list }) => {
    const columns = [
      { 
        key: 'dateOfInspection', 
        label: 'Date of Inspection', 
        width: '10%',
        align: 'center',
        render: (r) => formatDate(r.dateOfInspection || r.date || r.dateOfInspection)
      },
      { 
        key: 'disa', 
        label: 'DISA', 
        width: '8%',
        align: 'center',
        render: (r) => Array.isArray(r.disa) ? r.disa.join(', ') : (r.disa || '-')
      },
      { 
        key: 'item', 
        label: 'Item', 
        width: '15%',
        align : "center",
        render: (r) => {
          if (!r.item) return '-';
          if (typeof r.item === 'string') return r.item;
          if (typeof r.item === 'object') {
            const it1 = r.item.it1 || '';
            const it2 = r.item.it2 || '';
            return `${it1}${it2 ? ' ' + it2 : ''}`.trim() || '-';
          }
          return String(r.item);
        }
      },
      { key: 'dateCode', label: 'Date Code', width: '8%', align: 'center' },
      { key: 'heatCode', label: 'Heat Code', width: '8%', align: 'center' },
      { key: 'barDia', label: 'Bar Dia (mm)', width: '8%', align: 'center', render: (r) => r.barDia ?? '-' },
      { key: 'gaugeLength', label: 'Gauge Length (mm)', width: '10%', align: 'center', render: (r) => r.gaugeLength ?? '-' },
      { key: 'maxLoad', label: 'Max Load (Kgs/KN)', width: '10%', align: 'center', render: (r) => r.maxLoad ?? '-' },
      { key: 'yieldLoad', label: 'Yield Load (Kgs/KN)', width: '11%', align: 'center', render: (r) => r.yieldLoad ?? '-' },
      { key: 'tensileStrength', label: 'Tensile Strength (Kg/mm² or MPa)', width: '14%', align: 'center', render: (r) => r.tensileStrength ?? '-' },
      { key: 'yieldStrength', label: 'Yield Strength (Kg/mm² or MPa)', width: '14%', align: 'center', render: (r) => r.yieldStrength ?? '-' },
      { key: 'elongation', label: 'Elongation', width: '8%', align: 'center', render: (r) => r.elongation ?? '-' },
      { key: 'testedBy', label: 'Tested By', width: '9%', align: 'center', render: (r) => r.testedBy ?? '-' },
      { 
        key: 'remarks', 
        label: 'Remarks', 
        align: 'center',
        width: '12%',
        render: (r) => r.remarks || '-'
      },
    ];

    const noDataMessage = startDate 
      ? 'No records found for the selected date range.' 
      : 'No records found for the current date.';

    return (
      <Table
        columns={columns}
        data={list}
        minWidth={2000}
        defaultAlign="left"
        noDataMessage={noDataMessage}
      />
    );
  };

  return (
    <>
      <div className="microtensile-report-header">
        <div className="microtensile-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Micro Tensile Test - Report
          </h2>
        </div>
        <div aria-label="Date" style={{ fontWeight: 600, color: '#25424c' }}>
          {loading ? 'Loading...' : (() => {
            const date = new Date();
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `DATE : ${day} / ${month} / ${year}`;
          })()}
        </div>
      </div>

      <div className="microtensile-filter-container">
        <div className="microtensile-filter-group">
          <label>Start Date</label>
          <CustomDatePicker
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Select start date"
          />
        </div>
        <div className="microtensile-filter-group">
          <label>End Date</label>
          <CustomDatePicker
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Select end date"
          />
        </div>
        <FilterButton onClick={handleFilter} disabled={!startDate || loading}>
          {loading ? 'Loading...' : 'Filter'}
        </FilterButton>
        <ClearButton onClick={handleClearFilter} disabled={!startDate && !endDate}>
          Clear
        </ClearButton>
      </div>

      <PrimaryTable list={entries} />

      {error && (
        <div className="chr-error">{error}</div>
      )}

      {remarkModal.open && (
        <RemarksCard
          isOpen={remarkModal.open}
          onClose={() => setRemarkModal({ open: false, text: '' })}
          remarksText={remarkModal.text}
        />
      )}
    </>
  );
};

export default MicroTensileReport;
