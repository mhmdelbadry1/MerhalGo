import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';

const CompanySettings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { showError, showSuccess: toastSuccess } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    representativeName: '',
    email: ''
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch fresh profile data from API on mount
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getCurrentUser();
        if (response.data) {
          const userData = response.data;
          setProfileData({
            name: userData.companyProfile?.company_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.companyProfile?.main_office_address || '',
            representativeName: userData.full_name || userData.name || ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to context data
        if (user) {
          setProfileData({
            name: user.companyProfile?.company_name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.companyProfile?.main_office_address || '',
            representativeName: user.name || user.full_name || ''
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      updateUser(updatedUser.data);
      toastSuccess('تم تحديث بيانات الشركة بنجاح');
    } catch (error) {
      console.error('Profile update error:', error);
      showError(error.response?.data?.message || 'فشل تحديث بيانات الشركة');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (securityData.newPassword.length < 6) {
      showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (!securityData.currentPassword) {
      showError('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(securityData.currentPassword, securityData.newPassword);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toastSuccess('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      console.error('Password update error:', error);
      showError(error.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {t('accountSettings')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة معلومات شركتك وإعداداتك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === 'profile'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-building"></i>
                  <span>معلومات الشركة</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeTab === 'security'
                      ? 'bg-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-lock"></i>
                  <span>الأمان</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  معلومات الشركة
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="اسم الشركة الرسمي"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      placeholder="company@email.com"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم الممثل
                    </label>
                    <input
                      type="text"
                      name="representativeName"
                      value={profileData.representativeName}
                      onChange={handleProfileChange}
                      placeholder="اسم ممثل الشركة الكامل"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="01xxxxxxxxx"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('address')}
                    </label>
                    <textarea
                      name="address"
                      rows="3"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder="عنوان مقر الشركة بالتفصيل"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    ></textarea>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                     {loading ? <i className="fas fa-spinner fa-spin ml-2"></i> : <i className="fas fa-save ml-2"></i>}
                    {t('save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  الأمان وكلمة المرور
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الحالية
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      placeholder="أدخل كلمة المرور الحالية"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تأكيد كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange}
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">تنبيه</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          تأكد من اختيار كلمة مرور قوية تحتوي على أحرف وأرقام ورموز
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? <i className="fas fa-spinner fa-spin ml-2"></i> : <i className="fas fa-key ml-2"></i>}
                    تغيير كلمة المرور
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
