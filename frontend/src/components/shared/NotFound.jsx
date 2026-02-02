import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (!user) {
      navigate('/');
      return;
    }

    switch (user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'company':
        navigate('/company');
        break;
      case 'business': // In case 'business' is used interchangeably with 'company' or intended for future
      case 'user':
      default:
        navigate('/customer');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md w-full">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">404</h1>
        
        <div className="relative -mt-16 mb-8">
           <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">الصفحة غير موجودة</h2>
           <p className="text-gray-600 dark:text-gray-400">
             عذراً، الصفحة التي تحاول الوصول إليها قد تكون حذفت أو تم تغيير رابطها.
           </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-home"></i>
            {user ? 'العودة للوحة التحكم' : 'العودة للرئيسية'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
