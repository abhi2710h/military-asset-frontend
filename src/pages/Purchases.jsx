import React, { useState, useEffect } from 'react';
import { purchasesAPI, commonAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
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
    base_id: '',
    equipment_type_id: '',
    quantity: '',
    unit_price: '',
    purchase_date: new Date(),
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
    loadPurchases();
  }, []);

  useEffect(() => {
    loadPurchases();
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

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        baseId: filters.baseId || null,
        equipmentTypeId: filters.equipmentTypeId || null,
      };
      const response = await purchasesAPI.getAll(params);
      setPurchases(response.data.purchases);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchasesAPI.create({
        ...formData,
        purchase_date: formData.purchase_date.toISOString().split('T')[0],
        quantity: parseInt(formData.quantity),
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      });
      setShowForm(false);
      setFormData({
        base_id: '',
        equipment_type_id: '',
        quantity: '',
        unit_price: '',
        purchase_date: new Date(),
        notes: '',
      });
      loadPurchases();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create purchase');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Purchases</h2>
          <p className="text-gray-600 mt-2">Record and view asset purchases</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          {showForm ? 'Cancel' : '+ New Purchase'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Record New Purchase</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base *</label>
                <select
                  required
                  value={formData.base_id}
                  onChange={(e) => setFormData({ ...formData, base_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Base</option>
                  {bases.map((base) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
                <DatePicker
                  selected={formData.purchase_date}
                  onChange={(date) => setFormData({ ...formData, purchase_date: date })}
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
              Record Purchase
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

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No purchases found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchase.purchase_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.base_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.equipment_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.unit_price ? `$${parseFloat(purchase.unit_price).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.total_cost ? `$${parseFloat(purchase.total_cost).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.purchased_by_username || '-'}
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

export default Purchases;

