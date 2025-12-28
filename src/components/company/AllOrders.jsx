import React, { useState, useEffect } from 'react';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const AllOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showOffersView, setShowOffersView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [offerData, setOfferData] = useState({
    serviceType: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('mirhal_orders') || '[]');
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

  const openOfferModal = (order) => {
    setSelectedOrder(order);
    setShowOfferModal(true);
  };

  const submitOffer = () => {
    if (!offerData.serviceType || !offerData.startDate || !offerData.endDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newOffer = {
      id: Date.now(),
      orderId: selectedOrder.id,
      companyName: user?.name || 'شركة تجريبية',
      companyId: user?.id || Date.now(),
      ...offerData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const offers = JSON.parse(localStorage.getItem('mirhal_offers') || '[]');
    offers.push(newOffer);
    localStorage.setItem('mirhal_offers', JSON.stringify(offers));
    
    setShowOfferModal(false);
    setOfferData({ serviceType: '', startDate: '', endDate: '', notes: '' });
    alert('تم إضافة العرض بنجاح!');
  };

  const viewOffers = (order) => {
    setSelectedOrder(order);
    setShowOffersView(true);
  };

  const getOrderOffers = (orderId) => {
    const offers = JSON.parse(localStorage.getItem('mirhal_offers') || '[]');
    return offers.filter(offer => offer.orderId === orderId);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.type === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            كل الطلبات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            جميع طلبات الشحن من العملاء
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل', icon: 'fa-list' },
            { key: 'international', label: 'دولي', icon: 'fa-globe' },
            { key: 'local', label: 'محلي', icon: 'fa-truck' },
            { key: 'chinese', label: 'صيني', icon: 'fa-store' },
            { key: 'shein', label: 'شي ان', icon: 'fa-shopping-bag' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              لا توجد طلبات
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {getOrderTypeLabel(order.type)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                    رحلة #{order.id}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.data?.clientName || 'عميل'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                  {order.data?.from && (
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span className="text-gray-600 dark:text-gray-400">من:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.from}</span>
                    </div>
                  )}
                  {order.data?.to && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-green-500"></i>
                      <span className="text-gray-600 dark:text-gray-400">إلى:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.to}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    عدد العروض: {getOrderOffers(order.id).length}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openOfferModal(order)}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
                  >
                    <i className="fas fa-plus ml-1"></i>
                    إضافة عرض
                  </button>
                  <button
                    onClick={() => viewOffers(order)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Offer Modal */}
      {showOfferModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                إضافة عرض سعر
              </h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نص الخدمة *
                </label>
                <select
                  value={offerData.serviceType}
                  onChange={(e) => setOfferData({...offerData, serviceType: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">اختر نوع العملية</option>
                  <option value="door-door">من الباب إلى الباب</option>
                  <option value="door-port">من الباب إلى الميناء/المطار</option>
                  <option value="port-port">من الميناء/المطار إلى الميناء/المطار</option>
                  <option value="port-door">من الميناء/المطار إلى الباب</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ بداية الرحلة *
                </label>
                <input
                  type="date"
                  value={offerData.startDate}
                  onChange={(e) => setOfferData({...offerData, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ وصول الرحلة *
                </label>
                <input
                  type="date"
                  value={offerData.endDate}
                  onChange={(e) => setOfferData({...offerData, endDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows="3"
                  value={offerData.notes}
                  onChange={(e) => setOfferData({...offerData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="أي ملاحظات..."
                ></textarea>
              </div>

              <button
                onClick={submitOffer}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                <i className="fas fa-check ml-2"></i>
                تأكيد العرض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Offers Modal */}
      {showOffersView && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                عروض الأسعار المقدمة
              </h2>
              <button
                onClick={() => setShowOffersView(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              {getOrderOffers(selectedOrder.id).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
                    <i className="fas fa-inbox"></i>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">لا توجد عروض لهذا الطلب حتى الآن</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getOrderOffers(selectedOrder.id).map(offer => (
                    <div key={offer.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800 dark:text-white">{offer.companyName}</h3>
                        <span className="text-xs text-gray-500">{new Date(offer.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">نوع الخدمة:</span>
                          <span className="text-gray-800 dark:text-white font-semibold">{offer.serviceType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">تاريخ البدء:</span>
                          <span className="text-gray-800 dark:text-white font-semibold">{offer.startDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">تاريخ الوصول:</span>
                          <span className="text-gray-800 dark:text-white font-semibold">{offer.endDate}</span>
                        </div>
                        {offer.notes && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-gray-600 dark:text-gray-400">{offer.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
