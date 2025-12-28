import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const shippingTypes = [
    {
      id: 'international',
      title: t('internationalShipping'),
      icon: 'fa-globe',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      darkColor: 'dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      route: '/customer/shipping/international'
    },
    {
      id: 'local',
      title: t('localShipping'),
      icon: 'fa-truck',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      darkColor: 'dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      route: '/customer/shipping/local'
    },
    {
      id: 'chinese',
      title: t('chineseStoresShipping'),
      icon: 'fa-store',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      darkColor: 'dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      route: '/customer/shipping/chinese'
    },
    {
      id: 'shein',
      title: t('sheinShipping'),
      icon: 'fa-shopping-bag',
      color: 'bg-pink-500',
      lightColor: 'bg-pink-100',
      darkColor: 'dark:bg-pink-900/30',
      textColor: 'text-pink-600 dark:text-pink-400',
      route: '/customer/shipping/shein'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            مرحباً بك في MirhalGO
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختر نوع الشحن المناسب لك
          </p>
        </div>

        {/* Shipping Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shippingTypes.map((type, index) => (
            <div
              key={type.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(type.route)}
            >
              <div className={`w-16 h-16 ${type.lightColor} ${type.darkColor} rounded-full flex items-center justify-center ${type.textColor} text-2xl mb-4 mx-auto`}>
                <i className={`fas ${type.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
                {type.title}
              </h3>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
                اطلب شحنتك الآن
              </p>
              <button
                className={`w-full py-2 ${type.color} text-white rounded-lg hover:opacity-90 transition-all font-semibold`}
              >
                ابدأ الآن
              </button>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                <i className="fas fa-box text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">قيد التنفيذ</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مكتملة</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">7</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <i className="fas fa-check text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
