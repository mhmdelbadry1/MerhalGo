import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import storageService from '../../services/storage.service';
import { PhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import 'react-international-phone/style.css';
import seaportsData from '../../data/seaports.json';

const InternationalShippingFullForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic data
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    clientName: '', phone: '', whatsapp: '',
    clientType: '', clientTypeOther: '', saveClientData: false,
    operationType: '', cargoMode: '', serviceType: '',
    pickupCountry: '', pickupPort: '', pickupCountryOther: '', pickupPortOther: '', routeType: '', pickupFromAddress: '',
    deliveryCountry: '', deliveryPort: '', deliveryCountryOther: '', deliveryPortOther: '', deliveryToAddress: '',
    goodsDescription: '', hasLiquids: '', liquidType: '', hasHazmat: '', hazmatType: '',
    hasBatteries: '', batteryType: '', isFragile: '', fragilePacking: '',
    hasDocuments: '', docType: '', totalWeight: '', piecesCount: '',
    packagingType: '', packagingOther: '', preferredLine: '', preferredLineOther: '',
    clearanceLocation: '', hasImportCard: 'لا', needImportBroker: 'لا',
    shipmentPurpose: '', shipmentPurposeOther: '', invoiceValue: '', invoiceCurrency: 'USD',
    hsCode: '', docInvoice: false, docPacking: false, docCO: false, docHealth: false,
    otherClearanceDocType: '', howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
  });

  // Load countries - specific list in Arabic with flags
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      const specificCountries = [
        { code: 'EG', nameAr: 'مصر', flag: '🇪🇬' },
        { code: 'CN', nameAr: 'الصين', flag: '🇨🇳' },
        { code: 'SA', nameAr: 'السعودية', flag: '🇸🇦' },
        { code: 'AE', nameAr: 'الإمارات', flag: '🇦🇪' },
        { code: 'IN', nameAr: 'الهند', flag: '🇮🇳' },
        { code: 'TR', nameAr: 'تركيا', flag: '🇹🇷' },
        { code: 'IT', nameAr: 'إيطاليا', flag: '🇮🇹' },
        { code: 'ES', nameAr: 'إسبانيا', flag: '🇪🇸' },
        { code: 'GR', nameAr: 'اليونان', flag: '🇬🇷' },
        { code: 'RU', nameAr: 'روسيا', flag: '🇷🇺' },
        { code: 'US', nameAr: 'أمريكا', flag: '🇺🇸' },
        { code: 'DE', nameAr: 'ألمانيا', flag: '🇩🇪' },
        { code: 'NL', nameAr: 'هولندا', flag: '🇳🇱' },
        { code: 'KE', nameAr: 'كينيا', flag: '🇰🇪' },
        { code: 'NG', nameAr: 'نيجيريا', flag: '🇳🇬' },
        { code: 'ZA', nameAr: 'جنوب أفريقيا', flag: '🇿🇦' },
        { code: 'MA', nameAr: 'المغرب', flag: '🇲🇦' },
        { code: 'TN', nameAr: 'تونس', flag: '🇹🇳' },
        { code: 'DZ', nameAr: 'الجزائر', flag: '🇩🇿' },
        { code: 'GH', nameAr: 'غانا', flag: '🇬🇭' },
        { code: 'CI', nameAr: 'ساحل العاج', flag: '🇨🇮' },
        { code: 'TZ', nameAr: 'تنزانيا', flag: '🇹🇿' }
      ];
      setCountries(specificCountries);
      setLoadingCountries(false);
    };

    loadCountries();
  }, []);

  // Helper function to get flag emoji
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '';
    return countryCode
      .toUpperCase()
      .split('')
      .map(char => String.fromCodePoint(127397 + char.charCodeAt()))
      .join('');
  };

  useEffect(() => {
    const draft = localStorage.getItem('mirhal_intl_draft');
    if (draft) {
      try { setFormData(JSON.parse(draft)); } catch (e) { }
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('mirhal_intl_draft', JSON.stringify(formData));
    showSuccess('تم حفظ المسودة بنجاح');
  };

  const clearForm = () => {
    if (!confirm('هل أنت متأكد؟')) return;
    setFormData({
      clientName: '', phone: '', whatsapp: '',
      clientType: '', clientTypeOther: '', saveClientData: false, operationType: '', cargoMode: '',
      serviceType: '', pickupCountry: '', pickupPort: '', pickupCountryOther: '', pickupPortOther: '', routeType: '', pickupFromAddress: '',
      deliveryCountry: '', deliveryPort: '', deliveryCountryOther: '', deliveryPortOther: '', deliveryToAddress: '', goodsDescription: '',
      hasLiquids: '', liquidType: '', hasHazmat: '', hazmatType: '', hasBatteries: '',
      batteryType: '', isFragile: '', fragilePacking: '', hasDocuments: '', docType: '',
      totalWeight: '', piecesCount: '', packagingType: '', packagingOther: '', preferredLine: '',
      preferredLineOther: '', clearanceLocation: '', hasImportCard: 'لا', needImportBroker: 'لا',
      shipmentPurpose: '', shipmentPurposeOther: '', invoiceValue: '', invoiceCurrency: 'USD',
      hsCode: '', docInvoice: false, docPacking: false, docCO: false, docHealth: false,
      otherClearanceDocType: '', howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
    });
    setCurrentStep(1);
    localStorage.removeItem('mirhal_intl_draft');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.clientName || !formData.phone || !formData.whatsapp || !formData.clientType) {
          showError('أدخل جميع البيانات المطلوبة'); return false;
        }
        if (formData.clientType === 'other' && !formData.clientTypeOther) { showError('حدد نوع العميل'); return false; }
        break;
      case 2:
        if (!formData.operationType || !formData.cargoMode || !formData.serviceType) { showError('أكمل تفاصيل العملية'); return false; }
        break;
      case 3:
        if (!formData.pickupCountry || !formData.routeType) { showError('أكمل بيانات التحميل'); return false; }
        if (!formData.pickupPort) { showError('اختر الميناء أو المطار'); return false; }
        if (formData.pickupPort === 'other' && !formData.pickupPortOther) { showError('أدخل اسم الميناء أو المطار'); return false; }
        if ((formData.routeType === 'door-door' || formData.routeType === 'door-port') && !formData.pickupFromAddress) { showError('أدخل عنوان التحميل'); return false; }
        break;
      case 4:
        if (!formData.deliveryCountry) { showError('أكمل بيانات التسليم'); return false; }
        if (!formData.deliveryPort) { showError('اختر الميناء أو المطار'); return false; }
        if (formData.deliveryPort === 'other' && !formData.deliveryPortOther) { showError('أدخل اسم الميناء أو المطار'); return false; }
        if ((formData.routeType === 'door-door' || formData.routeType === 'port-door') && !formData.deliveryToAddress) { showError('أدخل عنوان التسليم'); return false; }
        break;
      case 5:
        if (!formData.goodsDescription || !formData.hasLiquids || !formData.hasHazmat || !formData.hasBatteries || !formData.isFragile || !formData.hasDocuments || !formData.totalWeight || !formData.packagingType) {
          showError('أكمل تفاصيل البضاعة'); return false;
        }
        if (formData.hasLiquids === 'نعم' && !formData.liquidType) { showError('حدد نوع السائل'); return false; }
        if (formData.hasHazmat === 'نعم' && !formData.hazmatType) { showError('حدد المادة الخطرة'); return false; }
        if (formData.hasBatteries === 'نعم' && !formData.batteryType) { showError('حدد نوع البطاريات'); return false; }
        if (formData.isFragile === 'نعم' && !formData.fragilePacking) { showError('حدد طريقة التغليف'); return false; }
        if (formData.hasDocuments === 'نعم' && !formData.docType) { showError('حدد نوع المستند'); return false; }
        if (formData.packagingType === 'أخرى' && !formData.packagingOther) { showError('حدد نوع التغليف'); return false; }
        break;
      case 6:
        if (formData.serviceType.includes('تخليص')) {
          if (!formData.clearanceLocation || !formData.shipmentPurpose) { showError('أكمل بيانات التخليص'); return false; }
          if (formData.shipmentPurpose === 'other' && !formData.shipmentPurposeOther) { showError('حدد الغرض'); return false; }
        }
        break;
      case 7:
        if (!formData.howFound) { showError('أخبرنا كيف علمت بنا'); return false; }
        if (formData.howFound === 'referral' && (!formData.referralName || !formData.referralPhone)) { showError('أدخل بيانات العميل السابق'); return false; }
        break;
    }
    return true;
  };

  // Helper function to determine if we need shipping steps (3,4,5)
  const needsShippingSteps = () => {
    return formData.serviceType === 'شحن فقط' || formData.serviceType === 'شحن+تخليص';
  };

  // Helper function to determine if we need clearance step (6)
  const needsClearanceStep = () => {
    return formData.serviceType === 'تخليص فقط' || formData.serviceType === 'شحن+تخليص';
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      let nextStepNumber = currentStep + 1;

      // If "تخليص فقط" (Clearance Only): Skip steps 3, 4, 5 - go directly to 6
      if (currentStep === 2 && formData.serviceType === 'تخليص فقط') {
        nextStepNumber = 6;
      }
      // If at step 5 and service doesn't include clearance, skip to step 7
      else if (currentStep === 5 && !needsClearanceStep()) {
        nextStepNumber = 7;
      }

      setCurrentStep(nextStepNumber);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      let prevStepNumber = currentStep - 1;

      // If at step 6 and "تخليص فقط" (Clearance Only): Go back to step 2
      if (currentStep === 6 && formData.serviceType === 'تخليص فقط') {
        prevStepNumber = 2;
      }
      // If at step 7 and service doesn't include clearance, go back to step 5
      else if (currentStep === 7 && !needsClearanceStep()) {
        prevStepNumber = 5;
      }

      setCurrentStep(prevStepNumber);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate current step before submitting (either step 6 or step 5)
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);

      let uploadedFileParams = [];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => storageService.uploadOrderDocument(file));
        const results = await Promise.all(uploadPromises);
        uploadedFileParams = results.map((res, index) => ({
          name: selectedFiles[index].name,
          path: res.path,
          url: res.url,
          type: selectedFiles[index].type
        }));
      }

      const orderData = {
        ...formData,
        files: uploadedFileParams,
        type: 'international'
      };

      await orderService.createOrder('international', orderData);

      localStorage.removeItem('mirhal_intl_draft');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Order submission error:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPorts = (countryCode, mode) => {
    console.log('🔍 getPorts called:', { countryCode, mode });

    if (!countryCode) return [];

    // Convert to uppercase to match seaportsData keys
    const upperCountryCode = countryCode.toUpperCase();
    console.log('🔍 Looking for:', upperCountryCode, 'in seaportsData');

    if (!seaportsData[upperCountryCode]) {
      console.log('❌ No data found for:', upperCountryCode);
      return [];
    }

    // If mode is selected, return ports for that mode only
    if (mode && seaportsData[upperCountryCode][mode]) {
      const ports = seaportsData[upperCountryCode][mode];
      console.log('✅ Returning ports for mode:', mode, ports.length, 'ports');
      return ports;
    }

    // If no mode selected, return all ports (sea + air + land)
    const allPorts = [];
    const countryPorts = seaportsData[upperCountryCode];

    if (countryPorts['بحري']) {
      allPorts.push(...countryPorts['بحري'].map(p => `🚢 ${p}`));
    }
    if (countryPorts['جوي']) {
      allPorts.push(...countryPorts['جوي'].map(p => `✈️ ${p}`));
    }
    if (countryPorts['بري']) {
      allPorts.push(...countryPorts['بري'].map(p => `🚛 ${p}`));
    }

    return allPorts;
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const progressPercentage = (currentStep / 7) * 100;

  const showPickupAddress = formData.routeType === 'door-door' || formData.routeType === 'door-port';
  const showDeliveryAddress = formData.routeType === 'door-door' || formData.routeType === 'port-door';

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#5D5CDE' }}>
                <i className="fas fa-route text-sm sm:text-base"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: '#5D5CDE' }}>نموذج شحن دولي عام — مرحال جو</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">أكمل بيانات الشحنة بدقة — سنوافيك برد خلال 24 ساعة عمل</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center flex-shrink-0 self-end sm:self-auto"
            >
              <i className="fas fa-times text-lg sm:text-xl"></i>
            </button>
          </div>

          {/* Progress bar للشاشات الكبيرة */}
          <div className="mb-4 sm:mb-6 hidden sm:block">
            <div className="flex items-center justify-between text-xs text-center mb-2">
              {['1. العميل', '2. العملية', '3. التحميل', '4. التسليم', '5. البضاعة', '6. التخليص', '7. النهاية'].map((text, i) => (
                <div key={i} className="w-1/7">{text}</div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          {/* Progress bar مبسط للموبايل */}
          <div className="mb-4 sm:hidden">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color: '#5D5CDE' }}>الخطوة {currentStep} من 7</span>
              <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">1 — بيانات العميل</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">الاسم الكامل</label>
                    <input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} type="text" className="w-full p-2.5 sm:p-3 border rounded-lg text-base" placeholder="أدخل الاسم الكامل" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">رقم الهاتف</label>
                    <div className="flex gap-2">
                      <select 
                        value={formData.phoneCountry || '+20'} 
                        onChange={(e) => setFormData({ ...formData, phoneCountry: e.target.value })}
                        className="w-28 p-2.5 sm:p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+963">🇸🇾 +963</option>
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+967">🇾🇪 +967</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+218">🇱🇾 +218</option>
                        <option value="+249">🇸🇩 +249</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+90">🇹🇷 +90</option>
                      </select>
                      <input 
                        type="tel" 
                        value={formData.phone || ''} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 p-2.5 sm:p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">رقم الواتساب</label>
                    <div className="flex gap-2">
                      <select 
                        value={formData.whatsappCountry || '+20'} 
                        onChange={(e) => setFormData({ ...formData, whatsappCountry: e.target.value })}
                        className="w-28 p-2.5 sm:p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="+20">🇪🇬 +20</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+962">🇯🇴 +962</option>
                        <option value="+961">🇱🇧 +961</option>
                        <option value="+963">🇸🇾 +963</option>
                        <option value="+964">🇮🇶 +964</option>
                        <option value="+967">🇾🇪 +967</option>
                        <option value="+212">🇲🇦 +212</option>
                        <option value="+213">🇩🇿 +213</option>
                        <option value="+216">🇹🇳 +216</option>
                        <option value="+218">🇱🇾 +218</option>
                        <option value="+249">🇸🇩 +249</option>
                        <option value="+86">🇨🇳 +86</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+90">🇹🇷 +90</option>
                      </select>
                      <input 
                        type="tel" 
                        value={formData.whatsapp || ''} 
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="flex-1 p-2.5 sm:p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="أدخل رقم الواتساب"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">نوع العميل</label>
                    <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر نوع العميل</option>
                      <option value="فرد">فرد</option>
                      <option value="تاجر">تاجر</option>
                      <option value="شركة">شركة</option>
                      <option value="مصنع">مصنع</option>
                      <option value="other">أخرى</option>
                    </select>
                    {formData.clientType === 'other' && (
                      <input value={formData.clientTypeOther} onChange={(e) => setFormData({ ...formData, clientTypeOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" placeholder="اذكر نوع العميل" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input checked={formData.saveClientData} onChange={(e) => setFormData({ ...formData, saveClientData: e.target.checked })} type="checkbox" className="w-4 h-4" id="save" />
                    <label htmlFor="save" className="text-sm">حفظ بيانات العميل</label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">2 — تفاصيل العملية</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">نوع العملية</label>
                    <select value={formData.operationType} onChange={(e) => setFormData({ ...formData, operationType: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر نوع العملية</option>
                      <option value="صادر">صادر</option>
                      <option value="وارد">وارد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">نوع الشحنة</label>
                    <select value={formData.cargoMode} onChange={(e) => setFormData({ ...formData, cargoMode: e.target.value, pickupPort: '', deliveryPort: '' })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر نوع الشحنة</option>
                      <option value="بري">بري</option>
                      <option value="جوي">جوي</option>
                      <option value="بحري">بحري</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm mb-1">نوع الخدمة</label>
                    <select value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر نوع الخدمة</option>
                      <option value="شحن فقط">شحن فقط</option>
                      <option value="تخليص فقط">تخليص فقط</option>
                      <option value="شحن+تخليص">شحن + تخليص جمركي</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">3 — بيانات التحميل (Pickup)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">بلد التحميل</label>
                    <input 
                      list="pickup-countries" 
                      value={formData.pickupCountry ? countries.find(c => c.code === formData.pickupCountry)?.nameAr || formData.pickupCountry : ''}
                      onChange={(e) => {
                        const selectedCountry = countries.find(c => c.nameAr === e.target.value);
                        setFormData({ 
                          ...formData, 
                          pickupCountry: selectedCountry ? selectedCountry.code : e.target.value,
                          pickupPort: '', 
                          pickupCountryOther: selectedCountry ? '' : e.target.value 
                        });
                      }}
                      className="p-2.5 sm:p-3 border rounded-lg w-full text-base"
                      placeholder="ابحث عن البلد أو اختر من القائمة"
                    />
                    <datalist id="pickup-countries">
                      {countries.map(country => (
                        <option key={country.code} value={country.nameAr}>
                          {country.flag} {country.nameAr}
                        </option>
                      ))}
                    </datalist>
                    {formData.pickupCountry && !countries.find(c => c.code === formData.pickupCountry) && (
                      <p className="text-xs text-gray-500 mt-1">دولة مخصصة: {formData.pickupCountry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">مطار/ميناء/معبر</label>
                    {countries.find(c => c.code === formData.pickupCountry) ? (
                      <>
                        <select value={formData.pickupPort} onChange={(e) => setFormData({ ...formData, pickupPort: e.target.value, pickupPortOther: '' })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base" disabled={!formData.pickupCountry}>
                          <option value="">اختر</option>
                          {getPorts(formData.pickupCountry, formData.cargoMode).map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="other">أخرى</option>
                        </select>
                        {formData.pickupPort === 'other' && (
                          <input value={formData.pickupPortOther} onChange={(e) => setFormData({ ...formData, pickupPortOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" placeholder="اسم الميناء أو المطار" />
                        )}
                      </>
                    ) : (
                      <input 
                        value={formData.pickupPortOther} 
                        onChange={(e) => setFormData({ ...formData, pickupPortOther: e.target.value, pickupPort: 'other' })} 
                        type="text" 
                        className="p-2.5 sm:p-3 border rounded-lg w-full text-base" 
                        placeholder="اسم الميناء أو المطار" 
                        disabled={!formData.pickupCountry}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm mb-1">طريقة الشحن</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { value: 'door-door', label: 'من الباب إلى الباب' },
                        { value: 'door-port', label: 'من الباب إلى الميناء/المطار' },
                        { value: 'port-port', label: 'من الميناء/المطار إلى الميناء/المطار' },
                        { value: 'port-door', label: 'من الميناء/المطار إلى الباب' }
                      ].map(route => (
                        <label key={route.value} className="p-3 border rounded-lg cursor-pointer">
                          <input checked={formData.routeType === route.value} onChange={(e) => setFormData({ ...formData, routeType: e.target.value })} type="radio" name="route" value={route.value} className="ml-2" /> {route.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {showPickupAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm mb-1">عنوان التحميل — من</label>
                      <textarea value={formData.pickupFromAddress} onChange={(e) => setFormData({ ...formData, pickupFromAddress: e.target.value })} className="w-full p-3 border rounded-lg" rows="2"></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">4 — بيانات التسليم (Delivery)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">بلد التسليم</label>
                    <input 
                      list="delivery-countries" 
                      value={formData.deliveryCountry ? countries.find(c => c.code === formData.deliveryCountry)?.nameAr || formData.deliveryCountry : ''}
                      onChange={(e) => {
                        const selectedCountry = countries.find(c => c.nameAr === e.target.value);
                        setFormData({ 
                          ...formData, 
                          deliveryCountry: selectedCountry ? selectedCountry.code : e.target.value,
                          deliveryPort: '', 
                          deliveryCountryOther: selectedCountry ? '' : e.target.value 
                        });
                      }}
                      className="p-2.5 sm:p-3 border rounded-lg w-full text-base"
                      placeholder="ابحث عن البلد أو اختر من القائمة"
                    />
                    <datalist id="delivery-countries">
                      {countries.map(country => (
                        <option key={country.code} value={country.nameAr}>
                          {country.flag} {country.nameAr}
                        </option>
                      ))}
                    </datalist>
                    {formData.deliveryCountry && !countries.find(c => c.code === formData.deliveryCountry) && (
                      <p className="text-xs text-gray-500 mt-1">دولة مخصصة: {formData.deliveryCountry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">مطار/ميناء/مدينة</label>
                    {countries.find(c => c.code === formData.deliveryCountry) ? (
                      <>
                        <select value={formData.deliveryPort} onChange={(e) => setFormData({ ...formData, deliveryPort: e.target.value, deliveryPortOther: '' })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base" disabled={!formData.deliveryCountry}>
                          <option value="">اختر</option>
                          {getPorts(formData.deliveryCountry, formData.cargoMode).map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="other">أخرى</option>
                        </select>
                        {formData.deliveryPort === 'other' && (
                          <input value={formData.deliveryPortOther} onChange={(e) => setFormData({ ...formData, deliveryPortOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" placeholder="اسم الميناء أو المطار" />
                        )}
                      </>
                    ) : (
                      <input 
                        value={formData.deliveryPortOther} 
                        onChange={(e) => setFormData({ ...formData, deliveryPortOther: e.target.value, deliveryPort: 'other' })} 
                        type="text" 
                        className="p-2.5 sm:p-3 border rounded-lg w-full text-base" 
                        placeholder="اسم الميناء أو المطار" 
                        disabled={!formData.deliveryCountry}
                      />
                    )}
                  </div>
                  {showDeliveryAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm mb-1">عنوان التسليم — إلى</label>
                      <textarea value={formData.deliveryToAddress} onChange={(e) => setFormData({ ...formData, deliveryToAddress: e.target.value })} className="w-full p-3 border rounded-lg" rows="2"></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">5 — تفاصيل البضاعة</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">وصف البضاعة</label>
                    <textarea value={formData.goodsDescription} onChange={(e) => setFormData({ ...formData, goodsDescription: e.target.value })} className="w-full p-3 border rounded-lg" rows="3"></textarea>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { field: 'hasLiquids', label: 'هل تحتوي على سوائل؟', subField: 'liquidType', subLabel: 'نوع السائل' },
                      { field: 'hasHazmat', label: 'هل تحتوي على مواد خطرة؟', subField: 'hazmatType', subLabel: 'نوع المادة الخطرة' },
                      { field: 'hasBatteries', label: 'هل تحتوي على بطاريات؟', subField: 'batteryType', subLabel: 'نوع البطاريات' },
                      { field: 'isFragile', label: 'هل قابلة للكسر؟', subField: 'fragilePacking', subLabel: 'طريقة التغليف' },
                      { field: 'hasDocuments', label: 'هل لديك مستندات؟', subField: 'docType', subLabel: 'نوع المستند' }
                    ].map(item => (
                      <div key={item.field}>
                        <label className="block text-xs sm:text-sm mb-1">{item.label}</label>
                        <select value={formData[item.field]} onChange={(e) => setFormData({ ...formData, [item.field]: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                          <option value="">اختر</option>
                          <option value="نعم">نعم</option>
                          <option value="لا">لا</option>
                        </select>
                        {formData[item.field] === 'نعم' && (
                          <input value={formData[item.subField]} onChange={(e) => setFormData({ ...formData, [item.subField]: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" placeholder={item.subLabel} />
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs sm:text-sm mb-1">الوزن الكلي (كجم)</label>
                      <input value={formData.totalWeight} onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })} type="number" step="0.01" className="w-full p-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm mb-1">عدد القطع (اختياري)</label>
                      <input value={formData.piecesCount} onChange={(e) => setFormData({ ...formData, piecesCount: e.target.value })} type="number" className="w-full p-3 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm mb-1">نوع التغليف</label>
                      <select value={formData.packagingType} onChange={(e) => setFormData({ ...formData, packagingType: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                        <option value="">اختر</option>
                        <option value="كراتين">كراتين</option>
                        <option value="باليت">باليت</option>
                        <option value="براميل">براميل</option>
                        <option value="أكياس">أكياس</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                      {formData.packagingType === 'أخرى' && (
                        <input value={formData.packagingOther} onChange={(e) => setFormData({ ...formData, packagingOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" placeholder="اذكر نوع التغليف" />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm mb-1">خط ملاحي مفضل (اختياري)</label>
                      <select value={formData.preferredLine} onChange={(e) => setFormData({ ...formData, preferredLine: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                        <option value="">اختر</option>
                        <option value="Maersk">Maersk</option>
                        <option value="MSC">MSC</option>
                        <option value="CMA CGM">CMA CGM</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                      {formData.preferredLine === 'أخرى' && (
                        <input value={formData.preferredLineOther} onChange={(e) => setFormData({ ...formData, preferredLineOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">6 — التخليص الجمركي</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">التخليص مطلوب في</label>
                    <select value={formData.clearanceLocation} onChange={(e) => setFormData({ ...formData, clearanceLocation: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر</option>
                      <option value="export">بلد التصدير فقط</option>
                      <option value="import">بلد الاستيراد فقط</option>
                      <option value="both">بلد التصدير + بلد الاستيراد</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">هل لديك بطاقة استيراد؟</label>
                    <select value={formData.hasImportCard} onChange={(e) => setFormData({ ...formData, hasImportCard: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="لا">لا</option>
                      <option value="نعم">نعم</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">الغرض من الشحنة</label>
                    <select value={formData.shipmentPurpose} onChange={(e) => setFormData({ ...formData, shipmentPurpose: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر</option>
                      <option value="commercial">استيراد تجاري</option>
                      <option value="personal">استيراد شخصي</option>
                      <option value="reexport">إعادة تصدير</option>
                      <option value="sample">هدايا / Sample</option>
                      <option value="other">أخرى</option>
                    </select>
                    {formData.shipmentPurpose === 'other' && (
                      <input value={formData.shipmentPurposeOther} onChange={(e) => setFormData({ ...formData, shipmentPurposeOther: e.target.value })} type="text" className="mt-2 p-2.5 sm:p-3 border rounded-lg w-full text-base" />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">القيمة الجمركية (اختياري)</label>
                    <div className="flex gap-2">
                      <input value={formData.invoiceValue} onChange={(e) => setFormData({ ...formData, invoiceValue: e.target.value })} type="number" step="0.01" className="flex-1 p-3 border rounded-lg" />
                      <select value={formData.invoiceCurrency} onChange={(e) => setFormData({ ...formData, invoiceCurrency: e.target.value })} className="p-3 border rounded-lg w-28">
                        <option value="USD">USD</option>
                        <option value="EGP">EGP</option>
                        <option value="CNY">CNY</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">الكود الجمركي (HS) (اختياري)</label>
                    <input value={formData.hsCode} onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })} type="text" className="w-full p-3 border rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">المستندات المتاحة (اختياري)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        { field: 'docInvoice', label: 'فاتورة تجارية' },
                        { field: 'docPacking', label: 'بيان التعبئة' },
                        { field: 'docCO', label: 'شهادة منشأ' },
                        { field: 'docHealth', label: 'شهادة صحية' }
                      ].map(doc => (
                        <label key={doc.field} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer">
                          <input checked={formData[doc.field]} onChange={(e) => setFormData({ ...formData, [doc.field]: e.target.checked })} type="checkbox" /> {doc.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7 */}
            {currentStep === 7 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">7 — معلومات إضافية وإنهاء الطلب</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">كيف علمت بخدماتنا؟</label>
                    <select value={formData.howFound} onChange={(e) => setFormData({ ...formData, howFound: e.target.value })} className="p-2.5 sm:p-3 border rounded-lg w-full text-base">
                      <option value="">اختر</option>
                      <option value="website">موقع الشركة</option>
                      <option value="referral">عميل سابق</option>
                      <option value="social">سوشيال ميديا</option>
                    </select>
                    {formData.howFound === 'referral' && (
                      <div className="mt-2 space-y-2">
                        <input value={formData.referralName} onChange={(e) => setFormData({ ...formData, referralName: e.target.value })} type="text" className="w-full p-3 border rounded-lg" placeholder="اسم العميل السابق" />
                        <input value={formData.referralPhone} onChange={(e) => setFormData({ ...formData, referralPhone: e.target.value })} type="tel" className="w-full p-3 border rounded-lg" placeholder="رقم العميل السابق" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm mb-1">ملاحظات إضافية</label>
                    <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} className="w-full p-3 border rounded-lg" rows="5"></textarea>
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <label className="block text-sm mb-2">مرفقات (اختياري)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors bg-gray-50">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="intl-file-upload"
                      />
                      <label htmlFor="intl-file-upload" className="cursor-pointer flex flex-col items-center">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <span className="text-sm text-gray-600">اضغط لرفع الملفات (فواتير، مستندات تخليص، صور)</span>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                            <span className="text-sm truncate max-w-xs">{file.name}</span>
                            <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}


            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 sm:pt-6">
              <button type="button" onClick={prevStep} className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base ${currentStep === 1 ? 'invisible' : ''}`}>السابق</button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button type="button" onClick={saveDraft} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm sm:text-base order-2 sm:order-1">حفظ</button>
                <button type="button" onClick={clearForm} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base order-3 sm:order-2">مسح</button>

                {currentStep === 7 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال'
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={nextStep} className="px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:bg-opacity-90 text-sm sm:text-base order-1 sm:order-3" style={{ backgroundColor: '#5D5CDE' }}>التالي</button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">تم بنجاح!</h3>
            <div className="text-gray-600 mb-4">شكراً لاستخدامك مرحال جو .. سنوافيكم بالرد خلال 24 ساعة عمل</div>
            <button onClick={() => { setShowSuccessModal(false); clearForm(); }} className="px-6 py-2 text-white rounded-lg" style={{ backgroundColor: '#5D5CDE' }}>موافق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalShippingFullForm;