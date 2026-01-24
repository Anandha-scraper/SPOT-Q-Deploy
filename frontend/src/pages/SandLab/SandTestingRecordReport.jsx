import React, { useEffect, useState } from 'react';
import { PencilLine, Trash2, BookOpenCheck } from 'lucide-react';
import CustomDatePicker from '../../Components/CustomDatePicker';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import Table from '../../Components/Table';
import '../../styles/PageStyles/Sandlab/SandTestingRecordReport.css';

const SandTestingRecordReport = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [table1Data, setTable1Data] = useState({
    table1a: {
      '0_1': [], '0_2': [], '0_3': [],
      '1_1': [], '1_2': [], '1_3': [],
      '2_1': [], '2_2': [], '2_3': [],
      '3_1': [], '3_2': [], '3_3': [],
      '4_1': [], '4_2': [], '4_3': []
    },
    table1b: {
      bentonite: '',
      batchType: '',
      value: ''
    }
  });

  const [table2Data, setTable2Data] = useState({
    '0_0': '', '0_1': '', '0_2': '',
    '1_0': '', '1_1': '', '1_2': '',
    '2_0': '', '2_1': '', '2_2': '',
    '3_0': '', '3_1': '', '3_2': '',
    '4_0': '', '4_1': '', '4_2': '',
    '5_0': '', '5_1': '', '5_2': '',
    '6_0': '', '6_1': '', '6_2': ''
  });

  const [table3Data, setTable3Data] = useState({
    '0_0': [], '0_1': [], '0_2': [], '0_3': [], '0_4': [],
    '1_0': [], '1_1': [], '1_2': [], '1_3': [], '1_4': [],
    '2_0': [], '2_1': [], '2_2': [], '2_3': [], '2_4': []
  });

  const [table4Data, setTable4Data] = useState({
    sandLump: '',
    newSandWt: '',
    friabilityShiftI: '',
    friabilityShiftII: '',
    friabilityShiftIII: ''
  });

  const [table5Data, setTable5Data] = useState([]);
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
      const response = await fetch(`http://localhost:5000/api/v1/sand-testing-records/date/${targetDate}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.length > 0) {
        const record = result.data[0];
        
        // Map sandShifts to table1Data
        if (record.sandShifts) {
          const shifts = record.sandShifts;
          setTable1Data({
            table1a: {
              '0_1': shifts.returnSand?.shiftI || [],
              '0_2': shifts.returnSand?.shiftII || [],
              '0_3': shifts.returnSand?.shiftIII || [],
              '1_1': shifts.newSand?.shiftI || [],
              '1_2': shifts.newSand?.shiftII || [],
              '1_3': shifts.newSand?.shiftIII || [],
              '2_1': shifts.mixingMode?.shiftI || [],
              '2_2': shifts.mixingMode?.shiftII || [],
              '2_3': shifts.mixingMode?.shiftIII || [],
              '3_1': shifts.bentonite?.shiftI || [],
              '3_2': shifts.bentonite?.shiftII || [],
              '3_3': shifts.bentonite?.shiftIII || [],
              '4_1': shifts.coalDustPremix?.shiftI || [],
              '4_2': shifts.coalDustPremix?.shiftII || [],
              '4_3': shifts.coalDustPremix?.shiftIII || []
            },
            table1b: {
              bentonite: shifts.bentonitePercent || '',
              batchType: shifts.batchType || '',
              value: shifts.batchValue || ''
            }
          });
        }

        // Map clayShifts to table2Data
        if (record.clayShifts) {
          const clay = record.clayShifts;
          setTable2Data({
            '0_0': clay.activeClay?.shiftI || '',
            '0_1': clay.activeClay?.shiftII || '',
            '0_2': clay.activeClay?.shiftIII || '',
            '1_0': clay.totalClay?.shiftI || '',
            '1_1': clay.totalClay?.shiftII || '',
            '1_2': clay.totalClay?.shiftIII || '',
            '2_0': clay.deadClay?.shiftI || '',
            '2_1': clay.deadClay?.shiftII || '',
            '2_2': clay.deadClay?.shiftIII || '',
            '3_0': clay.loi?.shiftI || '',
            '3_1': clay.loi?.shiftII || '',
            '3_2': clay.loi?.shiftIII || '',
            '4_0': clay.mbValue?.shiftI || '',
            '4_1': clay.mbValue?.shiftII || '',
            '4_2': clay.mbValue?.shiftIII || '',
            '5_0': clay.afa?.shiftI || '',
            '5_1': clay.afa?.shiftII || '',
            '5_2': clay.afa?.shiftIII || '',
            '6_0': clay.grainFineness?.shiftI || '',
            '6_1': clay.grainFineness?.shiftII || '',
            '6_2': clay.grainFineness?.shiftIII || ''
          });
        }

        // Map mixshifts to table3Data
        if (record.mixshifts) {
          const mix = record.mixshifts;
          setTable3Data({
            '0_0': mix.gcsLab?.shiftI || [],
            '0_1': mix.gcsLab?.shiftII || [],
            '0_2': mix.gcsLab?.shiftIII || [],
            '0_3': mix.gcsLab?.mouldNo || [],
            '0_4': mix.gcsLab?.ctPercent || [],
            '1_0': mix.gcsPlant?.shiftI || [],
            '1_1': mix.gcsPlant?.shiftII || [],
            '1_2': mix.gcsPlant?.shiftIII || [],
            '1_3': mix.gcsPlant?.mouldNo || [],
            '1_4': mix.gcsPlant?.ctPercent || [],
            '2_0': mix.gcsDisa?.shiftI || [],
            '2_1': mix.gcsDisa?.shiftII || [],
            '2_2': mix.gcsDisa?.shiftIII || [],
            '2_3': mix.gcsDisa?.mouldNo || [],
            '2_4': mix.gcsDisa?.ctPercent || []
          });
        }

        // Map sand friability data to table4Data
        setTable4Data({
          sandLump: record.sandLump || '',
          newSandWt: record.newSandWt || '',
          friabilityShiftI: record.sandFriability?.shiftI || '',
          friabilityShiftII: record.sandFriability?.shiftII || '',
          friabilityShiftIII: record.sandFriability?.shiftIII || ''
        });

        // Map testParameter to table5Data
        if (record.testParameter && Array.isArray(record.testParameter)) {
          const formattedTable5 = record.testParameter.map((item, index) => ({
            sno: index + 1,
            time: item.time || '',
            mixNo: item.mixNo || '',
            permeability: item.permeability || '',
            gcsType: item.gcsType || '',
            gcsValue: item.gcsValue || '',
            wts: item.wts || '',
            moisture: item.moisture || '',
            compactability: item.compactability || '',
            compressability: item.compressability || '',
            waterLitre: item.waterLitre || '',
            sandTempBC: item.sandTempBC || '',
            sandTempWU: item.sandTempWU || '',
            sandTempSSU: item.sandTempSSU || '',
            newSandKgs: item.newSandKgs || '',
            bentoniteType: item.bentoniteType || '',
            bentoniteKgs: item.bentoniteKgs || '',
            bentonitePercent: item.bentonitePercent || '',
            premixCoalType: item.premixCoalType || '',
            premixCoalKgs: item.premixCoalKgs || '',
            premixCoalPercent: item.premixCoalPercent || '',
            compactabilitySetting: item.compactabilitySetting || '',
            compactabilityValue: item.compactabilityValue || '',
            mouldStrengthSetting: item.mouldStrengthSetting || '',
            mouldStrengthValue: item.mouldStrengthValue || '',
            preparedSandLumps: item.preparedSandLumps || '',
            itemName: item.itemName || '',
            remarks: item.remarks || ''
          }));
          setTable5Data(formattedTable5);
        }
      } else {
        // No data found, reset to empty state
        handleClear();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
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

  const handleFilter_OLD_MOCK = () => {
    // Filter logic here - fetch data from API
    console.log('Filtering with date:', selectedDate);
    
    // Mock data for demonstration - replace with actual API call
    const mockData = {
      table1a: {
        '0_1': ['100', '105'],
        '0_2': ['98', '102'],
        '0_3': ['95', '99'],
        '1_1': ['5.0'],
        '1_2': ['4.8'],
        '1_3': ['5.2'],
        '2_1': ['Auto'],
        '2_2': ['Manual'],
        '2_3': ['Auto'],
        '3_1': ['1.2'],
        '3_2': ['1.3'],
        '3_3': ['1.1'],
        '4_1': ['0.8'],
        '4_2': ['0.9'],
        '4_3': ['0.7']
      },
      table1b: {
        bentonite: '2.5',
        batchType: 'coalDust',
        value: '1.5'
      }
    };
    
    const mockTable2Data = {
      '0_0': '12.5', '0_1': '13.0', '0_2': '12.8',
      '1_0': '9.5', '1_1': '10.0', '1_2': '9.8',
      '2_0': '3.0', '2_1': '3.2', '2_2': '3.0',
      '3_0': '2.5', '3_1': '2.7', '3_2': '2.6',
      '4_0': '5.2', '4_1': '5.5', '4_2': '5.3',
      '5_0': '50', '5_1': '51', '5_2': '52',
      '6_0': '8', '6_1': '9', '6_2': '7'
    };
    
    const mockTable3Data = {
      '0_0': ['100', '120'], '0_1': ['300', '320'], '0_2': ['200', '200'],
      '0_3': ['2'], '0_4': ['75'],
      '1_0': ['321', '350'], '1_1': ['550', '580'], '1_2': ['229', '230'],
      '1_3': ['3'], '1_4': ['80'],
      '2_0': ['581', '600'], '2_1': ['800', '820'], '2_2': ['219', '220'],
      '2_3': ['1'], '2_4': ['85']
    };
    
    const mockTable4Data = {
      sandLump: '0.5',
      newSandWt: '25',
      friabilityShiftI: '10.5',
      friabilityShiftII: '11.0',
      friabilityShiftIII: '10.8'
    };
    
    const mockTable5Data = [
      {
        sno: 1,
        time: '08:00',
        mixNo: '100',
        permeability: '125',
        gcsType: 'FDY-A',
        gcsValue: '1850',
        wts: '0.18',
        moisture: '3.5',
        compactability: '36',
        compressability: '24',
        waterLitre: '2.5',
        sandTempBC: '38',
        sandTempWU: '40',
        sandTempSSU: '42',
        newSandKgs: '3.2',
        bentoniteType: '0.60-1.20',
        bentoniteKgs: '1.0',
        bentonitePercent: '0.85',
        premixCoalType: 'Premix',
        premixCoalKgs: '0.8',
        premixCoalPercent: '0.95',
        compactabilitySetting: 'LC',
        compactabilityValue: '42',
        mouldStrengthSetting: 'SMC23',
        mouldStrengthValue: '23',
        preparedSandLumps: '0.3',
        itemName: 'Casting A',
        remarks: 'Good quality'
      },
      {
        sno: 2,
        time: '10:00',
        mixNo: '150',
        permeability: '130',
        gcsType: 'FDY-A',
        gcsValue: '1880',
        wts: '0.20',
        moisture: '3.7',
        compactability: '37',
        compressability: '25',
        waterLitre: '2.6',
        sandTempBC: '39',
        sandTempWU: '41',
        sandTempSSU: '43',
        newSandKgs: '3.5',
        bentoniteType: '0.60-1.20',
        bentoniteKgs: '1.1',
        bentonitePercent: '0.90',
        premixCoalType: 'Premix',
        premixCoalKgs: '0.85',
        premixCoalPercent: '1.0',
        compactabilitySetting: 'LC',
        compactabilityValue: '43',
        mouldStrengthSetting: 'SMC23',
        mouldStrengthValue: '24',
        preparedSandLumps: '0.28',
        itemName: 'Casting B',
        remarks: 'Excellent'
      },
      {
        sno: 3,
        time: '12:00',
        mixNo: '200',
        permeability: '128',
        gcsType: 'FDY-A',
        gcsValue: '1865',
        wts: '0.19',
        moisture: '3.6',
        compactability: '35',
        compressability: '23',
        waterLitre: '2.55',
        sandTempBC: '40',
        sandTempWU: '42',
        sandTempSSU: '44',
        newSandKgs: '3.3',
        bentoniteType: '0.60-1.20',
        bentoniteKgs: '1.05',
        bentonitePercent: '0.88',
        premixCoalType: 'Premix',
        premixCoalKgs: '0.82',
        premixCoalPercent: '0.98',
        compactabilitySetting: 'LC',
        compactabilityValue: '41',
        mouldStrengthSetting: 'SMC23',
        mouldStrengthValue: '22',
        preparedSandLumps: '0.32',
        itemName: 'Casting C',
        remarks: 'Normal'
      }
    ];
    
    // setTable1Data(mockData);
    // setTable2Data(mockTable2Data);
    // setTable3Data(mockTable3Data);
    // setTable4Data(mockTable4Data);
    // setTable5Data(mockTable5Data);
  };

  const handleClear = () => {
    setSelectedDate('');
    // Reload current date data
    fetchData();
  };

  return (
    <div className="sand-record-report-container">
      <div className="sand-record-report-header">
        <div className="sand-record-report-header-text">
          <BookOpenCheck size={28} style={{ color: '#5B9AA9', marginRight: '0.75rem' }} />
          <h2>Sand Testing Record - Report</h2>
        </div>
      </div>
      <div className="sand-record-filter-container">
        <div className="sand-record-filter-group">
          <label>Date:</label>
          <CustomDatePicker
            value={selectedDate}
            onChange={handleDateChange}
            name="selectedDate"
          />
        </div>
        <div className="sand-record-filter-actions">
          <FilterButton onClick={handleFilter} disabled={!selectedDate || loading} />
          <ClearButton onClick={handleClear} disabled={loading} />
        </div>
      </div>
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#5B9AA9' }}>
          Loading data...
        </div>
      )}

      {/* Table 1 Display - Always visible */}
      <div className="sand-section-header" style={{ marginTop: '2rem' }}>
        <h3>Table 1</h3>
      </div>

      {/* Table 1a - Display only */}
      <div style={{ marginBottom: '1rem' }}>
        <Table
          template
          showHeader={true}
          rows={5}
          columns={[
            { key: 'col1', label: 'Shift', bold: true, align: 'center' },
            { key: 'col2', label: 'I', align: 'center' },
            { key: 'col3', label: 'II', align: 'center' },
            { key: 'col4', label: 'III', align: 'center' }
          ]}
          renderCell={(rowIndex, colIndex) => {
            // First column: row labels
            if (colIndex === 0) {
              const labels = [
                'R. Sand ( Kgs. / Mix )',
                'N. Sand ( Kgs. / Mould )',
                'Mixing Mode',
                'Bentonite ( Kgs. / Mix )',
                'Coal Dust / Premix ( Kgs. / Mix )'
              ];
              return <strong style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#1e293b' }}>{labels[rowIndex]}</strong>;
            }

            // Other columns: display values
            const key = `${rowIndex}_${colIndex}`;
            const values = table1Data.table1a[key] || [];

            return (
              <div style={{ padding: '8px', textAlign: 'center' }}>
                {values.length > 0 ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: values.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                    gap: '8px'
                  }}>
                    {values.map((value, index) => (
                      <div 
                        key={index} 
                        style={{
                          padding: '8px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: '#334155'
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>-</span>
                )}
              </div>
            );
          }}
          minWidth="800px"
        />
      </div>

      {/* Table 1b - Display only */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '600px' }}>
            <tbody>
              <tr style={{ height: '50px' }}>
                <td rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>BATCH No.</td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Bentonite</td>
                <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', padding: '8px' }}>
                  {table1Data.table1b.batchType === 'coalDust' ? 'Coal Dust' : table1Data.table1b.batchType === 'premix' ? 'Premix' : '-'}
                </td>
              </tr>
              <tr style={{ height: '50px' }}>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    {table1Data.table1b.bentonite || '-'}
                  </div>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{
                    padding: '10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    {table1Data.table1b.value || '-'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2 Display - Always visible */}
      <div className="sand-section-header" style={{ marginTop: '2rem' }}>
        <h3>Table 2</h3>
      </div>

      {/* Table 2 - Display only */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '800px' }}>
            <tbody>
              {/* Header Row */}
              <tr style={{ height: '40px' }}>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SHIFT</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>I</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>II</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>III</td>
              </tr>
              {/* Data Rows */}
              {[
                'Total Clay (11.0-14.5%)',
                'Active Clay (8.5-11.0%)',
                'Dead Clay (2.0-4.0%)',
                'V.C.M. (2.0-3.2%)',
                'L.O.I. (4.5-6.0%)',
                'AFS No. (Min. 48)',
                'Fines (10% Max)'
              ].map((label, rowIndex) => (
                <tr key={rowIndex} style={{ height: '50px' }}>
                  <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>{label}</td>
                  {[0, 1, 2].map((colIndex) => {
                    const key = `${rowIndex}_${colIndex}`;
                    const value = table2Data[key] || '';
                    
                    return (
                      <td key={colIndex} style={{ textAlign: 'center', padding: '10px' }}>
                        <div style={{
                          padding: '10px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          color: '#334155',
                          minHeight: '20px'
                        }}>
                          {value || '-'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 3 Display - Always visible */}
      <div className="sand-section-header" style={{ marginTop: '2rem' }}>
        <h3>Table 3</h3>
      </div>

      {/* Table 3 - Display only */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="reusable-table-container">
          <table className="reusable-table table-template table-bordered" style={{ minWidth: '800px', width: '100%' }}>
            <colgroup>
              <col style={{ width: '80px' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '300px' }} />
              <col style={{ width: '300px' }} />
              <col />
              <col />
            </colgroup>
            <tbody>
              {/* Header Row */}
              <tr style={{ height: '40px' }}>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>Shift</td>
                <td colSpan={3} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', borderBottom: '1px solid #ddd' }}>
                  Mix No.
                </td>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>No. Of Rejected</td>
                <td rowSpan={2} style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b', verticalAlign: 'middle' }}>Return Sand Hopper level</td>
              </tr>
              <tr style={{ height: '40px' }}>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Start</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>End</td>
                <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Total</td>
              </tr>
              {/* Data Rows */}
              {['I', 'II', 'III'].map((shift, rowIndex) => {
                const columns = [0, 1, 2, 3, 4];
                return (
                  <tr key={rowIndex} style={{ height: '50px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>{shift}</td>
                    {columns.map((colIndex) => {
                      const key = `${rowIndex}_${colIndex}`;
                      const values = table3Data[key] || [];
                      
                      return (
                        <td key={colIndex} style={{ textAlign: 'center', padding: '10px' }}>
                          {values.length > 0 ? (
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: values.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                              gap: '8px'
                            }}>
                              {values.map((value, valueIndex) => (
                                <div key={valueIndex} style={{
                                  padding: '10px',
                                  backgroundColor: '#f8fafc',
                                  borderRadius: '4px',
                                  fontSize: '1rem',
                                  fontWeight: '500',
                                  color: '#334155',
                                  minHeight: '20px'
                                }}>
                                  {value || '-'}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{
                              padding: '10px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '4px',
                              fontSize: '1rem',
                              fontWeight: '500',
                              color: '#334155',
                              minHeight: '20px'
                            }}>
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 4 Display - Always visible */}
      <div className="sand-section-header" style={{ marginTop: '2rem' }}>
        <h3>Table 4</h3>
      </div>

      {/* Table 4a and 4b - Side by Side - Display only */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Table 4a - 2x2 */}
          <div>
            <div className="reusable-table-container">
              <table className="reusable-table table-template table-bordered">
                <tbody>
                  <tr style={{ height: '60px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SAND LUMPS</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#334155',
                        minHeight: '20px'
                      }}>
                        {table4Data.sandLump || '-'}
                      </div>
                    </td>
                  </tr>
                  <tr style={{ height: '60px' }}>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>NEW SAND WT</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#334155',
                        minHeight: '20px'
                      }}>
                        {table4Data.newSandWt || '-'}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4b - 4x2 */}
          <div>
            <div className="reusable-table-container">
              <table className="reusable-table table-template table-bordered">
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>SHIFT</td>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>Prepared Sand Friability ( 8.0 % - 13.0 % )</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>I</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#334155',
                        minHeight: '20px'
                      }}>
                        {table4Data.friabilityShiftI || '-'}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>II</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#334155',
                        minHeight: '20px'
                      }}>
                        {table4Data.friabilityShiftII || '-'}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 700, fontSize: '1.0625rem', color: '#1e293b' }}>III</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#334155',
                        minHeight: '20px'
                      }}>
                        {table4Data.friabilityShiftIII || '-'}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Table 5 Display - Sand Properties & Test Parameters */}
      <div className="sand-section-header" style={{ marginTop: '2rem' }}>
        <h3>Sand Properties & Test Parameters</h3>
      </div>

      {/* Table 5 - Scrollable display using Table component */}
      <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
        <Table
          data={table5Data}
          minWidth={3000}
          striped
          bordered
          noDataMessage="No test parameters recorded"
          columns={[
            { key: 'sno', label: 'S.No', width: '60px', align: 'center', bold: true },
            { key: 'time', label: 'Time', width: '80px', align: 'center' },
            { key: 'mixNo', label: 'Mix No', width: '80px', align: 'center' },
            { key: 'permeability', label: 'Permeability (90-160)', width: '120px', align: 'center' },
            { 
              key: 'gcs', 
              label: 'G.C.S Gm/cm²', 
              width: '150px', 
              align: 'center',
              render: (item) => `${item.gcsType}: ${item.gcsValue}`
            },
            { key: 'wts', label: 'WTS N/cm² (Min 0.15)', width: '120px', align: 'center' },
            { key: 'moisture', label: 'Moisture (3.0-4.0%)', width: '120px', align: 'center' },
            { key: 'compactability', label: 'Compactability (33-40%)', width: '140px', align: 'center' },
            { key: 'compressability', label: 'Compressability (20-28%)', width: '150px', align: 'center' },
            { key: 'waterLitre', label: 'Water L/Kg', width: '100px', align: 'center' },
            { 
              key: 'sandTemp', 
              label: 'Sand Temp °C', 
              width: '200px', 
              align: 'center',
              render: (item) => `BC:${item.sandTempBC} | WU:${item.sandTempWU} | SSU:${item.sandTempSSU}`
            },
            { key: 'newSandKgs', label: 'New Sand Kgs (0.0-5.0)', width: '140px', align: 'center' },
            { 
              key: 'bentonite', 
              label: 'Bentonite', 
              width: '200px', 
              align: 'center',
              render: (item) => `${item.bentoniteType} | Kgs:${item.bentoniteKgs} | %:${item.bentonitePercent}`
            },
            { 
              key: 'premixCoal', 
              label: 'Premix/Coal Dust', 
              width: '200px', 
              align: 'center',
              render: (item) => `${item.premixCoalType} | Kgs:${item.premixCoalKgs} | %:${item.premixCoalPercent}`
            },
            { 
              key: 'compactabilitySetting', 
              label: 'Compactability Setting', 
              width: '180px', 
              align: 'center',
              render: (item) => `${item.compactabilitySetting}: ${item.compactabilityValue}`
            },
            { 
              key: 'mouldStrength', 
              label: 'Mould Strength', 
              width: '180px', 
              align: 'center',
              render: (item) => `${item.mouldStrengthSetting}: ${item.mouldStrengthValue}`
            },
            { key: 'preparedSandLumps', label: 'Prepared Sand Lumps/Kg', width: '150px', align: 'center' },
            { key: 'itemName', label: 'Item Name', width: '150px', align: 'center' },
            { key: 'remarks', label: 'Remarks', width: '200px', align: 'left' }
          ]}
        />
      </div>
    </div>
  );
};
export default SandTestingRecordReport;