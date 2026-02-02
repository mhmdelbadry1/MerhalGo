import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import authService from '../../services/auth.service';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const { i18n } = useTranslation();
    const { showSuccess, showError } = useToast();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            showError(i18n.language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
            return;
        }

        setIsSubmitting(true);

        try {
            await authService.requestPasswordReset(email);
            setEmailSent(true);
            showSuccess(
                i18n.language === 'ar'
                    ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
                    : 'Password reset link sent to your email'
            );
        } catch (error) {
            showError(
                i18n.language === 'ar'
                    ? 'حدث خطأ. يرجى المحاولة مرة أخرى'
                    : 'An error occurred. Please try again'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setEmailSent(false);
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
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
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                            <i className="fas fa-key text-red-500"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {i18n.language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {!emailSent ? (
                    <>
                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                            {i18n.language === 'ar'
                                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور'
                                : 'Enter your email and we\'ll send you a link to reset your password'}
                        </p>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
                                        <i className="fas fa-envelope"></i>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                        placeholder="example@email.com"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-spinner fa-spin"></i>
                                        {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-paper-plane"></i>
                                        {i18n.language === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
                                    </span>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success Message */
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-3xl mx-auto mb-4">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {i18n.language === 'ar' ? 'تم إرسال البريد!' : 'Email Sent!'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                            {i18n.language === 'ar'
                                ? 'راجع بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور'
                                : 'Check your email and follow the instructions to reset your password'}
                        </p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
                        >
                            {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
