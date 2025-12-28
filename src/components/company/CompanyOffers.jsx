import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const CompanyOffers = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = () => {
    const allOffers = JSON.parse(localStorage.getItem('mirhal_offers') || '[]');
    const myOffers = allOffers.filter(offer => offer.companyId === user?.id || offer.companyName === user?.name);
    setOffers(myOffers);
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

  const deleteOffer = (offerId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      const allOffers = JSON.parse(localStorage.getItem('mirhal_offers') || '[]');
      const updated = allOffers.filter(o => o.id !== offerId);
      localStorage.setItem('mirhal_offers', JSON.stringify(updated));
      loadOffers();
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
                    {new Date(offer.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    طلب #{offer.orderId}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    عرض #{offer.id}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm space-y-2">
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
                </div>

                {offer.notes && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-semibold mb-1">الملاحظات:</p>
                    <p>{offer.notes}</p>
                  </div>
                )}

                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold">
                      <i className="fas fa-edit ml-1"></i>
                      تعديل
                    </button>
                    <button 
                      onClick={() => deleteOffer(offer.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyOffers;
