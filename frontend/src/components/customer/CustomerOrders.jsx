import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { formatOrderField } from '../../utils/orderFormatters';
import { getOrderLocations, getOrderServiceType } from '../../utils/orderHelpers';

const CustomerOrders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [filter, setFilter] = useState('all'); // all, new, pending, completed
  
  // Offers modal state
  const [orderOffers, setOrderOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null); // Menu state
  
  // Modals state
  const [showDetails, setShowDetails] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  
  // Reject offer modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [offerToReject, setOfferToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Action loading states for UX
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);
  const [rejectingOffer, setRejectingOffer] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Triggered when user confirms in modal
  const confirmCancelOrder = async () => {
    if (!selectedOrder || cancellingOrder) return;
    setCancellingOrder(true);
    try {
      await orderService.cancelOrder(selectedOrder.id);
      showSuccess('تم إلغاء الطلب بنجاح');
      setShowCancel(false);
      setSelectedOrder(null);
      await loadOrders();
    } catch (error) {
      console.error('Cancel order error:', error);
      showError('حدث خطأ أثناء إلغاء الطلب');
    } finally {
      setCancellingOrder(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      // Handle paginated response - extract data array
      const ordersData = response?.data?.data || response?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      showError('حدث خطأ أثناء تحميل الطلبات');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      offered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'معلق',
      reviewing: 'قيد المراجعة',
      offered: 'يوجد عروض',
      accepted: 'تم القبول',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  };

  const viewOrderOffers = async (order) => {
    setSelectedOrder(order);
    setShowOffers(true);
    setOffersLoading(true);
    setOrderOffers([]);
    
    try {
      const response = await orderService.getOrderOffers(order.id);
      const offersData = response?.data?.data || response?.data || [];
      setOrderOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error('Error loading offers:', error);
      showError('حدث خطأ أثناء تحميل العروض');
    } finally {
      setOffersLoading(false);
    }
  };

  const acceptOffer = async (offerId) => {
    if (acceptingOfferId) return; // Prevent double-click
    setAcceptingOfferId(offerId);
    try {
      await orderService.acceptOffer(selectedOrder.id, offerId);
      showSuccess('تم قبول العرض بنجاح! 🎉');
      setShowOffers(false); // Close offers modal
      setSelectedOrder(null); // Clear selected
      
      // Refresh global orders list
      await loadOrders();
    } catch (error) {
      console.error('Error accepting offer:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء قبول العرض');
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const openRejectModal = (offer) => {
    setOfferToReject(offer);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmRejectOffer = async () => {
    if (!offerToReject || !selectedOrder || rejectingOffer) return;
    setRejectingOffer(true);
    
    try {
      await orderService.rejectOffer(selectedOrder.id, offerToReject.id, rejectReason);
      showSuccess('تم رفض العرض وإرسال السبب للشركة');
      setShowRejectModal(false);
      setOfferToReject(null);
      setRejectReason('');
      
      // Refresh global orders to get updated counts/statuses
      const response = await orderService.getOrders();
      const updatedOrders = response?.data?.data || response?.data || [];
      setOrders(Array.isArray(updatedOrders) ? updatedOrders : []);
      
      // Find the currently selected order in the FRESH list
      const freshOrder = updatedOrders.find(o => o.id === selectedOrder.id);
      
      // Update selectedOrder state with fresh data
      if (freshOrder) {
        setSelectedOrder(freshOrder);
        // Refresh offers list using the FRESH order
        await viewOrderOffers(freshOrder);
      } else {
        // Fallback if odd things happen
        await viewOrderOffers(selectedOrder);
      }

    } catch (error) {
      console.error('Error rejecting offer:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء رفض العرض');
    } finally {
      setRejectingOffer(false);
    }
  };

  const handleFileClick = async (e, file) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let path = file.path;
      let bucketName = 'order-documents';

      // Smart Recovery: If path is missing, try to extract from URL
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    // Pending filter includes both 'pending' and 'reviewing' statuses
    if (filter === 'pending') {
      return order.status === 'pending' || order.status === 'reviewing';
    }
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

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
            { key: 'pending', label: 'معلق', count: orders.filter(o => o.status === 'pending' || o.status === 'reviewing').length },
            { key: 'offered', label: 'يوجد عروض', count: orders.filter(o => o.status === 'offered').length },
            { key: 'accepted', label: 'مقبول', count: orders.filter(o => o.status === 'accepted').length },
            { key: 'in_progress', label: 'قيد التنفيذ', count: orders.filter(o => o.status === 'in_progress').length },
            { key: 'completed', label: 'مكتمل', count: orders.filter(o => o.status === 'completed').length },
            { key: 'cancelled', label: 'ملغي', count: orders.filter(o => o.status === 'cancelled').length }
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
                    {new Date(order.created_at || order.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                {/* Order Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {getOrderTypeLabel(order.type || order.order_type)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    رقم الطلب: #{order.order_number || order.id?.substring(0, 8)}
                  </p>
                </div>

                {/* Order Details Preview */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                  {(order.form_data?.clientName || order.data?.clientName) && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.form_data?.clientName || order.data?.clientName}</span>
                    </div>
                  )}
                  {(order.form_data?.recvCountry || order.data?.recvCountry) && (
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">إلى:</span>
                      <span className="text-gray-800 dark:text-white font-semibold">{order.form_data?.recvCountry || order.data?.recvCountry}</span>
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

                {/* Offers Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-handshake text-primary"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {order.total_offers || order.offers?.[0]?.count || order.offers_count || order.offersCount || 0} عرض
                    </span>
                  </div>
                </div>

                {/* Actions */}
                  {/* Actions & Menu */}
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => viewOrderOffers(order)}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-semibold"
                    >
                      <i className="fas fa-eye ml-1"></i>
                      عرض العروض
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === order.id ? null : order.id);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenuId === order.id && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors border-b border-gray-100 dark:border-gray-700"
                        >
                          <i className="fas fa-file-alt text-gray-400"></i>
                          تفاصيل الطلب
                        </button>

                        {(order.status === 'pending' || order.status === 'reviewing' || order.status === 'new') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowCancel(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                          >
                            <i className="fas fa-trash-alt"></i>
                            إلغاء الطلب
                          </button>
                        )}
                        
                        {/* Overlay to close menu when clicking outside */}
                        <div 
                          className="fixed inset-0 z-[-1]" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }}
                        ></div>
                      </div>
                    )}
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
                العروض المقدمة - {selectedOrder.order_number || selectedOrder.id?.substring(0, 8)}
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
              {offersLoading ? (
                <div className="text-center py-12">
                  <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-400">جاري تحميل العروض...</p>
                </div>
              ) : orderOffers.length > 0 ? (
                <div className="space-y-4">
                  {/* Smart header based on offers status */}
                  {orderOffers.some(o => o.status === 'accepted') ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl mt-1"></i>
                        <div>
                          <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                            تم قبول عرض بنجاح! 🎉
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            سيتم التواصل معك من قبل الشركة المختارة قريباً
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-gift text-blue-600 dark:text-blue-400 text-xl mt-1"></i>
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            لديك <span className="font-bold">{orderOffers.filter(o => o.status === 'pending').length}</span> عرض قيد الانتظار! راجع العروض واختر الأنسب لك.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4">
                    {orderOffers.map((offer) => (
                      <div 
                        key={offer.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:border-primary transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Company Info */}
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                              <i className="fas fa-building text-primary text-xl"></i>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 dark:text-white text-lg">
                                {offer.company?.company_profiles?.company_name || offer.company?.email || 'شركة شحن'}
                              </h4>
                              {offer.company?.company_profiles?.license_number && (
                                <p className="text-xs text-gray-500">
                                  ترخيص: {offer.company.company_profiles.license_number}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {offer.created_at ? new Date(offer.created_at).toLocaleDateString('ar-EG') : ''}
                              </p>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-center md:text-right">
                            <p className="text-sm text-gray-500 mb-1">السعر</p>
                            <p className="text-2xl font-bold text-primary">
                              {offer.price} <span className="text-sm">{offer.currency || 'EGP'}</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* Offer Details */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">تاريخ البدء</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{offer.start_date || '-'}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">تاريخ الوصول</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{offer.end_date || '-'}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">المدة المتوقعة</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{offer.estimated_days || '-'} يوم</p>
                          </div>
                          <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                            <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">الحالة</p>
                            <p className={`font-semibold ${
                              offer.status === 'pending' ? 'text-yellow-600' : 
                              offer.status === 'accepted' ? 'text-green-600' : 
                              offer.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {offer.status === 'pending' ? 'معلق' : 
                               offer.status === 'accepted' ? 'مقبول' : 
                               offer.status === 'rejected' ? 'مرفوض' : offer.status}
                            </p>
                          </div>
                        </div>
                        
                        {/* Notes */}
                        {offer.notes && (
                          <div className="mt-4 p-3 bg-white dark:bg-gray-600 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">ملاحظات:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{offer.notes}</p>
                          </div>
                        )}
                        
                        {/* Accept/Reject Buttons */}
                        {offer.status === 'pending' && (
                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              onClick={() => openRejectModal(offer)}
                              disabled={acceptingOfferId === offer.id}
                              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-times ml-2"></i>
                              رفض العرض
                            </button>
                            <button
                              onClick={() => acceptOffer(offer.id)}
                              disabled={acceptingOfferId !== null}
                              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {acceptingOfferId === offer.id ? (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i>
                                  جاري القبول...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-check ml-2"></i>
                                  قبول العرض
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {offer.status === 'accepted' && (
                          <div className="mt-4 flex justify-end">
                            <span className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold">
                              <i className="fas fa-check-circle ml-2"></i>
                              تم قبول هذا العرض
                            </span>
                          </div>
                        )}
                        
                        {offer.status === 'rejected' && (
                          <div className="mt-4">
                            <div className="flex justify-end">
                              <span className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold">
                                <i className="fas fa-times-circle ml-2"></i>
                                تم رفض هذا العرض
                              </span>
                            </div>
                            {offer.rejection_reason && (
                              <p className="text-sm text-gray-500 mt-2 text-left">
                                السبب: {offer.rejection_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                تفاصيل الطلب #{selectedOrder.order_number || selectedOrder.id?.slice(0, 8)}
              </h2>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-right">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <span className="text-gray-500 block mb-1">نوع الخدمة</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{getOrderServiceType(selectedOrder)}</span>
                   </div>
                   <div>
                      <span className="text-gray-500 block mb-1">الحالة</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                   </div>
                   <div>
                      <span className="text-gray-500 block mb-1">من</span>
                      <span className="font-medium">{getOrderLocations(selectedOrder).from}</span>
                   </div>
                   <div>
                      <span className="text-gray-500 block mb-1">إلى</span>
                      <span className="font-medium">{getOrderLocations(selectedOrder).to}</span>
                   </div>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white border-b pb-2">تفاصيل إضافية</h3>
              
              {/* Products List (Shein) */}
              {selectedOrder.form_data?.products && Array.isArray(selectedOrder.form_data.products) && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-sm text-primary">المنتجات</h4>
                  <div className="border border-gray-100 dark:border-gray-700 rounded overflow-hidden">
                    <table className="w-full text-xs text-right bg-white dark:bg-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500">
                        <tr>
                          <th className="p-2">المنتج</th>
                          <th className="p-2">الكمية</th>
                          <th className="p-2">السعر</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.form_data.products.map((p, idx) => (
                          <tr key={idx} className="border-t border-gray-100 dark:border-gray-700">
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">{p.qty}</td>
                            <td className="p-2">{p.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                {selectedOrder.form_data && Object.entries(selectedOrder.form_data).map(([key, value]) => {
                  const skipFields = ['files', 'products', 'pickupGovernorate', 'deliveryGovernorate', 'pickupCountry', 'deliveryCountry', 'recvCountry', 'marketplace', 'serviceType', 'saveClient', 'saveClientData'];
                  if (skipFields.includes(key) || typeof value === 'object') return null;
                  if (!value || value === 'no' || value === 'false') return null;

                  const { label, value: displayValue } = formatOrderField(key, value);

                  return (
                    <div key={key} className="break-all border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                       <span className="text-gray-500 text-xs block mb-1">{label}</span>
                       <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{displayValue}</span>
                    </div>
                  );
                })}
              </div>

              {selectedOrder.form_data?.files?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-3">المرفقات</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedOrder.form_data.files.map((file, idx) => (
                      <div 
                        key={idx} 
                        onClick={(e) => handleFileClick(e, file)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                      >
                        <i className={`fas ${file.type?.includes('image') ? 'fa-image' : 'fa-file-pdf'}`}></i>
                        <span className="text-sm underline">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancel && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 z-[70]">
           <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-center transform transition-all scale-100">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-exclamation-triangle text-3xl text-red-600 dark:text-red-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الإلغاء</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                 هل أنت متأكد من رغبتك في إلغاء الطلب رقم <span className="font-mono font-bold">{selectedOrder.order_number || selectedOrder.id.slice(0,8)}</span>؟
                 <br/>
                 <span className="text-xs text-red-500 mt-2 block">لا يمكن التراجع عن هذا الإجراء.</span>
              </p>
              
              <div className="flex gap-3 justify-center">
                 <button
                    onClick={() => setShowCancel(false)}
                    disabled={cancellingOrder}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 disabled:opacity-50"
                 >
                    تراجع
                 </button>
                 <button
                    onClick={confirmCancelOrder}
                    disabled={cancellingOrder}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    {cancellingOrder ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الإلغاء...
                      </>
                    ) : (
                      'نعم، قم بالإلغاء'
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Reject Offer Modal */}
      {showRejectModal && offerToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 z-[80]">
           <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-center transform transition-all scale-100">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i className="fas fa-times-circle text-3xl text-red-600 dark:text-red-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">رفض العرض</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                 سيتم إرسال سبب الرفض للشركة عبر البريد الإلكتروني
              </p>
              
              <div className="mb-6 text-right">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  سبب الرفض (اختياري)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows="3"
                  placeholder="أدخل سبب رفض العرض..."
                ></textarea>
              </div>
              
              <div className="flex gap-3 justify-center">
                 <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setOfferToReject(null);
                      setRejectReason('');
                    }}
                    disabled={rejectingOffer}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 disabled:opacity-50"
                 >
                    تراجع
                 </button>
                 <button
                    onClick={confirmRejectOffer}
                    disabled={rejectingOffer}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    {rejectingOffer ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الرفض...
                      </>
                    ) : (
                      'تأكيد الرفض'
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default CustomerOrders;
