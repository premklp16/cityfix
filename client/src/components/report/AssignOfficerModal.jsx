import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Select from '../common/Select';
import Button from '../common/Button';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const AssignOfficerModal = ({ isOpen, onClose, report, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => {
    if (isOpen && report?.department?._id) {
      fetchOfficers();
    }
  }, [isOpen, report]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/admin/departments/${report.department._id}/officers`);
      setOfficers(res.data.data || []);
      setSelectedOfficer('');
    } catch (error) {
      toast.error('Failed to load officers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) {
      toast.error('Please select an officer');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/admin/assign-report', {
        reportId: report._id,
        officerId: selectedOfficer,
        departmentId: report.department._id
      });

      toast.success('Officer assigned successfully');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign officer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Officer to: ${report?.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">Department:</span> {report?.department?.name}
          </p>
        </div>

        <Select
          label="Select Officer"
          value={selectedOfficer}
          onChange={(e) => setSelectedOfficer(e.target.value)}
          required
        >
          <option value="">Choose an officer...</option>
          {officers.map(officer => (
            <option key={officer._id} value={officer._id}>
              {officer.name} ({officer.email})
            </option>
          ))}
        </Select>

        {officers.length === 0 && !loading && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
            No officers available in this department. Please assign officers first.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Assign Officer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignOfficerModal;
