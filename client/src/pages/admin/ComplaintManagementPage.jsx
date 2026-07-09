import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartPie, FaUsers, FaClipboardList, FaBuilding, FaUserTie, FaUserCheck, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ReportCard from '../../components/report/ReportCard';
import AssignOfficerModal from '../../components/report/AssignOfficerModal';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import FilterPanel from '../../components/common/FilterPanel';
import EmptyState from '../../components/common/EmptyState';
import { getReports } from '../../api/reportApi';
import { usePagination } from '../../hooks/usePagination';
import toast from 'react-hot-toast';

const ComplaintManagementPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', severity: '', sort: 'newest', search: '' });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const { page, limit, totalPages, setPage, setTotal } = usePagination(1, 12);

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports({ 
        page, 
        limit,
        status: filters.status,
        category: filters.category,
        severity: filters.severity,
        sort: filters.sort,
        search: filters.search
      });
      setReports(res.data.data.reports);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleOpenAssignModal = (report) => {
    if (!report.department) {
      toast.error('This report does not have a department assigned yet');
      return;
    }
    setSelectedReport(report);
    setAssignModalOpen(true);
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
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">All Complaints</h1>
          <p className="text-gray-600 mt-2">Manage and assign all civic issues across the platform.</p>
        </div>
      </div>

      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={() => { setFilters({ status: '', category: '', severity: '', sort: 'newest', search: '' }); setPage(1); }} 
      />

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : reports.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map(report => (
              <div key={report._id} className="flex flex-col">
                <ReportCard report={report} />
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<FaUserCheck />}
                    onClick={() => handleOpenAssignModal(report)}
                    disabled={!report.department}
                  >
                    Assign Officer
                  </Button>
                  <Link 
                    to={`/complaints/${report._id}`}
                    className="w-full block text-center bg-gray-100 text-gray-800 hover:bg-gray-200 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
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
          title="No complaints found"
          message="No reports match your current filters."
          action={{
            label: 'Clear Filters',
            variant: 'outline',
            onClick: () => { setFilters({ status: '', category: '', severity: '', sort: 'newest', search: '' }); setPage(1); }
          }}
        />
      )}

      <AssignOfficerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        report={selectedReport}
        onSuccess={() => {
          fetchReports();
        }}
      />
    </DashboardLayout>
  );
};

export default ComplaintManagementPage;
