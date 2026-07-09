import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaChartPie, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportCard from '../../components/report/ReportCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import FilterPanel from '../../components/common/FilterPanel';
import { getReports } from '../../api/reportApi';
import { usePagination } from '../../hooks/usePagination';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AssignedComplaintsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', sort: 'newest' });
  
  const { page, limit, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // In a real app, there would be an endpoint /api/v1/reports?assignedTo=me
      // For now, fetch and filter client-side (not ideal for pagination, but workable for MVP)
      const res = await getReports({ limit: 100 }); 
      
      let filteredReports = res.data.data.reports || [];
      
      // Filter by assigned user
      filteredReports = filteredReports.filter(r => r.assignedTo?._id === user._id || r.assignedTo === user._id);
      
      // Apply status filter
      if (filters.status) {
        filteredReports = filteredReports.filter(r => r.status === filters.status);
      }

      // Apply sorting
      if (filters.sort === 'oldest') {
        filteredReports.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        filteredReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setTotal(filteredReports.length);
      
      // Manual pagination
      const start = (page - 1) * limit;
      setReports(filteredReports.slice(start, start + limit));

    } catch (error) {
      toast.error('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
    { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assigned Complaints</h1>
          <p className="text-gray-600 mt-2">Manage and update the status of issues assigned to you.</p>
        </div>
      </div>

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={() => { setFilters({ status: '', sort: 'newest' }); setPage(1); }} 
      />

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : reports.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map(report => (
              <div key={report._id} className="flex flex-col">
                <ReportCard report={report} />
                <Link 
                  to={`/officer/complaints/${report._id}`}
                  className="mt-3 w-full block text-center bg-primary-600 text-white hover:bg-primary-700 py-2 rounded-lg font-medium shadow-sm transition-colors"
                >
                  Update Status
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
             <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <EmptyState 
          icon={<FaClipboardList className="text-gray-300" />}
          title="No assigned complaints"
          message="You don't have any complaints assigned to you right now."
        />
      )}
    </DashboardLayout>
  );
};

export default AssignedComplaintsPage;
