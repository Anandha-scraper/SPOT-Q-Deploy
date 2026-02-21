import React, { useState } from 'react';
import { BookOpenCheck, ArrowLeft } from 'lucide-react';
import '../../styles/PageStyles/Process/ProcessReportDetail.css';

const ProcessReportDetail = ({ detailData, detailType, onBack }) => {
  const [selectedDisa, setSelectedDisa] = useState('All');
  const [showMetalComposition, setShowMetalComposition] = useState(true);
  const [showCorrectiveAdditions, setShowCorrectiveAdditions] = useState(true);

  // Get unique DISA values from detailData
  const disaOptions = ['All', ...Array.from(new Set(detailData?.map(item => item.disa) || [])).sort()];

  // Filter data based on selected DISA
  const filteredData = selectedDisa === 'All' 
    ? detailData || []
    : detailData?.filter(item => item.disa === selectedDisa) || [];

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time helper
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
  };

  // Custom render for table with grouped headers
  const renderCustomTable = () => {
    const groupThStyle = {
      padding: '0.75rem',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      fontWeight: 700,
      fontSize: '1rem',
      color: '#1e293b',
      backgroundColor: '#f8fafc'
    };

    const thStyle = {
      padding: '0.625rem 0.5rem',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      fontWeight: 600,
      fontSize: '0.875rem',
      color: '#334155',
      backgroundColor: '#ffffff'
    };

    const tdStyle = {
      padding: '0.625rem 0.5rem',
      textAlign: 'center',
      border: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      color: '#475569'
    };

    // Column widths configuration
    const columnWidths = {
      date: '110px',
      disa: '120px',
      partName: '150px',
      datecode: '120px',
      heatcode: '120px',
      quantityOfMoulds: '120px',
      // Metal Composition
      metalC: '90px',
      metalSi: '90px',
      metalMn: '90px',
      metalP: '90px',
      metalS: '90px',
      metalMgFL: '100px',
      metalCu: '90px',
      metalCr: '90px',
      // Other fields
      pouringTemp: '110px',
      timeOfPouring: '180px',
      ppCode: '100px',
      treatmentNo: '120px',
      fcNo: '100px',
      heatNo: '100px',
      conNo: '100px',
      // Corrective Additions
      corrC: '90px',
      corrSi: '90px',
      corrMn: '90px',
      corrS: '90px',
      corrCr: '90px',
      corrCu: '90px',
      corrSn: '90px',
      // Rest
      tappingWt: '100px',
      tappingTime: '110px',
      mg: '80px',
      resMgConvertor: '130px',
      recOfMg: '100px',
      streamInoculant: '130px',
      pTime: '90px',
      remarks: '200px'
    };

    return (
      <div className="reusable-table-container">
        <div style={{ overflowX: 'auto', border: '1.5px solid #cbd5e1', borderRadius: '10px', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '3500px' }}>
            <thead>
              {/* Group Headers Row */}
              <tr>
                <th rowSpan={2} style={{ ...groupThStyle, borderLeft: 'none', width: columnWidths.date }}>Date</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.disa }}>
                  <div className="process-detail-header-dropdown">
                    <select
                      value={selectedDisa}
                      onChange={(e) => setSelectedDisa(e.target.value)}
                      className="process-detail-header-select"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {disaOptions.map((disa) => (
                        <option key={disa} value={disa}>
                          {disa}
                        </option>
                      ))}
                    </select>
                  </div>
                </th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.partName }}>Part Name</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.datecode }}>Date Code</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.heatcode }}>Heat Code</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.quantityOfMoulds }}>Qty of Moulds</th>
                {showMetalComposition && <th colSpan={8} style={groupThStyle}>Metal Composition (%)</th>}
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.pouringTemp }}>Pouring Temp</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.timeOfPouring }}>Time of Pouring</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.ppCode }}>PP Code</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.treatmentNo }}>Treatment No</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.fcNo }}>FC No</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.heatNo }}>Heat No</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.conNo }}>Con No</th>
                {showCorrectiveAdditions && <th colSpan={7} style={groupThStyle}>Corrective Additions (Kgs)</th>}
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.tappingWt }}>Tapping Wt</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.tappingTime }}>Tapping Time</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.mg }}>Mg</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.resMgConvertor }}>Res Mg Convertor</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.recOfMg }}>Rec of Mg</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.streamInoculant }}>Stream Inoculant</th>
                <th rowSpan={2} style={{ ...groupThStyle, width: columnWidths.pTime }}>P Time</th>
                <th rowSpan={2} style={{ ...groupThStyle, borderRight: 'none', width: columnWidths.remarks }}>Remarks</th>
              </tr>
              {/* Sub Headers Row */}
              <tr>
                {/* Metal Composition sub-headers */}
                {showMetalComposition && (
                  <>
                    <th style={{ ...thStyle, width: columnWidths.metalC }}>C</th>
                    <th style={{ ...thStyle, width: columnWidths.metalSi }}>Si</th>
                    <th style={{ ...thStyle, width: columnWidths.metalMn }}>Mn</th>
                    <th style={{ ...thStyle, width: columnWidths.metalP }}>P</th>
                    <th style={{ ...thStyle, width: columnWidths.metalS }}>S</th>
                    <th style={{ ...thStyle, width: columnWidths.metalMgFL }}>Mg FL</th>
                    <th style={{ ...thStyle, width: columnWidths.metalCu }}>Cu</th>
                    <th style={{ ...thStyle, width: columnWidths.metalCr }}>Cr</th>
                  </>
                )}
                {/* Corrective Additions sub-headers */}
                {showCorrectiveAdditions && (
                  <>
                    <th style={{ ...thStyle, width: columnWidths.corrC }}>C</th>
                    <th style={{ ...thStyle, width: columnWidths.corrSi }}>Si</th>
                    <th style={{ ...thStyle, width: columnWidths.corrMn }}>Mn</th>
                    <th style={{ ...thStyle, width: columnWidths.corrS }}>S</th>
                    <th style={{ ...thStyle, width: columnWidths.corrCr }}>Cr</th>
                    <th style={{ ...thStyle, width: columnWidths.corrCu }}>Cu</th>
                    <th style={{ ...thStyle, width: columnWidths.corrSn }}>Sn</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={22 + (showMetalComposition ? 8 : 0) + (showCorrectiveAdditions ? 7 : 0)} style={{ ...tdStyle, borderRight: 'none', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No entry details found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item._id || index}>
                    <td style={{ ...tdStyle, width: columnWidths.date }}>{formatDate(item.date)}</td>
                    <td style={{ ...tdStyle, width: columnWidths.disa }}>{item.disa || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.partName }}>{item.partName || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.datecode }}>{item.datecode || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.heatcode }}>{item.heatcode || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.quantityOfMoulds }}>{item.quantityOfMoulds || '-'}</td>
                    {/* Metal Composition */}
                    {showMetalComposition && (
                      <>
                        <td style={{ ...tdStyle, width: columnWidths.metalC }}>{item.metalCompositionC || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalSi }}>{item.metalCompositionSi || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalMn }}>{item.metalCompositionMn || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalP }}>{item.metalCompositionP || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalS }}>{item.metalCompositionS || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalMgFL }}>{item.metalCompositionMgFL || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalCu }}>{item.metalCompositionCu || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.metalCr }}>{item.metalCompositionCr || '-'}</td>
                      </>
                    )}
                    <td style={{ ...tdStyle, width: columnWidths.pouringTemp }}>
                      {item.pouringTemperatureMin && item.pouringTemperatureMax 
                        ? `${item.pouringTemperatureMin} - ${item.pouringTemperatureMax}` 
                        : '-'}
                    </td>
                    <td style={{ ...tdStyle, width: columnWidths.timeOfPouring }}>{item.timeOfPouring || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.ppCode }}>{item.ppCode || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.treatmentNo }}>{item.treatmentNo || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.fcNo }}>{item.fcNo || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.heatNo }}>{item.heatNo || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.conNo }}>{item.conNo || '-'}</td>
                    {/* Corrective Additions */}
                    {showCorrectiveAdditions && (
                      <>
                        <td style={{ ...tdStyle, width: columnWidths.corrC }}>{item.correctiveAdditionC || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrSi }}>{item.correctiveAdditionSi || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrMn }}>{item.correctiveAdditionMn || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrS }}>{item.correctiveAdditionS || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrCr }}>{item.correctiveAdditionCr || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrCu }}>{item.correctiveAdditionCu || '-'}</td>
                        <td style={{ ...tdStyle, width: columnWidths.corrSn }}>{item.correctiveAdditionSn || '-'}</td>
                      </>
                    )}
                    <td style={{ ...tdStyle, width: columnWidths.tappingWt }}>{item.tappingWt || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.tappingTime }}>{formatTime(item.tappingTime)}</td>
                    <td style={{ ...tdStyle, width: columnWidths.mg }}>{item.mg || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.resMgConvertor }}>{item.resMgConvertor || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.recOfMg }}>{item.recOfMg || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.streamInoculant }}>{item.streamInoculant || '-'}</td>
                    <td style={{ ...tdStyle, width: columnWidths.pTime }}>{item.pTime || '-'}</td>
                    <td style={{ ...tdStyle, borderRight: 'none', width: columnWidths.remarks }}>{item.remarks || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="process-report-header">
        <div className="process-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Process Control - Report Details
          </h2>
        </div>
        <button className="process-report-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Back to Report
        </button>
      </div>

      {/* Column Visibility Checkboxes */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={showMetalComposition}
            onChange={(e) => setShowMetalComposition(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Metal Composition (%)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={showCorrectiveAdditions}
            onChange={(e) => setShowCorrectiveAdditions(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Corrective Additions (Kgs)
        </label>
      </div>

      {/* Custom Table with Grouped Headers */}
      {renderCustomTable()}
    </>
  );
};

export default ProcessReportDetail;

