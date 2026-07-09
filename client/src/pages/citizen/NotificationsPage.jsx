import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaPlus, FaListUl, FaChartPie, FaUsers, FaClipboardList, FaBuilding, FaUserTie, FaHistory } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { usePagination } from '../../hooks/usePagination';

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markRead, markAllRead } = useNotifications();
  const [loading, setLoading] = useState(true);
  const { page, limit, totalPages, setPage, setTotal } = usePagination(1, 10);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    setLoading(true);
    const data = await fetchNotifications({ page, limit });
    if (data) {
      setTotal(data.total);
      if (data.notifications.some((notification) => !notification.read)) {
        await markAllRead();
      }
    }
    setLoading(false);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'status_change': return '🔄';
      case 'comment': return '💬';
      case 'assignment': return '👤';
      case 'upvote': return '👍';
      default: return '🔔';
    }
  };

  const { user } = useAuth();

  const citizenSidebar = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
    { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
    { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
    { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> },
  ];

  const adminSidebar = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <FaChartPie /> },
    { label: 'Complaints', path: '/admin/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Complaints', path: '/admin/history', icon: <FaHistory /> },
    { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { label: 'Officers', path: '/admin/officers', icon: <FaUserTie /> },
    { label: 'Departments', path: '/admin/departments', icon: <FaBuilding /> },
  ];

  const officerSidebar = [
    { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
    { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
    { label: 'Resolved Tasks', path: '/officer/history', icon: <FaHistory /> },
  ];

  const sidebarItems = user?.role === 'admin' ? adminSidebar : user?.role === 'officer' ? officerSidebar : citizenSidebar;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Updates on your reports and community activity.</p>
          </div>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-lg"
            >
              <FaCheck /> Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
        ) : notifications.length > 0 ? (
          <Card padding="none" className="overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <li 
                  key={notification._id} 
                  className={`p-4 sm:p-5 transition-colors ${notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                >
                  <div className="flex gap-4">
                    <div className="text-2xl mt-1 opacity-80">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-gray-900 ${notification.read ? '' : 'font-semibold'}`}>
                        {notification.message}
                      </p>
                      
                      {notification.reportId && (
                        <Link 
                          to={`/complaints/${notification.reportId._id}`}
                          className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Report: {notification.reportId.title}
                        </Link>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        {!notification.read && (
                          <button
                            onClick={() => markRead(notification._id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </Card>
        ) : (
          <EmptyState 
            icon={<FaBell className="text-gray-300" />}
            title="All caught up!"
            message="You don't have any notifications right now."
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
