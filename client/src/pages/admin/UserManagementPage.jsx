import React, { useState, useEffect } from 'react';
import { FaChartPie, FaUsers, FaClipboardList, FaBuilding, FaSearch, FaUserShield, FaUserTie, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Avatar from '../../components/common/Avatar';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { getUsers, updateUserRole } from '../../api/adminApi';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { page, limit, totalPages, setPage, setTotal } = usePagination(1, 10);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, debouncedSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        page,
        limit,
        role: roleFilter,
        search: debouncedSearch
      });
      setUsers(res.data.data.users);
      setTotal(res.data.data.total);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error('Failed to update user role');
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

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage citizens, officers, and administrators.</p>
        </div>
      </div>

      <Card className="mb-8 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<FaSearch />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'citizen', label: 'Citizens' },
                { value: 'officer', label: 'Officers' },
                { value: 'admin', label: 'Admins' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wider uppercase">User</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wider uppercase">Contact</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wider uppercase">Joined</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-sm tracking-wider uppercase">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profileImage} name={user.name} size="sm" />
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        className="w-32 py-1 text-sm bg-transparent border-gray-200"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        options={[
                          { value: 'citizen', label: 'Citizen' },
                          { value: 'officer', label: 'Officer' },
                          { value: 'admin', label: 'Admin' },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
};

export default UserManagementPage;
