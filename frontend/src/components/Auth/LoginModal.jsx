import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage, getSuccessMessage } from '../../utils/messages';
import ForgotPasswordModal from './ForgotPasswordModal';

/**
 * Unified Login Modal - Works for both customers and companies
 * Admin login is blocked from this modal (must use /admin-login)
 */
const LoginModal = ({ isOpen, onClose, blockAdminLogin = true }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      const userRole = result?.data?.user?.role || 'customer';

      // Block admin login from landing page
      if (blockAdminLogin && userRole === 'admin') {
        setError(i18n.language === 'ar'
          ? 'يرجى استخدام صفحة تسجيل دخول المسؤولين'
          : 'Please use the admin login page');
        // Logout the admin since we blocked them
        return;
      }

      showSuccess(getSuccessMessage('loginSuccess', i18n.language));
      onClose();

      // Navigate based on role
      setTimeout(() => {
        const routes = {
          admin: '/admin',
          company: '/company',
          customer: '/customer'
        };
        navigate(routes[userRole] || routes.customer);
      }, 100);

    } catch (err) {
      const errorMsg = getErrorMessage(err, i18n.language);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <i className="fas fa-sign-in-alt text-primary"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('login') || 'تسجيل الدخول'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
              <i className="fas fa-exclamation-circle mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('email') || 'البريد الإلكتروني'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="example@email.com"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('password') || 'كلمة المرور'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
            >
              {i18n.language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i>
                {i18n.language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing in...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-sign-in-alt"></i>
                {t('login') || 'تسجيل الدخول'}
              </span>
            )}
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {i18n.language === 'ar'
              ? 'يعمل لكل من العملاء وشركات الشحن'
              : 'Works for both customers and companies'}
          </p>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </div>
  );
};

export default LoginModal;
