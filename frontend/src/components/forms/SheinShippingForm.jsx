import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const SheinShippingForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentOrderTab, setCurrentOrderTab] = useState('service');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    clientName: '', phone: '', whatsapp: '', clientType: '', clientTypeOther: '', saveClient: false,
    serviceType: '', marketplace: '', productMethod: 'manual', cartLink: '', shipmentDescription: '',
    shipMode: '', needsPackaging: 'لا', packaging: '', packagingOther: '', isFragile: '', hasHazmat: '', hazmatType: '',
    supplierCity: '', supplierPhone: '', supplierAddress: '',
    warehouseCity: '', warehousePhone: '', warehouseAddress: '',
    deliveryCountry: '', deliveryCity: '', deliveryDistrict: '', deliveryAddress: '',
    howFound: '', referralName: '', referralPhone: '', additionalNotes: '', confirmTerms: false
  });

  const egyptCities = ["القاهرة", "الجيزة", "الإسكندرية", "بورسعيد", "السويس", "المنصورة", "طنطا"];
  const saudiCities = ["الرياض", "جدة", "الدمام", "مكة المكرمة", "المدينة المنورة", "الخبر", "الطائف"];
  const uaeCities = ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة"];

  useEffect(() => {
    const draft = localStorage.getItem('mirhal_shein_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setFormData(data.formData || data);
        setProducts(data.products || []);
      } catch (e) { }
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('mirhal_shein_draft', JSON.stringify({ formData, products }));
    showSuccess('تم حفظ المسودة');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.clientName || !formData.phone || !formData.whatsapp || !formData.clientType) {
          showError('أدخل جميع البيانات المطلوبة'); return false;
        }
        break;
      case 2:
        if (!formData.serviceType) { showError('اختر نوع الخدمة'); return false; }
        if (formData.serviceType !== 'شحن فقط') {
          if (!formData.marketplace) { showError('اختر الموقع'); return false; }
          if (formData.productMethod === 'cartLink' && !formData.cartLink) {
            showError('أدخل لينك الباج'); return false;
          }
          if (formData.productMethod === 'manual' && products.length === 0) {
            showError('أضف منتج واحد على الأقل'); return false;
          }
        }
        if (formData.serviceType === 'شحن فقط' && !formData.shipmentDescription) {
          showError('اوصف البضاعة'); return false;
        }
        break;
      case 3:
        if (!formData.shipMode) { showError('اختر طريقة الشحن'); return false; }
        if (formData.serviceType === 'شحن فقط') {
          if (!formData.supplierCity || !formData.supplierPhone || !formData.supplierAddress) {
            showError('أكمل بيانات المورد'); return false;
          }
        }
        if (!formData.deliveryCountry || !formData.deliveryCity || !formData.deliveryAddress) {
          showError('أكمل عنوان التسليم'); return false;
        }
        break;
      case 4:
        if (!formData.confirmTerms) { showError('يجب الموافقة على الشروط'); return false; }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 2 && currentOrderTab === 'service') {
      if (!formData.serviceType) { showError('اختر نوع الخدمة'); return; }
      if (formData.serviceType === 'شحن فقط') {
        setCurrentOrderTab('shipmentDetails');
      } else {
        setCurrentOrderTab('marketplaceProducts');
      }
      return;
    }
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep === 2 && (currentOrderTab === 'marketplaceProducts' || currentOrderTab === 'shipmentDetails')) {
      setCurrentOrderTab('service');
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    try {
      setIsSubmitting(true);
      const orderData = { ...formData, products, type: 'shein' };
      await orderService.createOrder('shein', orderData);
      localStorage.removeItem('mirhal_shein_draft');
      setShowSuccessModal(true);
    } catch (error) {
      showError(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = () => {
    if (products.length >= 10) { showError('الحد الأقصى 10 منتجات'); return; }
    setProducts([...products, { id: Date.now(), link: '', name: '', qty: '', hasColors: 'no', hasSizes: 'no', colors: [], sizes: [], note: '' }]);
  };

  const removeProduct = (id) => {
    if (products.length <= 1) { showError('يجب أن يكون هناك منتج واحد'); return; }
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addColorToProduct = (productId) => {
    setProducts(products.map(p => p.id === productId ? { ...p, colors: [...p.colors, { name: '', qty: '' }] } : p));
  };

  const removeColorFromProduct = (productId, colorIndex) => {
    setProducts(products.map(p => p.id === productId ? { ...p, colors: p.colors.filter((_, i) => i !== colorIndex) } : p));
  };

  const updateProductColor = (productId, colorIndex, field, value) => {
    setProducts(products.map(p => p.id === productId ? {
      ...p,
      colors: p.colors.map((c, i) => i === colorIndex ? { ...c, [field]: value } : c)
    } : p));
  };

  const addSizeToProduct = (productId) => {
    setProducts(products.map(p => p.id === productId ? { ...p, sizes: [...p.sizes, { name: '', qty: '' }] } : p));
  };

  const removeSizeFromProduct = (productId, sizeIndex) => {
    setProducts(products.map(p => p.id === productId ? { ...p, sizes: p.sizes.filter((_, i) => i !== sizeIndex) } : p));
  };

  const updateProductSize = (productId, sizeIndex, field, value) => {
    setProducts(products.map(p => p.id === productId ? {
      ...p,
      sizes: p.sizes.map((s, i) => i === sizeIndex ? { ...s, [field]: value } : s)
    } : p));
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="max-w-5xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="bg-white shadow-xl rounded-xl p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: '#5D5CDE' }}>
                <i className="fas fa-shipping-fast text-lg sm:text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: '#5D5CDE' }}>طلب شحن من شي إن</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">املأ البيانات - سنوافيك بالرد خلال 24 ساعة عمل</p>
              </div>
            </div>
            <button onClick={() => navigate(-1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition flex-shrink-0 self-end sm:self-auto">
              <i className="fas fa-times text-lg sm:text-xl"></i>
            </button>
          </div>

          {/* Progress - Desktop */}
          <div className="mb-6 sm:mb-8 md:mb-10 hidden sm:block">
            <div className="flex items-center justify-between text-xs sm:text-sm text-center mb-3">
              {['بيانات العميل', 'تفاصيل الطلب', 'الشحن', 'المراجعة'].map((text, i) => (
                <div key={i} className="w-1/4 font-medium flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 text-sm ${i + 1 <= currentStep ? 'text-white' : 'bg-gray-200 text-gray-600'}`} style={i + 1 <= currentStep ? { backgroundColor: '#5D5CDE' } : {}}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{text}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          {/* Progress - Mobile */}
          <div className="mb-4 sm:hidden">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold" style={{ color: '#5D5CDE' }}>الخطوة {currentStep} من 4</span>
              <span className="text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Client Data */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pb-2 border-b-2" style={{ borderColor: '#5D5CDE' }}>1 — بيانات العميل</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">الاسم الكامل <span className="text-red-500">*</span></label>
                    <input value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} type="text" className="w-full p-2.5 sm:p-3 md:p-3.5 border rounded-lg text-base focus:ring-2 focus:ring-primary" placeholder="أدخل الاسم الكامل" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">رقم الهاتف <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs sm:text-sm font-medium mb-2">رقم الواتساب <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs sm:text-sm font-medium mb-2">نوع العميل <span className="text-red-500">*</span></label>
                    <select value={formData.clientType} onChange={(e) => setFormData({ ...formData, clientType: e.target.value })} className="p-2.5 sm:p-3 md:p-3.5 border rounded-lg w-full text-base focus:ring-2 focus:ring-primary">
                      <option value="">اختر نوع العميل</option>
                      <option value="فرد">فرد</option>
                      <option value="تاجر">تاجر</option>
                      <option value="شركة">شركة</option>
                      <option value="other">أخرى</option>
                    </select>
                    {formData.clientType === 'other' && (
                      <input value={formData.clientTypeOther} onChange={(e) => setFormData({ ...formData, clientTypeOther: e.target.value })} type="text" className="mt-3 p-2.5 sm:p-3 md:p-3.5 border rounded-lg w-full text-base" placeholder="اذكر نوع العميل" />
                    )}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
                    <input checked={formData.saveClient} onChange={(e) => setFormData({ ...formData, saveClient: e.target.checked })} type="checkbox" className="w-4 h-4 sm:w-5 sm:h-5" id="save" />
                    <label htmlFor="save" className="text-xs sm:text-sm font-medium">حفظ بياناتي للمرات القادمة</label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Order Details with Tabs */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: '#5D5CDE' }}>2 — تفاصيل طلبك</h2>

                {/* Tabs */}
                <div className="flex border-b mb-6">
                  <div className={`px-6 py-3 cursor-pointer border-b-3 font-semibold transition ${currentOrderTab === 'service' ? 'bg-blue-50' : 'text-gray-600'}`} onClick={() => setCurrentOrderTab('service')} style={currentOrderTab === 'service' ? { color: '#5D5CDE', borderBottomColor: '#5D5CDE', borderBottomWidth: '3px' } : { borderBottomColor: 'transparent', borderBottomWidth: '3px' }}>
                    <i className="fas fa-cog ml-2"></i> نوع الخدمة
                  </div>
                  {formData.serviceType && formData.serviceType !== 'شحن فقط' && (
                    <div className={`px-6 py-3 cursor-pointer border-b-3 font-semibold transition ${currentOrderTab === 'marketplaceProducts' ? 'bg-blue-50' : 'text-gray-600'}`} onClick={() => setCurrentOrderTab('marketplaceProducts')} style={currentOrderTab === 'marketplaceProducts' ? { color: '#5D5CDE', borderBottomColor: '#5D5CDE', borderBottomWidth: '3px' } : { borderBottomColor: 'transparent', borderBottomWidth: '3px' }}>
                      <i className="fas fa-store ml-2"></i> الموقع & المنتجات
                      {products.length > 0 && <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-2">{products.length}</span>}
                    </div>
                  )}
                  {formData.serviceType === 'شحن فقط' && (
                    <div className={`px-6 py-3 cursor-pointer border-b-3 font-semibold transition ${currentOrderTab === 'shipmentDetails' ? 'bg-blue-50' : 'text-gray-600'}`} onClick={() => setCurrentOrderTab('shipmentDetails')} style={currentOrderTab === 'shipmentDetails' ? { color: '#5D5CDE', borderBottomColor: '#5D5CDE', borderBottomWidth: '3px' } : { borderBottomColor: 'transparent', borderBottomWidth: '3px' }}>
                      <i className="fas fa-box ml-2"></i> مواصفات الطلب
                    </div>
                  )}
                </div>

                {/* Service Selection Tab */}
                {currentOrderTab === 'service' && (
                  <div>
                    <h3 className="text-lg font-bold text-center mb-6">ما هي الخدمة التي تحتاجها؟</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'شراء فقط', icon: 'shopping-cart', color: 'blue', label: 'شراء فقط', desc: 'نشتري لك المنتجات من شي إن' },
                        { value: 'شحن فقط', icon: 'ship', color: 'green', label: 'شحن فقط', desc: 'نشحن منتجاتك من السعودية - الإمارات' },
                        { value: 'شراء+شحن', icon: 'boxes', color: 'purple', label: 'شراء + شحن', desc: 'نشتري ثم نشحن لك' }
                      ].map(service => (
                        <div key={service.value} className={`border-2 rounded-xl p-6 cursor-pointer transition hover:shadow-md ${formData.serviceType === service.value ? 'bg-blue-50' : 'border-gray-200'}`} onClick={() => setFormData({ ...formData, serviceType: service.value })} style={formData.serviceType === service.value ? { borderColor: '#5D5CDE' } : {}}>
                          <div className="text-center">
                            <div className={`w-16 h-16 bg-${service.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                              <i className={`fas fa-${service.icon} text-2xl text-${service.color}-600`}></i>
                            </div>
                            <h4 className="font-bold text-lg mb-2">{service.label}</h4>
                            <p className="text-sm text-gray-600">{service.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marketplace & Products Tab */}
                {currentOrderTab === 'marketplaceProducts' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">من أي موقع ستشتري؟</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {['شي إن السعودية', 'شي إن الإمارات'].map(mp => (
                        <div key={mp} className={`p-4 border rounded-lg cursor-pointer text-center transition ${formData.marketplace === mp ? 'bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`} onClick={() => setFormData({ ...formData, marketplace: mp })} style={formData.marketplace === mp ? { borderColor: '#5D5CDE' } : {}}>
                          <div className="font-medium">{mp}</div>
                          <div className="text-xs text-gray-500 mt-1">{mp === 'شي إن السعودية' ? 'shein.sa' : 'shein.ae'}</div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold mb-4">📦 طريقة إضافة المنتجات</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                      <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition ${formData.productMethod === 'cartLink' ? '' : 'border-gray-200 hover:border-gray-400'}`} style={formData.productMethod === 'cartLink' ? { borderColor: '#5D5CDE' } : {}}>
                        <input type="radio" checked={formData.productMethod === 'cartLink'} onChange={() => setFormData({ ...formData, productMethod: 'cartLink' })} className="w-5 h-5 ml-3" />
                        <div className="mr-3">
                          <div className="font-bold text-lg">إضافة لينك الباج</div>
                          <div className="text-sm text-gray-600 mt-1">أرسل رابط واحد يحتوي جميع منتجاتك</div>
                        </div>
                      </label>
                      <label className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition ${formData.productMethod === 'manual' ? '' : 'border-gray-200 hover:border-gray-400'}`} style={formData.productMethod === 'manual' ? { borderColor: '#5D5CDE' } : {}}>
                        <input type="radio" checked={formData.productMethod === 'manual'} onChange={() => setFormData({ ...formData, productMethod: 'manual' })} className="w-5 h-5 ml-3" />
                        <div className="mr-3">
                          <div className="font-bold text-lg">إضافة المنتجات يدويًا</div>
                          <div className="text-sm text-gray-600 mt-1">أضف كل منتج على حدة</div>
                        </div>
                      </label>
                    </div>

                    {formData.productMethod === 'cartLink' ? (
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <label className="block text-sm font-medium mb-2">لينك الباج من شي إن <span className="text-red-500">*</span></label>
                        <textarea value={formData.cartLink} onChange={(e) => setFormData({ ...formData, cartLink: e.target.value })} className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary" rows="3" placeholder="الصق هنا لينك الباج من موقع شي إن"></textarea>
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800"><i className="fas fa-info-circle ml-1"></i> <strong>ملاحظة:</strong> تأكد أن جميع المنتجات والمواصفات (الكمية – اللون – المقاس) تم اختيارها بدقة</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold mb-4">منتجاتك من شي إن</h3>
                        <div className="space-y-6">
                          {products.map((product, index) => (
                            <div key={product.id} className="border rounded-xl p-5 bg-white">
                              <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'rgba(93, 92, 222, 0.1)', color: '#5D5CDE' }}>{index + 1}</div>
                                  <div className="font-bold">منتج جديد</div>
                                </div>
                                <button type="button" onClick={() => removeProduct(product.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                                  <i className="fas fa-trash ml-1"></i> حذف
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">رابط المنتج <span className="text-red-500">*</span></label>
                                  <input value={product.link} onChange={(e) => updateProduct(product.id, 'link', e.target.value)} type="url" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="https://shein.sa/..." />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">اسم المنتج <span className="text-red-500">*</span></label>
                                  <input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="مثال: جاكيت" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2">الكمية <span className="text-red-500">*</span></label>
                                  <input value={product.qty} onChange={(e) => updateProduct(product.id, 'qty', e.target.value)} type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" min="1" />
                                </div>

                                {/* Colors Section */}
                                <div className="md:col-span-3">
                                  <label className="block text-sm font-medium mb-2">هل يحتاج تحديد ألوان؟</label>
                                  <select value={product.hasColors} onChange={(e) => updateProduct(product.id, 'hasColors', e.target.value)} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                                    <option value="no">لا</option>
                                    <option value="yes">نعم</option>
                                  </select>
                                  {product.hasColors === 'yes' && (
                                    <div className="mt-3">
                                      <button type="button" onClick={() => addColorToProduct(product.id)} className="px-3 py-1.5 text-white rounded-lg text-sm mb-3" style={{ backgroundColor: '#5D5CDE' }}>
                                        <i className="fas fa-plus ml-1"></i> إضافة لون
                                      </button>
                                      {product.colors.map((color, colorIndex) => (
                                        <div key={colorIndex} className="flex gap-2 mb-3">
                                          <input value={color.name} onChange={(e) => updateProductColor(product.id, colorIndex, 'name', e.target.value)} type="text" placeholder="اللون (مثال: أسود)" className="flex-1 p-3 border rounded-lg" />
                                          <input value={color.qty} onChange={(e) => updateProductColor(product.id, colorIndex, 'qty', e.target.value)} type="number" placeholder="الكمية" className="w-28 p-3 border rounded-lg" min="1" />
                                          <button type="button" onClick={() => removeColorFromProduct(product.id, colorIndex)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Sizes Section */}
                                <div className="md:col-span-3">
                                  <label className="block text-sm font-medium mb-2">هل يحتاج تحديد مقاسات؟</label>
                                  <select value={product.hasSizes} onChange={(e) => updateProduct(product.id, 'hasSizes', e.target.value)} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                                    <option value="no">لا</option>
                                    <option value="yes">نعم</option>
                                  </select>
                                  {product.hasSizes === 'yes' && (
                                    <div className="mt-3">
                                      <button type="button" onClick={() => addSizeToProduct(product.id)} className="px-3 py-1.5 text-white rounded-lg text-sm mb-3" style={{ backgroundColor: '#5D5CDE' }}>
                                        <i className="fas fa-plus ml-1"></i> إضافة مقاس
                                      </button>
                                      {product.sizes.map((size, sizeIndex) => (
                                        <div key={sizeIndex} className="flex gap-2 mb-3">
                                          <input value={size.name} onChange={(e) => updateProductSize(product.id, sizeIndex, 'name', e.target.value)} type="text" placeholder="المقاس (مثال: L)" className="flex-1 p-3 border rounded-lg" />
                                          <input value={size.qty} onChange={(e) => updateProductSize(product.id, sizeIndex, 'qty', e.target.value)} type="number" placeholder="الكمية" className="w-28 p-3 border rounded-lg" min="1" />
                                          <button type="button" onClick={() => removeSizeFromProduct(product.id, sizeIndex)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm">
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="md:col-span-3">
                                  <label className="block text-sm font-medium mb-2">ملاحظات عن المنتج</label>
                                  <textarea value={product.note} onChange={(e) => updateProduct(product.id, 'note', e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="أي ملاحظات إضافية..."></textarea>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addProduct} className="mt-4 px-5 py-3 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#5D5CDE' }}>
                          <i className="fas fa-plus ml-2"></i> إضافة منتج جديد
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Shipment Details Tab */}
                {currentOrderTab === 'shipmentDetails' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">📦 مواصفات الطلب</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border">
                      <label className="block text-sm font-medium mb-2">اوصف البضاعة و الكمية و الوزن <span className="text-red-500">*</span></label>
                      <textarea value={formData.shipmentDescription} onChange={(e) => setFormData({ ...formData, shipmentDescription: e.target.value })} className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary" rows="6" placeholder="مثال: كراتين ملابس – 5 كراتين – الوزن التقريبي 120 كجم"></textarea>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Shipping */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: '#5D5CDE' }}>3 — الشحن والتسليم</h2>

                <h3 className="text-lg font-bold mb-4">🚢 طريقة الشحن</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                  {[
                    { value: 'جوي', icon: 'plane', label: 'الشحن السريع', time: '12-20 أيام', color: 'blue' },
                    { value: 'بري', icon: 'truck', label: 'الشحن العادي', time: '25-45 يوم', color: 'green' }
                  ].map(mode => (
                    <div key={mode.value} className={`p-5 border-2 rounded-xl cursor-pointer transition hover:shadow-md ${formData.shipMode === mode.value ? 'bg-blue-50' : 'border-gray-200'}`} onClick={() => setFormData({ ...formData, shipMode: mode.value })} style={formData.shipMode === mode.value ? { borderColor: '#5D5CDE' } : {}}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 bg-${mode.color}-100 rounded-lg flex items-center justify-center`}>
                          <i className={`fas fa-${mode.icon} text-${mode.color}-600 text-xl`}></i>
                        </div>
                        <div>
                          <div className="font-bold text-lg">{mode.label}</div>
                          <div className="text-sm text-gray-600"><i className="fas fa-clock ml-1"></i> {mode.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.serviceType === 'شحن فقط' && (
                  <div className="mb-8 p-5 border rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <i className="fas fa-map-marker-alt"></i>
                      </div>
                      <h3 className="text-lg font-bold">📍 موقع المورد</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">المدينة <span className="text-red-500">*</span></label>
                        <input value={formData.supplierCity} onChange={(e) => setFormData({ ...formData, supplierCity: e.target.value })} type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="مثال: الرياض - دبي" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">رقم هاتف المورد <span className="text-red-500">*</span></label>
                        <input value={formData.supplierPhone} onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })} type="tel" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="+966 XXX" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">العنوان التفصيلي <span className="text-red-500">*</span></label>
                        <textarea value={formData.supplierAddress} onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" rows="2" placeholder="اسم الشارع، رقم المبنى..."></textarea>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 border rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <i className="fas fa-home"></i>
                    </div>
                    <h3 className="text-lg font-bold">🏠 عنوان التسليم النهائي</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">البلد <span className="text-red-500">*</span></label>
                      <select value={formData.deliveryCountry} onChange={(e) => setFormData({ ...formData, deliveryCountry: e.target.value, deliveryCity: '' })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                        <option value="">اختر البلد</option>
                        <option value="مصر">مصر 🇪🇬</option>
                        <option value="السعودية">السعودية 🇸🇦</option>
                        <option value="الإمارات">الإمارات 🇦🇪</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">المدينة <span className="text-red-500">*</span></label>
                      <select value={formData.deliveryCity} onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                        <option value="">اختر المدينة</option>
                        {formData.deliveryCountry === 'مصر' && egyptCities.map(c => <option key={c} value={c}>{c}</option>)}
                        {formData.deliveryCountry === 'السعودية' && saudiCities.map(c => <option key={c} value={c}>{c}</option>)}
                        {formData.deliveryCountry === 'الإمارات' && uaeCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">العنوان التفصيلي <span className="text-red-500">*</span></label>
                      <textarea value={formData.deliveryAddress} onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" rows="2" placeholder="اسم الشارع، رقم العمارة، الشقة..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">📦 التغليف والمواصفات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">هل تحتاج طريقة تغليف خاصة؟</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" checked={formData.needsPackaging === 'نعم'} onChange={() => setFormData({ ...formData, needsPackaging: 'نعم' })} className="w-5 h-5" />
                          <span className="font-medium">نعم</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" checked={formData.needsPackaging === 'لا'} onChange={() => setFormData({ ...formData, needsPackaging: 'لا' })} className="w-5 h-5" />
                          <span className="font-medium">لا</span>
                        </label>
                      </div>
                      {formData.needsPackaging === 'نعم' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">نوع التغليف المطلوب</label>
                          <select value={formData.packaging} onChange={(e) => setFormData({ ...formData, packaging: e.target.value })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                            <option value="">اختر طريقة التغليف</option>
                            <option value="كراتين">كراتين</option>
                            <option value="باليت">باليِت خشبي</option>
                            <option value="براميل">براميل بلاستيك</option>
                            <option value="أكياس">أكياس محكمة</option>
                            <option value="other">أخرى</option>
                          </select>
                          {formData.packaging === 'other' && (
                            <input value={formData.packagingOther} onChange={(e) => setFormData({ ...formData, packagingOther: e.target.value })} type="text" className="mt-3 p-3 border rounded-lg w-full" placeholder="اذكر طريقة التغليف" />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">هل المنتجات قابلة للكسر؟</label>
                      <select value={formData.isFragile} onChange={(e) => setFormData({ ...formData, isFragile: e.target.value })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                        <option value="">اختر</option>
                        <option value="نعم">نعم</option>
                        <option value="لا">لا</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">هل تحتوي على مواد خطرة؟</label>
                      <select value={formData.hasHazmat} onChange={(e) => setFormData({ ...formData, hasHazmat: e.target.value })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                        <option value="">اختر</option>
                        <option value="نعم">نعم</option>
                        <option value="لا">لا</option>
                      </select>
                      {formData.hasHazmat === 'نعم' && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium mb-2">نوع المواد الخطرة</label>
                          <input value={formData.hazmatType} onChange={(e) => setFormData({ ...formData, hazmatType: e.target.value })} type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary" placeholder="بطاريات - سوائل - كيماويات" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2" style={{ borderColor: '#5D5CDE' }}>4 — مراجعة طلبك</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 rounded-xl p-6 border mb-6">
                      <h3 className="text-lg font-bold mb-4">📋 ملخص الطلب</h3>
                      <div className="space-y-3 text-sm">
                        <div><strong>العميل:</strong> {formData.clientName}</div>
                        <div><strong>الخدمة:</strong> {formData.serviceType}</div>
                        {formData.marketplace && <div><strong>الموقع:</strong> {formData.marketplace}</div>}
                        {formData.productMethod === 'manual' && products.length > 0 && <div><strong>عدد المنتجات:</strong> {products.length}</div>}
                        <div><strong>طريقة الشحن:</strong> {formData.shipMode}</div>
                        <div><strong>التسليم:</strong> {formData.deliveryCountry} - {formData.deliveryCity}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-4">💬 ملاحظات إضافية</h3>
                      <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary" rows="5" placeholder="اكتب أي ملاحظات..."></textarea>
                    </div>
                  </div>
                  <div>
                    <div className="sticky top-6">
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">كيف علمت بخدماتنا؟</label>
                        <select value={formData.howFound} onChange={(e) => setFormData({ ...formData, howFound: e.target.value })} className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-primary">
                          <option value="">اختر</option>
                          <option value="website">موقع الشركة</option>
                          <option value="referral">عميل سابق</option>
                          <option value="social">سوشيال ميديا</option>
                          <option value="search">محرك بحث</option>
                        </select>
                        {formData.howFound === 'referral' && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 mb-3"><i className="fas fa-gift ml-1"></i> <strong>مكافأة:</strong> العميل السابق سيحصل على كاش باك</p>
                            <input value={formData.referralName} onChange={(e) => setFormData({ ...formData, referralName: e.target.value })} type="text" className="w-full p-3 border rounded-lg mb-3" placeholder="اسم العميل السابق" />
                            <input value={formData.referralPhone} onChange={(e) => setFormData({ ...formData, referralPhone: e.target.value })} type="tel" className="w-full p-3 border rounded-lg" placeholder="رقم العميل السابق" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 rounded-xl border" style={{ backgroundColor: 'rgba(93, 92, 222, 0.1)', borderColor: 'rgba(93, 92, 222, 0.2)' }}>
                        <h4 className="font-bold text-lg mb-3" style={{ color: '#5D5CDE' }}>✅ تأكيد الإرسال</h4>
                        <p className="text-sm text-gray-700 mb-4">بعد إرسال الطلب، سنتواصل معك خلال 24 ساعة عمل لتأكيد التفاصيل والبدء في التنفيذ.</p>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-4">
                          <input checked={formData.confirmTerms} onChange={(e) => setFormData({ ...formData, confirmTerms: e.target.checked })} type="checkbox" className="w-5 h-5" id="terms" />
                          <label htmlFor="terms" className="text-sm">أوافق على <a href="#" className="font-medium" style={{ color: '#5D5CDE' }}>الشروط والأحكام</a></label>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2">
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane"></i>
                              إرسال الطلب النهائي
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t">
              <button type="button" onClick={prevStep} className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-medium text-sm sm:text-base ${currentStep === 1 && currentOrderTab === 'service' ? 'invisible' : ''}`}>
                <i className="fas fa-arrow-right"></i> رجوع
              </button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button type="button" onClick={saveDraft} className="px-4 sm:px-5 py-2.5 sm:py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2 font-medium text-sm sm:text-base order-2 sm:order-1">
                  <i className="fas fa-save"></i> حفظ المسودة
                </button>
                {currentStep < 4 && (
                  <button type="button" onClick={nextStep} className="px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 font-medium text-sm sm:text-base order-1 sm:order-2" style={{ backgroundColor: '#5D5CDE' }}>
                    التالي <i className="fas fa-arrow-left"></i>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-green-600 mb-6" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
              <i className="fas fa-check text-3xl"></i>
            </div>
            <h3 className="font-bold text-xl mb-3">تم إرسال طلبك بنجاح! 🎉</h3>
            <p className="text-gray-600 mb-6">شكراً لثقتك بمرحال جو. سنوافيك بالرد خلال 24 ساعة عمل.</p>
            <button onClick={() => { setShowSuccessModal(false); navigate('/customer/dashboard'); }} className="px-6 py-3 text-white rounded-lg w-full font-medium" style={{ backgroundColor: '#5D5CDE' }}>
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheinShippingForm;