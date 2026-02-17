import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck, ArrowLeft } from 'lucide-react';
import Table from '../../Components/Table';
import { buildApiUrl } from '../../config/api';
import '../../styles/PageStyles/Process/ProcessReportEntries.css';

const ProcessReportEntries = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { date, disa } = location.state || {};
  const [currentEntries, setCurrentEntries] = useState(location.state?.entries || []);
  const [loading, setLoading] = useState(false);
  const [tableKey, setTableKey] = useState(Date.now());

  // Fetch fresh data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl('/api/v1/process'), {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
          // Filter entries by the current date and DISA (API returns flattened entries)
          const filteredEntries = (data.data || []).filter(item => {
            if (!item.date) return false;
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            const matchesDate = itemDate === date;
            const matchesDisa = !disa || item.disa === disa;
            return matchesDate && matchesDisa;
          });
          setCurrentEntries(filteredEntries);
          setTableKey(Date.now());
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchInitialData();
    }
  }, [date, disa]);

  useEffect(() => {
    if (!date) {
      navigate('/process/report');
    }
  }, [date, navigate]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/v1/process'), {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        // Filter entries by the current date and DISA (API returns flattened entries)
        const filteredEntries = (data.data || []).filter(item => {
          if (!item.date) return false;
          const itemDate = new Date(item.date).toISOString().split('T')[0];
          const matchesDate = itemDate === date;
          const matchesDisa = !disa || item.disa === disa;
          return matchesDate && matchesDisa;
        });
        setCurrentEntries(filteredEntries);
        setTableKey(Date.now());
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'No Date') return 'No Date';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentEntries || currentEntries.length === 0) {
    return null;
  }


  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentEntries || currentEntries.length === 0) {
    return null;
  }

  return (
    <>
      <div className="process-entries-header">
        <div className="process-entries-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Process Control - Report
          </h2>
        </div>
        <button className="process-entries-back-btn" onClick={() => navigate('/process/report')}>
          <ArrowLeft size={18} />
          Back to Cards
        </button>
      </div>

      <div className="process-entries-info">
        <div className="process-entries-info-item">
          <span className="process-entries-info-label">Date:</span>
          <span className="process-entries-info-value">{formatDate(date)}</span>
        </div>
        <div className="process-entries-info-item">
          <span className="process-entries-info-label">DISA:</span>
          <span className="process-entries-info-value">{disa || '-'}</span>
        </div>
      </div>

      <Table
        key={tableKey}
        columns={[
          { key: 'partName', label: 'Part Name', width: '150px',align:'center' },
          { key: 'datecode', label: 'Date Code', width: '100px', align: 'center' },
          { key: 'heatcode', label: 'Heat Code', width: '100px', align: 'center' },
          { key: 'quantityOfMoulds', label: 'Qty. Of Moulds', width: '120px', align: 'center' },
          { key: 'metalCompositionC', label: 'C', width: '70px', align: 'center' },
          { key: 'metalCompositionSi', label: 'Si', width: '70px', align: 'center' },
          { key: 'metalCompositionMn', label: 'Mn', width: '70px', align: 'center' },
          { key: 'metalCompositionP', label: 'P', width: '70px', align: 'center' },
          { key: 'metalCompositionS', label: 'S', width: '70px', align: 'center' },
          { key: 'metalCompositionMgFL', label: 'Mg FL', width: '80px', align: 'center' },
          { key: 'metalCompositionCu', label: 'Cu', width: '70px', align: 'center' },
          { key: 'metalCompositionCr', label: 'Cr', width: '70px', align: 'center' },
          { key: 'timeOfPouring', label: 'Time Of Pouring', width: '130px', align: 'center' },
          { key: 'pouringTemperature', label: 'Pouring Temp', width: '110px', align: 'center' },
          { key: 'ppCode', label: 'PP Code', width: '90px', align: 'center' },
          { key: 'treatmentNo', label: 'Treatment No', width: '110px', align: 'center' },
          { key: 'fcNo', label: 'FC No', width: '80px', align: 'center' },
          { key: 'heatNo', label: 'Heat No', width: '90px', align: 'center' },
          { key: 'conNo', label: 'Con No', width: '80px', align: 'center' },
          { key: 'tappingTime', label: 'Tapping Time', width: '110px', align: 'center' },
          { key: 'correctiveAdditionC', label: 'Corr. Add C', width: '100px', align: 'center' },
          { key: 'correctiveAdditionSi', label: 'Corr. Add Si', width: '100px', align: 'center' },
          { key: 'correctiveAdditionMn', label: 'Corr. Add Mn', width: '110px', align: 'center' },
          { key: 'correctiveAdditionS', label: 'Corr. Add S', width: '100px', align: 'center' },
          { key: 'correctiveAdditionCr', label: 'Corr. Add Cr', width: '100px', align: 'center' },
          { key: 'correctiveAdditionCu', label: 'Corr. Add Cu', width: '110px', align: 'center' },
          { key: 'correctiveAdditionSn', label: 'Corr. Add Sn', width: '110px', align: 'center' },
          { key: 'tappingWt', label: 'Tapping Wt', width: '100px', align: 'center' },
          { key: 'mg', label: 'Mg', width: '70px', align: 'center' },
          { key: 'resMgConvertor', label: 'Res Mg Convertor', width: '140px', align: 'center' },
          { key: 'recOfMg', label: 'Rec Of Mg', width: '100px', align: 'center' },
          { key: 'streamInoculant', label: 'Stream Inoculant', width: '140px', align: 'center' },
          { key: 'pTime', label: 'P Time', width: '80px', align: 'center' },
          { key: 'remarks', label: 'Remarks', width: '200px',align: 'center' }
        ]}
        data={currentEntries}
        minWidth={3800} //Table width
        defaultAlign="left"
        noDataMessage="No process entries found"
      />
    </>
  );
};

export default ProcessReportEntries;
