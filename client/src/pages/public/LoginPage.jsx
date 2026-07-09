import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaCity } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validators';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (user.role === 'officer') navigate('/officer/dashboard', { replace: true });
        else navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) newErrors.email = emailValidation.message;
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      // Navigation is handled by the useEffect above
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <FaCity className="text-white text-2xl" />
            </div>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to your CityFix account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<FaEnvelope />}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<FaLock />}
              placeholder="••••••••"
              required
              showPasswordToggle
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" fullWidth size="lg" loading={loading} className="font-semibold text-base shadow-lg shadow-primary-500/30">
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Don't have an account?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
