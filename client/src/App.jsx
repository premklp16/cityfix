import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportIssuePage from './pages/citizen/ReportIssuePage';
import MyComplaintsPage from './pages/citizen/MyComplaintsPage';
import ComplaintDetailPage from './pages/citizen/ComplaintDetailPage';
import NotificationsPage from './pages/citizen/NotificationsPage';
import ProfilePage from './pages/citizen/ProfilePage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import AssignedComplaintsPage from './pages/officer/AssignedComplaintsPage';
import UpdateStatusPage from './pages/officer/UpdateStatusPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import OfficerManagementPage from './pages/admin/OfficerManagementPage';

import ResolvedHistoryPage from './pages/ResolvedHistoryPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Any Authenticated User */}
        <Route path="/complaints/:id" element={
          <ProtectedRoute>
            <ComplaintDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Citizen Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute roles={['citizen']}>
            <ReportIssuePage />
          </ProtectedRoute>
        } />
        <Route path="/my-complaints" element={
          <ProtectedRoute roles={['citizen']}>
            <MyComplaintsPage />
          </ProtectedRoute>
        } />
        <Route path="/my-history" element={
          <ProtectedRoute roles={['citizen']}>
            <ResolvedHistoryPage />
          </ProtectedRoute>
        } />
        
        {/* Officer Routes */}
        <Route path="/officer/dashboard" element={
          <ProtectedRoute roles={['officer']}>
            <OfficerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/officer/complaints" element={
          <ProtectedRoute roles={['officer']}>
            <AssignedComplaintsPage />
          </ProtectedRoute>
        } />
        <Route path="/officer/complaints/:id" element={
          <ProtectedRoute roles={['officer']}>
            <UpdateStatusPage />
          </ProtectedRoute>
        } />
        <Route path="/officer/history" element={
          <ProtectedRoute roles={['officer']}>
            <ResolvedHistoryPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/complaints" element={
          <ProtectedRoute roles={['admin']}>
            <ComplaintManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/history" element={
          <ProtectedRoute roles={['admin']}>
            <ResolvedHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/departments" element={
          <ProtectedRoute roles={['admin']}>
            <DepartmentManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/officers" element={
          <ProtectedRoute roles={['admin']}>
            <OfficerManagementPage />
          </ProtectedRoute>
        } />
        
        {/* Catch all */}
        <Route path="*" element={
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-gray-800">404</h1>
            <p className="text-gray-500 mt-2">Page not found</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
