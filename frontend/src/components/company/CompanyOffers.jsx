import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import companyService from '../../services/company.service';
import { useToast } from '../../contexts/ToastContext';

const CompanyOffers = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [editData, setEditData] = useState({
    price: '',
    currency: 'EGP',
    startDate: '',
    endDate: '',
    notes: ''
  });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  
  // Action loading states for UX
  const [updatingOffer, setUpdatingOffer] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await companyService.getOffers();
      // Handle paginated response - extract data array
      const offersData = response?.data?.data || response?.data || [];
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error('Error loading offers:', error);
      showError('فشل تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'معلق',
      accepted: 'مقبول',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  const openEditModal = (offer) => {
    setSelectedOffer(offer);
    setEditData({
      price: offer.price || '',
      currency: offer.currency || 'EGP',
      startDate: offer.start_date || '',
      endDate: offer.end_date || '',
      notes: offer.notes || ''
    });
    setShowEditModal(true);
  };

  const updateOffer = async () => {
    if (!editData.price || parseFloat(editData.price) <= 0) {
      showError('يرجى إدخال سعر صالح');
      return;
    }
    if (!editData.startDate) {
      showError('يرجى تحديد تاريخ البداية');
      return;
    }
    if (!editData.endDate) {
      showError('يرجى تحديد تاريخ الوصول');
      return;
    }
    if (new Date(editData.endDate) < new Date(editData.startDate)) {
      showError('تاريخ الوصول يجب أن يكون بعد تاريخ البداية');
      return;
    }

    setUpdatingOffer(true);
    try {
      await companyService.updateOffer(selectedOffer.id, {
        price: parseFloat(editData.price),
        currency: editData.currency,
        startDate: editData.startDate,
        endDate: editData.endDate,
        notes: editData.notes
      });
      showSuccess('تم تحديث العرض بنجاح! ✓');
      setShowEditModal(false);
      await loadOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      const errorMsg = error.response?.data?.message || 'فشل تحديث العرض';
      showError(errorMsg);
    } finally {
      setUpdatingOffer(false);
    }
  };

  const openDeleteModal = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete || deletingOffer) return;
    
    setDeletingOffer(true);
    try {
      await companyService.deleteOffer(offerToDelete.id);
      showSuccess('تم حذف العرض بنجاح');
      setShowDeleteModal(false);
      setOfferToDelete(null);
      await loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      const errorMsg = error.response?.data?.message || 'فشل حذف العرض';
      showError(errorMsg);
    } finally {
      setDeletingOffer(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
			{t('myOffers')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            جميع العروض التي قدمتها
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>

        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل', count: offers.length },
            { key: 'pending', label: 'معلق', count: offers.filter(o => o.status === 'pending').length },
            { key: 'accepted', label: 'مقبول', count: offers.filter(o => o.status === 'accepted').length },
            { key: 'rejected', label: 'مرفوض', count: offers.filter(o => o.status === 'rejected').length }
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

        {filteredOffers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              لا توجد عروض
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لم تقدم أي عروض بعد
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                    {getStatusLabel(offer.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {offer.created_at ? new Date(offer.created_at).toLocaleDateString('ar-EG') : '-'}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    طلب #{offer.order?.order_number || offer.order_id?.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    عرض #{offer.id?.slice(0, 8)}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                    <span className="text-gray-800 dark:text-white font-bold text-lg">{offer.price} {offer.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تاريخ البدء:</span>
                    <span className="text-gray-800 dark:text-white font-semibold">{offer.start_date || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تاريخ الوصول:</span>
                    <span className="text-gray-800 dark:text-white font-semibold">{offer.end_date || '-'}</span>
                  </div>
                </div>

                {offer.notes && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold mb-1">الملاحظات:</p>
                    <p>{offer.notes}</p>
                  </div>
                )}

                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(offer)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                    >
                      <i className="fas fa-edit ml-1"></i>
                      تعديل
                    </button>
                    <button 
                      onClick={() => openDeleteModal(offer)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}

                {offer.status === 'rejected' && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-times-circle text-red-500"></i>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">تم رفض هذا العرض</span>
                    </div>
                    {offer.rejection_reason && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <span className="font-medium">سبب الرفض:</span> {offer.rejection_reason}
                      </p>
                    )}
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-green-500"></i>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">تم قبول هذا العرض</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Edit Offer Modal */}
      {showEditModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                <i className="fas fa-edit ml-2 text-blue-500"></i>
                تعديل العرض
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
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
                    min="1"
                    placeholder="0.00"
                    value={editData.price}
                    onChange={(e) => setEditData({...editData, price: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    العملة *
                  </label>
                  <select
                    value={editData.currency}
                    onChange={(e) => setEditData({...editData, currency: e.target.value})}
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
                  value={editData.startDate}
                  onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ وصول الشحنة *
                </label>
                <input
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات إضافية (اختياري)
                </label>
                <textarea
                  rows="3"
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="أي ملاحظات..."
                ></textarea>
              </div>

              <button
                onClick={updateOffer}
                disabled={updatingOffer}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updatingOffer ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save ml-2"></i>
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && offerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-fadeIn">
            <div className="p-6 text-center">
              {/* Warning Icon */}
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                تأكيد حذف العرض
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                هل أنت متأكد من حذف هذا العرض؟
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm">
                <p className="text-gray-800 dark:text-white">
                  <span className="text-gray-500">السعر:</span> {offerToDelete.price} {offerToDelete.currency}
                </p>
                <p className="text-gray-800 dark:text-white">
                  <span className="text-gray-500">الطلب:</span> #{offerToDelete.order?.order_number || offerToDelete.order_id?.slice(0, 8)}
                </p>
              </div>
              
              <p className="text-red-500 text-sm mb-6">
                <i className="fas fa-info-circle ml-1"></i>
                هذا الإجراء لا يمكن التراجع عنه
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOfferToDelete(null);
                  }}
                  disabled={deletingOffer}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingOffer}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deletingOffer ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash ml-2"></i>
                      نعم، احذف
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyOffers;
