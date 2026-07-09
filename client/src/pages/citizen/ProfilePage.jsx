import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSave, FaChartPie, FaPlus, FaListUl, FaClipboardList, FaUsers, FaUserTie, FaBuilding, FaHistory } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/authApi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateContextUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.phone) data.append('phone', formData.phone);
      if (imageFile) data.append('image', imageFile);

      const res = await updateProfile(data);
      updateContextUser(res.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getSidebarItems = () => {
    if (user?.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <FaChartPie /> },
        { label: 'Complaints', path: '/admin/complaints', icon: <FaClipboardList /> },
        { label: 'Resolved Complaints', path: '/admin/history', icon: <FaHistory /> },
        { label: 'Users', path: '/admin/users', icon: <FaUsers /> },
        { label: 'Officers', path: '/admin/officers', icon: <FaUserTie /> },
        { label: 'Departments', path: '/admin/departments', icon: <FaBuilding /> },
      ];
    } else if (user?.role === 'officer') {
      return [
        { label: 'Dashboard', path: '/officer/dashboard', icon: <FaChartPie /> },
        { label: 'Assigned Complaints', path: '/officer/complaints', icon: <FaClipboardList /> },
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

  return (
    <DashboardLayout sidebarItems={getSidebarItems()}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and personal information.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-slate-900 h-32 w-full"></div>
          
          <form onSubmit={handleSubmit} className="px-6 pb-8 md:px-8">
            <div className="relative -mt-16 mb-8 flex flex-col items-center sm:items-start sm:flex-row sm:justify-between">
              <div className="relative group">
                <Avatar 
                  src={previewUrl || user?.profileImage} 
                  name={user?.name} 
                  className="w-32 h-32 text-4xl border-4 border-white bg-white shadow-md" 
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <FaCamera className="text-2xl" />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              
              <div className="mt-4 sm:mt-16 text-center sm:text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 uppercase tracking-wider">
                  {user?.role} Account
                </span>
                {user?.department && (
                  <p className="text-sm text-gray-500 mt-2 font-medium">{user.department.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={<FaUser />}
                required
              />

              <Input
                label="Email Address"
                value={user?.email}
                icon={<FaEnvelope />}
                disabled
                className="opacity-70"
                helperText="Email cannot be changed"
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={<FaPhone />}
                placeholder="+1 (555) 000-0000"
              />

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" loading={loading} icon={<FaSave />}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
