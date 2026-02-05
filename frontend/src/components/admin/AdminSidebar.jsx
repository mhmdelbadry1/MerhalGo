import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (onClose) onClose();
  };

  const navItems = [
    { path: '/admin', icon: 'fa-home', label: 'الرئيسية', end: true },
    { path: '/admin/orders', icon: 'fa-box', label: 'كل الطلبات' },
    { path: '/admin/users', icon: 'fa-users', label: 'المستخدمين' },
    { path: '/admin/company-requests', icon: 'fa-building', label: 'طلبات الشركات' },
    { path: '/admin/companies', icon: 'fa-check-circle', label: 'الشركات المعتمدة' },
    { path: '/admin/settings', icon: 'fa-cog', label: 'الإعدادات' },
  ];

  return (
    <aside className={`
      fixed lg:static
      inset-y-0 right-0
      w-64
      bg-white dark:bg-gray-800
      border-l border-gray-200 dark:border-gray-700
      transform lg:transform-none
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      z-50 lg:z-auto
      overflow-y-auto
      flex flex-col
      h-screen
      lg:sticky lg:top-0
    `}>
      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h1 className="font-bold text-gray-800 dark:text-white">مرحال جو</h1>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block p-6 border-b border-gray-200 dark:border-gray-700">
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
            onClick={handleLinkClick}
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
          onClick={handleLinkClick}
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
          onClick={handleLinkClick}
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
          onClick={handleLinkClick}
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
