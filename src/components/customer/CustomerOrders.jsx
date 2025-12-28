import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const CustomerOrders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [filter, setFilter] = useState('all'); // all, new, pending, completed

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('mirhal_orders') || '[]');
    // Filter orders for current user (in real app, filter by user ID)
    setOrders(allOrders);
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
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.new;
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'جديد',
      pending: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  const viewOrderOffers = (order) => {
    setSelectedOrder(order);
    setShowOffers(true);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {t('myOrders')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            جميع طلبات الشحن الخاصة بك
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل', count: orders.length },
            { key: 'new', label: 'جديد', count: orders.filter(o => o.status === 'new').length },
            { key: 'pending', label: 'قيد التنفيذ', count: orders.filter(o => o.status === 'pending').length },
            { key: 'completed', label: 'مكتمل', count: orders.filter(o => o.status === 'completed').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              لا توجد طلبات حتى الآن
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ابدأ بإنشاء طلب شحن جديد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                {/* Order Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {getOrderTypeLabel(order.type)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رقم الطلب: #{order.id}
                  </p>
                </div>

                {/* Order Details Preview */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                  {order.data?.clientName && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.clientName}</span>
                    </div>
                  )}
                  {order.data?.from && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">من:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.from}</span>
                    </div>
                  )}
                </div>

                {/* Offers Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-handshake text-primary"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {order.offersCount || 0} عرض
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => viewOrderOffers(order)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
                  >
                    <i className="fas fa-eye ml-1"></i>
                    عرض العروض
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offers Modal */}
      {showOffers && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                العروض المقدمة - طلب #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowOffers(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 text-xl mt-1"></i>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      لم يتم استلام أي عروض بعد. سيتم إشعارك فور استلام عرض جديد.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
                  <i className="fas fa-inbox"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  لا توجد عروض حتى الآن
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  انتظر قليلاً، ستصلك العروض قريباً
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
