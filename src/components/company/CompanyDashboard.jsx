import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';

const CompanyDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const stats = [
    {
      title: 'كل الطلبات',
      value: '45',
      icon: 'fa-box',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      darkColor: 'dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'عروضي النشطة',
      value: '12',
      icon: 'fa-handshake',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      darkColor: 'dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'عروض مقبولة',
      value: '8',
      icon: 'fa-check-circle',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      darkColor: 'dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'قيد التنفيذ',
      value: '5',
      icon: 'fa-clock',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
      darkColor: 'dark:bg-yellow-900/30',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            لوحة التحكم
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            نظرة عامة على نشاطك وعروضك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.lightColor} ${stat.darkColor} rounded-full flex items-center justify-center ${stat.textColor}`}>
                  <i className={`fas ${stat.icon} text-xl`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate('/company/all-orders')}
            className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 text-white cursor-pointer hover:scale-105 transition-all shadow-xl"
          >
            <i className="fas fa-list text-4xl mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">كل الطلبات</h3>
            <p className="text-white/80">شاهد جميع طلبات العملاء وقدم عروضك</p>
          </div>

          <div
            onClick={() => navigate('/company/offers')}
            className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white cursor-pointer hover:scale-105 transition-all shadow-xl"
          >
            <i className="fas fa-handshake text-4xl mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">عروضي</h3>
            <p className="text-white/80">إدارة ومتابعة عروضك المقدمة</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
