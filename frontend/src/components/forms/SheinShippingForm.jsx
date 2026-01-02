import React, { useState, useEffect } from 'react';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import storageService from '../../services/storage.service';
import { useTranslation } from 'react-i18next';

const SheinShippingFullForm = () => {
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productCounter, setProductCounter] = useState(0);
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    clientName: '', phoneCountry: '+20', phoneNumber: '', waCountry: '+20', waNumber: '',
    clientType: '', clientTypeOther: '', saveClient: false,
    serviceType: '', importCard: '',
    orderNumber: '', marketplace: 'Shein', marketplaceOther: '',
    shipMode: '',
    hasHazmat: '', hazmatType: '', totalWeight: '', totalValue: '',
    recvCountry: '', recvPort: '', recvAddress: '',
    howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
  });

  const portsData = {
    'مصر': ['الإسكندرية', 'بورسعيد', 'القاهرة'],
    'السعودية': ['جدة', 'الرياض', 'الدمام'],
    'الإمارات': ['دبي', 'أبو ظبي', 'الشارقة']
  };

  useEffect(() => {
    const draft = localStorage.getItem('mirhal_shein_draft');
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
      } catch (e) { addProduct(); }
    } else {
      addProduct();
    }
  }, []);

  const saveDraft = () => {
    const data = { ...formData, products };
    localStorage.setItem('mirhal_shein_draft', JSON.stringify(data));
    showSuccess('تم حفظ المسودة بنجاح');
  };

  const clearForm = () => {
    if (!confirm('هل أنت متأكد؟')) return;
    setFormData({
      clientName: '', phoneCountry: '+20', phoneNumber: '', waCountry: '+20', waNumber: '',
      clientType: '', clientTypeOther: '', saveClient: false, serviceType: '', importCard: '',
      orderNumber: '', marketplace: 'Shein', marketplaceOther: '', shipMode: '',
      hasHazmat: '', hazmatType: '', totalWeight: '', totalValue: '',
      recvCountry: '', recvPort: '', recvAddress: '',
      howFound: '', referralName: '', referralPhone: '', additionalNotes: ''
    });
    setProducts([]);
    setProductCounter(0);
    addProduct();
    setCurrentStep(1);
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.clientName || !formData.phoneNumber || !formData.waNumber || !formData.clientType) {
          showError('أدخل جميع البيانات المطلوبة'); return false;
        }
        if (formData.clientType === 'أخرى' && !formData.clientTypeOther) { showError('حدد نوع العميل'); return false; }
        break;
      case 2:
        if (!formData.serviceType) { showError('اختر نوع الخدمة'); return false; }
        if (formData.serviceType === 'شحن+تخليص' && !formData.importCard) { showError('حدد إذا كان لديك بطاقة استيراد'); return false; }
        break;
      case 3:
        if (!formData.orderNumber || !formData.marketplace) { showError('أدخل بيانات الطلب'); return false; }
        if (formData.marketplace === 'Other' && !formData.marketplaceOther) { showError('اكتب اسم الموقع'); return false; }
        if (products.length === 0) { showError('أضف منتجًا واحدًا على الأقل'); return false; }
        for (let i = 0; i < products.length; i++) {
          const p = products[i];
          if (!p.link || !p.name || !p.qty || !p.price) {
            showError(`أكمل بيانات المنتج رقم ${i + 1}`); return false;
          }
        }
        break;
      case 4:
        if (!formData.shipMode) { showError('اختر طريقة الشحن'); return false; }
        break;
      case 5:
        if (!formData.hasHazmat || !formData.totalWeight) { showError('أكمل تفاصيل المنتجات'); return false; }
        if (formData.hasHazmat === 'نعم' && !formData.hazmatType) { showError('اذكر نوع المواد'); return false; }
        break;
      case 6:
        if (!formData.recvCountry || !formData.recvPort || !formData.recvAddress) {
          showError('أكمل بيانات التوصيل'); return false;
        }
        break;
      case 7:
        if (!formData.howFound) { showError('أخبرنا كيف علمت بنا'); return false; }
        if (formData.howFound === 'referral' && (!formData.referralName || !formData.referralPhone)) {
          showError('أدخل بيانات العميل السابق'); return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => { if (validateStep(currentStep) && currentStep < 7) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

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
        products,
        files: uploadedFileParams,
        type: 'shein'
      };

      await orderService.createOrder('shein', orderData);
      
      localStorage.removeItem('mirhal_shein_draft');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Order submission error:', error);
      showError(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = () => {
    if (products.length >= 10) { showError('الحد الأقصى 10 منتجات'); return; }
    setProducts([...products, { id: productCounter + 1, link: '', name: '', qty: '', price: '', note: '' }]);
    setProductCounter(productCounter + 1);
  };

  const removeProduct = (id) => {
    if (products.length === 1) { showError('يجب أن يكون هناك منتج واحد على الأقل'); return; }
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
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

  return (
    <div className="bg-gray-50 min-h-screen" style={{ fontFamily: 'Cairo, sans-serif' }} dir="rtl">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: '#5D5CDE' }}>
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#5D5CDE' }}>طلب شحن من شي إن — مرحال جو</h1>
              <p className="text-sm text-gray-500">املأ البيانات المطلوبة — سنوافيك بعروض خلال 24 ساعة عمل</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-center mb-2">
              {['1. العميل', '2. الخدمة', '3. الطلب', '4. شحن', '5. بضاعة', '6. توصيل', '7. النهاية'].map((text, i) => (
                <div key={i} className="w-1/7">{text}</div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progressPercentage}%`, backgroundColor: '#5D5CDE' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">1 — بيانات عامة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">الاسم الكامل</label>
                    <input value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} type="text" className="w-full p-3 border rounded-lg" placeholder="أدخل الاسم الكامل" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">كود الدولة + رقم الهاتف</label>
                    <div className="flex gap-2">
                      <select value={formData.phoneCountry} onChange={(e) => setFormData({...formData, phoneCountry: e.target.value})} className="p-3 border rounded-lg w-28">
                        <option value="+20">+20</option>
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                      </select>
                      <input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} type="tel" className="flex-1 p-3 border rounded-lg" placeholder="رقم الموبايل" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">كود الدولة + رقم الواتساب</label>
                    <div className="flex gap-2">
                      <select value={formData.waCountry} onChange={(e) => setFormData({...formData, waCountry: e.target.value})} className="p-3 border rounded-lg w-28">
                        <option value="+20">+20</option>
                        <option value="+966">+966</option>
                        <option value="+971">+971</option>
                      </select>
                      <input value={formData.waNumber} onChange={(e) => setFormData({...formData, waNumber: e.target.value})} type="tel" className="flex-1 p-3 border rounded-lg" placeholder="رقم الواتساب" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">نوع العميل</label>
                    <select value={formData.clientType} onChange={(e) => setFormData({...formData, clientType: e.target.value})} className="p-3 border rounded-lg w-full">
                      <option value="">اختر نوع العميل</option>
                      <option value="فرد">فرد</option>
                      <option value="تاجر">تاجر</option>
                      <option value="شركة">شركة</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                    {formData.clientType === 'أخرى' && (
                      <input value={formData.clientTypeOther} onChange={(e) => setFormData({...formData, clientTypeOther: e.target.value})} type="text" className="mt-2 p-3 border rounded-lg w-full" placeholder="اذكر نوع العميل" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input checked={formData.saveClient} onChange={(e) => setFormData({...formData, saveClient: e.target.checked})} type="checkbox" className="w-4 h-4" id="save" />
                    <label htmlFor="save" className="text-sm">حفظ بيانات العميل</label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">2 — نوع الخدمة</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="serviceType" value="شحن فقط" checked={formData.serviceType === 'شحن فقط'} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} className="mt-1" />
                    <div>
                      <div className="font-medium">شحن فقط</div>
                      <div className="text-xs text-gray-500">توصيل لميناء الوصول أو مكان العميل</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="serviceType" value="تخليص فقط" checked={formData.serviceType === 'تخليص فقط'} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} className="mt-1" />
                    <div>
                      <div className="font-medium">تخليص جمركي فقط</div>
                      <div className="text-xs text-gray-500">لو العميل عنده شحنة قائمة بالميناء</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="serviceType" value="شحن+تخليص" checked={formData.serviceType === 'شحن+تخليص'} onChange={(e) => setFormData({...formData, serviceType: e.target.value})} className="mt-1" />
                    <div>
                      <div className="font-medium">شحن + تخليص جمركي</div>
                      <div className="text-xs text-gray-500">استيراد كامل حتى مكان العميل</div>
                    </div>
                  </label>
                </div>
                {formData.serviceType === 'شحن+تخليص' && (
                  <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                    <label className="block text-sm mb-1 font-medium">هل لديك بطاقة استيراد أم تحتاج وسيط؟</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="importCard" value="have" checked={formData.importCard === 'have'} onChange={(e) => setFormData({...formData, importCard: e.target.value})} /> عندي بطاقة
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="importCard" value="need" checked={formData.importCard === 'need'} onChange={(e) => setFormData({...formData, importCard: e.target.value})} /> محتاج وسيط
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">3 — تفاصيل الطلب من شي إن</h2>
                <div className="mb-4">
                  <label className="block text-sm mb-1">رقم الطلب (Order Number)</label>
                  <input value={formData.orderNumber} onChange={(e) => setFormData({...formData, orderNumber: e.target.value})} type="text" className="w-full p-3 border rounded-lg" placeholder="رقم الطلب من شي إن" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">الموقع</label>
                  <select value={formData.marketplace} onChange={(e) => setFormData({...formData, marketplace: e.target.value})} className="p-3 border rounded-lg w-full">
                    <option value="Shein">Shein</option>
                    <option value="Other">آخر</option>
                  </select>
                  {formData.marketplace === 'Other' && (
                    <input value={formData.marketplaceOther} onChange={(e) => setFormData({...formData, marketplaceOther: e.target.value})} type="text" className="mt-2 p-3 border rounded-lg w-full" placeholder="اكتب اسم الموقع" />
                  )}
                </div>

                <div className="space-y-4 mb-4">
                  {products.map((product, index) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">منتج {index + 1}</h3>
                        {products.length > 1 && (
                          <button type="button" onClick={() => removeProduct(product.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">حذف</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-sm mb-1">رابط المنتج (URL)</label>
                          <input value={product.link} onChange={(e) => updateProduct(product.id, 'link', e.target.value)} type="url" className="w-full p-3 border rounded-lg" placeholder="https://" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">اسم المنتج</label>
                          <input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} type="text" className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">الكمية</label>
                          <input value={product.qty} onChange={(e) => updateProduct(product.id, 'qty', e.target.value)} type="number" min="1" className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">السعر (USD)</label>
                          <input value={product.price} onChange={(e) => updateProduct(product.id, 'price', e.target.value)} type="number" step="0.01" className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">ملاحظات (اختياري)</label>
                          <input value={product.note} onChange={(e) => updateProduct(product.id, 'note', e.target.value)} type="text" className="w-full p-3 border rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addProduct} className="px-3 py-2 text-white rounded-lg" style={{ backgroundColor: '#5D5CDE' }}>+ إضافة منتج جديد</button>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">4 — طريقة الشحن المفضلة</h2>
                <div className="space-y-3">
                  {[
                    { value: 'جوي', label: 'جوي (أسرع — أغلى)' },
                    { value: 'بحري', label: 'بحري (أرخص — أبطأ)' },
                    { value: 'بري', label: 'بري (متاح لبعض الدول)' },
                    { value: 'غير_محدد', label: 'لست متأكد' }
                  ].map(mode => (
                    <label key={mode.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="shipMode" value={mode.value} checked={formData.shipMode === mode.value} onChange={(e) => setFormData({...formData, shipMode: e.target.value})} /> {mode.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">5 — تفاصيل المنتجات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">هل تحتوي على سوائل أو مواد خطرة؟</label>
                    <select value={formData.hasHazmat} onChange={(e) => setFormData({...formData, hasHazmat: e.target.value})} className="p-3 border rounded-lg w-full">
                      <option value="">اختر</option>
                      <option value="نعم">نعم</option>
                      <option value="لا">لا</option>
                    </select>
                    {formData.hasHazmat === 'نعم' && (
                      <div className="mt-2">
                        <label className="block text-sm mb-1">اذكر نوع المواد</label>
                        <input value={formData.hazmatType} onChange={(e) => setFormData({...formData, hazmatType: e.target.value})} type="text" className="w-full p-3 border rounded-lg" placeholder="بطاريات — عطور — سوائل" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">الوزن الكلي التقريبي (كجم)</label>
                    <input value={formData.totalWeight} onChange={(e) => setFormData({...formData, totalWeight: e.target.value})} type="number" step="0.01" className="w-full p-3 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">القيمة الكلية التقريبية (USD)</label>
                    <input value={formData.totalValue} onChange={(e) => setFormData({...formData, totalValue: e.target.value})} type="number" step="0.01" className="w-full p-3 border rounded-lg" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">6 — بيانات التوصيل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">الدولة</label>
                    <select value={formData.recvCountry} onChange={(e) => setFormData({...formData, recvCountry: e.target.value, recvPort: ''})} className="p-3 border rounded-lg w-full">
                      <option value="">اختر الدولة</option>
                      <option value="مصر">مصر</option>
                      <option value="السعودية">السعودية</option>
                      <option value="الإمارات">الإمارات</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">المدينة/الميناء/المطار</label>
                    <select value={formData.recvPort} onChange={(e) => setFormData({...formData, recvPort: e.target.value})} className="p-3 border rounded-lg w-full">
                      <option value="">اختر</option>
                      {(portsData[formData.recvCountry] || []).map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">العنوان التفصيلي للتسليم</label>
                    <textarea value={formData.recvAddress} onChange={(e) => setFormData({...formData, recvAddress: e.target.value})} className="w-full p-3 border rounded-lg" rows="3" placeholder="الشارع، العمارة، تفاصيل..."></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7 */}
            {currentStep === 7 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">7 — معلومات إضافية</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">كيف علمت بخدماتنا؟</label>
                    <select value={formData.howFound} onChange={(e) => setFormData({...formData, howFound: e.target.value})} className="p-3 border rounded-lg w-full">
                      <option value="">اختر</option>
                      <option value="website">موقع الشركة</option>
                      <option value="referral">عميل سابق</option>
                      <option value="social">سوشيال ميديا</option>
                    </select>
                    {formData.howFound === 'referral' && (
                      <div className="mt-2 space-y-2">
                        <input value={formData.referralName} onChange={(e) => setFormData({...formData, referralName: e.target.value})} type="text" className="w-full p-3 border rounded-lg" placeholder="اسم العميل السابق" />
                        <input value={formData.referralPhone} onChange={(e) => setFormData({...formData, referralPhone: e.target.value})} type="tel" className="w-full p-3 border rounded-lg" placeholder="رقم العميل السابق" />
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700"><i className="fas fa-gift text-green-600 mr-2"></i>العميل السابق سيتكافأ بكاش باك</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">ملاحظات إضافية</label>
                    <textarea value={formData.additionalNotes} onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})} className="w-full p-3 border rounded-lg" rows="5" placeholder="أي ملاحظات أو تعليمات..."></textarea>
                  </div>
                  
                  <div className="md:col-span-2 mt-4">
                    <label className="block text-sm mb-2">مرفقات (اختياري)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors bg-gray-50">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="shein-file-upload"
                      />
                      <label htmlFor="shein-file-upload" className="cursor-pointer flex flex-col items-center">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <span className="text-sm text-gray-600">اضغط لرفع الملفات (صور الفاتورة، سكرين شوت، الخ)</span>
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
            <div className="flex justify-between items-center pt-6">
              <button type="button" onClick={prevStep} className={`px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ${currentStep === 1 ? 'invisible' : ''}`}>السابق</button>
              <div className="flex gap-3">
                <button type="button" onClick={saveDraft} className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">حفظ</button>
                <button type="button" onClick={clearForm} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">مسح</button>
                {currentStep < 7 ? (
                  <button type="button" onClick={nextStep} className="px-6 py-3 text-white rounded-lg hover:bg-opacity-90" style={{ backgroundColor: '#5D5CDE' }}>التالي</button>
                ) : (
                  <button 
  type="submit" 
  disabled={isSubmitting}
  className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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

export default SheinShippingFullForm;