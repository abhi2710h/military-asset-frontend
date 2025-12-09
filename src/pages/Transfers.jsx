import React, { useState, useEffect } from 'react';
import { transfersAPI, commonAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    baseId: '',
    equipmentTypeId: '',
  });
  const [formData, setFormData] = useState({
    from_base_id: '',
    to_base_id: '',
    equipment_type_id: '',
    quantity: '',
    transfer_date: new Date(),
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
    loadTransfers();
  }, []);

  useEffect(() => {
    loadTransfers();
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

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        baseId: filters.baseId || null,
        equipmentTypeId: filters.equipmentTypeId || null,
      };
      const response = await transfersAPI.getAll(params);
      setTransfers(response.data.transfers);
    } catch (error) {
      console.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.from_base_id === formData.to_base_id) {
      alert('Source and destination bases must be different');
      return;
    }
    try {
      await transfersAPI.create({
        ...formData,
        transfer_date: formData.transfer_date.toISOString().split('T')[0],
        quantity: parseInt(formData.quantity),
      });
      setShowForm(false);
      setFormData({
        from_base_id: '',
        to_base_id: '',
        equipment_type_id: '',
        quantity: '',
        transfer_date: new Date(),
        notes: '',
      });
      loadTransfers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create transfer');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transfers</h2>
          <p className="text-gray-600 mt-2">Transfer assets between bases</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          {showForm ? 'Cancel' : '+ New Transfer'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Transfer</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Base *</label>
                <select
                  required
                  value={formData.from_base_id}
                  onChange={(e) => setFormData({ ...formData, from_base_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Source Base</option>
                  {bases.map((base) => (
                    <option key={base.id} value={base.id}>
                      {base.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Base *</label>
                <select
                  required
                  value={formData.to_base_id}
                  onChange={(e) => setFormData({ ...formData, to_base_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Destination Base</option>
                  {bases
                    .filter((base) => base.id !== parseInt(formData.from_base_id))
                    .map((base) => (
                      <option key={base.id} value={base.id}>
                        {base.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type *</label>
                <select
                  required
                  value={formData.equipment_type_id}
                  onChange={(e) => setFormData({ ...formData, equipment_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Equipment</option>
                  {equipmentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Date *</label>
                <DatePicker
                  selected={formData.transfer_date}
                  onChange={(date) => setFormData({ ...formData, transfer_date: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Create Transfer
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              dateFormat="yyyy-MM-dd"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholderText="Select end date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base</label>
            <select
              value={filters.baseId}
              onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
            <select
              value={filters.equipmentTypeId}
              onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}
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
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No transfers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transferred By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transfer.transfer_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.from_base_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.to_base_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.equipment_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transfer.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transfer.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transfer.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transfer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transfer.transferred_by_username || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transfers;

