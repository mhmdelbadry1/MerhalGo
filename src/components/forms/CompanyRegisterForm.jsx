import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompanyRegisterForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    representativeName: '',
    phoneCode: '+20',
    phoneNumber: '',
    whatsappCode: '+20',
    whatsappNumber: '',
    headquarterAddress: '',
    mainActivity: '',
    otherActivity: '',
    governorates: '',
    shippingMethods: [],
    siteName: '',
    chineseMethods: [],
    commercialRegisterNumber: '',
    taxCardNumber: '',
    commercialRegisterFile: null,
    taxCardFile: null,
    businessLicenseFile: null,
    additionalDocsFiles: [],
    additionalNotes: ''
  });

  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = () => {
    const draft = localStorage.getItem('mirhal_partner_draft');
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  };

  const saveDraft = () => {
    localStorage.setItem('mirhal_partner_draft', JSON.stringify({ ...formData, currentStep }));
    showErrorMessage('تم حفظ المسودة بنجاح');
    setTimeout(() => setShowError(false), 1500);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentArray = prev[type] || [];
      if (checked) {
        return { ...prev, [type]: [...currentArray, value] };
      } else {
        return { ...prev, [type]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorMessage('حجم الملف كبير جداً. الحد الأقصى 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleMultipleFiles = (e) => {
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    if (totalSize > 10 * 1024 * 1024) {
      showErrorMessage('الحجم الإجمالي للملفات كبير جداً. الحد الأقصى 10MB');
      return;
    }
    setFormData(prev => ({ ...prev, additionalDocsFiles: files }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.companyName || !formData.representativeName || !formData.phoneNumber || 
            !formData.whatsappNumber || !formData.headquarterAddress || !formData.mainActivity) {
          showErrorMessage('يرجى ملء جميع الحقول المطلوبة');
          return false;
        }
        if (formData.mainActivity === 'other' && !formData.otherActivity) {
          showErrorMessage('يرجى تحديد النشاط الآخر');
          return false;
        }
        break;
        
      case 2:
        const activity = formData.mainActivity;
        if (activity === 'local' && !formData.governorates) {
          showErrorMessage('يرجى إدخال المحافظات');
          return false;
        }
        if (activity === 'international' && formData.shippingMethods.length === 0) {
          showErrorMessage('يرجى اختيار طريقة شحن واحدة على الأقل');
          return false;
        }
        if (activity === 'chinese') {
          if (!formData.siteName || formData.chineseMethods.length === 0) {
            showErrorMessage('يرجى إدخال اسم الموقع واختيار طريقة شحن');
            return false;
          }
        }
        break;
        
      case 3:
        if (!formData.commercialRegisterNumber || !formData.taxCardNumber || 
            !formData.commercialRegisterFile || !formData.taxCardFile) {
          showErrorMessage('يرجى إدخال أرقام السجل التجاري والبطاقة الضريبية ورفع الملفات المطلوبة');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const clearForm = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      setFormData({
        companyName: '', representativeName: '', phoneCode: '+20', phoneNumber: '',
        whatsappCode: '+20', whatsappNumber: '', headquarterAddress: '',
        mainActivity: '', otherActivity: '', governorates: '', shippingMethods: [],
        siteName: '', chineseMethods: [], commercialRegisterNumber: '',
        taxCardNumber: '', commercialRegisterFile: null, taxCardFile: null,
        businessLicenseFile: null, additionalDocsFiles: [], additionalNotes: ''
      });
      setCurrentStep(1);
      localStorage.removeItem('mirhal_partner_draft');
      showErrorMessage('تم مسح النموذج بنجاح');
      setTimeout(() => setShowError(false), 1500);
    }
  };

  const submitForm = () => {
    if (validateStep(4)) {
      // Save to localStorage
      const requests = JSON.parse(localStorage.getItem('mirhal_company_requests') || '[]');
      requests.push({
        id: Date.now(),
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('mirhal_company_requests', JSON.stringify(requests));
      
      // Clear draft
      localStorage.removeItem('mirhal_partner_draft');
      
      // Show success
      setShowSuccess(true);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    navigate('/');
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-route text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">مرحال جو</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">تسجيل الشركات</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <i className="fas fa-times text-gray-600 dark:text-gray-300"></i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        <div className="max-w-4xl mx-auto">
          
          {/* Welcome Message */}
          <div className="text-center mb-8 fade-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-3xl mx-auto mb-4">
              <i className="fas fa-handshake"></i>
            </div>
            <h2 className="text-3xl font-bold mb-2">انضم كشريك معنا</h2>
            <p className="text-gray-600 dark:text-gray-400">سجل شركتك الآن وكن جزءاً من شبكة وسطاء مرحال</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-4">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className="text-xs">
                    {step === 1 ? 'بيانات الشركة' : step === 2 ? 'الخدمات' : step === 3 ? 'المستندات' : 'إنهاء'}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-6">
            
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 fade-in">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <i className="fas fa-building text-primary"></i>
                  بيانات الشركة
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم الشركة *</label>
                    <input 
                      name="companyName"
                      type="text" 
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="أدخل اسم الشركة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الشخصي لممثل الشركة *</label>
                    <input 
                      name="representativeName"
                      type="text"
                      value={formData.representativeName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="أدخل اسم الممثل"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                      <div className="flex gap-2">
                        <select 
                          name="phoneCode"
                          value={formData.phoneCode}
                          onChange={handleInputChange}
                          className="w-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="+20">+20</option>
                          <option value="+966">+966</option>
                          <option value="+971">+971</option>
                          <option value="+1">+1</option>
                        </select>
                        <input 
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                          placeholder="010xxxxxxxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">رقم الواتساب *</label>
                      <div className="flex gap-2">
                        <select 
                          name="whatsappCode"
                          value={formData.whatsappCode}
                          onChange={handleInputChange}
                          className="w-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="+20">+20</option>
                          <option value="+966">+966</option>
                          <option value="+971">+971</option>
                          <option value="+1">+1</option>
                        </select>
                        <input 
                          name="whatsappNumber"
                          type="tel"
                          value={formData.whatsappNumber}
                          onChange={handleInputChange}
                          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                          placeholder="010xxxxxxxx"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المقر الرئيسي (عنوان تفصيلي) *</label>
                    <textarea 
                      name="headquarterAddress"
                      rows="3"
                      value={formData.headquarterAddress}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="المحافظة، المدينة، الشارع، رقم المبنى..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">النشاط الرئيسي *</label>
                    <select 
                      name="mainActivity"
                      value={formData.mainActivity}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">اختر النشاط</option>
                      <option value="local">شحن محلي</option>
                      <option value="international">شحن دولي</option>
                      <option value="customs">تخليص جمركي</option>
                      <option value="chinese">شحن من مواقع صينية</option>
                      <option value="shein">شحن من شي إن</option>
                      <option value="other">أخرى</option>
                    </select>
                  </div>

                  {formData.mainActivity === 'other' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">حدد النشاط الآخر *</label>
                      <input 
                        name="otherActivity"
                        type="text"
                        value={formData.otherActivity}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                        placeholder="اذكر النشاط"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 fade-in">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <i className="fas fa-cogs text-primary"></i>
                  خدمات الشركة
                </h3>
                
                {/* Local Shipping */}
                {formData.mainActivity === 'local' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">المحافظات التي تخدمها الشركة *</label>
                      <textarea 
                        name="governorates"
                        rows="3"
                        value={formData.governorates}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                        placeholder="مثال: القاهرة، الجيزة، الإسكندرية..."
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">يمكنك ذكر أكثر من محافظة</p>
                    </div>
                  </div>
                )}

                {/* International Shipping */}
                {formData.mainActivity === 'international' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">طرق الشحن المتوفرة * (يمكن اختيار أكثر من واحدة)</label>
                      <div className="space-y-3">
                        {['land', 'air', 'sea'].map(method => (
                          <label key={method} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              value={method}
                              checked={formData.shippingMethods.includes(method)}
                              onChange={(e) => handleCheckboxChange(e, 'shippingMethods')}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                              <i className={`fas ${method === 'land' ? 'fa-truck text-orange-600' : method === 'air' ? 'fa-plane text-blue-600' : 'fa-ship text-purple-600'}`}></i>
                              <span>{method === 'land' ? 'شحن بري' : method === 'air' ? 'شحن جوي' : 'شحن بحري'}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Chinese Sites */}
                {formData.mainActivity === 'chinese' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم الموقع *</label>
                      <input 
                        name="siteName"
                        type="text"
                        value={formData.siteName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                        placeholder="مثال: Alibaba, Taobao, 1688"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">طريقة الشحن * (يمكن اختيار أكثر من واحدة)</label>
                      <div className="space-y-3">
                        {['land', 'air', 'sea'].map(method => (
                          <label key={method} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              value={method}
                              checked={formData.chineseMethods.includes(method)}
                              onChange={(e) => handleCheckboxChange(e, 'chineseMethods')}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                            />
                            <div className="flex items-center gap-2">
                              <i className={`fas ${method === 'land' ? 'fa-truck text-orange-600' : method === 'air' ? 'fa-plane text-blue-600' : 'fa-ship text-purple-600'}`}></i>
                              <span>{method === 'land' ? 'شحن بري' : method === 'air' ? 'شحن جوي' : 'شحن بحري'}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Activities */}
                {(formData.mainActivity === 'customs' || formData.mainActivity === 'shein' || formData.mainActivity === 'other') && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">معلومات إضافية</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">يمكنك الانتقال للخطوة التالية مباشرة. سنتواصل معك لمعرفة تفاصيل الخدمات بشكل أكثر دقة.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 fade-in">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <i className="fas fa-file-upload text-primary"></i>
                  المستندات الرسمية
                </h3>
                
                <div className="space-y-6">
                  {/* Commercial Register */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم السجل التجاري *</label>
                    <input 
                      name="commercialRegisterNumber"
                      type="text"
                      value={formData.commercialRegisterNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent mb-3" 
                      placeholder="أدخل رقم السجل التجاري"
                    />
                    
                    <div 
                      onClick={() => document.getElementById('commercialRegisterFile').click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                        formData.commercialRegisterFile 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="commercialRegisterFile"
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileUpload(e, 'commercialRegisterFile')}
                      />
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formData.commercialRegisterFile ? `✓ ${formData.commercialRegisterFile.name}` : 'اضغط لرفع ملف السجل التجاري *'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (حد أقصى 5MB)</p>
                    </div>
                  </div>

                  {/* Tax Card */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم البطاقة الضريبية *</label>
                    <input 
                      name="taxCardNumber"
                      type="text"
                      value={formData.taxCardNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent mb-3" 
                      placeholder="أدخل رقم البطاقة الضريبية"
                    />
                    
                    <div 
                      onClick={() => document.getElementById('taxCardFile').click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                        formData.taxCardFile 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="taxCardFile"
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileUpload(e, 'taxCardFile')}
                      />
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formData.taxCardFile ? `✓ ${formData.taxCardFile.name}` : 'اضغط لرفع ملف البطاقة الضريبية *'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (حد أقصى 5MB)</p>
                    </div>
                  </div>

                  {/* Business License (Optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">رخصة مزاولة النشاط (اختياري)</label>
                    <div 
                      onClick={() => document.getElementById('businessLicenseFile').click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                        formData.businessLicenseFile 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="businessLicenseFile"
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={(e) => handleFileUpload(e, 'businessLicenseFile')}
                      />
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formData.businessLicenseFile ? `✓ ${formData.businessLicenseFile.name}` : 'اضغط لرفع رخصة مزاولة النشاط'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG (حد أقصى 5MB)</p>
                    </div>
                  </div>

                  {/* Additional Documents (Optional) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">مستندات إضافية (اختياري)</label>
                    <div 
                      onClick={() => document.getElementById('additionalDocsFile').click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                        formData.additionalDocsFiles.length > 0 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="additionalDocsFile"
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        multiple
                        onChange={handleMultipleFiles}
                      />
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formData.additionalDocsFiles.length > 0 
                          ? formData.additionalDocsFiles.map(f => f.name).join(', ')
                          : 'اضغط لرفع مستندات إضافية'}
                      </p>
                      <p className="text-xs text-gray-500">يمكن رفع أكثر من ملف - PDF, JPG, PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Notes & Submit */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 fade-in">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <i className="fas fa-check-circle text-primary"></i>
                  ملاحظات وإرسال
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">هل ترغب في إضافة أي تفاصيل؟</label>
                    <textarea 
                      name="additionalNotes"
                      rows="5"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-base focus:ring-2 focus:ring-primary focus:border-transparent" 
                      placeholder="أي ملاحظات أو تفاصيل إضافية تود إضافتها..."
                    ></textarea>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-info-circle text-green-600 dark:text-green-400 text-xl mt-1"></i>
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">قبل الإرسال</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <li>• تأكد من صحة جميع البيانات المدخلة</li>
                          <li>• تأكد من رفع المستندات المطلوبة</li>
                          <li>• سيتم مراجعة طلبكم خلال 48 ساعة عمل</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 flex-wrap gap-3">
              <button 
                type="button" 
                onClick={prevStep}
                className={`px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors btn-bounce ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                <i className="fas fa-arrow-right ml-2"></i>
                السابق
              </button>
              
              <div className="flex gap-3 mr-auto flex-wrap">
                <button 
                  type="button" 
                  onClick={clearForm}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors btn-bounce"
                >
                  <i className="fas fa-trash ml-2"></i>
                  مسح
                </button>
                
                <button 
                  type="button" 
                  onClick={saveDraft}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors btn-bounce"
                >
                  <i className="fas fa-save ml-2"></i>
                  حفظ كمسودة
                </button>
                
                {currentStep < 4 ? (
                  <button 
                    type="button" 
                    onClick={nextStep}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors btn-bounce"
                  >
                    التالي
                    <i className="fas fa-arrow-left mr-2"></i>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={submitForm}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors btn-bounce"
                  >
                    <i className="fas fa-paper-plane ml-2"></i>
                    إرسال الطلب
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-md w-full mx-4 text-center fade-in">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 text-3xl mx-auto mb-4">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="text-xl font-bold mb-3 text-green-900 dark:text-green-100">شكراً لتقديم طلبكم</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">سيتم مراجعة بياناتكم والتواصل معكم خلال 48 ساعة عمل.</p>
            <button 
              onClick={closeSuccessModal}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors btn-bounce"
            >
              موافق
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 text-2xl mx-auto mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-lg font-semibold mb-2">تنبيه</h3>
            <div className="text-gray-600 dark:text-gray-400 mb-4">{errorMessage}</div>
            <button 
              onClick={() => setShowError(false)}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors btn-bounce"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRegisterForm;
