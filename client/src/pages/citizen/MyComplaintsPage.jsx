import React, { useState, useEffect } from 'react';
import { FaPlus, FaListUl, FaChartPie, FaFilter, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportCard from '../../components/report/ReportCard';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import FilterPanel from '../../components/common/FilterPanel';
import { getMyReports } from '../../api/reportApi';
import { usePagination } from '../../hooks/usePagination';
import toast from 'react-hot-toast';

const MyComplaintsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', severity: '', sort: 'newest' });
  
  const { page, limit, totalPages, setPage, setTotal } = usePagination(1, 9);

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getMyReports({ 
        page, 
        limit,
        status: filters.status,
        category: filters.category,
        severity: filters.severity,
        sort: filters.sort
      });
      setReports(res.data.data.reports);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({ status: '', category: '', severity: '', sort: 'newest' });
    setPage(1);
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
    { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
    { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
    { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-gray-600 mt-2">Track the status of all the civic issues you have reported.</p>
        </div>
      </div>

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleResetFilters} 
      />

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : reports.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
             <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
              />
          </div>
        </>
      ) : (
        <EmptyState 
          icon={<FaListUl className="text-gray-300" />}
          title="No complaints found"
          message={Object.values(filters).some(f => f && f !== 'newest') 
            ? "No reports match your current filters. Try adjusting them." 
            : "You haven't reported any issues yet."}
          action={!Object.values(filters).some(f => f && f !== 'newest') ? {
            label: 'Report an Issue',
            onClick: () => window.location.href = '/report'
          } : {
            label: 'Clear Filters',
            variant: 'outline',
            onClick: handleResetFilters
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default MyComplaintsPage;
