import React, { useState, useEffect } from 'react';
import { FaChartPie, FaUsers, FaClipboardList, FaBuilding, FaUserTie, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import StatusChart from '../../components/charts/StatusChart';
import CategoryChart from '../../components/charts/CategoryChart';
import TrendChart from '../../components/charts/TrendChart';
import { getAnalytics } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setAnalytics(res.data.data);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
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

  if (loading || !analytics) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform analytics and overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-primary-500 shadow-sm flex items-center p-6">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-lg mr-4">
            <FaClipboardList className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
          </div>
        </Card>
        
        <Card className="border-l-4 border-emerald-500 shadow-sm flex items-center p-6">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4">
            <FaChartPie className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Resolution Rate</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.resolutionRate}%</p>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500 shadow-sm flex items-center p-6">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg mr-4">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Open Issues</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.openReports}</p>
          </div>
        </Card>

        <Card className="border-l-4 border-danger-500 shadow-sm flex items-center p-6">
          <div className="p-3 bg-danger-50 text-danger-600 rounded-lg mr-4">
            <FaBuilding className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{analytics.rejectedReports}</p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <h3 className="font-bold text-gray-900 mb-6">Reports by Status</h3>
          <StatusChart data={analytics.statusDistribution} />
        </Card>
        
        <Card>
          <h3 className="font-bold text-gray-900 mb-6">Reporting Trends (Last 6 Months)</h3>
          <TrendChart data={analytics.monthlyTrends} />
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-gray-900 mb-6">Reports by Category</h3>
        <CategoryChart data={analytics.categoryDistribution} />
      </Card>

    </DashboardLayout>
  );
};

export default AdminDashboard;
