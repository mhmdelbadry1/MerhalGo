import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getOrdersLink = () => {
    if (userType === 'customer') return '/customer/orders';
    if (userType === 'company') return '/company/offers';
    return '#';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={userType === 'customer' ? '/customer' : userType === 'company' ? '/company' : '/admin'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-route text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">MirhalGO</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  i18n.language === 'ar' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm transition-all ${
                  i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                EN
              </button>
            </div>

            {/* Orders/Offers Button */}
            {(userType === 'customer' || userType === 'company') && (
              <Link
                to={getOrdersLink()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-2"
              >
                <i className={`fas ${userType === 'customer' ? 'fa-box' : 'fa-handshake'}`}></i>
                <span>{userType === 'customer' ? t('myOrders') : t('myOffers')}</span>
              </Link>
            )}

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-user text-gray-600 dark:text-gray-300"></i>
              </button>

              {showSettings && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                  <Link
                    to={`/${userType}/settings`}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    <i className="fas fa-cog ml-2"></i>
                    {t('accountSettings')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt ml-2"></i>
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
          >
            <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-gray-600 dark:text-gray-300`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('ar')}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-all ${
                  i18n.language === 'ar' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                عربي
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`flex-1 px-3 py-2 rounded-md text-sm transition-all ${
                  i18n.language === 'en' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                EN
              </button>
            </div>

            {(userType === 'customer' || userType === 'company') && (
              <Link
                to={getOrdersLink()}
                className="block px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-center"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className={`fas ${userType === 'customer' ? 'fa-box' : 'fa-handshake'} ml-2`}></i>
                {userType === 'customer' ? t('myOrders') : t('myOffers')}
              </Link>
            )}

            <Link
              to={`/${userType}/settings`}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              <i className="fas fa-cog ml-2"></i>
              {t('accountSettings')}
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-right px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className="fas fa-sign-out-alt ml-2"></i>
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
