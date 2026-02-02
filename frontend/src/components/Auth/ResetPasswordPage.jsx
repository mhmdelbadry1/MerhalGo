import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import authService from '../../services/auth.service';

const ResetPasswordPage = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [searchParams] = useSearchParams();

    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            showError(i18n.language === 'ar' ? 'رابط غير صالح' : 'Invalid link');
            navigate('/');
            return;
        }

        setToken(tokenFromUrl);
        setIsValidating(false);
        setIsTokenValid(true);
    }, [searchParams, navigate, showError, i18n.language]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showError(i18n.language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            showError(i18n.language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            await authService.resetPassword(token, newPassword);
            showSuccess(
                i18n.language === 'ar'
                    ? 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول'
                    : 'Password reset successful! You can now log in'
            );

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message;
            showError(
                i18n.language === 'ar'
                    ? errorMessage || 'فشل إعادة تعيين كلمة المرور. الرابط قد يكون منتهي الصلاحية'
                    : errorMessage || 'Failed to reset password. Link may be expired'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400">
                        {i18n.language === 'ar' ? 'جاري التحقق...' : 'Validating...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!isTokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 text-3xl mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {i18n.language === 'ar' ? 'رابط غير صالح' : 'Invalid Link'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {i18n.language === 'ar'
                            ? 'الرابط غير صالح أو منتهي الصلاحية'
                            : 'This link is invalid or has expired'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                        {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            {/* Animated Background Shapes */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/2 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl mx-auto mb-4">
                        <i className="fas fa-lock"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {i18n.language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {i18n.language === 'ar'
                            ? 'أدخل كلمة المرور الجديدة لحسابك'
                            : 'Enter your new password for your account'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {i18n.language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 pr-10 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {i18n.language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                <i className="fas fa-lock"></i>
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
                        <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                            <i className="fas fa-info-circle mt-0.5"></i>
                            <span>
                                {i18n.language === 'ar'
                                    ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
                                    : 'Password must be at least 6 characters long'}
                            </span>
                        </p>
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
                                {i18n.language === 'ar' ? 'جاري إعادة التعيين...' : 'Resetting...'}
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <i className="fas fa-check"></i>
                                {i18n.language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
                            </span>
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-sm text-primary hover:text-primary-dark font-semibold"
                        >
                            {i18n.language === 'ar' ? '← العودة لتسجيل الدخول' : '← Back to Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
