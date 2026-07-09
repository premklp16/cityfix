import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaCity } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (user.role === 'officer') navigate('/officer/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameValidation = validateRequired(formData.name, 'Name');
    if (!nameValidation.valid) newErrors.name = nameValidation.message;

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) newErrors.email = emailValidation.message;
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) newErrors.password = passwordValidation.message;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      // Navigation handled by useEffect
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
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join CityFix to start reporting issues
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<FaUser />}
              placeholder="John Doe"
              required
            />

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

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<FaLock />}
              placeholder="••••••••"
              required
              showPasswordToggle
            />

            <div className="text-sm text-slate-500 text-center pb-2">
              By creating an account, you agree to our{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Terms</a> and{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Privacy Policy</a>.
            </div>

            <div>
              <Button type="submit" fullWidth size="lg" loading={loading} className="font-semibold text-base shadow-lg shadow-primary-500/30">
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
