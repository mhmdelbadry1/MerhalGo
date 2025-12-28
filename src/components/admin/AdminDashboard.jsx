import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Shared/Navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    localShipping: 0,
    internationalShipping: 0,
    companyRequests: 0
  });
  const [orderStatus, setOrderStatus] = useState({
    new: 0,
    reviewing: 0,
    notAcceptable: 0,
    accepted: 0,
    rejected: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const orders = JSON.parse(localStorage.getItem('mirhal_orders') || '[]');
    const requests = JSON.parse(localStorage.getItem('mirhal_company_requests') || '[]');

    setStats({
      totalOrders: orders.length,
      localShipping: orders.filter(o => o.type === 'local').length,
      internationalShipping: orders.filter(o => o.type === 'international').length,
      companyRequests: requests.filter(r => r.status === 'pending').length
    });

    setOrderStatus({
      new: orders.filter(o => o.status === 'new').length,
      reviewing: orders.filter(o => o.status === 'reviewing').length,
      notAcceptable: orders.filter(o => o.status === 'not_acceptable').length,
      accepted: orders.filter(o => o.status === 'accepted').length,
      rejected: orders.filter(o => o.status === 'rejected').length
    });

    setRecentOrders(orders.slice(-5).reverse());
  };

  const getOrderTypeLabel = (type) => {
    const labels = {
      international: 'شحن دولي',
      local: 'شحن محلي',
      chinese: 'متاجر صينية',
      shein: 'شي ان'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      not_acceptable: 'bg-gray-100 text-gray-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.new;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 min-h-screen shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-6">لوحة التحكم - مرحال جو</h2>
            <nav className="space-y-2">
              <button onClick={() => navigate('/admin')} className="w-full text-right px-4 py-3 bg-primary text-white rounded-lg flex items-center gap-3">
                <i className="fas fa-home"></i>
                <span>الرئيسية</span>
              </button>
              <button className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-truck"></i>
                <span>شحن محلي</span>
              </button>
              <button className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-globe"></i>
                <span>دولي عام</span>
              </button>
              <button className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-store"></i>
                <span>مواقع صينة</span>
              </button>
              <button className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-tshirt"></i>
                <span>شي ان</span>
              </button>
              <button onClick={() => navigate('/admin/company-requests')} className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-money-check"></i>
                <span>طلبات الشركات</span>
              </button>
              <button onClick={() => navigate('/admin/settings')} className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-cog"></i>
                <span>الإعدادات</span>
              </button>
              <button className="w-full text-right px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3">
                <i className="fas fa-clipboard"></i>
                <span>السياسات</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              نظرة عامة على جميع العمليات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">كل الطلبات</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <i className="fas fa-list text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">شحن محلي</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.localShipping}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <i className="fas fa-truck text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">شحن دولي</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.internationalShipping}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <i className="fas fa-globe text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">طلبات الشركات</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.companyRequests}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                  <i className="fas fa-money-check text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">حالة الطلبات</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg p-4">
                  <p className="text-3xl font-bold mb-1">{orderStatus.new}</p>
                  <p className="text-sm">جديد</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg p-4">
                  <p className="text-3xl font-bold mb-1">{orderStatus.reviewing}</p>
                  <p className="text-sm">جاري المراجعة</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg p-4">
                  <p className="text-3xl font-bold mb-1">{orderStatus.notAcceptable}</p>
                  <p className="text-sm">غير قابل</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-4">
                  <p className="text-3xl font-bold mb-1">{orderStatus.accepted}</p>
                  <p className="text-sm">مقبول</p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-4">
                  <p className="text-3xl font-bold mb-1">{orderStatus.rejected}</p>
                  <p className="text-sm">مرفوض</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">أحدث الطلبات</h2>
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <i className="fas fa-box"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">LOCAL-{String(order.id).padStart(3, '0')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.data?.clientName || 'عميل'}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-xs font-semibold">
                        {getOrderTypeLabel(order.type)}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'new')}`}>
                        جديد
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
