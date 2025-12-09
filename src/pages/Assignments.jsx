import React, { useState, useEffect } from 'react';
import { assignmentsAPI, commonAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    baseId: '',
    equipmentTypeId: '',
    status: '',
  });
  const [assignmentFormData, setAssignmentFormData] = useState({
    base_id: '',
    equipment_type_id: '',
    personnel_name: '',
    personnel_id: '',
    quantity: '',
    assignment_date: new Date(),
    notes: '',
  });
  const [expenditureFormData, setExpenditureFormData] = useState({
    base_id: '',
    equipment_type_id: '',
    quantity: '',
    expenditure_date: new Date(),
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadInitialData();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [filters, activeTab]);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : null,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : null,
        baseId: filters.baseId || null,
        equipmentTypeId: filters.equipmentTypeId || null,
        status: filters.status || null,
      };
      if (activeTab === 'assignments') {
        const response = await assignmentsAPI.getAssignments(params);
        setAssignments(response.data.assignments);
      } else {
        const response = await assignmentsAPI.getExpenditures(params);
        setExpenditures(response.data.expenditures);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentsAPI.create({
        ...assignmentFormData,
        assignment_date: assignmentFormData.assignment_date.toISOString().split('T')[0],
        quantity: parseInt(assignmentFormData.quantity),
      });
      setShowAssignmentForm(false);
      setAssignmentFormData({
        base_id: '',
        equipment_type_id: '',
        personnel_name: '',
        personnel_id: '',
        quantity: '',
        assignment_date: new Date(),
        notes: '',
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create assignment');
    }
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentsAPI.recordExpenditure({
        ...expenditureFormData,
        expenditure_date: expenditureFormData.expenditure_date.toISOString().split('T')[0],
        quantity: parseInt(expenditureFormData.quantity),
      });
      setShowExpenditureForm(false);
      setExpenditureFormData({
        base_id: '',
        equipment_type_id: '',
        quantity: '',
        expenditure_date: new Date(),
        reason: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to record expenditure');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h2>
        <p className="text-gray-600 mt-2">Manage asset assignments and track expenditures</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab('assignments');
              setFilters({ ...filters, status: '' });
            }}
            className={`px-6 py-4 font-medium ${
              activeTab === 'assignments'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('expenditures')}
            className={`px-6 py-4 font-medium ${
              activeTab === 'expenditures'
                ? 'border-b-2 border-blue-900 text-blue-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expenditures
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        {activeTab === 'assignments' ? (
          <button
            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            {showAssignmentForm ? 'Cancel' : '+ New Assignment'}
          </button>
        ) : (
          <button
            onClick={() => setShowExpenditureForm(!showExpenditureForm)}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            {showExpenditureForm ? 'Cancel' : '+ Record Expenditure'}
          </button>
        )}
      </div>

      {/* Assignment Form */}
      {showAssignmentForm && activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Assignment</h3>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base *</label>
                <select
                  required
                  value={assignmentFormData.base_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, base_id: e.target.value })}
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
                  value={assignmentFormData.equipment_type_id}
                  onChange={(e) =>
                    setAssignmentFormData({ ...assignmentFormData, equipment_type_id: e.target.value })
                  }
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnel Name *</label>
                <input
                  type="text"
                  required
                  value={assignmentFormData.personnel_name}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, personnel_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personnel ID</label>
                <input
                  type="text"
                  value={assignmentFormData.personnel_id}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, personnel_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={assignmentFormData.quantity}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Date *</label>
                <DatePicker
                  selected={assignmentFormData.assignment_date}
                  onChange={(date) => setAssignmentFormData({ ...assignmentFormData, assignment_date: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={assignmentFormData.notes}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Create Assignment
            </button>
          </form>
        </div>
      )}

      {/* Expenditure Form */}
      {showExpenditureForm && activeTab === 'expenditures' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Record Expenditure</h3>
          <form onSubmit={handleExpenditureSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base *</label>
                <select
                  required
                  value={expenditureFormData.base_id}
                  onChange={(e) => setExpenditureFormData({ ...expenditureFormData, base_id: e.target.value })}
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
                  value={expenditureFormData.equipment_type_id}
                  onChange={(e) =>
                    setExpenditureFormData({ ...expenditureFormData, equipment_type_id: e.target.value })
                  }
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
                  value={expenditureFormData.quantity}
                  onChange={(e) => setExpenditureFormData({ ...expenditureFormData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expenditure Date *</label>
                <DatePicker
                  selected={expenditureFormData.expenditure_date}
                  onChange={(date) => setExpenditureFormData({ ...expenditureFormData, expenditure_date: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <input
                  type="text"
                  required
                  value={expenditureFormData.reason}
                  onChange={(e) => setExpenditureFormData({ ...expenditureFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={expenditureFormData.notes}
                  onChange={(e) => setExpenditureFormData({ ...expenditureFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Record Expenditure
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          {activeTab === 'assignments' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No assignments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Personnel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(assignment.assignment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.base_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.equipment_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.personnel_name}
                        {assignment.personnel_id && ` (${assignment.personnel_id})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assignment.assigned_by_username || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expenditures Table */}
      {activeTab === 'expenditures' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
          ) : expenditures.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No expenditures found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenditures.map((expenditure) => (
                    <tr key={expenditure.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expenditure.expenditure_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expenditure.base_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expenditure.equipment_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expenditure.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{expenditure.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expenditure.recorded_by_username || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignments;

