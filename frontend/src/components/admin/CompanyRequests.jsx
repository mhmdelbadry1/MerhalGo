import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import storageService from '../../services/storage.service'; // Import storage service
import { useToast } from '../../contexts/ToastContext';

const CompanyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Modals state
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  
  // Actions state
  const [password, setPassword] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // File viewing
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRegistrationRequests();
      setRequests(response.data?.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showError('فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = async (fileObj, title) => {
    if (!fileObj || !fileObj.path) return;
    try {
      // Company docs are in 'company-documents' bucket
      const url = await storageService.getFileUrl('company-documents', fileObj.path);
      setSelectedFileUrl(url);
      setSelectedFileName(title || 'مستند');
      setShowFileModal(true);
    } catch (error) {
      console.error('Error fetching file URL:', error);
      showError('فشل فتح الملف');
    }
  };

  const openAcceptModal = (request) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const acceptCompany = async () => {
    if (!password) {
      showError('يرجى إدخال كلمة المرور');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.approveCompany(selectedRequest.id, password);
      
      showSuccess('تم قبول الشركة وإنشاء الحساب بنجاح');
      setShowAcceptModal(false);
      setPassword('');
      loadRequests();
    } catch (error) {
      console.error('Error approving company:', error);
      showError(error.response?.data?.message || 'فشل قبول الشركة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectCompany = async () => {
    if (!rejectionReason) {
      showError('يرجى كتابة سبب الرفض');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.rejectCompany(selectedRequest.id, rejectionReason);
      showSuccess('تم رفض الطلب');
      setShowRejectModal(false);
      setRejectionReason('');
      loadRequests();
    } catch (error) {
      console.error('Error rejecting company:', error);
      showError('فشل رفض الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'معلق',
      accepted: 'مقبول',
      approved: 'مقبول',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">طلبات الشركات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة طلبات الانضمام الجديدة</p>
        </div>
        <button onClick={loadRequests} className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md transition-all">
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center text-gray-400 text-3xl mx-auto mb-4">
            <i className="fas fa-inbox"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            لا توجد طلبات جديدة
          </h3>
          <p className="text-gray-500">جميع الطلبات تم مراجعتها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                    <i className="fas fa-building"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {request.form_data?.companyName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.email}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ممثل الشركة</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{request.form_data?.representativeName}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                  <p className="font-semibold text-gray-800 dark:text-white" dir="ltr">{request.form_data?.phoneCode} {request.form_data?.phoneNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">السجل التجاري</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{request.form_data?.commercialRegisterNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">البطاقة الضريبية</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{request.form_data?.taxCardNumber}</p>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <i className="fas fa-paperclip text-gray-400"></i>
                  المرفقات
                </h4>
                <div className="flex flex-wrap gap-2">
                  {request.form_data?.commercialRegisterFile && (
                    <button 
                      onClick={() => handleViewFile(request.form_data.commercialRegisterFile, 'السجل التجاري')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-file-alt"></i>
                      السجل التجاري
                    </button>
                  )}
                  {request.form_data?.taxCardFile && (
                    <button 
                      onClick={() => handleViewFile(request.form_data.taxCardFile, 'البطاقة الضريبية')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-file-invoice"></i>
                      البطاقة الضريبية
                    </button>
                  )}
                  {request.form_data?.businessLicenseFile && (
                    <button 
                      onClick={() => handleViewFile(request.form_data.businessLicenseFile, 'رخصة النشاط')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-id-card"></i>
                      رخصة النشاط
                    </button>
                  )}
                </div>
              </div>

              {(!request.status || request.status === 'pending') && (
                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => openAcceptModal(request)}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-600/20"
                  >
                    <i className="fas fa-check ml-2"></i>
                    قبول
                  </button>
                  <button
                    onClick={() => openRejectModal(request)}
                    className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-semibold"
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

      {/* Accept Modal */}
      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animation-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden scale-in">
            <div className="bg-green-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fas fa-check"></i>
              </div>
              <h2 className="text-2xl font-bold">قبول الشركة</h2>
              <p className="opacity-90 mt-1">{selectedRequest.form_data?.companyName}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تعيين كلمة مرور لحساب الشركة *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Auto-generated if empty"
                  />
                  <i className="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  سيتم إرسال بيانات الدخول إلى: <strong>{selectedRequest.email}</strong>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={acceptCompany}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-600/30 disabled:opacity-70"
                >
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : 'تأكيد القبول'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animation-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden scale-in">
            <div className="bg-red-600 p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fas fa-times"></i>
              </div>
              <h2 className="text-2xl font-bold">رفض الطلب</h2>
              <p className="opacity-90 mt-1">{selectedRequest.form_data?.companyName}</p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  سبب الرفض *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                  placeholder="يرجى كتابة سبب واضح للرفض ليتم إرساله للشركة..."
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={rejectCompany}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-600/30 disabled:opacity-70"
                >
                  {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : 'تأكيد الرفض'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animation-fade-in">
          <div className="flex items-center justify-between p-4 px-6 text-white bg-black/50 backdrop-blur-sm">
            <h3 className="font-bold text-lg">{selectedFileName}</h3>
            <div className="flex gap-4">
              <a 
                href={selectedFileUrl} 
                download 
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                <i className="fas fa-download mr-2"></i>
                تحميل
              </a>
              <button 
                onClick={() => setShowFileModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
            {selectedFileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
              <img src={selectedFileUrl} alt="Document" className="max-w-full max-h-full rounded-lg shadow-2xl" />
            ) : (
              <iframe 
                src={selectedFileUrl} 
                title="Document Viewer" 
                className="w-full h-full max-w-5xl bg-white rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRequests;

