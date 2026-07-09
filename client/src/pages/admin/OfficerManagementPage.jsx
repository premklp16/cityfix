import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaBuilding, FaPhone, FaEnvelope, FaUserTie, FaHistory, FaChartPie, FaClipboardList } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getUsers, updateUserRole, getDepartments, assignOfficerToDepartment, removeOfficerFromDepartment } from '../../api/adminApi';
import toast from 'react-hot-toast';

const OfficerManagementPage = () => {
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [formData, setFormData] = useState({ departmentId: '' });
  const [saving, setSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [officerToRemove, setOfficerToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const depts = await fetchDepartments();
      await fetchOfficers(depts);
    };

    loadData();
  }, []);

  const fetchOfficers = async (depts = departments) => {
    try {
      setLoading(true);
      const res = await getUsers({ role: 'officer', limit: 1000 });
      const officersList = res.data.data.users || [];
      
      const enrichedOfficers = officersList.map((officer) => ({
        ...officer,
        departmentName: officer.department ? depts.find(d => d._id === officer.department)?.name || 'Unassigned' : 'Unassigned'
      }));
      
      setOfficers(enrichedOfficers);
    } catch (error) {
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error('Failed to load departments:', error);
      return [];
    }
  };

  const handleAssignDepartment = (officer) => {
    setEditingOfficer(officer);
    setFormData({ departmentId: officer.department || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.departmentId) {
      toast.error('Please select a department');
      return;
    }

    // Check if reassigning to a different department
    if (editingOfficer.department && editingOfficer.department === formData.departmentId) {
      toast.error('Officer is already assigned to this department');
      return;
    }

    // Show confirmation if reassigning from one department to another
    if (editingOfficer.department && editingOfficer.department !== formData.departmentId) {
      const oldDeptName = departments.find(d => d._id === editingOfficer.department)?.name;
      const newDeptName = departments.find(d => d._id === formData.departmentId)?.name;
      
      const confirmed = window.confirm(
        `Are you sure you want to reassign ${editingOfficer.name} from ${oldDeptName} to ${newDeptName}?\n\nThey will be removed from their current department.`
      );
      
      if (!confirmed) return;
    }

    try {
      setSaving(true);
      await assignOfficerToDepartment({
        userId: editingOfficer._id,
        departmentId: formData.departmentId
      });
      
      toast.success('Officer assigned to department');
      setModalOpen(false);
      fetchOfficers(departments);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign officer');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromDepartment = async () => {
    if (!officerToRemove) return;
    try {
      setRemoving(true);
      await removeOfficerFromDepartment({
        userId: officerToRemove._id,
        departmentId: officerToRemove.department
      });
      
      toast.success('Officer removed from department');
      fetchOfficers(departments);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove officer');
    } finally {
      setRemoving(false);
      setDeleteConfirmOpen(false);
      setOfficerToRemove(null);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <FaChartPie /> },
    { label: 'Complaints', path: '/admin/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Complaints', path: '/admin/history', icon: <FaHistory /> },
    { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { label: 'Officers', path: '/admin/officers', icon: <FaUserTie /> },
    { label: 'Departments', path: '/admin/departments', icon: <FaBuilding /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Officers Management</h1>
          <p className="text-gray-600 mt-2">Manage officers and assign them to departments.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Officer Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {officers.map(officer => (
                  <tr key={officer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {officer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{officer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="text-gray-400" />
                        {officer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaPhone className="text-gray-400" />
                        {officer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        officer.department 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {officer.departmentName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          icon={<FaEdit />}
                          onClick={() => handleAssignDepartment(officer)}
                        >
                          Assign
                        </Button>
                        {officer.department && (
                          <Button 
                            size="sm" 
                            variant="danger"
                            icon={<FaTrash />}
                            onClick={() => { setOfficerToRemove(officer); setDeleteConfirmOpen(true); }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {officers.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No officers found.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Assign Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Assign ${editingOfficer?.name} to Department`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Department"
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            required
          >
            <option value="">Select a department</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Assign Officer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleRemoveFromDepartment}
        title="Remove from Department"
        message={`Are you sure you want to remove "${officerToRemove?.name}" from their current department?`}
        confirmText="Remove"
        confirmVariant="danger"
        loading={removing}
      />
    </DashboardLayout>
  );
};

export default OfficerManagementPage;
