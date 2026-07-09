import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartPie, FaListUl, FaPlus, FaClipboardList, FaUsers, FaUserTie, FaBuilding, FaHistory, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import DashboardLayout from '../components/layout/DashboardLayout';
import ReportCard from '../components/report/ReportCard';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Card from '../components/common/Card';
import { getMyReports, getReports } from '../api/reportApi';
import { usePagination } from '../hooks/usePagination';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResolvedHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const limit = 9;
  const { page, totalPages, setPage, setTotal } = usePagination(1, limit);

  useEffect(() => {
    if (!user) return;
    fetchResolvedReports();
  }, [page, user]);

  const fetchResolvedReports = async () => {
    try {
      setLoading(true);
      if (user.role === 'citizen') {
        // Fetch citizen's own resolved reports
        const res = await getMyReports({
          page,
          limit,
          status: 'Resolved',
          sort: 'newest'
        });
        setReports(res.data.data.reports || []);
        setTotal(res.data.data.total || 0);
      } else if (user.role === 'officer') {
        // Fetch all and filter client-side for officer's assigned + resolved reports (matching AssignedComplaintsPage approach)
        const res = await getReports({ limit: 1000, status: 'Resolved', sort: 'newest' });
        const allReports = res.data.data.reports || [];
        const officerResolved = allReports.filter(
          r => (r.assignedTo?._id === user._id || r.assignedTo === user._id) && r.status === 'Resolved'
        );
        
        setTotal(officerResolved.length);
        
        // Manual pagination
        const start = (page - 1) * limit;
        setReports(officerResolved.slice(start, start + limit));
      } else if (user.role === 'admin') {
        // Fetch all resolved reports
        const res = await getReports({
          page,
          limit,
          status: 'Resolved',
          sort: 'newest'
        });
        setReports(res.data.data.reports || []);
        setTotal(res.data.data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to load resolved history');
    } finally {
      setLoading(false);
    }
  };

  // Determine sidebar items and title based on user role
  let sidebarItems = [];
  let pageTitle = '';
  let pageSubtitle = '';
  let emptyTitle = '';
  let emptyMessage = '';

  if (user?.role === 'citizen') {
    sidebarItems = [
      { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
      { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
      { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
      { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> }
    ];
    pageTitle = 'My Resolved Issues';
    pageSubtitle = 'View and track all the issues you reported that have been successfully resolved.';
    emptyTitle = 'No resolved issues';
    emptyMessage = 'You do not have any resolved issues in your history yet.';
  } else if (user?.role === 'officer') {
    sidebarItems = [
      { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
      { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
      { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> }
    ];
    pageTitle = 'Resolved Tasks';
    pageSubtitle = 'A history of all tasks assigned to you that have been marked as resolved.';
    emptyTitle = 'No resolved tasks';
    emptyMessage = 'You have not marked any assigned complaints as resolved yet.';
  } else if (user?.role === 'admin') {
    sidebarItems = [
      { label: 'Dashboard', path: '/admin/dashboard', icon: <FaChartPie /> },
      { label: 'Complaints', path: '/admin/complaints', icon: <FaClipboardList /> },
      { label: 'Resolved Complaints', path: '/admin/history', icon: <FaHistory /> },
      { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
      { label: 'Officers', path: '/admin/officers', icon: <FaUserTie /> },
      { label: 'Departments', path: '/admin/departments', icon: <FaBuilding /> }
    ];
    pageTitle = 'Resolved Complaints';
    pageSubtitle = 'Complete archive of all resolved civic issues across the platform.';
    emptyTitle = 'No resolved complaints';
    emptyMessage = 'There are no resolved complaints in the system archive.';
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <FaCheckCircle className="text-2xl" />
          </span>
          {pageTitle}
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">{pageSubtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : reports.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          icon={<FaHistory className="text-gray-300" />}
          title={emptyTitle}
          message={emptyMessage}
        />
      )}
    </DashboardLayout>
  );
};

export default ResolvedHistoryPage;
