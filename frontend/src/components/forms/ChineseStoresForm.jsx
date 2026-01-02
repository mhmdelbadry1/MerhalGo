import React, { useState, useEffect } from 'react';
import orderService from '../../services/order.service';
import storageService from '../../services/storage.service';
import { useToast } from '../../contexts/ToastContext';

const ChineseStoresFullForm = () => {
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [productCounter, setProductCounter] = useState(0);
  const [products, setProducts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Form Data State
  const [formData, setFormData] = useState({
    clientName: '', phoneCountry: '', phoneNumber: '', waCountry: '', waNumber: '',
    clientType: '', clientTypeOther: '', saveClient: false, serviceType: '', importCard: '',
    marketplace: '', marketplaceOther: '', aggregation: '', shipMode: '',
    totalWeight: '', packaging: '', packagingOther: '', isFragile: '', fragilePacking: '',
    hasHazmat: '', hazmatType: '', recvCountry: '', recvPort: '', recvAddress: '',
    howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
  });

  // Ports and airports data
  const portsData = {
    'مصر': ['الإسكندرية - ميناء الإسكندرية', 'بورسعيد - ميناء بورسعيد', 'دمياط - ميناء دمياط'],
    'الصين': ['ميناء نينغبو', 'ميناء شنغهاي', 'ميناء شنتشن'],
    'السعودية': ['ميناء جدة', 'ميناء الدمام', 'ميناء الجبيل']
  };

  const airportsData = {
    'مصر': ['مطار القاهرة الدولي', 'مطار برج العرب'],
    'الصين': ['مطار بكين', 'مطار شنغهاي', 'مطار قوانزو'],
    'السعودية': ['مطار الملك عبدالعزيز', 'مطار الملك خالد', 'مطار الملك فهد']
  };

  const areasData = {
    'مصر': ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'طنطا'],
    'الصين': ['بكين', 'شنغهاي', 'قوانزو', 'شنتشن'],
    'السعودية': ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة']
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('mirhal_china_full_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
        if (parsed.products && parsed.products.length > 0) {
          setProducts(parsed.products);
          setProductCounter(parsed.products.length);
        } else {
          addProduct();
        }
      } catch (e) {
        console.error('Error loading draft:', e);
        addProduct();
      }
    } else {
      addProduct();
    }
  }, []);

  const saveDraft = () => {
    const data = { ...formData, products };
    localStorage.setItem('mirhal_china_full_draft', JSON.stringify(data));
    showSuccess('تم حفظ المسودة بنجاح! ✅');
  };

  const clearForm = () => {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات؟')) return;
    setFormData({
      clientName: '', phoneCountry: '', phoneNumber: '', waCountry: '', waNumber: '',
      clientType: '', clientTypeOther: '', saveClient: false, serviceType: '', importCard: '',
      marketplace: '', marketplaceOther: '', aggregation: '', shipMode: '',
      totalWeight: '', packaging: '', packagingOther: '', isFragile: '', fragilePacking: '',
      hasHazmat: '', hazmatType: '', files: null, recvCountry: '', recvPort: '', recvAddress: '',
      howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
    });
    setProducts([]);
    setProductCounter(0);
    addProduct();
    setCurrentStep(1);
  };

  // Navigation with conditional logic
  const nextStep = () => {
    // Validate before moving
    if (!validateStep(currentStep)) return;

    // Special case: if at products step and only one product, skip aggregation step
    if (currentStep === 3) {
      const productCount = products.length;
      if (productCount === 1) {
        // If service is clearance-only, go to receiving(7)
        if (formData.serviceType === 'تخليص فقط') {
          setCurrentStep(7);
          return;
        }
        // Otherwise skip aggregation(4) and go to shipping(5)
        setCurrentStep(5);
        return;
      }
    }

    // Flow when service is "تخليص فقط": 1 -> 2 -> 3 -> 7 -> 8 (skip 4, 5, 6)
    if (formData.serviceType === 'تخليص فقط') {
      if (currentStep === 1) { setCurrentStep(2); return; }
      if (currentStep === 2) { setCurrentStep(3); return; }
      if (currentStep === 3) { setCurrentStep(7); return; }
      if (currentStep === 7) { setCurrentStep(8); return; }
    }

    // Normal flow
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Special flow for "تخليص فقط"
    if (formData.serviceType === 'تخليص فقط') {
      if (currentStep === 8) { setCurrentStep(7); return; }
      if (currentStep === 7) { setCurrentStep(3); return; }
      if (currentStep === 3) { setCurrentStep(2); return; }
      if (currentStep === 2) { setCurrentStep(1); return; }
    }

    // Special case: if coming back from step 5 and had only 1 product, go back to step 3
    if (currentStep === 5 && products.length === 1) {
      setCurrentStep(3);
      return;
    }

    // Normal flow
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation
  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.clientName || !formData.phoneCountry || !formData.phoneNumber || 
            !formData.waCountry || !formData.waNumber || !formData.clientType) {
          showError('من فضلك أدخل جميع البيانات المطلوبة');
          return false;
        }
        if (formData.clientType === 'other' && !formData.clientTypeOther) {
          showError('اذكر نوع العميل');
          return false;
        }
        break;
      case 2:
        if (!formData.serviceType) {
          showError('اختر نوع الخدمة');
          return false;
        }
        if (formData.serviceType === 'شحن+تخليص' && !formData.importCard) {
          showError('حدد إذا كان لديك بطاقة استيراد');
          return false;
        }
        break;
      case 3:
        if (!formData.marketplace) {
          showError('اختر الموقع');
          return false;
        }
        if (formData.marketplace === 'other' && !formData.marketplaceOther) {
          showError('اكتب اسم الموقع');
          return false;
        }
        if (products.length === 0) {
          showError('أضف منتجًا واحدًا على الأقل');
          return false;
        }
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (!p.link) {
            showError(`من فضلك أدخل رابط المنتج رقم ${i + 1}`);
            return false;
          }
          if (!p.name) {
            showError(`من فضلك أدخل اسم المنتج رقم ${i + 1}`);
            return false;
          }
          if (!p.qty || Number(p.qty) <= 0) {
            showError(`ادخل الكمية المطلوبة للمنتج رقم ${i + 1}`);
            return false;
          }
          if (p.hasColors === 'yes') {
            if (p.colors.length === 0) {
              showError(`أضف لونًا واحدًا على الأقل للمنتج رقم ${i + 1}`);
              return false;
            }
            for (let c of p.colors) {
              if (!c.name || !c.qty || Number(c.qty) <= 0) {
                showError(`أدخل اسم وكمية صحيحة لكل لون في المنتج رقم ${i + 1}`);
                return false;
              }
            }
          }
          if (p.hasSizes === 'yes') {
            if (p.sizes.length === 0) {
              showError(`أضف مقاسًا واحدًا على الأقل للمنتج رقم ${i + 1}`);
              return false;
            }
            for (let s of p.sizes) {
              if (!s.name || !s.qty || Number(s.qty) <= 0) {
                showError(`أدخل اسم وكمية صحيحة لكل مقاس في المنتج رقم ${i + 1}`);
                return false;
              }
            }
          }
        }
        break;
      case 4:
        if (!formData.aggregation) {
          showError('اختر طريقة التجميع');
          return false;
        }
        break;
      case 5:
        if (!formData.shipMode) {
          showError('اختر طريقة الشحن');
          return false;
        }
        break;
      case 6:
        if (!formData.totalWeight || Number(formData.totalWeight) <= 0) {
          showError('الرجاء إدخال الوزن الكلي للشحنة');
          return false;
        }
        if (!formData.packaging) {
          showError('اختر طريقة التغليف');
          return false;
        }
        if (formData.packaging === 'other' && !formData.packagingOther) {
          showError('اذكر نوع التغليف');
          return false;
        }
        if (!formData.isFragile) {
          showError('حدد إذا كانت المنتجات قابلة للكسر');
          return false;
        }
        if (formData.isFragile === 'نعم' && !formData.fragilePacking) {
          showError('اذكر طريقة التغليف المطلوبة');
          return false;
        }
        if (!formData.hasHazmat) {
          showError('حدد إذا كانت الشحنة تحتوي على مواد خطرة');
          return false;
        }
        if (formData.hasHazmat === 'نعم' && !formData.hazmatType) {
          showError('اذكر نوع المواد الخطرة');
          return false;
        }
        break;
      case 7:
        if (!formData.recvCountry) {
          showError('اختر الدولة');
          return false;
        }
        if (!formData.recvPort) {
          showError('اختر الميناء/المطار/المدينة');
          return false;
        }
        // Address is required only if NOT "تخليص فقط"
        if (formData.serviceType !== 'تخليص فقط' && !formData.recvAddress) {
          showError('الرجاء إدخال العنوان التفصيلي للتسليم');
          return false;
        }
        break;
      case 8:
        if (!formData.howFound) {
          showError('من فضلك أخبرنا كيف علمت بخدماتنا');
          return false;
        }
        if (formData.howFound === 'referral' && (!formData.referralName || !formData.referralPhone)) {
          showError('من فضلك أدخل اسم ورقم العميل السابق');
          return false;
        }
        break;
    }
    return true;
  };

  // Products Management
  const addProduct = () => {
    if (products.length >= 10) {
      alert('الحد الأقصى 10 منتجات');
      return;
    }
    const newProduct = {
      id: productCounter + 1,
      link: '', name: '', qty: '',
      hasColors: 'no', colors: [],
      hasSizes: 'no', sizes: [],
      note: ''
    };
    setProducts([...products, newProduct]);
    setProductCounter(productCounter + 1);
  };

  const removeProduct = (id) => {
    if (products.length === 1) {
      alert('يجب أن يكون هناك منتج واحد على الأقل');
      return;
    }
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addColorRow = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, colors: [...p.colors, { name: '', qty: '' }] };
      }
      return p;
    }));
  };

  const removeColorRow = (productId, colorIndex) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, colors: p.colors.filter((_, i) => i !== colorIndex) };
      }
      return p;
    }));
  };

  const updateColor = (productId, colorIndex, field, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newColors = p.colors.map((c, i) => 
          i === colorIndex ? { ...c, [field]: value } : c
        );
        return { ...p, colors: newColors };
      }
      return p;
    }));
  };

  const addSizeRow = (productId) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, sizes: [...p.sizes, { name: '', qty: '' }] };
      }
      return p;
    }));
  };

  const removeSizeRow = (productId, sizeIndex) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, sizes: p.sizes.filter((_, i) => i !== sizeIndex) };
      }
      return p;
    }));
  };

  const updateSize = (productId, sizeIndex, field, value) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const newSizes = p.sizes.map((s, i) => 
          i === sizeIndex ? { ...s, [field]: value } : s
        );
        return { ...p, sizes: newSizes };
      }
      return p;
    }));
  };

  // File Handling
  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Optional: Validate size/type here
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Update ports/airports when country changes
  const updatePortsAirports = () => {
    const country = formData.recvCountry;
    const mode = formData.shipMode;
    
    if (!country) return [];
    
    if (mode === 'بحري') return portsData[country] || [];
    if (mode === 'جوي') return airportsData[country] || [];
    return areasData[country] || [];
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(8)) return;

    try {
      setIsSubmitting(true);

      // Upload files first
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
        products,
        files: uploadedFileParams,
        type: 'chinese'
      };

      await orderService.createOrder('chinese', orderData);

      localStorage.removeItem('mirhal_china_full_draft');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Order submission error:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    clearForm();
  };

  const progressPercentage = (currentStep / 8) * 100;

  // Determine if step should be shown (for conditional rendering)
  const shouldShowStep = (step) => {
    if (formData.serviceType === 'تخليص فقط') {
      // Hide steps 4, 5, 6 when "تخليص فقط"
      if (step === 4 || step === 5 || step === 6) return false;
    }
    return true;
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#5D5CDE' }}>
              <i className="fas fa-store"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#5D5CDE' }}>نموذج — شحن من المتاجر الصينية</h1>
              <p className="text-sm text-gray-500">املأ البيانات المطلوبة — سنوافيك بعروض خلال 24 ساعة عمل</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-center mb-2">
              <div style={{width: '12.5%'}}>1. العميل</div>
              <div style={{width: '12.5%'}}>2. الخدمة</div>
              <div style={{width: '12.5%'}}>3. المنتجات</div>
              <div style={{width: '12.5%'}}>4. التجميع</div>
              <div style={{width: '12.5%'}}>5. الشحن</div>
              <div style={{width: '12.5%'}}>6. تفاصيل</div>
              <div style={{width: '12.5%'}}>7. الاستلام</div>
              <div style={{width: '12.5%'}}>8. النهاية</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Client Info */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">1 — بيانات العميل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">كود الدولة + رقم الهاتف</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.phoneCountry}
                        onChange={(e) => setFormData({ ...formData, phoneCountry: e.target.value })}
                        className="p-3 border rounded-lg w-28"
                      >
                        <option value="">اختر</option>
                        <option value="+20">+20</option>
                        <option value="+86">+86</option>
                        <option value="+1">+1</option>
                        <option value="+966">+966</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="flex-1 p-3 border rounded-lg"
                        placeholder="رقم الموبايل"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">كود الدولة + رقم الواتساب</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.waCountry}
                        onChange={(e) => setFormData({ ...formData, waCountry: e.target.value })}
                        className="p-3 border rounded-lg w-28"
                      >
                        <option value="">اختر</option>
                        <option value="+20">+20</option>
                        <option value="+86">+86</option>
                        <option value="+1">+1</option>
                        <option value="+966">+966</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.waNumber}
                        onChange={(e) => setFormData({ ...formData, waNumber: e.target.value })}
                        className="flex-1 p-3 border rounded-lg"
                        placeholder="رقم الواتساب"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">نوع العميل</label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">اختر نوع العميل</option>
                      <option value="فرد">فرد</option>
                      <option value="تاجر">تاجر</option>
                      <option value="شركة">شركة</option>
                      <option value="مصنع">مصنع</option>
                      <option value="other">أخرى</option>
                    </select>
                    {formData.clientType === 'other' && (
                      <input
                        type="text"
                        value={formData.clientTypeOther}
                        onChange={(e) => setFormData({ ...formData, clientTypeOther: e.target.value })}
                        className="mt-2 p-3 border rounded-lg w-full"
                        placeholder="اذكر نوع العميل"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.saveClient}
                      onChange={(e) => setFormData({ ...formData, saveClient: e.target.checked })}
                      className="w-4 h-4"
                      id="saveClient"
                    />
                    <label htmlFor="saveClient" className="text-sm">حفظ بيانات العميل (للمرات القادمة)</label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Service Type */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">2 — نوع الخدمة</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="serviceType"
                      value="شحن فقط"
                      checked={formData.serviceType === 'شحن فقط'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">شحن فقط</div>
                      <div className="text-xs text-gray-500">توصيل لميناء الوصول (بدون تخليص جمركي)</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="serviceType"
                      value="تخليص فقط"
                      checked={formData.serviceType === 'تخليص فقط'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">تخليص جمركي فقط</div>
                      <div className="text-xs text-gray-500">تخليص شحنة موجودة بالميناء دون شحن</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="serviceType"
                      value="شحن+تخليص"
                      checked={formData.serviceType === 'شحن+تخليص'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">شحن + تخليص جمركي</div>
                      <div className="text-xs text-gray-500">استيراد كامل حتى المنزل/المخزن</div>
                    </div>
                  </label>

                  {formData.serviceType === 'شحن+تخليص' && (
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                      <label className="block text-sm mb-2 font-medium">هل لديك بطاقة استيراد أم تحتاج وسيط؟</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="importCard"
                            value="have"
                            checked={formData.importCard === 'have'}
                            onChange={(e) => setFormData({ ...formData, importCard: e.target.value })}
                          />
                          عندي بطاقة
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="importCard"
                            value="need"
                            checked={formData.importCard === 'need'}
                            onChange={(e) => setFormData({ ...formData, importCard: e.target.value })}
                          />
                          محتاج وسيط
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Products */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">3 — تفاصيل المنتجات</h2>
                
                <div className="mb-4">
                  <label className="block text-sm mb-1">الموقع</label>
                  <select
                    value={formData.marketplace}
                    onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                    className="p-3 border rounded-lg w-full"
                  >
                    <option value="">اختر الموقع</option>
                    <option value="alibaba">Alibaba</option>
                    <option value="1688">1688</option>
                    <option value="aliexpress">AliExpress</option>
                    <option value="taobao">Taobao</option>
                    <option value="tmall">Tmall</option>
                    <option value="jd">JD.com</option>
                    <option value="pinduoduo">Pinduoduo</option>
                    <option value="other">موقع آخر</option>
                  </select>
                  {formData.marketplace === 'other' && (
                    <input
                      type="text"
                      value={formData.marketplaceOther}
                      onChange={(e) => setFormData({ ...formData, marketplaceOther: e.target.value })}
                      className="mt-2 p-3 border rounded-lg w-full"
                      placeholder="اكتب اسم الموقع"
                    />
                  )}
                </div>

                {/* Products List */}
                <div className="space-y-4 mb-4">
                  {products.map((product, index) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">منتج {index + 1}</h3>
                        {products.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            حذف
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm mb-1">رابط المنتج (URL)</label>
                          <input
                            type="url"
                            value={product.link}
                            onChange={(e) => updateProduct(product.id, 'link', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="https://"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">اسم المنتج</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="مثال: جاكيت رجالي"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">الكمية المطلوبة (إجمالي)</label>
                          <input
                            type="number"
                            value={product.qty}
                            onChange={(e) => updateProduct(product.id, 'qty', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            min="1"
                            placeholder="مثال: 10"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm mb-1">هل يحتاج هذا المنتج لتحديد لون؟</label>
                          <select
                            value={product.hasColors}
                            onChange={(e) => {
                              updateProduct(product.id, 'hasColors', e.target.value);
                              if (e.target.value === 'yes' && product.colors.length === 0) {
                                addColorRow(product.id);
                              }
                            }}
                            className="p-3 border rounded-lg w-full"
                          >
                            <option value="no">لا</option>
                            <option value="yes">نعم</option>
                          </select>

                          {product.hasColors === 'yes' && (
                            <div className="mt-2">
                              <div className="flex gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => addColorRow(product.id)}
                                  className="px-2 py-1 text-white rounded text-sm"
                                  style={{ backgroundColor: '#5D5CDE' }}
                                >
                                  + إضافة لون
                                </button>
                                <div className="text-xs text-gray-500 self-center">عند إضافة أكثر من لون، أدخل كمية لكل لون (مطلوب)</div>
                              </div>
                              {product.colors.map((color, colorIndex) => (
                                <div key={colorIndex} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) => updateColor(product.id, colorIndex, 'name', e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                    placeholder="اللون (مثال: أسود)"
                                  />
                                  <input
                                    type="number"
                                    value={color.qty}
                                    onChange={(e) => updateColor(product.id, colorIndex, 'qty', e.target.value)}
                                    className="w-28 p-2 border rounded"
                                    placeholder="الكمية"
                                    min="1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeColorRow(product.id, colorIndex)}
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm mb-1">هل يحتاج هذا المنتج لتحديد مقاس؟</label>
                          <select
                            value={product.hasSizes}
                            onChange={(e) => {
                              updateProduct(product.id, 'hasSizes', e.target.value);
                              if (e.target.value === 'yes' && product.sizes.length === 0) {
                                addSizeRow(product.id);
                              }
                            }}
                            className="p-3 border rounded-lg w-full"
                          >
                            <option value="no">لا</option>
                            <option value="yes">نعم</option>
                          </select>

                          {product.hasSizes === 'yes' && (
                            <div className="mt-2">
                              <div className="flex gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={() => addSizeRow(product.id)}
                                  className="px-2 py-1 text-white rounded text-sm"
                                  style={{ backgroundColor: '#5D5CDE' }}
                                >
                                  + إضافة مقاس
                                </button>
                                <div className="text-xs text-gray-500 self-center">أدخل المقاس وكمية كل مقاس (مطلوب عند تفعيل)</div>
                              </div>
                              {product.sizes.map((size, sizeIndex) => (
                                <div key={sizeIndex} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    value={size.name}
                                    onChange={(e) => updateSize(product.id, sizeIndex, 'name', e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                    placeholder="المقاس (مثال: L)"
                                  />
                                  <input
                                    type="number"
                                    value={size.qty}
                                    onChange={(e) => updateSize(product.id, sizeIndex, 'qty', e.target.value)}
                                    className="w-28 p-2 border rounded"
                                    placeholder="الكمية"
                                    min="1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeSizeRow(product.id, sizeIndex)}
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                  >
                                    حذف
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm mb-1">ملاحظات عن المنتج (اختياري)</label>
                          <textarea
                            value={product.note}
                            onChange={(e) => updateProduct(product.id, 'note', e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="مثال: أريد 5 باللون أسود و 5 بالأبيض"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addProduct}
                  className="px-6 py-3 text-white rounded-lg hover:bg-opacity-90"
                  style={{ backgroundColor: '#5D5CDE' }}
                >
                  + إضافة منتج آخر
                </button>
              </div>
            )}

            {/* STEP 4: Aggregation */}
            {currentStep === 4 && shouldShowStep(4) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">4 — التجميع</h2>
                <p className="text-sm text-gray-500 mb-4">هل تريد تجميع المنتجات في مستودعنا قبل الشحن؟</p>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="aggregation"
                      value="no"
                      checked={formData.aggregation === 'no'}
                      onChange={(e) => setFormData({ ...formData, aggregation: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">لا، شحن مباشر</div>
                      <div className="text-xs text-gray-500">شحن المنتجات فور وصولها للمستودع</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="aggregation"
                      value="yes"
                      checked={formData.aggregation === 'yes'}
                      onChange={(e) => setFormData({ ...formData, aggregation: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">نعم، تجميع ثم شحن</div>
                      <div className="text-xs text-gray-500">انتظر وصول جميع المنتجات ثم شحن دفعة واحدة</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Shipping Method */}
            {currentStep === 5 && shouldShowStep(5) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">5 — طريقة الشحن</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipMode"
                      value="جوي"
                      checked={formData.shipMode === 'جوي'}
                      onChange={(e) => setFormData({ ...formData, shipMode: e.target.value })}
                      className="ml-2"
                    />
                    <span>جوي</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipMode"
                      value="بحري"
                      checked={formData.shipMode === 'بحري'}
                      onChange={(e) => setFormData({ ...formData, shipMode: e.target.value })}
                      className="ml-2"
                    />
                    <span>بحري</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipMode"
                      value="بري"
                      checked={formData.shipMode === 'بري'}
                      onChange={(e) => setFormData({ ...formData, shipMode: e.target.value })}
                      className="ml-2"
                    />
                    <span>بري (اختياري لبعض المسارات)</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="shipMode"
                      value="غير_محدد"
                      checked={formData.shipMode === 'غير_محدد'}
                      onChange={(e) => setFormData({ ...formData, shipMode: e.target.value })}
                      className="ml-2"
                    />
                    <span>لست متأكد</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 6: Details */}
            {currentStep === 6 && shouldShowStep(6) && (
              <div>
                <h2 className="text-lg font-semibold mb-4">6 — تفاصيل الشحنة</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">الوزن الكلي للشحنة (كجم)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalWeight}
                      onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="مثال: 12.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">طريقة التغليف</label>
                    <select
                      value={formData.packaging}
                      onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="">اختر</option>
                      <option value="كراتين">كراتين</option>
                      <option value="باليت">باليِت</option>
                      <option value="براميل">براميل</option>
                      <option value="أكياس">أكياس</option>
                      <option value="other">أخرى</option>
                    </select>
                    {formData.packaging === 'other' && (
                      <input
                        type="text"
                        value={formData.packagingOther}
                        onChange={(e) => setFormData({ ...formData, packagingOther: e.target.value })}
                        className="mt-2 p-3 border rounded-lg w-full"
                        placeholder="اذكر نوع التغليف"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">هل المنتجات قابلة للكسر؟</label>
                    <select
                      value={formData.isFragile}
                      onChange={(e) => setFormData({ ...formData, isFragile: e.target.value })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">اختر</option>
                      <option value="نعم">نعم</option>
                      <option value="لا">لا</option>
                    </select>
                    {formData.isFragile === 'نعم' && (
                      <div className="mt-2">
                        <label className="block text-sm mb-1">اذكر طريقة التغليف المطلوبة</label>
                        <input
                          type="text"
                          value={formData.fragilePacking}
                          onChange={(e) => setFormData({ ...formData, fragilePacking: e.target.value })}
                          className="w-full p-3 border rounded-lg"
                          placeholder="مثال: تغليف بالفقاعات / كراتين مضاعفة"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">هل تحتوي الشحنة على مواد خطرة؟ (بطاريات - سوائل - أخرى)</label>
                    <select
                      value={formData.hasHazmat}
                      onChange={(e) => setFormData({ ...formData, hasHazmat: e.target.value })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">اختر</option>
                      <option value="نعم">نعم</option>
                      <option value="لا">لا</option>
                    </select>
                    {formData.hasHazmat === 'نعم' && (
                      <div className="mt-2">
                        <label className="block text-sm mb-1">اذكر نوع المواد الخطرة</label>
                        <input
                          type="text"
                          value={formData.hazmatType}
                          onChange={(e) => setFormData({ ...formData, hazmatType: e.target.value })}
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">رفع ملفات (فاتورة / صور / كتالوج) — اختياري</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors bg-gray-50">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <span className="text-sm text-gray-600">اضغط لرفع الملفات</span>
                        <span className="text-xs text-gray-400 mt-1">الحد الأقصى 5 ميجا لكل ملف</span>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                <i className="fas fa-file"></i>
                              </div>
                              <div className="text-sm">
                                <p className="font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
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

            {/* STEP 7: Delivery */}
            {currentStep === 7 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">7 — بيانات الاستلام</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">الدولة</label>
                    <select
                      value={formData.recvCountry}
                      onChange={(e) => setFormData({ ...formData, recvCountry: e.target.value, recvPort: '' })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">اختر الدولة</option>
                      <option value="مصر">مصر</option>
                      <option value="الصين">الصين</option>
                      <option value="السعودية">السعودية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">الميناء / المطار / المدينة</label>
                    <select
                      value={formData.recvPort}
                      onChange={(e) => setFormData({ ...formData, recvPort: e.target.value })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">-- اختر --</option>
                      {updatePortsAirports().map((port, i) => (
                        <option key={i} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address is required only if NOT "تخليص فقط" */}
                  {formData.serviceType !== 'تخليص فقط' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1">العنوان التفصيلي للتسليم (إجباري للحالات الشحن)</label>
                      <textarea
                        value={formData.recvAddress}
                        onChange={(e) => setFormData({ ...formData, recvAddress: e.target.value })}
                        className="w-full p-3 border rounded-lg"
                        rows="2"
                        placeholder="مثال: شارع، عمارة، تفاصيل..."
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 8: Final */}
            {currentStep === 8 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">8 — إنهاء الطلب</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">كيف علمت بخدماتنا؟</label>
                    <select
                      value={formData.howFound}
                      onChange={(e) => setFormData({ ...formData, howFound: e.target.value })}
                      className="p-3 border rounded-lg w-full"
                    >
                      <option value="">اختر</option>
                      <option value="website">موقع الشركة</option>
                      <option value="referral">عميل سابق</option>
                      <option value="social">سوشيال ميديا</option>
                    </select>

                    {formData.howFound === 'referral' && (
                      <div className="mt-2">
                        <label className="block text-sm mb-1">اسم العميل السابق</label>
                        <input
                          type="text"
                          value={formData.referralName}
                          onChange={(e) => setFormData({ ...formData, referralName: e.target.value })}
                          className="w-full p-3 border rounded-lg mb-2"
                          placeholder="اسم العميل السابق"
                        />
                        <label className="block text-sm mb-1">رقم العميل السابق</label>
                        <input
                          type="tel"
                          value={formData.referralPhone}
                          onChange={(e) => setFormData({ ...formData, referralPhone: e.target.value })}
                          className="w-full p-3 border rounded-lg"
                          placeholder="رقم العميل السابق"
                          inputMode="numeric"
                        />
                        <p className="text-xs text-green-600 mt-2">ملاحظة: العميل السابق سيحصل على كاش باك عند إتمام الشحنة.</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">ملاحظات إضافية</label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      rows="5"
                      placeholder="اكتب أي ملاحظات أو تعليمات..."
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500 mb-3">راجع بياناتك قبل الإرسال. سنوافيك برد خلال 24 ساعة عمل.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t pt-6">
              <button
                type="button"
                onClick={prevStep}
                className={`px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ${currentStep === 1 ? 'invisible' : ''}`}
              >
                السابق
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  مسح
                </button>
                {currentStep < 8 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-5 py-2 text-white rounded-lg hover:bg-opacity-90"
                    style={{ backgroundColor: '#5D5CDE' }}
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center text-green-600 mb-4 text-2xl">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="font-semibold text-lg mb-2">تم إرسال الطلب</h3>
            <p className="text-sm text-gray-600 mb-4">شكراً لاستخدامك مرحال جو. سنوافيك بالرد خلال 24 ساعة عمل.</p>
            <button
              onClick={closeSuccess}
              className="px-4 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#5D5CDE' }}
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChineseStoresFullForm;