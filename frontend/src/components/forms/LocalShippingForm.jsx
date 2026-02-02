import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import storageService from '../../services/storage.service';

const LocalShippingFullForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Form Data State
  const [formData, setFormData] = useState({
    // Step 1: Client Data
    clientName: '',
    clientType: 'individual',
    clientTypeOther: '',
    phoneCountryCode: '+20',
    clientPhone: '',
    whatsappCountryCode: '+20',
    clientWhatsapp: '',

    // Step 2: Cargo Type
    cargoType: '',
    // Furniture
    furniturePieces: '',
    furnitureType: '',
    // Fruits/Vegetables
    fruitsType: '',
    needsCooling: 'no',
    coolingTemp: '',
    // Other
    otherCargoType: '',
    // Weight & Volume
    weight: '',
    volume: '',

    // Step 3: Pickup Details
    pickupGovernorate: '',
    pickupArea: '',
    pickupAddress: '',
    pickupDate: '',
    pickupTime: '',

    // Step 4: Delivery Details
    deliveryGovernorate: '',
    deliveryArea: '',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTime: '',
    deliveryPhone: '',

    // Step 5: Special Requirements
    needsSpecialPackaging: 'no',
    specialPackagingDetails: '',
    hasFragileItems: 'no',
    needsInsurance: 'no',
    insuranceValue: '',
    needsAssembly: 'no',
    needsDisassembly: 'no',

    // Step 6: Payment
    paymentMethod: '',

    // Step 7: Final
    howDidYouKnow: '',
    referralClientName: '',
    referralClientPhone: '',
    additionalNotes: ''
  });

  // Areas data for Egypt governorates
  const areasData = {
    cairo: ['وسط البلد', 'مصر الجديدة', 'النزهة', 'مدينة نصر', 'الزمالك', 'المعادي', 'حلوان'],
    giza: ['الدقي', 'المهندسين', 'الهرم', 'فيصل', '6 أكتوبر', 'الشيخ زايد', 'العجوزة'],
    alexandria: ['وسط الإسكندرية', 'سيدي جابر', 'سموحة', 'جليم', 'المنتزه', 'العجمي', 'الدخيلة'],
    qalyubia: ['بنها', 'شبين القناطر', 'القناطر الخيرية', 'كفر شكر', 'طوخ'],
    gharbia: ['طنطا', 'المحلة الكبرى', 'كفر الزيات', 'زفتى', 'السنطة']
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('mirhal_local_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('mirhal_local_draft', JSON.stringify(formData));
    showSuccess('تم حفظ المسودة بنجاح');
  };

  const clearForm = () => {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات؟')) return;
    setFormData({
      clientName: '', clientType: 'individual', clientTypeOther: '',
      phoneCountryCode: '+20', clientPhone: '', whatsappCountryCode: '+20', clientWhatsapp: '',
      cargoType: '', furniturePieces: '', furnitureType: '', fruitsType: '',
      needsCooling: 'no', coolingTemp: '', otherCargoType: '', weight: '', volume: '',
      pickupGovernorate: '', pickupArea: '', pickupAddress: '', pickupDate: '', pickupTime: '',
      deliveryGovernorate: '', deliveryArea: '', deliveryAddress: '', deliveryDate: '', deliveryTime: '', deliveryPhone: '',
      needsSpecialPackaging: 'no', specialPackagingDetails: '', hasFragileItems: 'no',
      needsInsurance: 'no', insuranceValue: '', needsAssembly: 'no', needsDisassembly: 'no',
      paymentMethod: '', howDidYouKnow: '', referralClientName: '', referralClientPhone: '', additionalNotes: ''
    });
    setCurrentStep(1);
    localStorage.removeItem('mirhal_local_draft');
  };

  // Navigation
  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.clientName || !formData.clientPhone || !formData.clientWhatsapp) {
          showError('من فضلك أدخل جميع البيانات المطلوبة');
          return false;
        }
        if (formData.clientType === 'other' && !formData.clientTypeOther) {
          showError('من فضلك حدد نوع العميل');
          return false;
        }
        break;
      case 2:
        if (!formData.cargoType) {
          showError('من فضلك اختر نوع الشحنة');
          return false;
        }
        if (formData.cargoType === 'furniture' && (!formData.furniturePieces || !formData.furnitureType)) {
          showError('من فضلك أدخل تفاصيل الأثاث');
          return false;
        }
        if (formData.cargoType === 'fruits_vegetables' && !formData.fruitsType) {
          showError('من فضلك حدد نوع الفاكهة أو الخضار');
          return false;
        }
        if (formData.cargoType === 'other' && !formData.otherCargoType) {
          showError('من فضلك حدد نوع الشحنة');
          return false;
        }
        if (!formData.weight) {
          showError('من فضلك أدخل الوزن التقريبي');
          return false;
        }
        break;
      case 3:
        if (!formData.pickupGovernorate || !formData.pickupArea || !formData.pickupAddress || !formData.pickupDate) {
          showError('من فضلك أدخل جميع بيانات التحميل');
          return false;
        }
        break;
      case 4:
        if (!formData.deliveryGovernorate || !formData.deliveryArea || !formData.deliveryAddress) {
          showError('من فضلك أدخل جميع بيانات التسليم');
          return false;
        }
        break;
      case 5:
        if (formData.needsSpecialPackaging === 'yes' && !formData.specialPackagingDetails) {
          showError('من فضلك حدد تفاصيل التغليف الخاص');
          return false;
        }
        if (formData.needsInsurance === 'yes' && !formData.insuranceValue) {
          showError('من فضلك أدخل قيمة التأمين');
          return false;
        }
        break;
      case 6:
        if (!formData.paymentMethod) {
          showError('من فضلك اختر طريقة الدفع');
          return false;
        }
        break;
      case 7:
        if (!formData.howDidYouKnow) {
          showError('من فضلك أخبرنا كيف علمت بخدماتنا');
          return false;
        }
        if (formData.howDidYouKnow === 'previous_client' && (!formData.referralClientName || !formData.referralClientPhone)) {
          showError('من فضلك أدخل بيانات العميل السابق');
          return false;
        }
        break;
    }
    return true;
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(7)) return;

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
        type: 'local'
      };

      await orderService.createOrder('local', orderData);

      localStorage.removeItem('mirhal_local_draft');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Order submission error:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    clearForm();
  };

  const progressPercentage = (currentStep / 7) * 100;

  // Get areas based on selected governorate
  const getAreas = (governorate) => {
    return areasData[governorate] || [];
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">نموذج الشحن المحلي</h2>
              <p className="text-gray-600 dark:text-gray-400">يرجى تعبئة جميع البيانات المطلوبة</p>
            </div>

            <button
              onClick={() => navigate('/customer/dashboard')}
              type="button"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors flex items-center justify-center"
              title="العودة للصفحة الرئيسية"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-4">
              {[1, 2, 3, 4, 5, 6, 7].map(step => (
                <div key={step} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${currentStep >= step ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
                    }`}>
                    {step}
                  </div>
                  <span className="text-xs">
                    {step === 1 && 'بيانات العميل'}
                    {step === 2 && 'نوع الشحنة'}
                    {step === 3 && 'التحميل'}
                    {step === 4 && 'التسليم'}
                    {step === 5 && 'متطلبات خاصة'}
                    {step === 6 && 'الدفع'}
                    {step === 7 && 'إنهاء'}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STEP 1: Client Data */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">بيانات العميل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">هل العميل</label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="individual">فرد</option>
                      <option value="trader">تاجر</option>
                      <option value="company">شركة</option>
                      <option value="factory">مصنع</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>
                  {formData.clientType === 'other' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">نوع العميل الآخر</label>
                      <input
                        type="text"
                        value={formData.clientTypeOther}
                        onChange={(e) => setFormData({ ...formData, clientTypeOther: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.phoneCountryCode}
                        onChange={(e) => setFormData({ ...formData, phoneCountryCode: e.target.value })}
                        className="w-24 p-3 border border-gray-300 rounded-lg text-base"
                      >
                        <option value="+20">+20</option>
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الواتساب</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.whatsappCountryCode}
                        onChange={(e) => setFormData({ ...formData, whatsappCountryCode: e.target.value })}
                        className="w-24 p-3 border border-gray-300 rounded-lg text-base"
                      >
                        <option value="+20">+20</option>
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.clientWhatsapp}
                        onChange={(e) => setFormData({ ...formData, clientWhatsapp: e.target.value })}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Cargo Type */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">نوع الشحنة</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اختيار نوع الشحنة</label>
                    <select
                      value={formData.cargoType}
                      onChange={(e) => setFormData({ ...formData, cargoType: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">اختر نوع الشحنة</option>
                      <option value="furniture">أثاث</option>
                      <option value="fruits_vegetables">فواكه وخضار</option>
                      <option value="chemicals">مواد كيميائية</option>
                      <option value="electronics">أجهزة كهربائية</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  {/* Furniture Details */}
                  {formData.cargoType === 'furniture' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">عدد القطع</label>
                          <input
                            type="number"
                            min="1"
                            value={formData.furniturePieces}
                            onChange={(e) => setFormData({ ...formData, furniturePieces: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">نوع الأثاث</label>
                          <input
                            type="text"
                            value={formData.furnitureType}
                            onChange={(e) => setFormData({ ...formData, furnitureType: e.target.value })}
                            placeholder="مثال: غرفة نوم، صالون، مكتب"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fruits/Vegetables Details */}
                  {formData.cargoType === 'fruits_vegetables' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">نوع الفاكهة أو الخضار</label>
                        <input
                          type="text"
                          value={formData.fruitsType}
                          onChange={(e) => setFormData({ ...formData, fruitsType: e.target.value })}
                          placeholder="مثال: تفاح، طماطم، موز"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">هل تحتاج تبريد؟</label>
                        <select
                          value={formData.needsCooling}
                          onChange={(e) => setFormData({ ...formData, needsCooling: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          <option value="no">لا</option>
                          <option value="yes">نعم</option>
                        </select>
                      </div>
                      {formData.needsCooling === 'yes' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">درجة التبريد</label>
                          <select
                            value={formData.coolingTemp}
                            onChange={(e) => setFormData({ ...formData, coolingTemp: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          >
                            <option value="unknown">لا أعلم</option>
                            <option value="0-5">0-5 درجة مئوية</option>
                            <option value="-5-0">-5-0 درجة مئوية</option>
                            <option value="-18">-18 درجة مئوية (تجميد)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Other Cargo Type */}
                  {formData.cargoType === 'other' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium mb-2">نوع الشحنة الأخرى</label>
                      <input
                        type="text"
                        value={formData.otherCargoType}
                        onChange={(e) => setFormData({ ...formData, otherCargoType: e.target.value })}
                        placeholder="اذكر نوع الشحنة"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  {/* Weight & Volume */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الوزن التقريبي (كجم)</label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="مثال: 50"
                        min="0"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الحجم التقريبي (متر مكعب) - اختياري</label>
                      <input
                        type="number"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        placeholder="مثال: 2.5"
                        min="0"
                        step="0.1"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Pickup Details */}
            {currentStep === 3 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">تحميل الشحنة</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">المحافظة</label>
                      <select
                        value={formData.pickupGovernorate}
                        onChange={(e) => setFormData({ ...formData, pickupGovernorate: e.target.value, pickupArea: '' })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="cairo">القاهرة</option>
                        <option value="giza">الجيزة</option>
                        <option value="alexandria">الإسكندرية</option>
                        <option value="qalyubia">القليوبية</option>
                        <option value="gharbia">الغربية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">المنطقة</label>
                      <select
                        value={formData.pickupArea}
                        onChange={(e) => setFormData({ ...formData, pickupArea: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المنطقة أولاً</option>
                        {getAreas(formData.pickupGovernorate).map((area, i) => (
                          <option key={i} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان التفصيلي</label>
                    <textarea
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      rows="3"
                      placeholder="الشارع، رقم المبنى، أي تفاصيل إضافية"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">تاريخ التحميل المطلوب</label>
                      <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">وقت التحميل المطلوب</label>
                      <input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Delivery Details */}
            {currentStep === 4 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">تسليم الشحنة</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">المحافظة</label>
                      <select
                        value={formData.deliveryGovernorate}
                        onChange={(e) => setFormData({ ...formData, deliveryGovernorate: e.target.value, deliveryArea: '' })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="cairo">القاهرة</option>
                        <option value="giza">الجيزة</option>
                        <option value="alexandria">الإسكندرية</option>
                        <option value="qalyubia">القليوبية</option>
                        <option value="gharbia">الغربية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">المنطقة</label>
                      <select
                        value={formData.deliveryArea}
                        onChange={(e) => setFormData({ ...formData, deliveryArea: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المنطقة أولاً</option>
                        {getAreas(formData.deliveryGovernorate).map((area, i) => (
                          <option key={i} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان التفصيلي</label>
                    <textarea
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      rows="3"
                      placeholder="الشارع، رقم المبنى، أي تفاصيل إضافية"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">تاريخ التسليم المطلوب - اختياري</label>
                      <input
                        type="date"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">وقت التسليم المطلوب - اختياري</label>
                      <input
                        type="time"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم هاتف المستلم - اختياري</label>
                    <input
                      type="tel"
                      value={formData.deliveryPhone}
                      onChange={(e) => setFormData({ ...formData, deliveryPhone: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Special Requirements */}
            {currentStep === 5 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">متطلبات خاصة</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">هل تحتاج تغليف خاص؟</label>
                    <select
                      value={formData.needsSpecialPackaging}
                      onChange={(e) => setFormData({ ...formData, needsSpecialPackaging: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="no">لا</option>
                      <option value="yes">نعم</option>
                    </select>
                  </div>
                  {formData.needsSpecialPackaging === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">تفاصيل التغليف الخاص</label>
                      <textarea
                        value={formData.specialPackagingDetails}
                        onChange={(e) => setFormData({ ...formData, specialPackagingDetails: e.target.value })}
                        rows="3"
                        placeholder="اذكر متطلبات التغليف"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      ></textarea>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">هل البضائع قابلة للكسر؟</label>
                    <select
                      value={formData.hasFragileItems}
                      onChange={(e) => setFormData({ ...formData, hasFragileItems: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="no">لا</option>
                      <option value="yes">نعم</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">هل تحتاج تأمين على البضائع؟</label>
                    <select
                      value={formData.needsInsurance}
                      onChange={(e) => setFormData({ ...formData, needsInsurance: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="no">لا</option>
                      <option value="yes">نعم</option>
                    </select>
                  </div>
                  {formData.needsInsurance === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">قيمة التأمين المطلوبة (بالجنيه)</label>
                      <input
                        type="number"
                        value={formData.insuranceValue}
                        onChange={(e) => setFormData({ ...formData, insuranceValue: e.target.value })}
                        placeholder="مثال: 10000"
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">هل تحتاج فك وتركيب؟</label>
                      <select
                        value={formData.needsDisassembly}
                        onChange={(e) => setFormData({ ...formData, needsDisassembly: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="no">لا</option>
                        <option value="yes">نعم</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">هل تحتاج تركيب فقط؟</label>
                      <select
                        value={formData.needsAssembly}
                        onChange={(e) => setFormData({ ...formData, needsAssembly: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      >
                        <option value="no">لا</option>
                        <option value="yes">نعم</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Payment */}
            {currentStep === 6 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">طريقة الدفع المفضلة</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex items-center gap-3">
                      <i className="fas fa-university text-blue-600 text-xl"></i>
                      <span>تحويل بنكي</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vodafone_cash"
                      checked={formData.paymentMethod === 'vodafone_cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex items-center gap-3">
                      <i className="fas fa-mobile-alt text-red-600 text-xl"></i>
                      <span>فودافون كاش</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={formData.paymentMethod === 'instapay'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex items-center gap-3">
                      <i className="fas fa-mobile-alt text-green-600 text-xl"></i>
                      <span>إنستاباي</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={formData.paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex items-center gap-3">
                      <i className="fas fa-money-bill text-orange-600 text-xl"></i>
                      <span>كاش عند الاستلام</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="e_wallet"
                      checked={formData.paymentMethod === 'e_wallet'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="flex items-center gap-3">
                      <i className="fas fa-wallet text-purple-600 text-xl"></i>
                      <span>محفظة إلكترونية</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 7: Final */}
            {currentStep === 7 && (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-6">معلومات إضافية</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">كيف علمت بخدماتنا؟</label>
                    <select
                      value={formData.howDidYouKnow}
                      onChange={(e) => setFormData({ ...formData, howDidYouKnow: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">اختر الطريقة</option>
                      <option value="website">موقع الشركة</option>
                      <option value="previous_client">عميل سابق</option>
                      <option value="social_media">سوشيال ميديا</option>
                    </select>
                  </div>

                  {formData.howDidYouKnow === 'previous_client' && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-2">اسم العميل السابق</label>
                        <input
                          type="text"
                          value={formData.referralClientName}
                          onChange={(e) => setFormData({ ...formData, referralClientName: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">رقم العميل السابق</label>
                        <input
                          type="tel"
                          value={formData.referralClientPhone}
                          onChange={(e) => setFormData({ ...formData, referralClientPhone: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                          <i className="fas fa-gift text-green-600 mr-2"></i>
                          العميل السابق سيتكافأ بكاش باك في حالة إتمام الشحنة
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      rows="4"
                      placeholder="أي ملاحظات أو تفاصيل إضافية..."
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${currentStep === 1 ? 'invisible' : ''}`}
              >
                السابق
              </button>
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  مسح
                </button>
                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    style={{ backgroundColor: '#5D5CDE' }}
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال الطلب'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">تم بنجاح!</h3>
              <div className="text-gray-600 mb-4">شكراً لاستخدامك مرحال جو .. سنوافيكم بالرد خلال 24 ساعة عمل</div>
              <button
                onClick={closeSuccess}
                className="px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: '#5D5CDE' }}
              >
                موافق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalShippingFullForm;