import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClipboardList, FaChartPie, FaArrowLeft, FaSave, FaImage, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUpload from '../../components/common/ImageUpload';
import { getReportById, updateReport } from '../../api/reportApi';
import { STATUSES } from '../../utils/constants';
import toast from 'react-hot-toast';

const UpdateStatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    status: '',
    note: '',
    resolutionNotes: ''
  });
  
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getReportById(id);
      setReport(res.data.data);
      setFormData({ 
        status: res.data.data.status, 
        note: '',
        resolutionNotes: res.data.data.resolutionNotes || ''
      });
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/officer/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (files) => {
    setSelectedImages(Array.from(files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.status === report.status && !formData.note && !formData.resolutionNotes && selectedImages.length === 0) {
      toast.error('Please change the status, add notes, or upload images');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = new FormData();
      submitData.append('status', formData.status);
      submitData.append('note', formData.note);
      
      if (formData.resolutionNotes) {
        submitData.append('resolutionNotes', formData.resolutionNotes);
      }
      
      // Append resolution images
      selectedImages.forEach((img, idx) => {
        submitData.append('images', img);
      });

      await updateReport(id, submitData);
      toast.success('Report updated successfully');
      navigate('/officer/complaints');
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
    { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> },
  ];

  if (loading || !report) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-primary-600 mb-6 font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Complaints
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Update Report Status</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Select
                  label="New Status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={STATUSES.map(s => ({ value: s, label: s }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Note (Optional)
                  </label>
                  <textarea
                    className="input w-full"
                    rows="3"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Brief update about the action taken..."
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Visible to the citizen who reported the issue.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resolution Notes
                  </label>
                  <textarea
                    className="input w-full"
                    rows="3"
                    value={formData.resolutionNotes}
                    onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                    placeholder="Detailed description of how the issue was resolved..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-1" /> Upload Resolution Images
                  </label>
                  <ImageUpload 
                    images={selectedImages}
                    onChange={setSelectedImages}
                    maxFiles={5}
                  />
                  {selectedImages.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-700">
                      {selectedImages.length} image(s) selected for upload
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" loading={saving} icon={<FaSave />}>
                    Save Update
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="bg-gray-50 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Original Report Details</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-medium text-gray-700">Title:</span> {report.title}</p>
                <p><span className="font-medium text-gray-700">Location:</span> {report.location}</p>
                <p><span className="font-medium text-gray-700">Category:</span> {report.category}</p>
                <p><span className="font-medium text-gray-700">Severity:</span> {report.severity}</p>
                <div className="pt-2">
                  <p className="font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-gray-600 bg-white p-3 rounded border">{report.description}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Current Status</h3>
              <div className="flex justify-center py-4">
                <StatusBadge status={report.status} size="lg" />
              </div>
            </Card>

            {report.images && report.images.length > 0 && (
              <Card padding="sm">
                <h3 className="font-bold text-gray-900 mb-3 px-2">Original Photos</h3>
                <div className="grid gap-2">
                  {report.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              </Card>
            )}

            {report.resolutionImages && report.resolutionImages.length > 0 && (
              <Card padding="sm">
                <h3 className="font-bold text-gray-900 mb-3 px-2">Resolution Photos</h3>
                <div className="grid gap-2">
                  {report.resolutionImages.map((img, idx) => (
                    <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpdateStatusPage;
