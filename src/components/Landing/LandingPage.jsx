import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [showCompanyLogin, setShowCompanyLogin] = useState(false);
  const [showCustomerRegister, setShowCustomerRegister] = useState(false);

  // Customer Login State
  const [customerLoginData, setCustomerLoginData] = useState({
    email: '',
    password: ''
  });

  // Company Login State
  const [companyLoginData, setCompanyLoginData] = useState({
    username: '',
    password: ''
  });

  // Customer Registration State
  const [customerRegisterData, setCustomerRegisterData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    password: ''
  });

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  // Handle Customer Login
  const handleCustomerLogin = (e) => {
    e.preventDefault();
    // Mock login - في الـ backend الحقيقي هنعمل API call
    const userData = {
      email: customerLoginData.email,
      name: 'عميل تجريبي'
    };
    login(userData, 'customer');
    navigate('/customer');
  };

  // Handle Company Login
  const handleCompanyLogin = (e) => {
    e.preventDefault();
    // Mock login - في الـ backend الحقيقي هنعمل API call
    const userData = {
      username: companyLoginData.username,
      name: 'شركة تجريبية'
    };
    login(userData, 'company');
    navigate('/company');
  };

  // Handle Customer Registration
  const handleCustomerRegister = (e) => {
    e.preventDefault();
    // Mock registration - في الـ backend الحقيقي هنعمل API call
    const userData = {
      ...customerRegisterData
    };
    login(userData, 'customer');
    navigate('/customer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Language Switcher */}
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => changeLanguage('ar')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              i18n.language === 'ar' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Logo and Welcome */}
          <div className="text-center mb-12 fade-in">
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-2xl">
              <i className="fas fa-route"></i>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
              {t('welcome')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('companyDescription')}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Customer Login Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl mx-auto mb-4">
                  <i className="fas fa-user"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {t('loginAsCustomer')}
                </h3>
              </div>
              <button
                onClick={() => setShowCustomerLogin(true)}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-lg"
              >
                {t('loginAsCustomer')}
              </button>
              <button
                onClick={() => setShowCustomerRegister(true)}
                className="w-full mt-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
              >
                {t('createCustomerAccount')}
              </button>
            </div>

            {/* Company Login Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-2xl mx-auto mb-4">
                  <i className="fas fa-building"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {t('loginAsCompany')}
                </h3>
              </div>
              <button
                onClick={() => setShowCompanyLogin(true)}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold text-lg"
              >
                {t('loginAsCompany')}
              </button>
              <button
                onClick={() => navigate('/company-register')}
                className="w-full mt-3 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
              >
                {t('registerAsCompany')}
              </button>
            </div>
          </div>

          {/* Admin Access (Hidden) */}
          <div className="text-center">
            <button
              onClick={() => {
                login({ username: 'admin', name: 'المدير' }, 'admin');
                navigate('/admin');
              }}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <i className="fas fa-shield-alt ml-1"></i>
              Admin Access
            </button>
          </div>
        </div>
      </div>

      {/* Customer Login Modal */}
      {showCustomerLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('loginAsCustomer')}
              </h2>
              <button
                onClick={() => setShowCustomerLogin(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={customerLoginData.email}
                  onChange={(e) => setCustomerLoginData({ ...customerLoginData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={customerLoginData.password}
                  onChange={(e) => setCustomerLoginData({ ...customerLoginData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                {t('loginAsCustomer')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Company Login Modal */}
      {showCompanyLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('loginAsCompany')}
              </h2>
              <button
                onClick={() => setShowCompanyLogin(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCompanyLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('username')}
                </label>
                <input
                  type="text"
                  value={companyLoginData.username}
                  onChange={(e) => setCompanyLoginData({ ...companyLoginData, username: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={companyLoginData.password}
                  onChange={(e) => setCompanyLoginData({ ...companyLoginData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                {t('loginAsCompany')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Customer Register Modal */}
      {showCustomerRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t('createCustomerAccount')}
              </h2>
              <button
                onClick={() => setShowCustomerRegister(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCustomerRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={customerRegisterData.name}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={customerRegisterData.phone}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('address')}
                </label>
                <input
                  type="text"
                  value={customerRegisterData.address}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, address: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={customerRegisterData.email}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={customerRegisterData.password}
                  onChange={(e) => setCustomerRegisterData({ ...customerRegisterData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                {t('createCustomerAccount')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
