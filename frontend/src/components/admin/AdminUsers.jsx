import React, { useState, useEffect } from 'react';
import adminService from '../../services/admin.service';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => {
      const name = user.full_name?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const phone = user.phone || user.contact_from_order?.phone || '';
      
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const response = await adminService.getAllUsers(params);
      
      let loadedUsers = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        loadedUsers = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        loadedUsers = response.data;
      } else if (Array.isArray(response)) {
        loadedUsers = response;
      }
      
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showError('فشل تحميل المستخدمين');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      customer: { label: 'عميل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      company: { label: 'شركة', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      admin: { label: 'مدير', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    return badges[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
  };

  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    const phone = user.contact_from_order?.phone || user.phone || 'لم يتم التوفير';
    const whatsapp = user.contact_from_order?.whatsapp || user.whatsapp || 'لم يتم التوفير';
    const roleBadge = getRoleBadge(user.role);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {user.full_name || 'مستخدم'}
                </h2>
                <span className={`text-xs px-2 py-1 rounded-full ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
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
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-info-circle text-primary"></i>
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-800 dark:text-white break-all" dir="ltr">{user.email || 'غير متوفر'}</p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">معرف المستخدم</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{user.id}</p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">تاريخ التسجيل</p>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">عدد الطلبات</p>
                  <p className="font-medium text-gray-800 dark:text-white">{user.order_count || 0} طلب</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <i className="fas fa-phone text-primary"></i>
                معلومات الاتصال
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                  <span className="text-sm text-gray-500">رقم الهاتف</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white" dir="ltr">{phone}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-sm text-gray-500">رقم الواتساب</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white" dir="ltr">{whatsapp}</span>
                </div>
              </div>
              {user.contact_from_order && (
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  معلومات الاتصال من آخر طلب
                </p>
              )}
            </div>

            {/* Activity */}
            {user.last_order_date && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <i className="fas fa-chart-line text-primary"></i>
                  النشاط
                </h3>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-bold">آخر طلب</p>
                  <p className="text-green-800 dark:text-green-300">
                    {new Date(user.last_order_date).toLocaleDateString('ar-EG')}
                  </p>
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
      {isModalOpen && <UserDetailsModal user={selectedUser} onClose={() => setIsModalOpen(false)} />}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            المستخدمين
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة جميع المستخدمين المسجلين في المنصة
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="بحث بالاسم أو البريد أو الهاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">كل المستخدمين</option>
            <option value="customer">العملاء</option>
            <option value="company">الشركات</option>
            <option value="admin">المديرين</option>
          </select>
          
          <button 
            onClick={loadUsers}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="تحديث البيانات"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-md">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-4xl mx-auto mb-4">
            <i className="fas fa-users"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'حاول استخدام كلمات مفتاحية مختلفة' : 'لم يتم تسجيل أي مستخدمين حتى الآن'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            const phone = user.contact_from_order?.phone || user.phone || '-';
            
            return (
              <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg line-clamp-1" title={user.full_name}>
                      {user.full_name || 'مستخدم'}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${roleBadge.color} inline-block mt-1`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-envelope text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate" title={user.email}>{user.email || 'غير متوفر'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300" dir="ltr">{phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-calendar text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-box text-gray-400 w-5"></i>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {user.order_count || 0} طلب
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleViewDetails(user)}
                  className="w-full py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
                >
                  عرض التفاصيل
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
