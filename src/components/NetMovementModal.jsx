import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

const NetMovementModal = ({ filters, onClose }) => {
  const [details, setDetails] = useState({
    purchases: [],
    transfersIn: [],
    transfersOut: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        baseId: filters.baseId || null,
        equipmentTypeId: filters.equipmentTypeId || null,
      };
      const response = await dashboardAPI.getNetMovementDetails(params);
      setDetails(response.data);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (data, type) => {
    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-center py-8 text-gray-500">No records found</div>;
    }

    if (type === 'purchases') {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.purchase_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.unit_price ? `$${parseFloat(item.unit_price).toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_cost ? `$${parseFloat(item.total_cost).toFixed(2)}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (type === 'transfersIn' || type === 'transfersOut') {
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(item.transfer_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.from_base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.to_base_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.equipment_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Net Movement Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'purchases'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Purchases ({details.purchases.length})
          </button>
          <button
            onClick={() => setActiveTab('transfersIn')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'transfersIn'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transfers In ({details.transfersIn.length})
          </button>
          <button
            onClick={() => setActiveTab('transfersOut')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'transfersOut'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transfers Out ({details.transfersOut.length})
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'purchases' && renderTable(details.purchases, 'purchases')}
          {activeTab === 'transfersIn' && renderTable(details.transfersIn, 'transfersIn')}
          {activeTab === 'transfersOut' && renderTable(details.transfersOut, 'transfersOut')}
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;

