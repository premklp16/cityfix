import React, { useState, useEffect } from 'react';
import { FaChartPie, FaUsers, FaClipboardList, FaBuilding, FaPlus, FaEdit, FaTrash, FaUserTie, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/adminApi';
import toast from 'react-hot-toast';

const DepartmentManagementPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      setDepartments(res.data.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, description: dept.description || '' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', description: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    try {
      setSaving(true);
      if (editingDept) {
        const res = await updateDepartment(editingDept._id, { name: formData.name, description: formData.description });
        setDepartments(departments.map(d => d._id === editingDept._id ? res.data.data : d));
        toast.success('Department updated');
      } else {
        const res = await createDepartment({ name: formData.name, description: formData.description });
        setDepartments([...departments, res.data.data]);
        toast.success('Department created');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to save department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      setDeleting(true);
      await deleteDepartment(deptToDelete._id);
      setDepartments(departments.filter(d => d._id !== deptToDelete._id));
      toast.success('Department deleted');
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to delete department');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeptToDelete(null);
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-2">Manage city departments. Assign officers to departments from the Officers page.</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={<FaPlus />}>
          Create Department
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => (
            <Card key={dept._id} className="flex flex-col h-full border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                  <FaBuilding />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(dept)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => { setDeptToDelete(dept); setDeleteConfirmOpen(true); }}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
              <p className="text-gray-600 text-sm flex-grow mb-6 line-clamp-3">
                {dept.description || 'No description provided.'}
              </p>
            </Card>
          ))}
          
          {departments.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-gray-100 text-gray-500">
              No departments found. Click the button above to create one.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Road Department, Water Department"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input w-full"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the department's responsibilities..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${deptToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default DepartmentManagementPage;
