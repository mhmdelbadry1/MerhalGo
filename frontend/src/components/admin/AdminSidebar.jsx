import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: 'fa-home', label: 'الرئيسية', end: true },
    { path: '/admin/orders', icon: 'fa-box', label: 'كل الطلبات' },
    { path: '/admin/company-requests', icon: 'fa-building', label: 'طلبات الشركات' },
    { path: '/admin/companies', icon: 'fa-check-circle', label: 'الشركات المعتمدة' },
    { path: '/admin/settings', icon: 'fa-cog', label: 'الإعدادات' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 min-h-screen sticky top-0 h-screen overflow-y-auto transition-all duration-300">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 dark:text-white text-lg">مرحال جو</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">لوحة الإدارة</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 px-4 mt-2">
          القائمة الرئيسية
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-[-4px]' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary'}
            `}
          >
            <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        <div className="my-4 border-t border-gray-100 dark:border-gray-700"></div>

        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 px-4">
          تصفية الطلبات
        </div>

        <NavLink
          to="/admin/orders?type=local"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
          `}
        >
          <i className="fas fa-truck w-6 text-center text-lg text-orange-500"></i>
          <span className="font-medium">شحن محلي</span>
        </NavLink>

        <NavLink
          to="/admin/orders?type=international"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
          `}
        >
          <i className="fas fa-plane w-6 text-center text-lg text-purple-500"></i>
          <span className="font-medium">شحن دولي</span>
        </NavLink>

        <NavLink
          to="/admin/orders?type=shein"
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
          `}
        >
          <i className="fas fa-shopping-bag w-6 text-center text-lg text-pink-500"></i>
          <span className="font-medium">شي ان</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors font-medium"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
