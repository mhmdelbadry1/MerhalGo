import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCompanies(companies);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = companies.filter(company => {
      // company is the company_profile row
      const name = company.company_name?.toLowerCase() || '';
      const nameEn = company.company_name_en?.toLowerCase() || '';
      // User data is in 'user' relation
      const email = company.user?.email?.toLowerCase() || '';
      const phone = company.phone_number || '';
      
      return name.includes(query) || nameEn.includes(query) || email.includes(query) || phone.includes(query);
    });
    
    setFilteredCompanies(filtered);
  }, [searchQuery, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCompanies();
      
      let loadedCompanies = [];
      
      // Handle various response structures defensively
      if (response?.data?.data && Array.isArray(response.data.data)) {
        // Expected: { ... data: { data: [...] } }
        loadedCompanies = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        // Direct array: { ... data: [...] }
        loadedCompanies = response.data;
      } else if (Array.isArray(response)) {
        // Raw array
        loadedCompanies = response;
      }
      
      setCompanies(loadedCompanies);
      setFilteredCompanies(loadedCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
      showError('فشل تحميل الشركات');
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (company) => {
    // Controller expects user_id as the parameter 'id'
    // .eq('user_id', id)
    
    const newStatus = !company.is_approved;
    const actionText = newStatus ? 'تنشيط' : 'إيقاف';

    if (!window.confirm(`هل أنت متأكد من ${actionText} حساب الشركة: ${company.company_name}؟`)) return;

    try {
      // Pass user_id, not profile id, because controller filters by user_id
      await adminService.updateCompany(company.user_id, { isApproved: newStatus });
      
      // Update local state
      const updatedCompanies = companies.map(c => {
        if (c.id === company.id) {
          return { ...c, is_approved: newStatus };
        }
        return c;
      });

      setCompanies(updatedCompanies);
      setFilteredCompanies(updatedCompanies);
      showSuccess(`تم ${actionText} الحساب بنجاح`);
    } catch (error) {
      console.error('Error updating company status:', error);
      showError('فشل تحديث حالة الشركة');
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleViewFile = (fileUrl, fileName) => {
    if (!fileUrl) return;
    // Open file in new tab
    window.open(fileUrl, '_blank');
  };

  const handleDeleteCompany = async (company) => {
    if (company.is_approved) {
      showError('لا يمكن حذف شركة نشطة. يجب إيقافها أولاً.');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من حذف شركة "${company.company_name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      await adminService.deleteCompany(company.user_id);
      showSuccess('تم حذف الشركة بنجاح');
      loadCompanies(); // Refresh list
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error.response?.data?.message || 'فشل حذف الشركة';
      showError(errorMessage);
    }
  };

  const CompanyDetailsModal = ({ company, onClose }) => {
    if (!company) return null;
    // company IS the profile
    const user = company.user || {};

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl">
                <i className="fas fa-building"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {company.company_name}
                </h2>
                <p className="text-sm text-gray-500">{company.company_name_en}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Account Status */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
              <span className="text-gray-600 dark:text-gray-300 font-medium">حالة الحساب</span>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${company.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {company.is_approved ? 'نشط' : 'وقف مؤقت'}
                </span>
                <button
                  onClick={() => {
                    onClose();
                    toggleStatus(company);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  تغيير الحالة
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-info-circle text-primary"></i>
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-800 dark:text-white" dir="ltr">{user.email || 'غير متوفر'}</p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">تاريخ الانضمام</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {new Date(company.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-briefcase text-primary"></i>
                تفاصيل الشركة
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {company.representative_name && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ممثل الشركة</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{company.representative_name}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">نوع الشركة</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {company.company_type === 'local' && 'شحن محلي'}
                    {company.company_type === 'international' && 'شحن دولي'}
                    {company.company_type === 'customs' && 'تخليص جمركي'}
                    {company.company_type === 'chinese' && 'شحن من مواقع صينية'}
                    {company.company_type === 'shein' && 'شحن من شي إن'}
                    {!['local', 'international', 'customs', 'chinese', 'shein'].includes(company.company_type) && (company.company_type || '-')}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">السجل التجاري</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{company.commercial_register || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">الرقم الضريبي</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{company.tax_number || '-'}</p>
                </div>
              </div>
              
              {company.main_office_address && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg mt-3">
                  <p className="text-xs text-gray-500 mb-1">العنوان الرئيسي</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{company.main_office_address}</p>
                </div>
              )}
              
              {/* Services */}
              {company.company_type === 'local' && company.service_countries?.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mt-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
                    <i className="fas fa-map-marked-alt"></i>
                    المحافظات المخدومة
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-white">{company.service_countries.join(', ')}</p>
                </div>
              )}
              
              {company.company_type === 'international' && company.services?.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                    <i className="fas fa-shipping-fast"></i>
                    طرق الشحن المتوفرة
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((method, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {method === 'land' && '🚛 شحن بري'}
                        {method === 'air' && '✈️ شحن جوي'}
                        {method === 'sea' && '🚢 شحن بحري'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {company.notes && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-3">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1">
                    <i className="fas fa-sticky-note"></i>
                    ملاحظات
                  </p>
                  <p className="text-sm text-gray-800 dark:text-white">{company.notes}</p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                 <p className="text-xs text-green-600 mb-1 font-bold">رقم الهاتف</p>
                 <p className="text-green-800 dark:text-green-300 font-mono dir-ltr text-left">
                   {user.phone || company.phone_number || '-'}
                 </p>
              </div>
              {company.whatsapp_number && (
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                   <p className="text-xs text-green-600 mb-1 font-bold">رقم الواتساب</p>
                   <p className="text-green-800 dark:text-green-300 font-mono dir-ltr text-left">
                     {company.whatsapp_number}
                   </p>
                </div>
              )}
              {company.website && (
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                   <p className="text-xs text-blue-600 mb-1 font-bold">الموقع الإلكتروني</p>
                   <a 
                     href={company.website} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-800 dark:text-blue-300 hover:underline truncate block"
                   >
                     {company.website}
                   </a>
                </div>
              )}
            </div>
            
            {/* Documents */}
            {(company.commercial_register_file || company.tax_card_file || company.business_license_file || company.additional_docs?.length > 0) && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <i className="fas fa-paperclip text-primary"></i>
                  المرفقات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.commercial_register_file && (
                    <button 
                      onClick={() => handleViewFile(company.commercial_register_file, 'السجل التجاري')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-file-alt"></i>
                      السجل التجاري
                    </button>
                  )}
                  {company.tax_card_file && (
                    <button 
                      onClick={() => handleViewFile(company.tax_card_file, 'البطاقة الضريبية')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-file-invoice"></i>
                      البطاقة الضريبية
                    </button>
                  )}
                  {company.business_license_file && (
                    <button 
                      onClick={() => handleViewFile(company.business_license_file, 'رخصة النشاط')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <i className="fas fa-id-card"></i>
                      رخصة النشاط
                    </button>
                  )}
                  {company.additional_docs && company.additional_docs.length > 0 && (
                    company.additional_docs.map((file, index) => (
                      <button 
                        key={index}
                        onClick={() => handleViewFile(file, `مستند إضافي ${index + 1}`)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                      >
                        <i className="fas fa-file"></i>
                        مستند إضافي {index + 1}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isModalOpen && <CompanyDetailsModal company={selectedCompany} onClose={() => setIsModalOpen(false)} />}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            الشركات المعتمدة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة حسابات الشركات المسجلة في المنصة
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="بحث باسم الشركة أو البريد..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <button 
            onClick={loadCompanies}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="تحديث البيانات"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
            <i className="fas fa-building"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد شركات'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'حاول استخدام كلمات مفتاحية مختلفة' : 'لم يتم تسجيل أي شركات حتى الآن'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const user = company.profile || {};
            return (
              <div key={company.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border ${company.is_approved ? 'border-gray-100 dark:border-gray-700' : 'border-red-200 dark:border-red-900/50 ring-1 ring-red-100'}`}>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 relative">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl">
                    <i className="fas fa-building"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg line-clamp-1" title={company.company_name}>
                      {company.company_name || user.full_name || 'شركه'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  {!company.is_approved && (
                    <span className="absolute top-0 left-0 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                      موقوف
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-envelope text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate" title={user.email}>{user.email || 'غير متوفر'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {company.phone_number || '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-map-marker-alt text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate" title={company.headquarters_address}>
                      {company.main_office_address || company.headquarters_address || '-'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(company)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                  >
                    التفاصيل
                  </button>
                  <button 
                    onClick={() => toggleStatus(company)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${company.is_approved ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'}`}
                    title={company.is_approved ? "إيقاف الحساب" : "تنشيط الحساب"}
                  >
                    <i className={`fas ${company.is_approved ? 'fa-ban' : 'fa-check'}`}></i>
                  </button>
                  {!company.is_approved && (
                    <button 
                      onClick={() => handleDeleteCompany(company)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="حذف الشركة"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
