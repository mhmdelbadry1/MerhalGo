// Bilingual error message mapping
export const errorMessages = {
  ar: {
    // Auth errors
    'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Invalid or expired token': 'انتهت صلاحية الجلسة، الرجاء تسجيل الدخول مرة أخرى',
    'User not found': 'المستخدم غير موجود',
    'Email already exists': 'البريد الإلكتروني مسجل مسبقاً',
    'User profile not found': 'الملف الشخصي غير موجود',
    'Your company registration is pending approval': 'طلب تسجيل شركتك قيد المراجعة',
    
    // Validation errors
    'Validation failed': 'فشل التحقق من البيانات',
    'Valid email is required': 'البريد الإلكتروني مطلوب',
    'Password is required': 'كلمة المرور مطلوبة',
    'Full name is required': 'الاسم الكامل مطلوب',
    'Phone number is required': 'رقم الهاتف مطلوب',
    
    // Order errors
    'Order not found': 'الطلب غير موجود',
    'Cannot update order in current status': 'لا يمكن تحديث الطلب في حالته الحالية',
    'An offer has already been accepted for this order': 'تم قبول عرض لهذا الطلب بالفعل',
    
    // Company errors
    'A registration request with this email is already pending': 'يوجد طلب تسجيل معلق بهذا البريد الإلكتروني',
    'You have already submitted an offer for this order': 'لقد قدمت عرضاً لهذا الطلب بالفعل',
    'Cannot update offer in current status': 'لا يمكن تحديث العرض في حالته الحالية',
    'This order is no longer available for offers': 'هذا الطلب لم يعد متاحاً للعروض',
    
    // Network errors
    'Network Error': 'خطأ في الاتصال بالخادم',
    'Request failed': 'فشل الطلب',
    'Connection failed': 'فشل الاتصال',
    
    // Generic errors
    'An error occurred': 'حدث خطأ',
    'Something went wrong': 'حدث خطأ ما',
    'Please try again': 'الرجاء المحاولة مرة أخرى',
    'Failed to fetch data': 'فشل تحميل البيانات',
    'Operation failed': 'فشلت العملية'
  },
  en: {
    // English versions (fallback to original message)
    'Invalid email or password': 'Invalid email or password',
    'Invalid or expired token': 'Session expired, please login again',
    'User not found': 'User not found',
    'Email already exists': 'Email already exists',
    'User profile not found': 'User profile not found',
    'Your company registration is pending approval': 'Your company registration is pending approval',
    'Validation failed': 'Validation failed',
    'Valid email is required': 'Valid email is required',
    'Password is required': 'Password is required',
    'Full name is required': 'Full name is required',
    'Phone number is required': 'Phone number is required',
    'Order not found': 'Order not found',
    'Cannot update order in current status': 'Cannot update order in current status',
    'An offer has already been accepted for this order': 'An offer has already been accepted for this order',
    'A registration request with this email is already pending': 'A registration request with this email is already pending',
    'You have already submitted an offer for this order': 'You have already submitted an offer for this order',
    'Cannot update offer in current status': 'Cannot update offer in current status',
    'This order is no longer available for offers': 'This order is no longer available for offers',
    'Network Error': 'Network Error',
    'Request failed': 'Request failed',
    'Connection failed': 'Connection failed',
    'An error occurred': 'An error occurred',
    'Something went wrong': 'Something went wrong',
    'Please try again': 'Please try again',
    'Failed to fetch data': 'Failed to fetch data',
    'Operation failed': 'Operation failed'
  }
};

export const successMessages = {
  ar: {
    // Auth
    'loginSuccess': 'مرحباً بعودتك 👋',
    'registerSuccess': 'تم إنشاء الحساب بنجاح! مرحباً بك 🎉',
    'logoutSuccess': 'تم تسجيل الخروج بنجاح',
    'passwordUpdated': 'تم تحديث كلمة المرور بنجاح',
    
    // Orders
    'orderCreated': 'تم إنشاء الطلب بنجاح ✅',
    'orderUpdated': 'تم تحديث الطلب بنجاح',
    'orderCancelled': 'تم إلغاء الطلب',
    'offerAccepted': 'تم قبول العرض بنجاح 🎉',
    
    // Company
    'offerSubmitted': 'تم إرسال عرض السعر بنجاح 💰',
    'offerUpdated': 'تم تحديث العرض بنجاح',
    'profileUpdated': 'تم تحديث الملف الشخصي',
    'companyRegistered': 'تم إرسال طلب التسجيل، سنراجعه قريباً',
    
    // Admin
    'companyApproved': 'تمت الموافقة على الشركة بنجاح ✅',
    'companyRejected': 'تم رفض طلب الشركة',
    'operationSuccess': 'تمت العملية بنجاح'
  },
  en: {
    'loginSuccess': 'Welcome back 👋',
    'registerSuccess': 'Account created successfully! Welcome 🎉',
    'logoutSuccess': 'Logged out successfully',
    'passwordUpdated': 'Password updated successfully',
    'orderCreated': 'Order created successfully ✅',
    'orderUpdated': 'Order updated successfully',
    'orderCancelled': 'Order cancelled',
    'offerAccepted': 'Offer accepted successfully 🎉',
    'offerSubmitted': 'Price offer submitted successfully 💰',
    'offerUpdated': 'Offer updated successfully',
    'profileUpdated': 'Profile updated',
    'companyRegistered': 'Registration request submitted, we will review it soon',
    'companyApproved': 'Company approved successfully ✅',
    'companyRejected': 'Company request rejected',
    'operationSuccess': 'Operation completed successfully'
  }
};

/**
 * Get localized error message
 * @param {Error} error - The error object
 * @param {string} language - Current language (ar/en)
 * @returns {string} Localized error message
 */
export const getErrorMessage = (error, language = 'ar') => {
  // Handle network errors
  if (error.message === 'Network Error') {
    return errorMessages[language]['Network Error'];
  }

  // Get error message from response
  let errorMsg = error.response?.data?.message || error.message || 'An error occurred';
  
  // Handle validation errors
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const validationErrors = error.response.data.errors;
    if (validationErrors.length > 0) {
      // Return the first validation error message (or combine them)
      errorMsg = validationErrors.map(e => e.message).join(', ');
    }
  }
  
  // Return localized message or fallback to original
  return errorMessages[language][errorMsg] || errorMsg;
};

/**
 * Get localized success message
 * @param {string} key - Success message key
 * @param {string} language - Current language (ar/en)
 * @returns {string} Localized success message
 */
export const getSuccessMessage = (key, language = 'ar') => {
  return successMessages[language][key] || successMessages['en'][key] || key;
};
