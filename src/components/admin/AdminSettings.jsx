import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../Shared/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const AdminSettings = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || 'المدير',
    email: 'admin@mirhalgo.com'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = () => {
    updateUser(profileData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const changePassword = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }
    if (securityData.newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    updateUser({ password: securityData.newPassword });
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
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
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
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
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={saveProfile}
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
                  >
                    <i className="fas fa-save ml-2"></i>
                    حفظ التغييرات
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
                    className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold"
                  >
                    <i className="fas fa-key ml-2"></i>
                    تغيير كلمة المرور
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 fade-in z-50">
          <i className="fas fa-check-circle text-2xl"></i>
          <div>
            <p className="font-semibold">تم الحفظ بنجاح</p>
            <p className="text-sm">تم تحديث معلوماتك</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
