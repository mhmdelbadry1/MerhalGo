import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getErrorMessage, getSuccessMessage } from '../../utils/messages';
import LoginModal from '../Auth/LoginModal';
import ContactIcons from '../shared/ContactIcons';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCustomerRegister, setShowCustomerRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Customer Registration State
  const [customerRegisterData, setCustomerRegisterData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: ''
  });

  // Handle Customer Registration
  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await register({
        email: customerRegisterData.email,
        password: customerRegisterData.password,
        fullName: customerRegisterData.name,
        phone: customerRegisterData.phone,
        address: customerRegisterData.address
      });

      const responseData = response.data || {};

      if (responseData.requiresVerification || response.requiresVerification) {
        showSuccess('تم إنشاء الحساب بنجاح! راجع بريدك الإلكتروني للحصول على رمز التحقق.');
        navigate('/verify-email', { state: { email: customerRegisterData.email } });
      } else {
        showSuccess(getSuccessMessage('registerSuccess', i18n.language));
        navigate('/customer');
      }
    } catch (error) {
      showError(getErrorMessage(error, i18n.language));
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const features = [
    { icon: 'fa-truck', title: 'شحن محلي', desc: 'توصيل سريع لجميع المحافظات', color: 'blue' },
    { icon: 'fa-plane', title: 'شحن دولي', desc: 'شحن جوي وبحري لجميع الدول', color: 'purple' },
    { icon: 'fa-sync', title: 'تتبع مباشر', desc: 'تتبع شحناتك في الوقت الفعلي', color: 'green' },
    { icon: 'fa-shield-alt', title: 'ضمان الجودة', desc: 'شركات شحن موثوقة ومعتمدة', color: 'orange' }
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 dark:bg-purple-500/20',
    green: 'bg-green-500/10 text-green-500 dark:bg-green-500/20',
    orange: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <i className="fas fa-route text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">مرحال جو</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">MirhalGO</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 mx-8">
            <button
              onClick={() => navigate('/about')}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-semibold"
            >
              {i18n.language === 'ar' ? 'من نحن' : 'About Us'}
            </button>
            <button
              onClick={() => {
                navigate('/about');
                setTimeout(() => {
                  const servicesSection = document.getElementById('services-section');
                  servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-semibold"
            >
              {i18n.language === 'ar' ? 'الخدمات' : 'Services'}
            </button>
            <button
              onClick={() => {
                navigate('/about');
                setTimeout(() => {
                  const contactSection = document.getElementById('contact-section');
                  contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-semibold"
            >
              {i18n.language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </button>
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${i18n.language === 'ar'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              عربي
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${i18n.language === 'en'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <i className="fas fa-star"></i>
              <span> المنصة الاولي لكل خدمات الشحن في مصر </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
              {t('welcome') || 'مرحباً بك في مرحال جو'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              {t('companyDescription') || 'منصة متكاملة تربط بين العملاء وشركات الشحن الموثوقة'}
            </p>
          </div>

          {/* Main Card - Unified Portal */}
          <div className="max-w-md mx-auto mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-900/10 dark:shadow-black/30 border border-white/20">
              {/* Login Button */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl hover:shadow-lg hover:shadow-primary/30 transition-all font-bold text-lg flex items-center justify-center gap-3 mb-6"
              >
                <i className="fas fa-sign-in-alt"></i>
                {t('login') || 'تسجيل الدخول'}
              </button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                    {i18n.language === 'ar' ? 'أو أنشئ حساباً جديداً' : 'or create a new account'}
                  </span>
                </div>
              </div>

              {/* Registration Options */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowCustomerRegister(true)}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 text-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <i className="fas fa-user"></i>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">
                    {i18n.language === 'ar' ? 'حساب عميل' : 'Customer'}
                  </p>
                </button>

                <button
                  onClick={() => navigate('/company-register')}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 text-xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <i className="fas fa-building"></i>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">
                    {i18n.language === 'ar' ? 'شركة شحن' : 'Company'}
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${colorClasses[feature.color]} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4`}>
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer id="contact-section" className="relative z-10 border-t border-gray-200/50 dark:border-gray-700/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {i18n.language === 'ar' ? 'مرحال جو' : 'MirhalGO'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {i18n.language === 'ar' 
                  ? 'منصة الشحن الرائدة في مصر للشحن المحلي والدولي'
                  : 'Egypt\'s leading shipping platform for local and international freight'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {i18n.language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/about')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-right"
                >
                  {i18n.language === 'ar' ? 'من نحن' : 'About Us'}
                </button>
                <button
                  onClick={() => {
                    navigate('/about');
                    setTimeout(() => {
                      const servicesSection = document.getElementById('services-section');
                      servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-right"
                >
                  {i18n.language === 'ar' ? 'الخدمات' : 'Services'}
                </button>
                <button
                  onClick={() => navigate('/company-register')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors text-right"
                >
                  {i18n.language === 'ar' ? 'انضم كشركة شحن' : 'Join as Company'}
                </button>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                {i18n.language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              <div className="mt-4">
                <ContactIcons className="justify-start" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              © 2026 MirhalGO. {i18n.language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
            </p>
          </div>
        </div>
      </footer>

      {/* Unified Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        blockAdminLogin={true}
      />

      {/* Customer Register Modal */}
      {showCustomerRegister && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <i className="fas fa-user-plus text-blue-500"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t('createCustomerAccount') || 'إنشاء حساب عميل'}
                </h2>
              </div>
              <button
                onClick={() => setShowCustomerRegister(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('name') || 'الاسم الكامل'}
                </label>
                <input
                  type="text"
                  value={customerRegisterData.name}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('phone') || 'رقم الهاتف'}
                </label>
                <input
                  type="tel"
                  value={customerRegisterData.phone}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('address') || 'العنوان'}
                </label>
                <input
                  type="text"
                  value={customerRegisterData.address}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, address: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('email') || 'البريد الإلكتروني'}
                </label>
                <input
                  type="email"
                  value={customerRegisterData.email}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, email: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('password') || 'كلمة المرور'}
                </label>
                <input
                  type="password"
                  value={customerRegisterData.password}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, password: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i>
                    {i18n.language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-user-plus"></i>
                    {t('createCustomerAccount') || 'إنشاء الحساب'}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
