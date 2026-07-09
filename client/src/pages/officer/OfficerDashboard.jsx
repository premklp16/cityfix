import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaChartPie, FaCheckCircle, FaExclamationCircle, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import ReportCard from '../../components/report/ReportCard';
import { getReports } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [assignedReports, setAssignedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch non-resolved and resolved reports separately because server
      // API defaults to excluding 'Resolved' when no status param is provided.
      const resOpen = await getReports({ limit: 100 }); 
      const resResolved = await getReports({ limit: 100, status: 'Resolved' });

      const openReports = resOpen.data.data.reports || [];
      const resolvedReports = resResolved.data.data.reports || [];

      // Combine both sets to get full list
      const reports = [...openReports, ...resolvedReports];

      const assignedToMe = reports.filter(r => r.assignedTo?._id === user._id || r.assignedTo === user._id);

      setStats({
        assigned: assignedToMe.length,
        inProgress: assignedToMe.filter(r => r.status === 'In Progress').length,
        resolved: assignedToMe.filter(r => r.status === 'Resolved').length
      });

      // Get latest 4 for display (sorted by createdAt desc)
      const sorted = assignedToMe.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAssignedReports(sorted.slice(0, 4));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
    { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, Officer {user?.name}. Manage your assigned civic issues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white border-l-4 border-violet-500 p-6 flex items-center shadow-sm">
          <div className="p-4 rounded-xl bg-violet-50 text-violet-600 mr-4">
            <FaExclamationCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Assigned</p>
            <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-amber-500 p-6 flex items-center shadow-sm">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600 mr-4">
            <FaClipboardList className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>
        </Card>

        <Card className="bg-white border-l-4 border-emerald-500 p-6 flex items-center shadow-sm">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
            <FaCheckCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Resolved</p>
            <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Assignments</h2>
          <Link to="/officer/complaints" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All
          </Link>
        </div>

        {assignedReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {assignedReports.map(report => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
            You currently have no assigned complaints.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OfficerDashboard;
