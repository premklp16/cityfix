import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaListUl, FaChartPie, FaClipboardList, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import ReportCard from '../../components/report/ReportCard';
import EmptyState from '../../components/common/EmptyState';
import { getMyReports, getReports } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user's recent reports (we'll compute recent from combined sets below)
        // Fetch non-resolved and resolved separately because server excludes
        // 'Resolved' by default when no status param is provided.
        const nonResolvedRes = await getMyReports({ limit: 100 }); // excludes Resolved
        const resolvedRes = await getMyReports({ limit: 100, status: 'Resolved' });

        const nonResolved = nonResolvedRes.data.data.reports || [];
        const resolvedAll = resolvedRes.data.data.reports || [];

        const combined = [...nonResolved, ...resolvedAll];

        // Recent 4 reports (sorted newest first) across all statuses
        const sortedRecent = combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMyReports(sortedRecent.slice(0, 4));

        setStats({
          total: combined.length,
          resolved: resolvedAll.length,
          pending: nonResolved.length
        });

        // Fetch nearby/recent reports (general for now, could use geolocation)
        const recentRes = await getReports({ limit: 3, sort: 'newest' });
        setNearbyReports(recentRes.data.data.reports);

      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
    { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
    { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
    { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> },
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your civic contributions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white border border-gray-100 flex items-center p-6 rounded-2xl shadow-sm">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600 mr-4">
            <FaClipboardList className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Reported</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </Card>
        
        <Card className="bg-white border border-gray-100 flex items-center p-6 rounded-2xl shadow-sm">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 mr-4">
            <FaClipboardList className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Resolved</p>
            <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
        </Card>

        <Card className="bg-white border border-gray-100 flex items-center p-6 rounded-2xl shadow-sm">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600 mr-4">
            <FaClipboardList className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User's Recent Reports */}
        <div className="xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Recent Reports</h2>
            <Link to="/my-complaints" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All
            </Link>
          </div>

          {myReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myReports.map(report => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<FaPlus className="text-gray-300" />}
              title="No reports yet"
              message="You haven't reported any civic issues yet."
              action={{
                label: 'Report an Issue',
                onClick: () => window.location.href = '/report'
              }}
            />
          )}
        </div>

        {/* Recently reported in city */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent in City</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
            {nearbyReports.map(report => (
              <div key={report._id} className="flex gap-4 border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {report.images && report.images.length > 0 ? (
                    <img src={report.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📸
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/complaints/${report._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 leading-tight mb-1">
                    {report.title}
                  </Link>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 truncate">{report.category}</span>
                  </div>
                  <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-medium uppercase tracking-wider">
                    {report.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;
