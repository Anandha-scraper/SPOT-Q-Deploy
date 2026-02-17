import { useState, useEffect } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FilterButton, ClearButton } from '../../Components/Buttons';
import CustomDatePicker from '../../Components/CustomDatePicker';
import Table from '../../Components/Table';
import { buildApiUrl } from '../../config/api';
import "../../styles/PageStyles/MicroStructure/MicroStructureReport.css";

const MicroStructureReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Fetch all entries using a wide date range
      const startDate = '2020-01-01';
      const endDate = '2030-12-31';
      const resp = await fetch(buildApiUrl(`/api/v1/micro-structure/filter?startDate=${startDate}&endDate=${endDate}`), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await resp.json();

      if (data.success) {
        setItems(data.data || []);
        setFilteredItems(data.data || []);
      } else {
        console.error('Failed to fetch:', data.message);
      }
    } catch (error) {
      console.error('Error fetching micro structure tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      disa: item.disa || '',
      partName: item.partName || '',
      dateCode: item.dateCode || '',
      heatCode: item.heatCode || '',
      nodularity: item.nodularity || '',
      graphiteType: item.graphiteType || '',
      countNos: item.countNos || '',
      size: item.size || '',
      ferrite: item.ferrite || '',
      pearlite: item.pearlite || '',
      carbide: item.carbide || '',
      remarks: item.remarks || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setEditLoading(true);
      const resp = await fetch(buildApiUrl(`/api/v1/micro-structure/${editingItem._id}`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      const data = await resp.json();

      if (data.success) {
        setShowEditModal(false);
        fetchItems();
      } else {
        alert('Failed to update entry: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating micro structure test:', error);
      alert('Failed to update entry: ' + (error.message || 'Unknown error'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const resp = await fetch(buildApiUrl(`/api/v1/micro-structure/${id}`), {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await resp.json();

        if (data.success) {
          fetchItems();
        } else {
          alert('Failed to delete entry: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting micro structure test:', error);
        alert('Failed to delete entry: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleFilter = () => {
    if (!startDate) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => {
      const rawDate = item.date;
      if (!rawDate) return false;

      const itemDate = new Date(rawDate);
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
    setFilteredItems(items);
  };

  // Format date for display
  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <div className="impact-report-header">
        <div className="impact-report-header-text">
          <h2>
            <BookOpenCheck size={28} style={{ color: '#5B9AA9' }} />
            Micro Structure - Report
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
              render: (item) => formatDate(item.date)
            },
            { key: 'disa', label: 'DISA', width: '100px', align: 'center' },
            { key: 'partName', label: 'Part Name', width: '180px' },
            { key: 'dateCode', label: 'Date Code', width: '110px', align: 'center' },
            { key: 'heatCode', label: 'Heat Code', width: '110px', align: 'center' },
            { 
              key: 'nodularity', 
              label: 'Nodularity %', 
              width: '120px',
              align: 'center',
              render: (item) => item.nodularity !== undefined && item.nodularity !== null ? item.nodularity : '-'
            },
            { 
              key: 'graphiteType', 
              label: 'Graphite Type %', 
              width: '140px',
              align: 'center',
              render: (item) => item.graphiteType !== undefined && item.graphiteType !== null ? item.graphiteType : '-'
            },
            { key: 'countNos', label: 'Count Nos/mm²', width: '130px', align: 'center' },
            { key: 'size', label: 'Size', width: '90px', align: 'center' },
            { 
              key: 'ferrite', 
              label: 'Ferrite %', 
              width: '100px',
              align: 'center',
              render: (item) => item.ferrite !== undefined && item.ferrite !== null ? item.ferrite : '-'
            },
            { 
              key: 'pearlite', 
              label: 'Pearlite %', 
              width: '100px',
              align: 'center',
              render: (item) => item.pearlite !== undefined && item.pearlite !== null ? item.pearlite : '-'
            },
            { 
              key: 'carbide', 
              label: 'Carbide %', 
              width: '100px',
              align: 'center',
              render: (item) => item.carbide !== undefined && item.carbide !== null ? item.carbide : '-'
            },
            { key: 'remarks', label: 'Remarks', width: '200px' }
          ]}
          data={filteredItems}
          minWidth={1700}
          defaultAlign="left"
          noDataMessage="No records found"
        />
      )}
    </>
  );
};

export default MicroStructureReport;
