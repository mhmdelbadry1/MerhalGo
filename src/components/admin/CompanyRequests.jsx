import React, { useState, useEffect } from 'react';
import Navbar from '../Shared/Navbar';

const CompanyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('mirhal_company_requests') || '[]');
    setRequests(allRequests);
  };

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const acceptCompany = () => {
    if (!credentials.username || !credentials.password) {
      alert('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    const companies = JSON.parse(localStorage.getItem('mirhal_companies') || '[]');
    companies.push({
      id: Date.now(),
      username: credentials.username,
      password: credentials.password,
      requestId: selectedRequest.id,
      ...selectedRequest,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('mirhal_companies', JSON.stringify(companies));

    const allRequests = JSON.parse(localStorage.getItem('mirhal_company_requests') || '[]');
    const updated = allRequests.map(r => 
      r.id === selectedRequest.id ? { ...r, status: 'accepted' } : r
    );
    localStorage.setItem('mirhal_company_requests', JSON.stringify(updated));

    setShowAcceptModal(false);
    setCredentials({ username: '', password: '' });
    loadRequests();
    alert('تم قبول الشركة وإنشاء الحساب بنجاح!');
  };

  const rejectCompany = (requestId) => {
    if (window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
      const allRequests = JSON.parse(localStorage.getItem('mirhal_company_requests') || '[]');
      const updated = allRequests.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' } : r
      );
      localStorage.setItem('mirhal_company_requests', JSON.stringify(updated));
      loadRequests();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            طلبات الشركات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة طلبات تسجيل الشركات
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              لا توجد طلبات
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status || 'pending')}`}>
                    {getStatusLabel(request.status || 'pending')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(request.submittedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {request.companyName}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-user text-primary"></i>
                    <div>
                      <p className="text-xs text-gray-500">ممثل الشركة</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{request.representativeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-primary"></i>
                    <div>
                      <p className="text-xs text-gray-500">رقم الهاتف</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{request.phoneCode} {request.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-briefcase text-primary"></i>
                    <div>
                      <p className="text-xs text-gray-500">النشاط الرئيسي</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{request.mainActivity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-alt text-primary"></i>
                    <div>
                      <p className="text-xs text-gray-500">السجل التجاري</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{request.commercialRegisterNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-map-marker-alt text-primary"></i>
                    <div>
                      <p className="text-xs text-gray-500">المقر الرئيسي</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{request.headquarterAddress}</p>
                    </div>
                  </div>
                </div>

                {(!request.status || request.status === 'pending') && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => openAcceptModal(request)}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                    >
                      <i className="fas fa-check ml-2"></i>
                      قبول
                    </button>
                    <button
                      onClick={() => rejectCompany(request.id)}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
                    >
                      <i className="fas fa-times ml-2"></i>
                      رفض
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                إنشاء حساب للشركة
              </h2>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  سيتم إنشاء حساب للشركة: <strong>{selectedRequest.companyName}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    كلمة المرور *
                  </label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="••••••••"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    سيتم إرسال بيانات الدخول للشركة على البريد الإلكتروني (في النسخة الكاملة)
                  </p>
                </div>

                <button
                  onClick={acceptCompany}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                >
                  <i className="fas fa-check ml-2"></i>
                  إنشاء الحساب وقبول الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRequests;
