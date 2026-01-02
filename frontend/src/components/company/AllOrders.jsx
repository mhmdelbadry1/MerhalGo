import React, { useState, useEffect } from 'react';
import Navbar from '../Shared/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import companyService from '../../services/company.service';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { formatOrderField } from '../../utils/orderFormatters';
import { getOrderLocations, getOrderServiceType } from '../../utils/orderHelpers';

const AllOrders = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [offerData, setOfferData] = useState({
    price: '',
    currency: 'EGP',
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await companyService.getAvailableOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading available orders:', error);
      showError('فشل تحميل الطلبات المتاحة');
    } finally {
      setLoading(false);
    }
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

  const submitOffer = async () => {
    // Validate required fields
    if (!offerData.price || parseFloat(offerData.price) <= 0) {
      showError('يرجى إدخال سعر صالح (أكبر من صفر)');
      return;
    }
    
    if (!offerData.startDate) {
      showError('يرجى تحديد تاريخ بداية الرحلة');
      return;
    }
    
    if (!offerData.endDate) {
      showError('يرجى تحديد تاريخ وصول الشحنة المتوقع');
      return;
    }
    
    // Validate end date is after or equal to start date
    if (new Date(offerData.endDate) < new Date(offerData.startDate)) {
      showError('تاريخ الوصول يجب أن يكون بعد أو يساوي تاريخ البداية');
      return;
    }

    try {
      const offerPayload = {
        orderId: selectedOrder.id,
        ...offerData,
        price: parseFloat(offerData.price)
      };
      
      await companyService.submitOffer(offerPayload);
      
      showSuccess('تم إضافة العرض بنجاح!');
      setShowOfferModal(false);
      setOfferData({ price: '', currency: 'EGP', startDate: '', endDate: '', notes: '' });
      loadOrders();
    } catch (error) {
      console.error('Error submitting offer:', error);
      // Show the actual error message from server
      const errorMsg = error.response?.data?.errors?.[0]?.msg 
        || error.response?.data?.message 
        || 'فشل إضافة العرض - تأكد من صحة البيانات';
      showError(errorMsg);
    }
  };

  const handleFileClick = async (e, file) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let path = file.path;
      let bucketName = 'order-documents';

      if (!path && file.url) {
        if (file.url.includes('/order-documents/')) {
          bucketName = 'order-documents';
          path = file.url.split('/order-documents/')[1];
        } else if (file.url.includes('/company-documents/')) {
          bucketName = 'company-documents';
          path = file.url.split('/company-documents/')[1];
        }
        if (path) {
          path = decodeURIComponent(path);
        }
      }

      if (path) {
        const response = await api.get(`/upload/file`, {
          params: { bucket: bucketName, path: path }
        });
        if (response.data?.data?.url) {
          window.open(response.data.data.url, '_blank');
        } else {
          showError('فشل فتح الملف');
        }
      } else {
        showError('لم يتم العثور على مسار الملف');
      }
    } catch (err) {
      console.error('File open error:', err);
      showError('حدث خطأ أثناء فتح الملف');
    }
  };

  // Helper  // Filter orders by status
  const filteredOrders = (orders.data?.data || orders.data || []).filter(order => {
    if (filter === 'all') return true;
    return order.order_type === filter;
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
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${order.status === 'reviewing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.status || 'reviewing'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-EG') : ''}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    رحلة #{order.order_number || order.id?.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.form_data?.clientName || order.data?.clientName || 'عميل'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                  {order.data?.from && (
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span className="text-gray-600 dark:text-gray-400">من:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.from || order.form_data?.pickupCountry}</span>
                    </div>
                  )}
                  {order.data?.to && (
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-map-marker-alt text-green-500"></i>
                      <span className="text-gray-600 dark:text-gray-400">إلى:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.data.to || order.form_data?.deliveryCountry}</span>
                    </div>
                  )}
                  {(order.form_data?.files?.length > 0 || order.data?.files?.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 mb-1">المرفقات:</p>
                      <div className="flex flex-wrap gap-2">
                        {(order.form_data?.files || order.data?.files).map((file, idx) => (
                          <div 
                            key={idx} 
                            onClick={(e) => handleFileClick(e, file)}
                            className="bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-2 py-1 text-xs text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <i className="fas fa-paperclip"></i>
                            <span className="truncate max-w-[100px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    عدد العروض: {order.total_offers || 0}
                  </span>
                </div>



                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all text-sm font-semibold"
                  >
                    <i className="fas fa-eye ml-1"></i>
                    التفاصيل
                  </button>
                  {order.has_offered ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                      <span className="font-semibold flex items-center gap-1">
                        <i className="fas fa-check-circle"></i>
                        تم تقديم عرض
                      </span>
                      <a href="/company/offers" className="text-xs underline hover:text-green-600 mt-1">
                        يمكنك تعديله من صفحة عروضي
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => openOfferModal(order)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
                    >
                      <i className="fas fa-plus ml-1"></i>
                      إضافة عرض
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                تفاصيل الطلب #{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="col-span-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-primary">معلومات أساسية</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">نوع الخدمة:</span>
                      <span className="font-medium">{getOrderServiceType(selectedOrder)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">تاريخ الطلب:</span>
                      <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">من:</span>
                      <span className="font-medium">{getOrderLocations(selectedOrder).from}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">إلى:</span>
                      <span className="font-medium">{getOrderLocations(selectedOrder).to}</span>
                    </div>
                  </div>
                </div>

                {/* Cargo Details */}
                <div className="col-span-full">
                  <h3 className="font-semibold mb-3 text-primary border-b pb-2">تفاصيل الشحنة</h3>
                  <div className="space-y-3 text-sm">
                    {selectedOrder.form_data?.goodsDescription && (
                      <div>
                        <span className="text-gray-500 block">وصف البضاعة:</span>
                        <p className="font-medium bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">{selectedOrder.form_data.goodsDescription}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {selectedOrder.form_data?.totalWeight && (
                        <div>
                          <span className="text-gray-500 block">الوزن الكلي:</span>
                          <span className="font-medium">{selectedOrder.form_data.totalWeight} كجم</span>
                        </div>
                      )}
                      {selectedOrder.form_data?.piecesCount && (
                        <div>
                          <span className="text-gray-500 block">عدد القطع:</span>
                          <span className="font-medium">{selectedOrder.form_data.piecesCount}</span>
                        </div>
                      )}
                      {selectedOrder.form_data?.packagingType && (
                        <div>
                          <span className="text-gray-500 block">نوع التغليف:</span>
                          <span className="font-medium">{selectedOrder.form_data.packagingType}</span>
                        </div>
                      )}
                      {selectedOrder.form_data?.cargoType && (
                        <div>
                          <span className="text-gray-500 block">نوع البضاعة:</span>
                          <span className="font-medium">{selectedOrder.form_data.cargoType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Details - Dynamic Rendering of other useful fields */}
                <div className="col-span-full">
                  <h3 className="font-semibold mb-3 text-primary border-b pb-2">تفاصيل إضافية</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(selectedOrder.form_data || {}).map(([key, value]) => {
                      // Skip already shown, technical, or SENSITIVE fields
                      const sensitiveFields = ['phoneNumber', 'phoneCountry', 'waNumber', 'waCountry', 'clientPhone', 'clientWhatsapp', 'referralPhone', 'email', 'referralName'];
                      const skipFields = ['files', 'products', 'clientName', 'pickupCountry', 'deliveryCountry', 'serviceType', 'goodsDescription', 'totalWeight', 'piecesCount', 'packagingType', 'cargoType', 'type', 'saveClientData', 'saveClient', 'pickupGovernorate', 'deliveryGovernorate', 'recvCountry', 'marketplace'];
                      
                      if (sensitiveFields.includes(key) || skipFields.includes(key)) return null;
                      if (!value || value === 'no' || value === 'false' || value === 'لا') return null;
                      
                      const { label, value: displayValue } = formatOrderField(key, value);
                      
                      return (
                        <div key={key} className="break-words">
                          <span className="text-gray-500 block text-xs">{label}:</span>
                          <span className="font-medium">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attachments with Preview */}
                {(selectedOrder.form_data?.files?.length > 0 || selectedOrder.data?.files?.length > 0) && (
                  <div className="col-span-full">
                    <h3 className="font-semibold mb-3 text-primary border-b pb-2">
                      <i className="fas fa-paperclip ml-2"></i>
                      المرفقات ({(selectedOrder.form_data?.files || selectedOrder.data?.files)?.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedOrder.form_data?.files || selectedOrder.data?.files).map((file, idx) => {
                        const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
                        
                        return (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                            {isImage && (
                              <div onClick={(e) => handleFileClick(e, file)} className="block mb-2 cursor-pointer">
                                <img 
                                  src={file.url} 
                                  alt={file.name} 
                                  className="w-full h-24 object-cover rounded border"
                                />
                              </div>
                            )}
                            <div 
                              onClick={(e) => handleFileClick(e, file)}
                              className="flex items-center gap-2 text-blue-600 dark:text-blue-300 hover:underline text-sm cursor-pointer"
                            >
                              <i className={`fas ${isPdf ? 'fa-file-pdf text-red-500' : isImage ? 'fa-file-image text-green-500' : 'fa-file text-gray-500'}`}></i>
                              <span className="truncate">{file.name}</span>
                              <i className="fas fa-external-link-alt text-xs opacity-50"></i>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  openOfferModal(selectedOrder);
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
              >
                إضافة عرض لهذا الطلب
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={offerData.price}
                    onChange={(e) => setOfferData({...offerData, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العملة *
                  </label>
                  <select
                    value={offerData.currency}
                    onChange={(e) => setOfferData({...offerData, currency: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="EGP">جنية مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>
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
    </div>
  );
};

export default AllOrders;
