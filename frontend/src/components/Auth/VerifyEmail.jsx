import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import authService from '../../services/auth.service';

const VerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Set direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect back to home
      navigate('/');
    }
  }, [location, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) return;
    
    setIsVerifying(true);
    try {
      await authService.verifyEmail(email, code);
      showSuccess(i18n.language === 'ar' ? 'تم التحقق من البريد الإلكتروني بنجاح!' : 'Email verified successfully!');
      navigate('/'); // Redirect to landing page to login
    } catch (error) {
      console.error('Verification error:', error);
      showError(error.response?.data?.message || (i18n.language === 'ar' ? 'فشل التحقق من الرمز' : 'Verification failed'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;
    
    setIsResending(true);
    try {
      await authService.resendVerificationCode(email);
      showSuccess(i18n.language === 'ar' ? 'تم إرسال رمز جديد بنجاح' : 'New code sent successfully');
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      console.error('Resend error:', error);
      showError(error.response?.data?.message || (i18n.language === 'ar' ? 'فشل إرسال الرمز' : 'Failed to send code'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-envelope-open-text text-blue-600 dark:text-blue-400 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {i18n.language === 'ar' ? 'التحقق من البريد الإلكتروني' : 'Verify Your Email'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {i18n.language === 'ar' ? 'تم إرسال رمز التحقق إلى:' : 'Verification code sent to:'}{' '}
            <span className="font-semibold text-gray-800 dark:text-white dir-ltr block mt-1">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {i18n.language === 'ar' ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6 digits)'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full text-center text-3xl tracking-widest p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-300"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.length !== 6}
            className="w-full px-6 py-4 bg-primary text-white rounded-xl hover:bg-opacity-90 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {i18n.language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
              </>
            ) : (
              i18n.language === 'ar' ? 'تحقق الآن' : 'Verify Now'
            )}
          </button>
        </form>

        <div className="mt-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {i18n.language === 'ar' ? 'لم يصلك الرمز؟' : 'Didn\'t receive the code?'}
          </p>
          <button
            onClick={handleResendCode}
            disabled={countdown > 0 || isResending}
            className={`text-sm font-semibold transition-all px-4 py-2 rounded-md ${
              countdown > 0 || isResending
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-600 text-primary border border-gray-200 dark:border-gray-500 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {isResending ? (
               <span className="flex items-center justify-center gap-2">
                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
               </span>
            ) : countdown > 0 ? (
              i18n.language === 'ar' 
                ? `إعادة الإرسال بعد ${countdown} ثانية` 
                : `Resend in ${countdown}s`
            ) : (
              i18n.language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'
            )}
          </button>
        </div>

        <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm flex items-center justify-center gap-2 mx-auto transition-colors group"
          >
            <i className={`fas fa-arrow-${i18n.language === 'ar' ? 'right' : 'left'} group-hover:-translate-x-1 transition-transform`}></i>
            {i18n.language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
