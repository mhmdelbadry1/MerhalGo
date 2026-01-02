import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, withOffers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({ limit: 100 }); // Get more orders for accurate stats
      
      // Handle paginated response - extract data array correctly
      const ordersData = response?.data?.data || response?.data || [];
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      const total = ordersArray.length;
      // Active: pending, reviewing, offered, accepted, in_progress
      const active = ordersArray.filter(o => 
        ['new', 'pending', 'reviewing', 'offered', 'accepted', 'in_progress'].includes(o.status)
      ).length;
      const completed = ordersArray.filter(o => o.status === 'completed').length;
      const withOffers = ordersArray.filter(o => 
        (o.total_offers > 0) || (o.offers?.[0]?.count > 0) || o.status === 'offered'
      ).length;
      
      setStats({ total, active, completed, withOffers });
      setRecentOrders(ordersArray.slice(0, 3)); // Get 3 most recent
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      showError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {loading ? <i className="fas fa-spinner fa-spin text-xl"></i> : stats.total}
                </p>
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
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {loading ? <i className="fas fa-spinner fa-spin text-xl"></i> : stats.active}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">واصلة العروض</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {loading ? <i className="fas fa-spinner fa-spin text-xl"></i> : stats.withOffers}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                <i className="fas fa-handshake text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">مكتملة</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {loading ? <i className="fas fa-spinner fa-spin text-xl"></i> : stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <i className="fas fa-check text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              أحدث الطلبات
            </h2>
            <button
              onClick={() => navigate('/customer/orders')}
              className="text-primary hover:text-primary-dark font-semibold text-sm"
            >
              عرض الكل
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="grid gap-4">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                      ${['international', 'chinese'].includes(order.order_type || order.type) ? 'bg-blue-100 text-blue-600' : 
                        (order.order_type || order.type) === 'local' ? 'bg-green-100 text-green-600' : 'bg-pink-100 text-pink-600'}`}
                    >
                      <i className={`fas ${
                        ['international', 'chinese'].includes(order.order_type || order.type) ? 'fa-globe' : 
                        (order.order_type || order.type) === 'local' ? 'fa-truck' : 'fa-shopping-bag'
                      }`}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">
                        {order.order_type === 'international' ? t('internationalShipping') : 
                         order.order_type === 'local' ? t('localShipping') : 
                         order.order_type === 'chinese' ? t('chineseStoresShipping') : t('sheinShipping')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        #{order.order_number || order.id?.substring(0, 8)} • {new Date(order.created_at).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'offered' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status === 'new' ? 'جديد' : 
                         order.status === 'pending' ? 'قيد الانتظار' :
                         order.status === 'offered' ? 'وصلت عروض' :
                         order.status === 'accepted' ? 'تم القبول' : order.status}
                      </span>
                    </div>
                    {(order.total_offers > 0 || order.offers_count > 0 || (order.offers && order.offers[0] && order.offers[0].count > 0)) && (
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-sm font-semibold">
                        <i className="fas fa-handshake"></i>
                        <span>{order.total_offers || order.offers?.[0]?.count || 0} عروض</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate('/customer/orders')}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300"
                    >
                      التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-2xl mx-auto mb-4">
                <i className="fas fa-box-open"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                لا توجد طلبات حديثة
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                ابدأ بإنشاء طلب شحن جديد
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
