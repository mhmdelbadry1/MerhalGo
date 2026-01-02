import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/auth.service';
import { useToast } from '../../contexts/ToastContext';

const AdminSettings = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    phone_country_code: '+20'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      if (response.data) {
        setProfileData({
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          phone_country_code: response.data.phone_country_code || '+20'
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('فشل في تحميل الملف الشخصي', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      await authService.updateProfile({
        full_name: profileData.full_name,
        phone: profileData.phone,
        phone_country_code: profileData.phone_country_code
      });
      showToast('تم حفظ التغييرات بنجاح', 'success');
      if (refreshUser) refreshUser();
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast(error.response?.data?.message || 'فشل في حفظ التغييرات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين', 'error');
      return;
    }
    if (securityData.newPassword.length < 6) {
      showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
      return;
    }
    if (!securityData.currentPassword) {
      showToast('يرجى إدخال كلمة المرور الحالية', 'error');
      return;
    }

    try {
      setSaving(true);
      await authService.updatePassword(securityData.currentPassword, securityData.newPassword);
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
    } catch (error) {
      console.error('Failed to change password:', error);
      showToast(error.response?.data?.message || 'فشل في تغيير كلمة المرور', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            إعدادات الأدمن
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة إعدادات حسابك
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
                  <i className="fas fa-user"></i>
                  <span>الملف الشخصي</span>
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
                  معلومات الملف الشخصي
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      placeholder="أدخل اسمك"
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="phone_country_code"
                        value={profileData.phone_country_code}
                        onChange={handleProfileChange}
                        className="w-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      >
                        <option value="+20">+20</option>
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="رقم الهاتف"
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50"
                  >
                    {saving ? (
                      <><i className="fas fa-spinner fa-spin ml-2"></i>جاري الحفظ...</>
                    ) : (
                      <><i className="fas fa-save ml-2"></i>حفظ التغييرات</>
                    )}
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

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">تحذير</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          تغيير كلمة مرور الأدمن يؤثر على أمان النظام بالكامل. تأكد من اختيار كلمة مرور قوية.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50"
                  >
                    {saving ? (
                      <><i className="fas fa-spinner fa-spin ml-2"></i>جاري التغيير...</>
                    ) : (
                      <><i className="fas fa-key ml-2"></i>تغيير كلمة المرور</>
                    )}
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

export default AdminSettings;
