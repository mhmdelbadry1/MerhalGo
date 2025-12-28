import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      // Landing Page
      "welcome": "مرحباً بكم في MirhalGO",
      "companyDescription": "شركة رائدة في خدمات الشحن الدولي والمحلي، نقدم حلول شحن متكاملة لعملائنا",
      "loginAsCustomer": "تسجيل الدخول كعميل",
      "loginAsCompany": "تسجيل الدخول كشركة",
      "createCustomerAccount": "إنشاء حساب كعميل",
      "registerAsCompany": "التسجيل كشركة",
      
      // Common
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "phone": "رقم الهاتف",
      "address": "العنوان",
      "name": "الاسم",
      "submit": "إرسال",
      "cancel": "إلغاء",
      "save": "حفظ",
      "edit": "تعديل",
      "delete": "حذف",
      "confirm": "تأكيد",
      "back": "رجوع",
      "next": "التالي",
      "logout": "تسجيل الخروج",
      
      // Navigation
      "myOrders": "طلباتي",
      "myOffers": "عروضي",
      "settings": "الإعدادات",
      "accountSettings": "إعدادات الحساب",
      "language": "اللغة",
      
      // Shipping Types
      "internationalShipping": "شحن دولي",
      "localShipping": "شحن محلي",
      "chineseStoresShipping": "شحن من متاجر صينية",
      "sheinShipping": "شحن شي ان",
      
      // Forms
      "companyName": "اسم الشركة",
      "representativeName": "اسم ممثل الشركة",
      "required": "مطلوب",
      "optional": "اختياري",
      
      // Admin
      "adminPanel": "لوحة التحكم",
      "allOrders": "كل الطلبات",
      "companyRequests": "طلبات الشركات",
      "acceptedCompanies": "الشركات المقبولة",
      "createAccount": "إنشاء حساب",
      "username": "اسم المستخدم",
    }
  },
  en: {
    translation: {
      // Landing Page
      "welcome": "Welcome to MirhalGO",
      "companyDescription": "A leading company in international and local shipping services, providing integrated shipping solutions for our clients",
      "loginAsCustomer": "Login as Customer",
      "loginAsCompany": "Login as Company",
      "createCustomerAccount": "Create Customer Account",
      "registerAsCompany": "Register as Company",
      
      // Common
      "email": "Email",
      "password": "Password",
      "phone": "Phone Number",
      "address": "Address",
      "name": "Name",
      "submit": "Submit",
      "cancel": "Cancel",
      "save": "Save",
      "edit": "Edit",
      "delete": "Delete",
      "confirm": "Confirm",
      "back": "Back",
      "next": "Next",
      "logout": "Logout",
      
      // Navigation
      "myOrders": "My Orders",
      "myOffers": "My Offers",
      "settings": "Settings",
      "accountSettings": "Account Settings",
      "language": "Language",
      
      // Shipping Types
      "internationalShipping": "International Shipping",
      "localShipping": "Local Shipping",
      "chineseStoresShipping": "Chinese Stores Shipping",
      "sheinShipping": "Shein Shipping",
      
      // Forms
      "companyName": "Company Name",
      "representativeName": "Representative Name",
      "required": "Required",
      "optional": "Optional",
      
      // Admin
      "adminPanel": "Admin Panel",
      "allOrders": "All Orders",
      "companyRequests": "Company Requests",
      "acceptedCompanies": "Accepted Companies",
      "createAccount": "Create Account",
      "username": "Username",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
