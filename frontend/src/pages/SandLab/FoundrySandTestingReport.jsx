import React, { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import Table from '../../Components/Table';
import '../../styles/PageStyles/Sandlab/FoundrySandTestingReport.css';

const FoundrySandTestingReport = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to fetch data from API
  const fetchData = async (date = null) => {
    try {
      setLoading(true);
      const targetDate = date || getCurrentDate();
      const response = await fetch(`http://localhost:5000/api/v1/foundry-sand-testing-notes/date/${targetDate}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setReportData(data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current date data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleFilter = () => {
    if (selectedDate) {
      fetchData(selectedDate);
    }
  };

  const handleClear = () => {
    setSelectedDate('');
    fetchData();
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Prepare data for Clay Tests Table
  const prepareClayTestsData = () => {
    const rows = [];
    reportData.forEach((record) => {
      if (record.clayTests) {
        ['test1', 'test2'].forEach((testKey) => {
          const test = record.clayTests[testKey];
          if (test && Object.values(test).some(val => val && Object.values(val).some(v => v))) {
            rows.push({
              _id: `${record._id}-${testKey}`,
              date: formatDate(record.date),
              shift: record.shift,
              testNo: testKey === 'test1' ? 'Test 1' : 'Test 2',
              totalClay: test.totalClay?.solution || '-',
              activeClay: test.activeClay?.solution || '-',
              deadClay: test.deadClay?.solution || '-',
              vcm: test.vcm?.solution || '-',
              loi: test.loi?.solution || '-'
            });
          }
        });
      }
    });
    return rows;
  };

  // Prepare data for Sieve Testing Table
  const prepareSieveTestingData = () => {
    const rows = [];
    reportData.forEach((record) => {
      if (record.sieveTesting) {
        ['test1', 'test2'].forEach((testKey) => {
          const test = record.sieveTesting[testKey];
          if (test && test.sieveSize) {
            rows.push({
              _id: `${record._id}-${testKey}`,
              date: formatDate(record.date),
              shift: record.shift,
              testNo: testKey === 'test1' ? 'Test 1' : 'Test 2',
              s1700: test.sieveSize['1700'] || '-',
              s850: test.sieveSize['850'] || '-',
              s600: test.sieveSize['600'] || '-',
              s425: test.sieveSize['425'] || '-',
              s300: test.sieveSize['300'] || '-',
              s212: test.sieveSize['212'] || '-',
              s150: test.sieveSize['150'] || '-',
              s106: test.sieveSize['106'] || '-',
              s75: test.sieveSize['75'] || '-',
              pan: test.sieveSize['pan'] || '-',
              total: test.sieveSize['total'] || '-'
            });
          }
        });
      }
    });
    return rows;
  };

  // Prepare data for Parameters Table
  const prepareParametersData = () => {
    const rows = [];
    reportData.forEach((record) => {
      if (record.parameters) {
        ['test1', 'test2'].forEach((testKey) => {
          const test = record.parameters[testKey];
          if (test && Object.values(test).some(v => v)) {
            rows.push({
              _id: `${record._id}-${testKey}`,
              date: formatDate(record.date),
              shift: record.shift,
              testNo: testKey === 'test1' ? 'Test 1' : 'Test 2',
              compactability: test.compactability || '-',
              permeability: test.permeability || '-',
              gcs: test.gcs || '-',
              wts: test.wts || '-',
              moisture: test.moisture || '-',
              bentonite: test.bentonite || '-',
              coalDust: test.coalDust || '-',
              hopperLevel: test.hopperLevel || '-',
              shearStrength: test.shearStrength || '-',
              dustCollectorSettings: test.dustCollectorSettings || '-',
              returnSandMoisture: test.returnSandMoisture || '-'
            });
          }
        });
      }
    });
    return rows;
  };

  // Prepare data for Additional Data Table
  const prepareAdditionalData = () => {
    const rows = [];
    reportData.forEach((record) => {
      if (record.additionalData) {
        ['test1', 'test2'].forEach((testKey) => {
          const test = record.additionalData[testKey];
          if (test && Object.values(test).some(v => v)) {
            rows.push({
              _id: `${record._id}-${testKey}`,
              date: formatDate(record.date),
              shift: record.shift,
              testNo: testKey === 'test1' ? 'Test 1' : 'Test 2',
              afsNo: test.afsNo || '-',
              fines: test.fines || '-',
              gd: test.gd || '-'
            });
          }
        });
      }
    });
    return rows;
  };

  const clayTestsColumns = [
    { key: 'date', label: 'Date', width: '120px', align: 'center' },
    { key: 'shift', label: 'Shift', width: '80px', align: 'center' },
    { key: 'testNo', label: 'Test', width: '80px', align: 'center' },
    { key: 'totalClay', label: 'Total Clay', width: '120px', align: 'center' },
    { key: 'activeClay', label: 'Active Clay', width: '120px', align: 'center' },
    { key: 'deadClay', label: 'Dead Clay', width: '120px', align: 'center' },
    { key: 'vcm', label: 'VCM', width: '120px', align: 'center' },
    { key: 'loi', label: 'LOI', width: '120px', align: 'center' }
  ];

  const sieveTestingColumns = [
    { key: 'date', label: 'Date', width: '100px', align: 'center' },
    { key: 'shift', label: 'Shift', width: '70px', align: 'center' },
    { key: 'testNo', label: 'Test', width: '70px', align: 'center' },
    { key: 's1700', label: '1700µ', width: '80px', align: 'center' },
    { key: 's850', label: '850µ', width: '80px', align: 'center' },
    { key: 's600', label: '600µ', width: '80px', align: 'center' },
    { key: 's425', label: '425µ', width: '80px', align: 'center' },
    { key: 's300', label: '300µ', width: '80px', align: 'center' },
    { key: 's212', label: '212µ', width: '80px', align: 'center' },
    { key: 's150', label: '150µ', width: '80px', align: 'center' },
    { key: 's106', label: '106µ', width: '80px', align: 'center' },
    { key: 's75', label: '75µ', width: '80px', align: 'center' },
    { key: 'pan', label: 'Pan', width: '80px', align: 'center' },
    { key: 'total', label: 'Total', width: '80px', align: 'center', bold: true }
  ];

  const parametersColumns = [
    { key: 'date', label: 'Date', width: '100px', align: 'center' },
    { key: 'shift', label: 'Shift', width: '70px', align: 'center' },
    { key: 'testNo', label: 'Test', width: '70px', align: 'center' },
    { key: 'compactability', label: 'Compactability', width: '110px', align: 'center' },
    { key: 'permeability', label: 'Permeability', width: '110px', align: 'center' },
    { key: 'gcs', label: 'GCS', width: '90px', align: 'center' },
    { key: 'wts', label: 'WTS', width: '90px', align: 'center' },
    { key: 'moisture', label: 'Moisture', width: '90px', align: 'center' },
    { key: 'bentonite', label: 'Bentonite', width: '90px', align: 'center' },
    { key: 'coalDust', label: 'Coal Dust', width: '90px', align: 'center' },
    { key: 'hopperLevel', label: 'Hopper Level', width: '100px', align: 'center' },
    { key: 'shearStrength', label: 'Shear Strength', width: '110px', align: 'center' },
    { key: 'dustCollectorSettings', label: 'Dust Collector', width: '110px', align: 'center' },
    { key: 'returnSandMoisture', label: 'Return Sand Moisture', width: '140px', align: 'center' }
  ];

  const additionalDataColumns = [
    { key: 'date', label: 'Date', width: '120px', align: 'center' },
    { key: 'shift', label: 'Shift', width: '80px', align: 'center' },
    { key: 'testNo', label: 'Test', width: '80px', align: 'center' },
    { key: 'afsNo', label: 'AFS No', width: '120px', align: 'center' },
    { key: 'fines', label: 'Fines', width: '120px', align: 'center' },
    { key: 'gd', label: 'GD', width: '120px', align: 'center' }
  ];

  return (
    <div className="foundry-sand-testing-report-container">
      <div className="foundry-sand-testing-report-header">
        <div className="foundry-sand-testing-report-header-text">
          <BookOpenCheck size={28} style={{ color: '#5B9AA9', marginRight: '0.75rem' }} />
          <h2>Foundry Sand Testing Note - Report</h2>
        </div>
      </div>
      <div className="foundry-sand-testing-filter-container">
        <div className="foundry-sand-testing-filter-group">
          <label style={{ fontWeight: '600', marginRight: '0.5rem' }}>Date:</label>
          <CustomDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            name="selectedDate"
          />
        </div>
        <div className="foundry-sand-testing-filter-actions">
          <FilterButton onClick={handleFilter} disabled={!selectedDate || loading} />
          <ClearButton onClick={handleClear} disabled={loading} />
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#5B9AA9' }}>
          Loading data...
        </div>
      )}

      {/* Clay Tests Section */}
      <div className="foundry-section-header" style={{ marginTop: '2rem' }}>
        <h3>Clay Tests Results</h3>
      </div>
      <Table
        columns={clayTestsColumns}
        data={prepareClayTestsData()}
        noDataMessage="No clay test records found for the selected date"
        minWidth={1200}
        striped
        headerGradient
      />

      {/* Sieve Testing Section */}
      <div className="foundry-section-header" style={{ marginTop: '2rem' }}>
        <h3>Sieve Testing Results</h3>
      </div>
      <Table
        columns={sieveTestingColumns}
        data={prepareSieveTestingData()}
        noDataMessage="No sieve testing records found for the selected date"
        minWidth={1600}
        striped
        headerGradient
      />

      {/* Parameters Section */}
      <div className="foundry-section-header" style={{ marginTop: '2rem' }}>
        <h3>Testing Parameters</h3>
      </div>
      <Table
        columns={parametersColumns}
        data={prepareParametersData()}
        noDataMessage="No parameter records found for the selected date"
        minWidth={1800}
        striped
        headerGradient
      />

      {/* Additional Data Section */}
      <div className="foundry-section-header" style={{ marginTop: '2rem' }}>
        <h3>Additional Data</h3>
      </div>
      <Table
        columns={additionalDataColumns}
        data={prepareAdditionalData()}
        noDataMessage="No additional data found for the selected date"
        minWidth={800}
        striped
        headerGradient
      />
    </div>
  );
};

export default FoundrySandTestingReport;

