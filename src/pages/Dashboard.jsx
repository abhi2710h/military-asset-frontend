import React, { useState, useEffect } from 'react';
import { dashboardAPI, commonAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NetMovementModal from '../components/NetMovementModal';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    closingBalance: 0,
    netMovement: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    assigned: 0,
    expended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    baseId: '',
    equipmentTypeId: '',
  });
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [basesRes, equipmentRes] = await Promise.all([
        commonAPI.getBases(),
        commonAPI.getEquipmentTypes(),
      ]);
      setBases(basesRes.data);
      setEquipmentTypes(equipmentRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        baseId: filters.baseId || null,
        equipmentTypeId: filters.equipmentTypeId || null,
      };
      const response = await dashboardAPI.getMetrics(params);
      setMetrics(response.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      baseId: '',
      equipmentTypeId: '',
    });
  };

  const MetricCard = ({ title, value, onClick, clickable = false }) => (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${
        clickable ? 'cursor-pointer hover:shadow-lg transition' : ''
      }`}
      onClick={onClick}
    >
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">Overview of asset movements and balances</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select end date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base
            </label>
            <select
              value={filters.baseId}
              onChange={(e) => handleFilterChange('baseId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Bases</option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Type
            </label>
            <select
              value={filters.equipmentTypeId}
              onChange={(e) => handleFilterChange('equipmentTypeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Clear Filters
        </button>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Opening Balance" value={metrics.openingBalance} />
          <MetricCard title="Closing Balance" value={metrics.closingBalance} />
          <MetricCard
            title="Net Movement"
            value={metrics.netMovement}
            clickable
            onClick={() => setShowNetMovementModal(true)}
          />
          <MetricCard title="Assigned" value={metrics.assigned} />
          <MetricCard title="Expended" value={metrics.expended} />
        </div>
      )}

      {/* Net Movement Modal */}
      {showNetMovementModal && (
        <NetMovementModal
          filters={filters}
          onClose={() => setShowNetMovementModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

