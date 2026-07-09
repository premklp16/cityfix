import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaMapMarkerAlt, FaArrowLeft, FaExclamationCircle, FaArrowUp, FaUserCircle, FaBuilding, FaClock, FaChartPie, FaListUl, FaPlus, FaHistory, FaUsers, FaUserTie } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Avatar from '../../components/common/Avatar';
import MapDisplay from '../../components/map/MapDisplay';
import CommentSection from '../../components/report/CommentSection';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getReportById, deleteReport } from '../../api/reportApi';
import { toggleUpvote } from '../../api/upvoteApi';
import { toggleFollow } from '../../api/followApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ComplaintDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await getReportById(id);
      setReport(res.data.data);
    } catch (error) {
      toast.error('Failed to load report details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteReport(id);
      toast.success('Report deleted successfully');
      navigate(-1);
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to delete report');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      const res = await toggleUpvote(id);
      setReport(prev => ({
        ...prev,
        upvoteCount: res.data.data.upvoteCount,
        upvotes: res.data.data.upvoted 
          ? [...prev.upvotes, user.id] 
          : prev.upvotes.filter(u => u !== user.id)
      }));
    } catch (error) {
      toast.error('Failed to upvote');
    } finally {
      setUpvoting(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await toggleFollow(id);
      setFollowing(res.data.data.following);
      toast.success(res.data.data.following ? 'Following report updates' : 'Unfollowed report');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  // Determine sidebar items based on role
  const getSidebarItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <FaChartPie /> },
        { label: 'Complaints', path: '/admin/complaints', icon: <FaListUl /> },
        { label: 'Resolved Complaints', path: '/admin/history', icon: <FaHistory /> },
        { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
        { label: 'Officers', path: '/admin/officers', icon: <FaUserTie /> },
        { label: 'Departments', path: '/admin/departments', icon: <FaBuilding /> },
      ];
    } else if (user?.role === 'officer') {
      return [
        { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
        { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaListUl /> },
        { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> },
      ];
    }
    return [
      { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
      { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
      { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
      { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> },
    ];
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={getSidebarItems()}>
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (!report) return null;

  const isCreator = user?.id === report.createdBy?._id;
  const isAdmin = user?.role === 'admin';
  const hasUpvoted = report.upvotes?.includes(user?.id);

  return (
    <DashboardLayout sidebarItems={getSidebarItems()}>
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-primary-600 mb-6 font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Image Carousel (Simplified as grid if multiple) */}
              {report.images && report.images.length > 0 ? (
                <div className={`grid gap-1 ${report.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {report.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Report image ${idx + 1}`} 
                      className={`w-full object-cover ${report.images.length === 1 ? 'h-80' : 'h-48'}`} 
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-gray-400 border-b border-gray-100">
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📸</span>
                    <p>No photos provided</p>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <StatusBadge status={report.status} />
                  <Badge text={report.category} variant="default" />
                  <Badge 
                    text={`Severity: ${report.severity}`} 
                    variant={report.severity === 'Critical' ? 'danger' : report.severity === 'High' ? 'orange' : report.severity === 'Medium' ? 'warning' : 'success'} 
                  />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {report.title}
                </h1>
                
                <p className="text-gray-700 whitespace-pre-line mb-6 text-lg leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-start text-gray-600 mb-8 bg-gray-50 p-4 rounded-lg">
                  <FaMapMarkerAlt className="mt-1 mr-3 flex-shrink-0 text-primary-500 text-xl" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p>{report.location}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={hasUpvoted ? 'primary' : 'outline'}
                      onClick={handleUpvote}
                      disabled={upvoting}
                      className="rounded-full px-6"
                    >
                      <FaArrowUp className="mr-2" />
                      {hasUpvoted ? 'Upvoted' : 'Upvote'} ({report.upvoteCount})
                    </Button>
                    
                    {!isCreator && (
                      <Button
                        variant="ghost"
                        onClick={handleFollow}
                      >
                        {following ? 'Unfollow' : 'Follow Updates'}
                      </Button>
                    )}
                  </div>

                  {(isCreator || isAdmin) && (
                    <Button 
                      variant="danger" 
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      Delete Report
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <CommentSection reportId={id} />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Map Preview */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Map Location</h3>
              <MapDisplay reports={[report]} height="250px" showLegend={false} showOverview={false} />
            </div>

            {/* Details Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6 border-b pb-2">Report Details</h3>
              
              <div className="space-y-5">
                <div className="flex gap-3">
                  <FaClock className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reported On</p>
                    <p className="text-gray-900">{format(new Date(report.createdAt), 'MMM dd, yyyy h:mm a')}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FaUserCircle className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reported By</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar src={report.createdBy?.profileImage} name={report.createdBy?.name} size="sm" />
                      <p className="text-gray-900">{report.createdBy?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FaBuilding className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned Department</p>
                    <p className="text-gray-900">{report.department?.name || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FaUserCircle className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assigned Officer</p>
                    <p className="text-gray-900">{report.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History and Timeline */}
            {report.statusHistory && report.statusHistory.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 border-b pb-2">Status Timeline</h3>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {report.statusHistory.map((history, idx) => (
                    <div key={idx} className="relative flex items-start">
                      <div className="absolute left-0 mt-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow"></div>
                      <div className="pl-8">
                        <StatusBadge status={history.newStatus} size="sm" className="mb-1" />
                        <p className="text-xs text-gray-500 mb-1">{format(new Date(history.timestamp), 'MMM dd, yyyy h:mm a')}</p>
                        {history.note && <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 mt-2">{history.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Images and Notes */}
            {(report.resolutionImages?.length > 0 || report.resolutionNotes) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 border-b pb-2">Resolution Details</h3>
                
                {report.resolutionNotes && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-600 mb-2">Officer Notes</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap">{report.resolutionNotes}</p>
                  </div>
                )}

                {report.resolutionImages && report.resolutionImages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-3">Resolution Photos</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {report.resolutionImages.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={img} alt={`Resolution ${idx + 1}`} className="w-full h-40 object-cover rounded border border-gray-200 hover:border-primary-500 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default ComplaintDetailPage;
