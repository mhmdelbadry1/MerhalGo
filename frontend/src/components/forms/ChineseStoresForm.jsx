import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/order.service';
import { useToast } from '../../contexts/ToastContext';
import storageService from '../../services/storage.service';

/**
 * ✅ Converted from your HTML into a single React JSX component.
 * - Keeps your structure, classes, and dynamic behavior.
 * - Replaces inline onclick/onchange with React handlers.
 * - Replaces DOM queries + innerHTML injections with React state rendering.
 * - Uses localStorage for auto-save exactly like your script.
 *
 * NOTE:
 * - Tailwind must be enabled in your React project (not via CDN).
 * - FontAwesome: either install @fortawesome or keep your kit in index.html.
 */

const ChineseStoresForm = () => {
  /**********************
   Cities
  **********************/
  const egyptCities = useMemo(
    () => [
      "القاهرة",
      "الجيزة",
      "الإسكندرية",
      "بورسعيد",
      "السويس",
      "المنصورة",
      "طنطا",
      "الإسماعيلية",
      "أسيوط",
      "الأقصر",
      "أسوان",
      "بنها",
      "كفر الشيخ",
      "دمنهور",
      "الزقازيق",
      "سوهاج",
      "قنا",
      "العريش",
    ],
    []
  );

  const saudiCities = useMemo(
    () => [
      "الرياض",
      "جدة",
      "الدمام",
      "مكة المكرمة",
      "المدينة المنورة",
      "الخبر",
      "الطائف",
      "تبوك",
      "الجبيل",
      "حائل",
      "نجران",
      "أبها",
      "ينبع",
      "الظهران",
      "القطيف",
      "الاحساء",
      "عرعر",
    ],
    []
  );

  const uaeCities = useMemo(
    () => [
      "دبي",
      "أبوظبي",
      "الشارقة",
      "عجمان",
      "رأس الخيمة",
      "الفجيرة",
      "أم القيوين",
      "العين",
      "الرويس",
      "دبا",
    ],
    []
  );

  /**********************
   State
  **********************/
  const totalSteps = 4;

  // Navigation and notifications
  const navigate = useNavigate();
  const { showSuccess: showSuccessToast, showError: showErrorToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [currentOrderTab, setCurrentOrderTab] = useState("service"); // service | marketplaceProducts | shipmentDetails
  const [selectedService, setSelectedService] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("");
  const [selectedProductMethod, setSelectedProductMethod] = useState("manual"); // manual | cartLink

  const [showSuccess, setShowSuccess] = useState(false);
  const [draftNotice, setDraftNotice] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] = useState([]);

  const autoSaveTimeoutRef = useRef(null);
  const isAutoSavingRef = useRef(false);

  // Products state (manual method)
  const [products, setProducts] = useState(() => [
    {
      id: 1,
      link: "",
      name: "",
      qty: "",
      hasColors: "no",
      hasSizes: "no",
      note: "",
      colors: [],
      sizes: [],
    },
  ]);
  const nextProductIdRef = useRef(2);

  // Form fields (grouped)
  const [form, setForm] = useState({
    // Step 1
    clientName: "",
    phoneCountry: "+20",
    phoneNumber: "",
    phoneOther: "",
    waCountry: "+20",
    waNumber: "",
    waOther: "",
    clientType: "",
    clientTypeOther: "",
    saveClient: false,

    // Step 2
    marketplaceOther: "",
    cartLink: "",
    shipmentDescription: "",

    // Step 3
    shipMode: "",
    needsPackaging: "",
    packaging: "",
    packagingOther: "",
    isFragile: "",
    hasHazmat: "",
    hazmatType: "",

    // Addresses (dynamic)
    chinaCity: "",
    chinaPhone: "",
    chinaAddress: "",
    chinaDeliveryCity: "",
    chinaDeliveryPhone: "",
    chinaDeliveryAddress: "",

    deliveryCountry: "",
    deliveryCity: "",
    deliveryDistrict: "",
    deliveryAddress: "",
    deliveryCountryOther: "",
    deliveryCityOther: "",

    // Step 4
    howFound: "",
    referralName: "",
    referralPhone: "",
    additionalNotes: "",
    confirmTerms: false,
  });

  const deliveryCities = useMemo(() => {
    if (form.deliveryCountry === "مصر") return egyptCities;
    if (form.deliveryCountry === "السعودية") return saudiCities;
    if (form.deliveryCountry === "الإمارات") return uaeCities;
    return [];
  }, [form.deliveryCountry, egyptCities, saudiCities, uaeCities]);

  const bigCities = useMemo(
    () => ["القاهرة", "الجيزة", "الإسكندرية", "الرياض", "جدة", "الدمام", "دبي", "أبوظبي"],
    []
  );

  const showDistrictField = useMemo(() => bigCities.includes(form.deliveryCity), [bigCities, form.deliveryCity]);

  /**********************
   Helpers
  **********************/
  function showToast() {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2000);
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function triggerAutoSave() {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => autoSaveDraft(), 1000);
  }

  function collectAllFormData() {
    return {
      ...form,
      serviceType: selectedService,
      marketplace: selectedMarketplace,
      productMethod: selectedProductMethod,
      products: selectedService !== "شحن فقط" && selectedProductMethod === "manual" ? products : [],
      files: files?.map((f) => ({ name: f.name, size: f.size, type: f.type })) || [],
      currentStep,
      currentOrderTab,
      lastSaved: new Date().toISOString(),
    };
  }

  function autoSaveDraft() {
    if (isAutoSavingRef.current) return;
    isAutoSavingRef.current = true;

    try {
      const data = collectAllFormData();
      localStorage.setItem("mirhal_china_auto_draft", JSON.stringify(data));
      showToast();
      // eslint-disable-next-line no-console
      console.log("✅ تم الحفظ التلقائي للبيانات");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("❌ خطأ في الحفظ التلقائي:", e);
    } finally {
      isAutoSavingRef.current = false;
    }
  }

  function clearAutoDraft() {
    localStorage.removeItem("mirhal_china_auto_draft");
  }

  function saveDraft() {
    const data = collectAllFormData();
    localStorage.setItem("mirhal_china_smart_draft_4steps", JSON.stringify(data));
    alert("✅ تم حفظ المسودة بنجاح");
  }

  function loadAutoDraft() {
    const raw = localStorage.getItem("mirhal_china_auto_draft");
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      if (data && Object.keys(data).length > 0) {
        setDraftNotice(true);

        // restore states
        setForm((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(data).filter(([k]) => k in prev)),
        }));

        setSelectedService(data.serviceType || "");
        setSelectedMarketplace(data.marketplace || "");
        setSelectedProductMethod(data.productMethod || "manual");
        setCurrentStep(data.currentStep || 1);
        setCurrentOrderTab(data.currentOrderTab || "service");
        setProducts(Array.isArray(data.products) && data.products.length ? data.products.map((p, i) => ({
          id: p.id ?? i + 1,
          link: p.link || "",
          name: p.name || "",
          qty: p.qty || "",
          hasColors: p.hasColors || "no",
          hasSizes: p.hasSizes || "no",
          note: p.note || "",
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
        })) : [
          {
            id: 1,
            link: "",
            name: "",
            qty: "",
            hasColors: "no",
            hasSizes: "no",
            note: "",
            colors: [],
            sizes: [],
          },
        ]);

        // update next id
        const maxId = (Array.isArray(data.products) ? data.products : []).reduce((m, p) => Math.max(m, Number(p.id || 0)), 1);
        nextProductIdRef.current = Math.max(maxId + 1, 2);

        return true;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("❌ خطأ في تحميل البيانات المحفوظة تلقائياً:", e);
    }
    return false;
  }

  /**********************
   Init
  **********************/
  useEffect(() => {
    // Load autosave once
    loadAutoDraft();

    // initial autosave
    const t = setTimeout(() => triggerAutoSave(), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on most changes
  useEffect(() => {
    triggerAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, selectedService, selectedMarketplace, selectedProductMethod, products, currentStep, currentOrderTab]);

  /**********************
   Tabs logic for Step 2
  **********************/
  const tabs = useMemo(() => {
    const base = [{ key: "service", label: "نوع الخدمة", icon: "fas fa-cog" }];

    if (selectedService === "شحن فقط") {
      base.push({ key: "shipmentDetails", label: "مواصفات المنتج", icon: "fas fa-box" });
    } else if (selectedService === "شراء فقط" || selectedService === "شراء+شحن") {
      base.push({ key: "marketplaceProducts", label: "الموقع & المنتجات", icon: "fas fa-store" });
    }

    return base;
  }, [selectedService]);

  function switchOrderTab(tabName) {
    setCurrentOrderTab(tabName);
    setTimeout(() => {
      const el = document.getElementById("orderTabsContent");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function selectService(serviceType) {
    setSelectedService(serviceType);

    // Adjust tab default
    if (serviceType === "شحن فقط") {
      setCurrentOrderTab("shipmentDetails");
    } else {
      setCurrentOrderTab("marketplaceProducts");
    }

    // If shipping only => ignore products
    if (serviceType === "شحن فقط") {
      // keep products state but won't validate/use
    } else {
      // ensure at least 1 product if manual
      if (selectedProductMethod === "manual" && products.length === 0) {
        setProducts([
          {
            id: nextProductIdRef.current++,
            link: "",
            name: "",
            qty: "",
            hasColors: "no",
            hasSizes: "no",
            note: "",
            colors: [],
            sizes: [],
          },
        ]);
      }
    }
  }

  function selectMarketplace(m) {
    setSelectedMarketplace(m);
  }

  function selectProductMethod(method) {
    setSelectedProductMethod(method);
  }

  /**********************
   Products
  **********************/
  function addProduct() {
    if (selectedService === "شحن فقط" || selectedProductMethod === "cartLink") return;
    if (products.length >= 10) return alert("⚠️ الحد الأقصى 10 منتجات");

    setProducts((prev) => [
      ...prev,
      {
        id: nextProductIdRef.current++,
        link: "",
        name: "",
        qty: "",
        hasColors: "no",
        hasSizes: "no",
        note: "",
        colors: [],
        sizes: [],
      },
    ]);
  }

  function removeProduct(id) {
    if (selectedService === "شحن فقط" || selectedProductMethod === "cartLink") return;
    if (products.length <= 1) return alert("⚠️ يجب أن يكون هناك منتج واحد على الأقل");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function addColorRow(productId) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, colors: [...p.colors, { name: "", qty: "" }] } : p
      )
    );
  }

  function removeColorRow(productId, idx) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, colors: p.colors.filter((_, i) => i !== idx) } : p
      )
    );
  }

  function updateColorRow(productId, idx, patch) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const colors = p.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c));
        return { ...p, colors };
      })
    );
  }

  function addSizeRow(productId) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, sizes: [...p.sizes, { name: "", qty: "" }] } : p
      )
    );
  }

  function removeSizeRow(productId, idx) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, sizes: p.sizes.filter((_, i) => i !== idx) } : p
      )
    );
  }

  function updateSizeRow(productId, idx, patch) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const sizes = p.sizes.map((s, i) => (i === idx ? { ...s, ...patch } : s));
        return { ...p, sizes };
      })
    );
  }

  /**********************
   Navigation
  **********************/
  function scrollToStep(step) {
    setTimeout(() => {
      const el = document.querySelector(`[data-step="${step}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function showStep(step) {
    setCurrentStep(step);

    // dynamic updates when entering steps
    if (step === 2) {
      if (!selectedService) setCurrentOrderTab("service");
      else setCurrentOrderTab(selectedService === "شحن فقط" ? "shipmentDetails" : "marketplaceProducts");
    }
    if (step === 4) {
      // summary computed via memo
    }

    scrollToStep(step);
  }

  /**********************
   Validation (mirrors your JS)
  **********************/
  function showError(message) {
    alert(`❌ ${message}`);
    return false;
  }

  function validateServiceTab() {
    if (!selectedService) return showError("⚠️ من فضلك اختر نوع الخدمة أولاً");
    return true;
  }

  function validateStep(step) {
    if (step === 1) {
      if (!form.clientName.trim()) return showError("من فضلك أدخل الاسم الكامل");

      if (!form.phoneCountry) return showError("اختر كود الدولة للهاتف");
      if (form.phoneCountry === "other" && !form.phoneOther.trim()) return showError("أدخل كود الدولة للهاتف");
      if (!form.phoneNumber.trim()) return showError("من فضلك أدخل رقم الهاتف");

      if (!form.waCountry) return showError("اختر كود الدولة للواتساب");
      if (form.waCountry === "other" && !form.waOther.trim()) return showError("أدخل كود الدولة للواتساب");
      if (!form.waNumber.trim()) return showError("من فضلك أدخل رقم الواتساب");

      if (!form.clientType) return showError("اختر نوع العميل");
      if (form.clientType === "other" && !form.clientTypeOther.trim()) return showError("اذكر نوع العميل");
    }

    if (step === 2) {
      if (currentOrderTab === "service") {
        if (!selectedService) return showError("اختر نوع الخدمة");
      } else if (currentOrderTab === "marketplaceProducts") {
        if (!selectedMarketplace) return showError("اختر الموقع الرئيسي");
        if (selectedMarketplace === "other" && !form.marketplaceOther.trim()) return showError("اكتب اسم الموقع");

        if (!selectedProductMethod) return showError("اختر طريقة إضافة المنتجات");

        if (selectedProductMethod === "cartLink") {
          if (!form.cartLink.trim()) return showError("من فضلك أدخل لينك الباج");
          if (!form.cartLink.trim().startsWith("http")) return showError("الرجاء إدخال رابط صحيح يبدأ بـ http أو https");
        } else {
          if (products.length === 0) return showError("أضف منتجًا واحدًا على الأقل");
          for (let i = 0; i < products.length; i++) {
            const p = products[i];
            if (!p.link.trim()) return showError(`أدخل رابط المنتج رقم ${i + 1}`);
            if (!p.name.trim()) return showError(`أدخل اسم المنتج رقم ${i + 1}`);
            if (!p.qty || Number(p.qty) <= 0) return showError(`أدخل كمية صحيحة للمنتج رقم ${i + 1}`);
          }
        }
      } else if (currentOrderTab === "shipmentDetails") {
        if (!form.shipmentDescription.trim()) return showError("من فضلك اكتب وصف الشحنة");
        if (form.shipmentDescription.trim().length < 10) return showError("من فضلك اكتب وصفًا مفصلاً للشحنة");
      }
    }

    if (step === 3) {
      const serviceType = selectedService;

      if (serviceType === "شراء فقط") {
        if (!form.chinaDeliveryCity.trim()) return showError("أدخل المدينة في الصين");
        if (!form.chinaDeliveryPhone.trim()) return showError("أدخل رقم هاتف المستلم");
        if (!form.chinaDeliveryAddress.trim()) return showError("أدخل العنوان في الصين");
      } else {
        if (!form.shipMode) return showError("اختر طريقة الشحن");

        if (serviceType === "شحن فقط") {
          if (!form.chinaCity.trim()) return showError("أدخل المدينة في الصين");
          if (!form.chinaPhone.trim()) return showError("أدخل رقم هاتف المورد");
          if (!form.chinaAddress.trim()) return showError("أدخل العنوان في الصين");
        }

        if (serviceType === "شحن فقط" || serviceType === "شراء+شحن") {
          if (!form.deliveryCountry) return showError("اختر البلد");
          if (!form.deliveryCity) return showError("اختر المدينة/المنطقة");
          if (!form.deliveryAddress.trim()) return showError("أدخل العنوان التفصيلي");
        }
      }

      if (form.needsPackaging === "نعم") {
        if (!form.packaging) return showError("اختر طريقة التغليف");
        if (form.packaging === "other" && !form.packagingOther.trim()) return showError("اذكر طريقة التغليف");
      }

      if (form.hasHazmat === "نعم" && !form.hazmatType.trim()) {
        return showError("اذكر نوع المواد الخطرة");
      }
    }

    if (step === 4) {
      if (!form.confirmTerms) return showError("يجب الموافقة على الشروط والأحكام");
    }

    return true;
  }

  function nextStep() {
    if (currentStep === 2) {
      if (currentOrderTab === "service") {
        if (!validateServiceTab()) return;

        if (selectedService === "شحن فقط") switchOrderTab("shipmentDetails");
        else switchOrderTab("marketplaceProducts");
        return;
      }

      if (currentOrderTab === "marketplaceProducts" || currentOrderTab === "shipmentDetails") {
        if (!validateStep(2)) return;
      }
    } else {
      if (!validateStep(currentStep)) return;
    }

    if (currentStep < totalSteps) showStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep === 2 && (currentOrderTab === "marketplaceProducts" || currentOrderTab === "shipmentDetails")) {
      switchOrderTab("service");
      return;
    }
    if (currentStep > 1) showStep(currentStep - 1);
  }

  /**********************
   Summary (Step 4)
  **********************/
  const finalSummary = useMemo(() => {
    const clientName = form.clientName || "غير محدد";
    const phone = form.phoneNumber || "غير محدد";
    const clientType = form.clientType || "غير محدد";
    const serviceType = selectedService || "غير محدد";

    const summary = {
      client: { clientName, phone, clientType },
      order: {
        serviceType,
        marketplace: selectedMarketplace || "غير محدد",
        productMethod: selectedProductMethod === "cartLink" ? "لينك الباج" : "يدوي",
        productCount: products.length,
        cartLink: form.cartLink || "",
        shipmentDescription: form.shipmentDescription || "",
      },
      shipping: {
        shipMode: form.shipMode || "غير محدد",
        packaging:
          form.needsPackaging === "نعم"
            ? form.packaging === "other"
              ? form.packagingOther || "غير محدد"
              : form.packaging || "غير محدد"
            : "لا يحتاج",
      },
      addresses: {
        chinaCity: form.chinaCity || "غير محدد",
        deliveryCountry: form.deliveryCountry || "غير محدد",
        deliveryCity: form.deliveryCity || "غير محدد",
        deliveryDistrict: form.deliveryDistrict || "",
        chinaDeliveryCity: form.chinaDeliveryCity || "غير محدد",
        chinaDeliveryPhone: form.chinaDeliveryPhone || "غير محدد",
      },
    };

    return summary;
  }, [
    form,
    products.length,
    selectedMarketplace,
    selectedProductMethod,
    selectedService,
  ]);

  /**********************
   Submit
  **********************/
  async function onSubmit(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);

      // Upload files if any
      let uploadedFileParams = [];
      if (files && files.length > 0) {
        try {
          const uploadPromises = files.map(file => storageService.uploadOrderDocument(file));
          const results = await Promise.all(uploadPromises);
          uploadedFileParams = results.map((res, index) => ({
            name: files[index].name,
            path: res.path,
            url: res.url,
            type: files[index].type
          }));
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          showErrorToast('حدث خطأ أثناء رفع الملفات. يرجى المحاولة مرة أخرى.');
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        ...form,
        serviceType: selectedService,
        marketplace: selectedMarketplace,
        productMethod: selectedProductMethod,
        products: selectedService !== "شحن فقط" && selectedProductMethod === "manual" ? products : [],
        cartLink: selectedProductMethod === "cartLink" ? form.cartLink : "",
        files: uploadedFileParams,
        type: 'chinese'
      };

      // Submit to backend API
      await orderService.createOrder('chinese', orderData);

      // Clear drafts
      localStorage.removeItem("mirhal_china_smart_draft_4steps");
      localStorage.removeItem("mirhal_china_smart_orders_4steps"); // Clean up old localStorage orders
      clearAutoDraft();

      // Show success modal
      setShowSuccess(true);
    } catch (error) {
      console.error('Order submission error:', error);
      showErrorToast(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeSuccess() {
    setShowSuccess(false);

    // reset
    setForm({
      clientName: "",
      phoneCountry: "+20",
      phoneNumber: "",
      phoneOther: "",
      waCountry: "+20",
      waNumber: "",
      waOther: "",
      clientType: "",
      clientTypeOther: "",
      saveClient: false,

      marketplaceOther: "",
      cartLink: "",
      shipmentDescription: "",

      shipMode: "",
      needsPackaging: "",
      packaging: "",
      packagingOther: "",
      isFragile: "",
      hasHazmat: "",
      hazmatType: "",

      chinaCity: "",
      chinaPhone: "",
      chinaAddress: "",
      chinaDeliveryCity: "",
      chinaDeliveryPhone: "",
      chinaDeliveryAddress: "",

      deliveryCountry: "",
      deliveryCity: "",
      deliveryDistrict: "",
      deliveryAddress: "",
      deliveryCountryOther: "",
      deliveryCityOther: "",

      howFound: "",
      referralName: "",
      referralPhone: "",
      additionalNotes: "",
      confirmTerms: false,
    });

    setSelectedService("");
    setSelectedMarketplace("");
    setSelectedProductMethod("manual");
    setCurrentOrderTab("service");
    setCurrentStep(1);
    setDraftNotice(false);
    setFiles([]);

    setProducts([
      {
        id: 1,
        link: "",
        name: "",
        qty: "",
        hasColors: "no",
        hasSizes: "no",
        note: "",
        colors: [],
        sizes: [],
      },
    ]);
    nextProductIdRef.current = 2;

    scrollToStep(1);

    // Navigate to customer orders
    navigate('/customer/orders');
  }

  function clearForm() {
    if (!confirm("هل أنت متأكد أنك تريد مسح جميع الحقول؟")) return;
    localStorage.removeItem("mirhal_china_smart_draft_4steps");
    clearAutoDraft();
    closeSuccess(); // reuse reset logic but keep modal closed already
    alert("✅ تم مسح النموذج بنجاح");
  }

  /**********************
   UI helpers
  **********************/
  const progressPercent = (currentStep / totalSteps) * 100;
  const stepCircleClass = (stepNum) =>
    stepNum <= currentStep
      ? "w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mb-2"
      : "w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-2";

  const productsCount = selectedService === "شحن فقط" || selectedProductMethod === "cartLink" ? 0 : products.length;

  return (
    <div lang="ar" dir="rtl" className="bg-gray-50 text-gray-800 min-h-screen">
      {/* Toast */}
      <div
        className={`fixed bottom-5 left-5 bg-emerald-500 text-white px-5 py-3 rounded-lg shadow-lg z-[1000] transition ${toastVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <i className="fas fa-save ml-2" /> تم الحفظ التلقائي
      </div>

      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#5D5CDE] rounded-xl flex items-center justify-center text-white shadow-md">
                <i className="fas fa-shipping-fast text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#5D5CDE]">طلب شحن من الصين</h1>
                <p className="text-sm text-gray-500 mt-1">املأ البيانات - سنوافيك بالرد خلال 24 ساعة عمل</p>

                {draftNotice && (
                  <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg inline-block">
                    <i className="fas fa-history ml-1" /> تم استرجاع آخر طلب غير مكتمل
                  </div>
                )}
              </div>
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

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center justify-between text-sm text-center mb-3">
              <div className="w-1/4 font-medium flex flex-col items-center">
                <div className={stepCircleClass(1)}>1</div>
                <span>بيانات العميل</span>
              </div>
              <div className="w-1/4 font-medium flex flex-col items-center">
                <div className={stepCircleClass(2)}>2</div>
                <span>تفاصيل الطلب</span>
              </div>
              <div className="w-1/4 font-medium flex flex-col items-center">
                <div className={stepCircleClass(3)}>3</div>
                <span>الشحن</span>
              </div>
              <div className="w-1/4 font-medium flex flex-col items-center">
                <div className={stepCircleClass(4)}>4</div>
                <span>المراجعة</span>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div
                className="h-2.5 bg-[#5D5CDE] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="form-step active" data-step="1">
                <h2 className="text-[1.1rem] font-bold text-gray-700 mb-6 pb-2 border-b-2 border-[#5D5CDE]">
                  1 — بيانات العميل
                </h2>
                <p className="text-gray-500 text-[0.95rem] -mt-2 mb-6">معلومات التواصل الأساسية</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* الاسم */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الاسم الكامل <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      value={form.clientName}
                      onChange={(e) => setField("clientName", e.target.value)}
                      className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                      placeholder="أدخل الاسم الكامل"
                      required
                    />
                  </div>

                  {/* الهاتف */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رقم الهاتف <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={form.phoneCountry}
                        onChange={(e) => setField("phoneCountry", e.target.value)}
                        className="p-3.5 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                      >
                        <option value="+20">EG +20</option>
                        <option value="+966">SA +966</option>
                        <option value="+971">AE +971</option>
                        <option value="+86">CN +86</option>
                        <option value="other">أخرى</option>
                      </select>

                      <input
                        value={form.phoneNumber}
                        onChange={(e) => setField("phoneNumber", e.target.value)}
                        type="tel"
                        className="flex-1 p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                        placeholder="1X XXXXXXXX"
                        required
                        pattern="[0-9]{10,11}"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">أدخل رقم الهاتف بدون كود الدولة</div>

                    {form.phoneCountry === "other" && (
                      <input
                        value={form.phoneOther}
                        onChange={(e) => setField("phoneOther", e.target.value)}
                        className="mt-2 p-3 border rounded-lg w-full"
                        placeholder="+ كود الدولة"
                      />
                    )}
                  </div>

                  {/* واتساب */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رقم الواتساب <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={form.waCountry}
                        onChange={(e) => setField("waCountry", e.target.value)}
                        className="p-3.5 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                      >
                        <option value="+20">EG +20</option>
                        <option value="+966">SE +966</option>
                        <option value="+971">AE +971</option>
                        <option value="+86">CN +86</option>
                        <option value="other">أخرى</option>
                      </select>

                      <input
                        value={form.waNumber}
                        onChange={(e) => setField("waNumber", e.target.value)}
                        type="tel"
                        className="flex-1 p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                        placeholder="1X XXXXXXXX"
                        required
                        pattern="[0-9]{10,11}"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">يمكن أن يكون نفس رقم الهاتف</div>

                    {form.waCountry === "other" && (
                      <input
                        value={form.waOther}
                        onChange={(e) => setField("waOther", e.target.value)}
                        className="mt-2 p-3 border rounded-lg w-full"
                        placeholder="+ كود الدولة"
                      />
                    )}
                  </div>

                  {/* نوع العميل */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      نوع العميل <span className="text-red-500 font-bold">*</span>
                    </label>
                    <select
                      value={form.clientType}
                      onChange={(e) => setField("clientType", e.target.value)}
                      className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                      required
                    >
                      <option value="" disabled>
                        اختر نوع العميل
                      </option>
                      <option value="فرد">فرد</option>
                      <option value="تاجر">تاجر</option>
                      <option value="شركة">شركة</option>
                      <option value="مصنع">مصنع</option>
                      <option value="other">أخرى</option>
                    </select>

                    {form.clientType === "other" && (
                      <input
                        value={form.clientTypeOther}
                        onChange={(e) => setField("clientTypeOther", e.target.value)}
                        className="mt-3 p-3.5 border border-gray-300 rounded-lg w-full"
                        placeholder="اذكر نوع العميل"
                      />
                    )}
                  </div>

                  {/* حفظ البيانات */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        checked={form.saveClient}
                        onChange={(e) => setField("saveClient", e.target.checked)}
                        type="checkbox"
                        className="w-5 h-5 text-[#5D5CDE] rounded focus:ring-[#5D5CDE]"
                        id="c_saveClient"
                      />
                      <div>
                        <label htmlFor="c_saveClient" className="text-sm font-medium">
                          حفظ بياناتي للمرات القادمة
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          سيتم حفظ معلوماتك تلقائيًا لتجربة أسرع في المستقبل
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="form-step active" data-step="2">
                <h2 className="text-[1.1rem] font-bold text-gray-700 mb-6 pb-2 border-b-2 border-[#5D5CDE]">
                  2 — تفاصيل طلبك
                </h2>
                <p className="text-gray-500 text-[0.95rem] -mt-2 mb-6">اختر الخدمة وأضف منتجاتك</p>

                {/* Tabs */}
                <div className="flex border-b mb-6" id="serviceTabs">
                  {tabs.map((t) => (
                    <div
                      key={t.key}
                      onClick={() => switchOrderTab(t.key)}
                      className={`px-6 py-3 border-b-[3px] font-semibold cursor-pointer transition ${currentOrderTab === t.key
                        ? "text-[#5D5CDE] border-[#5D5CDE] bg-[#f8f9ff]"
                        : "text-gray-500 border-transparent"
                        }`}
                    >
                      <i className={`${t.icon} ml-2`} />
                      {t.label}
                      {t.key === "marketplaceProducts" && selectedService !== "شحن فقط" && selectedProductMethod !== "cartLink" && (
                        <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1 mr-2">
                          {productsCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div id="orderTabsContent">
                  {/* Service Tab */}
                  {currentOrderTab === "service" && (
                    <div id="serviceTab" className="order-tab active">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">ما هي الخدمة التي تحتاجها؟</h3>
                        <p className="text-gray-600">اختر نوع الخدمة التي تناسب متطلباتك</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            value: "شراء فقط",
                            title: "شراء فقط",
                            desc: "نشتري لك المنتجات من الصين",
                            icon: "fas fa-shopping-cart",
                            bg: "bg-blue-100",
                            iconColor: "text-blue-600",
                            note: "التسليم داخل الصين",
                          },
                          {
                            value: "شحن فقط",
                            title: "شحن فقط",
                            desc: "نشحن منتجاتك من الصين",
                            icon: "fas fa-ship",
                            bg: "bg-green-100",
                            iconColor: "text-green-600",
                            note: "تحتاج عنوانين",
                          },
                          {
                            value: "شراء+شحن",
                            title: "شراء + شحن",
                            desc: "نشتري ثم نشحن لك",
                            icon: "fas fa-boxes",
                            bg: "bg-purple-100",
                            iconColor: "text-purple-600",
                            note: "خدمة متكاملة",
                          },
                        ].map((s) => (
                          <div
                            key={s.value}
                            onClick={() => selectService(s.value)}
                            className={`border-2 rounded-2xl p-6 cursor-pointer transition mb-4 hover:shadow-md hover:-translate-y-0.5 ${selectedService === s.value
                              ? "border-[#5D5CDE] bg-gradient-to-br from-[#f8f9ff] to-[#f0f3ff]"
                              : "border-gray-200"
                              }`}
                          >
                            <div className="text-center">
                              <div className={`w-16 h-16 ${s.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <i className={`${s.icon} text-2xl ${s.iconColor}`} />
                              </div>
                              <h4 className="font-bold text-lg mb-2">{s.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{s.desc}</p>
                              <div className="text-xs text-green-600 font-medium">
                                <i className="fas fa-check-circle" /> {s.note}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-info-circle text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">ملاحظة:</p>
                            <p className="text-sm text-blue-700">
                              بعد اختيار الخدمة، انتقل إلى التبويب التالي لإضافة تفاصيل طلبك
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Marketplace + Products Tab */}
                  {currentOrderTab === "marketplaceProducts" && (
                    <div id="marketplaceProductsTab" className="order-tab active">
                      {/* Marketplace */}
                      <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">من أي موقع ستشتري؟</h3>

                        <div className="mb-6">
                          <label className="block text-sm font-medium mb-2">
                            الموقع الرئيسي <span className="text-red-500 font-bold">*</span>
                          </label>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {["Alibaba", "Taobao", "1688", "other"].map((m) => (
                              <button
                                type="button"
                                key={m}
                                onClick={() => selectMarketplace(m)}
                                className={`p-4 border rounded-lg text-center hover:border-[#5D5CDE] transition ${selectedMarketplace === m ? "border-[#5D5CDE] bg-[#f8f9ff]" : "border-gray-200"
                                  }`}
                              >
                                <div className="font-medium">{m === "other" ? "آخر" : m}</div>
                              </button>
                            ))}
                          </div>

                          {selectedMarketplace === "other" && (
                            <div className="mt-4">
                              <label className="block text-sm font-medium mb-2">اكتب اسم الموقع</label>
                              <input
                                value={form.marketplaceOther}
                                onChange={(e) => setField("marketplaceOther", e.target.value)}
                                className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                placeholder="مثال: موقع XYZ الصيني"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <i className="fas fa-lightbulb text-yellow-500 ml-1" />{" "}
                            <span className="font-medium">نصيحة:</span> يمكنك إضافة روابط المنتجات من مواقع مختلفة في قسم المنتجات أدناه
                          </p>
                        </div>
                      </div>

                      {/* Product Method */}
                      <div className="border-t pt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📦 طريقة إضافة المنتجات</h3>

                        <div className="mb-8">
                          <label className="block text-sm font-medium mb-3">
                            كيف تريد إضافة المنتجات؟ <span className="text-red-500 font-bold">*</span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                              type="button"
                              onClick={() => selectProductMethod("cartLink")}
                              className={`flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 border-2 rounded-xl hover:border-[#5D5CDE] transition ${selectedProductMethod === "cartLink" ? "border-[#5D5CDE] bg-[#f8f9ff]" : "border-gray-200"
                                }`}
                            >
                              <input readOnly type="radio" checked={selectedProductMethod === "cartLink"} className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D5CDE] mb-2 sm:mb-0" />
                              <div className="mr-0 sm:mr-3 text-right flex-1">
                                <div className="font-bold text-base sm:text-lg text-gray-800">إضافة لينك الباج (Cart Link)</div>
                                <div className="text-xs sm:text-sm text-gray-600 mt-1">أرسل رابط واحد يحتوي جميع منتجاتك</div>
                              </div>
                              <div className="mr-auto mt-2 sm:mt-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-link text-blue-600 text-lg sm:text-xl" />
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => selectProductMethod("manual")}
                              className={`flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 border-2 rounded-xl hover:border-[#5D5CDE] transition ${selectedProductMethod === "manual" ? "border-[#5D5CDE] bg-[#f8f9ff]" : "border-gray-200"
                                }`}
                            >
                              <input readOnly type="radio" checked={selectedProductMethod === "manual"} className="w-4 h-4 sm:w-5 sm:h-5 text-[#5D5CDE] mb-2 sm:mb-0" />
                              <div className="mr-0 sm:mr-3 text-right flex-1">
                                <div className="font-bold text-base sm:text-lg text-gray-800">إضافة المنتجات يدويًا</div>
                                <div className="text-xs sm:text-sm text-gray-600 mt-1">أضف كل منتج على حدة</div>
                              </div>
                              <div className="mr-auto mt-2 sm:mt-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-edit text-green-600 text-lg sm:text-xl" />
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Cart Link */}
                        {selectedProductMethod === "cartLink" && (
                          <div className="mb-8">
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                              <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                  <i className="fas fa-shopping-bag" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-800 mb-1">لينك الباج (Cart Link)</h4>
                                  <p className="text-sm text-gray-600">أرسل رابط واحد يحتوي جميع منتجاتك مع تفاصيلها</p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    لينك الباج <span className="text-red-500 font-bold">*</span>
                                  </label>
                                  <textarea
                                    value={form.cartLink}
                                    onChange={(e) => setField("cartLink", e.target.value)}
                                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                    rows={3}
                                    placeholder="الصق هنا لينك الباج الذي يحتوي على جميع المنتجات (يشمل الكمية، الألوان، المقاسات… إن وُجد)"
                                    required
                                  />
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <div className="flex items-start gap-3">
                                    <i className="fas fa-info-circle text-yellow-600 mt-0.5" />
                                    <div>
                                      <p className="text-sm text-yellow-800 font-medium mb-2">ملاحظة هامة:</p>
                                      <p className="text-sm text-yellow-700">
                                        عند إرسال لينك الباج، يُرجى التأكد أن جميع المنتجات والمواصفات (الكمية – اللون – المقاس – الموديل…) تم اختيارها بدقة.
                                        سيتم اعتماد البيانات الموجودة داخل اللينك كما هي، لتفادي أي سوء فهم أو اختلاف في التنفيذ.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Manual Products */}
                        {selectedProductMethod === "manual" && (
                          <div>
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-gray-800 mb-4">منتجاتك</h3>

                              <div className="space-y-6">
                                {products.map((p, index) => (
                                  <div key={p.id} className="product-item border border-gray-300 rounded-xl p-5 bg-white">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#5D5CDE]/10 rounded-lg flex items-center justify-center text-[#5D5CDE] font-bold">
                                          {index + 1}
                                        </div>
                                        <div className="font-bold text-gray-800">منتج جديد</div>
                                      </div>

                                      <button
                                        type="button"
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                        onClick={() => removeProduct(p.id)}
                                      >
                                        <i className="fas fa-trash ml-1" /> حذف
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium mb-2">
                                          رابط المنتج <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                          value={p.link}
                                          onChange={(e) => updateProduct(p.id, { link: e.target.value })}
                                          type="url"
                                          className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                          placeholder="https://"
                                          required
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-2">
                                          اسم المنتج <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                          value={p.name}
                                          onChange={(e) => updateProduct(p.id, { name: e.target.value })}
                                          className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                          placeholder="مثال: جاكيت رجالي"
                                          required
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-2">
                                          الكمية <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                          value={p.qty}
                                          onChange={(e) => updateProduct(p.id, { qty: e.target.value })}
                                          type="number"
                                          min="1"
                                          className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                          placeholder="مثال: 10"
                                          required
                                        />
                                      </div>

                                      {/* Colors */}
                                      <div className="md:col-span-3">
                                        <label className="block text-sm font-medium mb-2">هل يحتاج تحديد ألوان؟</label>
                                        <select
                                          value={p.hasColors}
                                          onChange={(e) => updateProduct(p.id, { hasColors: e.target.value })}
                                          className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                        >
                                          <option value="no">لا</option>
                                          <option value="yes">نعم</option>
                                        </select>

                                        {p.hasColors === "yes" && (
                                          <div className="mt-3">
                                            <div className="flex gap-2 mb-3">
                                              <button
                                                type="button"
                                                className="px-3 py-1.5 bg-[#5D5CDE] text-white rounded-lg hover:bg-[#5D5CDE]/90 transition text-sm font-medium"
                                                onClick={() => addColorRow(p.id)}
                                              >
                                                <i className="fas fa-plus ml-1" /> إضافة لون
                                              </button>
                                              <div className="text-xs text-gray-500 self-center">أدخل كمية لكل لون</div>
                                            </div>

                                            {p.colors.map((c, i) => (
                                              <div key={i} className="flex gap-2 mb-3">
                                                <input
                                                  value={c.name}
                                                  onChange={(e) => updateColorRow(p.id, i, { name: e.target.value })}
                                                  placeholder="اللون (مثال: أسود)"
                                                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                                                />
                                                <input
                                                  value={c.qty}
                                                  onChange={(e) => updateColorRow(p.id, i, { qty: e.target.value })}
                                                  type="number"
                                                  min="1"
                                                  placeholder="الكمية"
                                                  className="w-28 p-3 border border-gray-300 rounded-lg"
                                                />
                                                <button
                                                  type="button"
                                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                                  onClick={() => removeColorRow(p.id, i)}
                                                >
                                                  <i className="fas fa-trash ml-1" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Sizes */}
                                      <div className="md:col-span-3">
                                        <label className="block text-sm font-medium mb-2">هل يحتاج تحديد مقاسات؟</label>
                                        <select
                                          value={p.hasSizes}
                                          onChange={(e) => updateProduct(p.id, { hasSizes: e.target.value })}
                                          className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                        >
                                          <option value="no">لا</option>
                                          <option value="yes">نعم</option>
                                        </select>

                                        {p.hasSizes === "yes" && (
                                          <div className="mt-3">
                                            <div className="flex gap-2 mb-3">
                                              <button
                                                type="button"
                                                className="px-3 py-1.5 bg-[#5D5CDE] text-white rounded-lg hover:bg-[#5D5CDE]/90 transition text-sm font-medium"
                                                onClick={() => addSizeRow(p.id)}
                                              >
                                                <i className="fas fa-plus ml-1" /> إضافة مقاس
                                              </button>
                                              <div className="text-xs text-gray-500 self-center">أدخل كمية لكل مقاس</div>
                                            </div>

                                            {p.sizes.map((s, i) => (
                                              <div key={i} className="flex gap-2 mb-3">
                                                <input
                                                  value={s.name}
                                                  onChange={(e) => updateSizeRow(p.id, i, { name: e.target.value })}
                                                  placeholder="المقاس (مثال: L)"
                                                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                                                />
                                                <input
                                                  value={s.qty}
                                                  onChange={(e) => updateSizeRow(p.id, i, { qty: e.target.value })}
                                                  type="number"
                                                  min="1"
                                                  placeholder="الكمية"
                                                  className="w-28 p-3 border border-gray-300 rounded-lg"
                                                />
                                                <button
                                                  type="button"
                                                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                                                  onClick={() => removeSizeRow(p.id, i)}
                                                >
                                                  <i className="fas fa-trash ml-1" />
                                                </button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Notes */}
                                      <div className="md:col-span-3">
                                        <label className="block text-sm font-medium mb-2">ملاحظات عن المنتج</label>
                                        <textarea
                                          value={p.note}
                                          onChange={(e) => updateProduct(p.id, { note: e.target.value })}
                                          className="w-full p-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                                          placeholder="أي ملاحظات إضافية..."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-3 mt-8">
                                <button
                                  type="button"
                                  className="px-5 py-3 bg-[#5D5CDE] text-white rounded-lg hover:bg-[#5D5CDE]/90 transition flex items-center gap-2 font-medium"
                                  onClick={addProduct}
                                >
                                  <i className="fas fa-plus" /> إضافة منتج جديد
                                </button>

                                <button
                                  type="button"
                                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 font-medium"
                                  onClick={() => alert("⏳ ميزة استيراد المنتجات من ملف قريبًا...")}
                                >
                                  <i className="fas fa-file-import" /> استيراد من ملف
                                </button>
                              </div>

                              <div className="text-sm text-gray-500 mt-3">
                                <i className="fas fa-info-circle ml-1" /> يمكنك إضافة حتى 10 منتجات
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shipment Details Tab (Shipping only) */}
                  {currentOrderTab === "shipmentDetails" && (
                    <div id="shipmentDetailsTab" className="order-tab active">
                      <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📦 مواصفات الشحنة</h3>
                        <p className="text-gray-600 mb-6">قم بوصف البضاعة التي تريد شحنها من الصين</p>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                          <label className="block text-sm font-medium mb-2">
                            اوصف البضاعة و الكمية و الوزن (إن وُجد) <span className="text-red-500 font-bold">*</span>
                          </label>
                          <textarea
                            value={form.shipmentDescription}
                            onChange={(e) => setField("shipmentDescription", e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                            rows={6}
                            placeholder={
                              "مثال: كراتين ملابس – 5 كراتين – الوزن التقريبي 120 كجم\n" +
                              "مثال آخر: أجهزة إلكترونية – 10 قطع – الوزن التقريبي 50 كجم\n" +
                              "مثال ثالث: مواد بناء – 2 طن"
                            }
                            required
                          />
                          <div className="text-sm text-gray-500 mt-3">
                            <i className="fas fa-info-circle ml-1" /> يمكنك كتابة أي تفاصيل أخرى مهمة عن الشحنة
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <i className="fas fa-exclamation-triangle ml-1" /> <span className="font-medium">ملاحظة:</span>{" "}
                            ستتم مناقشة التفاصيل الدقيقة والرسوم بعد إرسال الطلب
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="form-step active" data-step="3">
                <h2 className="text-[1.1rem] font-bold text-gray-700 mb-6 pb-2 border-b-2 border-[#5D5CDE]">
                  3 — الشحن&التسليم
                </h2>
                <p className="text-gray-500 text-[0.95rem] -mt-2 mb-6">حدد طريقة الشحن والعناوين المطلوبة</p>

                <div className="space-y-8">
                  {/* Shipping mode (hidden for "شراء فقط") */}
                  {selectedService !== "شراء فقط" && (
                    <div className="animate-[fadeIn_0.3s_ease-in]">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">🚢 طريقة الشحن</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {[
                          { value: "جوي", title: "الشحن الجوي", desc: "أسرع - أعلى تكلفة", icon: "fas fa-plane", bg: "bg-blue-100", iconColor: "text-blue-600", days: "15-25 يوم" },
                          { value: "بحري", title: "الشحن البحري", desc: "أبطأ - أقل تكلفة", icon: "fas fa-ship", bg: "bg-green-100", iconColor: "text-green-600", days: "30-45 يوم" },
                        ].map((m) => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setField("shipMode", m.value)}
                            className={`p-5 border-2 rounded-xl text-right hover:border-gray-300 transition ${form.shipMode === m.value ? "border-[#5D5CDE] bg-[#f8f9ff]" : "border-gray-200"
                              }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 ${m.bg} rounded-lg flex items-center justify-center`}>
                                <i className={`${m.icon} ${m.iconColor} text-xl`} />
                              </div>
                              <div>
                                <div className="font-bold text-lg">{m.title}</div>
                                <div className="text-sm text-gray-600">{m.desc}</div>
                              </div>
                            </div>

                            <div className="text-sm text-gray-700">
                              <i className="fas fa-clock ml-1" /> {m.days}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <i className="fas fa-exclamation-triangle ml-1" /> <span className="font-medium">ملاحظة:</span>{" "}
                          الطلبات الصغيرة تتطلب الشحن الجوي إجباريًا
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Addresses Section */}
                  <div className="animate-[fadeIn_0.3s_ease-in]">
                    {selectedService === "شحن فقط" && (
                      <div className="space-y-6">
                        {/* China loading address */}
                        <div className="p-5 border border-gray-300 rounded-xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                              <i className="fas fa-map-marker-alt" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">📍 عنوان التحميل في الصين</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                المدينة في الصين <span className="text-red-500 font-bold">*</span>
                              </label>
                              <input
                                value={form.chinaCity}
                                onChange={(e) => setField("chinaCity", e.target.value)}
                                className="w-full p-3.5 border border-gray-300 rounded-lg"
                                placeholder="مثال: شنغهاي"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                رقم هاتف المورد <span className="text-red-500 font-bold">*</span>
                              </label>
                              <input
                                value={form.chinaPhone}
                                onChange={(e) => setField("chinaPhone", e.target.value)}
                                type="tel"
                                className="w-full p-3.5 border border-gray-300 rounded-lg"
                                placeholder="+86 XXXXXXXXXX"
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2">
                                العنوان التفصيلي <span className="text-red-500 font-bold">*</span>
                              </label>
                              <textarea
                                value={form.chinaAddress}
                                onChange={(e) => setField("chinaAddress", e.target.value)}
                                className="w-full p-3.5 border border-gray-300 rounded-lg"
                                rows={2}
                                placeholder="اسم الشارع، رقم المبنى، اسم المورد..."
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delivery address */}
                        <DeliveryAddressBlock
                          form={form}
                          setField={setField}
                          deliveryCities={deliveryCities}
                          showDistrictField={showDistrictField}
                        />
                      </div>
                    )}

                    {selectedService === "شراء+شحن" && (
                      <DeliveryAddressBlock
                        form={form}
                        setField={setField}
                        deliveryCities={deliveryCities}
                        showDistrictField={showDistrictField}
                      />
                    )}

                    {selectedService === "شراء فقط" && (
                      <div className="p-5 border border-gray-300 rounded-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <i className="fas fa-map-marker-alt" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">📍 عنوان التسليم في الصين</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              المدينة في الصين <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              value={form.chinaDeliveryCity}
                              onChange={(e) => setField("chinaDeliveryCity", e.target.value)}
                              className="w-full p-3.5 border border-gray-300 rounded-lg"
                              placeholder="مثال: شنغهاي"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              رقم هاتف المستلم <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                              value={form.chinaDeliveryPhone}
                              onChange={(e) => setField("chinaDeliveryPhone", e.target.value)}
                              type="tel"
                              className="w-full p-3.5 border border-gray-300 rounded-lg"
                              placeholder="+86 XXXXXXXXXX"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                              العنوان التفصيلي <span className="text-red-500 font-bold">*</span>
                            </label>
                            <textarea
                              value={form.chinaDeliveryAddress}
                              onChange={(e) => setField("chinaDeliveryAddress", e.target.value)}
                              className="w-full p-3.5 border border-gray-300 rounded-lg"
                              rows={2}
                              placeholder="اسم الشارع، رقم المبنى، الشقة..."
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {!selectedService && (
                      <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                        <i className="fas fa-exclamation-triangle text-yellow-600 text-3xl mb-3" />
                        <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ اختر الخدمة أولاً</h3>
                        <p className="text-yellow-700">ارجع إلى الخطوة السابقة واختر نوع الخدمة</p>
                      </div>
                    )}
                  </div>

                  {/* Packaging + specs */}
                  <div className="animate-[fadeIn_0.3s_ease-in]">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📦 التغليف والمواصفات</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Packaging */}
                      <div>
                        <label className="block text-sm font-medium mb-3">هل تحتاج طريقة تغليف خاصة؟</label>
                        <div className="flex gap-6">
                          {["نعم", "لا"].map((v) => (
                            <label key={v} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="radio"
                                name="needsPackaging"
                                checked={form.needsPackaging === v}
                                onChange={() => setField("needsPackaging", v)}
                                className="w-5 h-5 text-[#5D5CDE]"
                              />
                              <span className="font-medium">{v}</span>
                            </label>
                          ))}
                        </div>

                        {form.needsPackaging === "نعم" && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">نوع التغليف المطلوب</label>
                            <select
                              value={form.packaging}
                              onChange={(e) => setField("packaging", e.target.value)}
                              className="p-3.5 border border-gray-300 rounded-lg w-full"
                            >
                              <option value="">اختر طريقة التغليف</option>
                              <option value="كراتين">كراتين</option>
                              <option value="باليت">باليِت خشبي</option>
                              <option value="براميل">براميل بلاستيك</option>
                              <option value="أكياس">أكياس محكمة</option>
                              <option value="other">أخرى</option>
                            </select>

                            {form.packaging === "other" && (
                              <input
                                value={form.packagingOther}
                                onChange={(e) => setField("packagingOther", e.target.value)}
                                className="mt-3 p-3.5 border border-gray-300 rounded-lg w-full"
                                placeholder="اذكر طريقة التغليف"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Fragile */}
                      <div>
                        <label className="block text-sm font-medium mb-2">هل المنتجات قابلة للكسر؟</label>
                        <select
                          value={form.isFragile}
                          onChange={(e) => setField("isFragile", e.target.value)}
                          className="p-3.5 border border-gray-300 rounded-lg w-full"
                        >
                          <option value="">اختر</option>
                          <option value="نعم">نعم</option>
                          <option value="لا">لا</option>
                        </select>
                      </div>

                      {/* Hazmat */}
                      <div>
                        <label className="block text-sm font-medium mb-2">هل تحتوي على مواد خطرة؟</label>
                        <select
                          value={form.hasHazmat}
                          onChange={(e) => setField("hasHazmat", e.target.value)}
                          className="p-3.5 border border-gray-300 rounded-lg w-full"
                        >
                          <option value="">اختر</option>
                          <option value="نعم">نعم</option>
                          <option value="لا">لا</option>
                        </select>

                        {form.hasHazmat === "نعم" && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium mb-2">نوع المواد الخطرة</label>
                            <input
                              value={form.hazmatType}
                              onChange={(e) => setField("hazmatType", e.target.value)}
                              className="w-full p-3.5 border border-gray-300 rounded-lg"
                              placeholder="بطاريات - سوائل - كيماويات"
                            />
                          </div>
                        )}
                      </div>

                      {/* Files */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">رفع ملفات (اختياري)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-2">اسحب وأفلت الملفات هنا أو انقر للاختيار</p>

                          <input
                            type="file"
                            multiple
                            className="hidden"
                            id="c_files"
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("c_files")?.click()}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          >
                            اختيار ملفات
                          </button>

                          <p className="text-xs text-gray-500 mt-3">PDF, JPG, PNG - الحد الأقصى 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="form-step active" data-step="4">
                <h2 className="text-[1.1rem] font-bold text-gray-700 mb-6 pb-2 border-b-2 border-[#5D5CDE]">
                  4 — مراجعة طلبك
                </h2>
                <p className="text-gray-500 text-[0.95rem] -mt-2 mb-6">راجع معلوماتك قبل الإرسال النهائي</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="md:col-span-2">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📋 ملخص الطلب</h3>

                      <div className="space-y-6 text-sm">
                        <div>
                          <h4 className="font-bold text-gray-800 mb-2">👤 بيانات العميل</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-600">الاسم:</div>
                            <div className="font-medium">{finalSummary.client.clientName}</div>
                            <div className="text-gray-600">الهاتف:</div>
                            <div className="font-medium">{finalSummary.client.phone}</div>
                            <div className="text-gray-600">النوع:</div>
                            <div className="font-medium">{finalSummary.client.clientType}</div>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-bold text-gray-800 mb-2">🛒 تفاصيل الطلب</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-gray-600">نوع الخدمة:</div>
                            <div className="font-medium text-[#5D5CDE]">{finalSummary.order.serviceType}</div>

                            {finalSummary.order.serviceType === "شحن فقط" ? (
                              <>
                                <div className="text-gray-600">وصف الشحنة:</div>
                                <div className="font-medium">
                                  {finalSummary.order.shipmentDescription
                                    ? finalSummary.order.shipmentDescription.slice(0, 50) +
                                    (finalSummary.order.shipmentDescription.length > 50 ? "..." : "")
                                    : "غير محدد"}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-gray-600">طريقة الإضافة:</div>
                                <div className="font-medium">{finalSummary.order.productMethod}</div>

                                <div className="text-gray-600">الموقع الرئيسي:</div>
                                <div className="font-medium">{finalSummary.order.marketplace}</div>

                                {selectedProductMethod === "cartLink" ? (
                                  <>
                                    <div className="text-gray-600">لينك الباج:</div>
                                    <div className="font-medium text-blue-600 truncate">
                                      {finalSummary.order.cartLink
                                        ? finalSummary.order.cartLink.slice(0, 40) +
                                        (finalSummary.order.cartLink.length > 40 ? "..." : "")
                                        : "غير محدد"}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-gray-600">عدد المنتجات:</div>
                                    <div className="font-medium">{finalSummary.order.productCount} منتج</div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {selectedService !== "شراء فقط" ? (
                          <div className="border-t pt-4">
                            <h4 className="font-bold text-gray-800 mb-2">🚚 معلومات الشحن</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-gray-600">طريقة الشحن:</div>
                              <div className="font-medium">{finalSummary.shipping.shipMode}</div>

                              <div className="text-gray-600">التغليف الخاص:</div>
                              <div className="font-medium">{finalSummary.shipping.packaging}</div>

                              {selectedService === "شحن فقط" && (
                                <>
                                  <div className="text-gray-600">موقع التحميل:</div>
                                  <div className="font-medium">{finalSummary.addresses.chinaCity} - الصين</div>
                                </>
                              )}

                              {(selectedService === "شحن فقط" || selectedService === "شراء+شحن") && (
                                <>
                                  <div className="text-gray-600">موقع التسليم:</div>
                                  <div className="font-medium">
                                    {finalSummary.addresses.deliveryCity}
                                    {finalSummary.addresses.deliveryDistrict
                                      ? ` - ${finalSummary.addresses.deliveryDistrict}`
                                      : ""}
                                    {" - "}
                                    {finalSummary.addresses.deliveryCountry}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="border-t pt-4">
                            <h4 className="font-bold text-gray-800 mb-2">📍 عنوان التسليم في الصين</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-gray-600">المدينة:</div>
                              <div className="font-medium">{finalSummary.addresses.chinaDeliveryCity}</div>
                              <div className="text-gray-600">هاتف المستلم:</div>
                              <div className="font-medium">{finalSummary.addresses.chinaDeliveryPhone}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">💬 ملاحظات إضافية</h3>
                      <textarea
                        value={form.additionalNotes}
                        onChange={(e) => setField("additionalNotes", e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                        rows={5}
                        placeholder="اكتب أي ملاحظات أو تعليمات إضافية تريد إضافتها..."
                      />
                    </div>
                  </div>

                  {/* Side panel */}
                  <div>
                    <div className="sticky top-6">
                      {/* How found */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-3">كيف علمت بخدماتنا؟</label>
                        <select
                          value={form.howFound}
                          onChange={(e) => setField("howFound", e.target.value)}
                          className="p-3.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#5D5CDE] focus:border-transparent"
                        >
                          <option value="">اختر</option>
                          <option value="website">موقع الشركة</option>
                          <option value="referral">عميل سابق</option>
                          <option value="social">سوشيال ميديا</option>
                          <option value="search">محرك بحث</option>
                          <option value="advertisement">إعلان</option>
                        </select>

                        {form.howFound === "referral" && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 mb-3">
                              <i className="fas fa-gift ml-1" /> <span className="font-medium">مكافأة:</span> العميل السابق سيحصل على كاش باك
                            </p>
                            <input
                              value={form.referralName}
                              onChange={(e) => setField("referralName", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                              placeholder="اسم العميل السابق"
                            />
                            <input
                              value={form.referralPhone}
                              onChange={(e) => setField("referralPhone", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              placeholder="رقم العميل السابق"
                            />
                          </div>
                        )}
                      </div>

                      {/* Confirm */}
                      <div className="p-5 bg-[#5D5CDE]/10 rounded-xl border border-[#5D5CDE]/20">
                        <h4 className="font-bold text-lg text-[#5D5CDE] mb-3">✅ تأكيد الإرسال</h4>
                        <p className="text-sm text-gray-700 mb-4">
                          بعد إرسال الطلب، سنتواصل معك خلال 24 ساعة عمل لتأكيد التفاصيل والبدء في التنفيذ.
                        </p>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg mb-4">
                          <input
                            checked={form.confirmTerms}
                            onChange={(e) => setField("confirmTerms", e.target.checked)}
                            type="checkbox"
                            className="w-5 h-5 text-[#5D5CDE] rounded"
                            required
                          />
                          <label className="text-sm">
                            أوافق على{" "}
                            <a href="#" className="text-[#5D5CDE] font-medium">
                              الشروط والأحكام
                            </a>
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-3 rounded-lg transition font-bold flex items-center justify-center gap-2 ${isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin" /> جاري الإرسال...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane" /> إرسال الطلب النهائي
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t">
              <button
                type="button"
                className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2 font-medium text-sm sm:text-base ${currentStep === 1 ? "invisible" : ""
                  }`}
                onClick={prevStep}
              >
                <i className="fas fa-arrow-right" /> رجوع
              </button>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2 font-medium text-sm sm:text-base order-2 sm:order-1"
                  onClick={saveDraft}
                >
                  <i className="fas fa-save" /> حفظ المسودة
                </button>

                {currentStep < totalSteps && (
                  <button
                    type="button"
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#5D5CDE] text-white rounded-lg hover:bg-[#5D5CDE]/90 transition flex items-center justify-center gap-2 font-medium text-sm sm:text-base order-1 sm:order-2"
                    onClick={nextStep}
                  >
                    التالي <i className="fas fa-arrow-left" />
                  </button>
                )}

                <button
                  type="button"
                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 font-medium text-sm sm:text-base order-3 sm:order-3"
                  onClick={clearForm}
                >
                  <i className="fas fa-trash-alt" /> مسح الكل
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Success modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full mx-auto flex items-center justify-center text-emerald-600 mb-6">
                <i className="fas fa-check text-3xl" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">تم إرسال طلبك بنجاح! 🎉</h3>
              <p className="text-gray-600 mb-6">شكراً لثقتك بمرحال جو. سنوافيك بالرد خلال 24 ساعة عمل.</p>
              <button
                className="px-6 py-3 bg-[#5D5CDE] text-white rounded-lg hover:bg-[#5D5CDE]/90 transition font-medium w-full"
                onClick={closeSuccess}
              >
                موافق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Delivery Address Block (shared for شحن فقط & شراء+شحن)
 */
function DeliveryAddressBlock({ form, setField, deliveryCities, showDistrictField }) {
  return (
    <div className="p-5 border border-gray-300 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
          <i className="fas fa-home" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">🏠 عنوان التسليم</h3>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              البلد <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={form.deliveryCountry}
              onChange={(e) => {
                const v = e.target.value;
                setField("deliveryCountry", v);
                setField("deliveryCity", "");
                setField("deliveryCityOther", "");
              }}
              className="p-3.5 border border-gray-300 rounded-lg w-full"
              required
            >
              <option value="" disabled>
                اختر البلد
              </option>
              <option value="مصر">مصر 🇪🇬</option>
              <option value="السعودية">السعودية 🇸🇦</option>
              <option value="الإمارات">الإمارات 🇦🇪</option>
              <option value="other">بلد آخر</option>
            </select>

            {form.deliveryCountry === "other" && (
              <input
                value={form.deliveryCountryOther}
                onChange={(e) => setField("deliveryCountryOther", e.target.value)}
                className="mt-3 p-3.5 border border-gray-300 rounded-lg w-full"
                placeholder="اكتب اسم البلد"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              المدينة/المنطقة <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              value={form.deliveryCity}
              onChange={(e) => {
                const v = e.target.value;
                setField("deliveryCity", v);
                if (v !== "other") setField("deliveryCityOther", "");
              }}
              className="p-3.5 border border-gray-300 rounded-lg w-full"
              required
              disabled={!form.deliveryCountry}
            >
              <option value="" disabled>
                اختر المدينة/المنطقة
              </option>
              <option value="other">مدينة/منطقة أخرى</option>
              {deliveryCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {form.deliveryCity === "other" && (
              <input
                value={form.deliveryCityOther}
                onChange={(e) => setField("deliveryCityOther", e.target.value)}
                className="mt-3 p-3.5 border border-gray-300 rounded-lg w-full"
                placeholder="اكتب اسم المدينة/المنطقة"
              />
            )}
          </div>
        </div>

        {/* District optional */}
        {showDistrictField && (
          <div>
            <label className="block text-sm font-medium mb-2">المنطقة/الحي (اختياري)</label>
            <input
              value={form.deliveryDistrict}
              onChange={(e) => setField("deliveryDistrict", e.target.value)}
              className="w-full p-3.5 border border-gray-300 rounded-lg"
              placeholder="اسم المنطقة أو الحي"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            العنوان التفصيلي <span className="text-red-500 font-bold">*</span>
          </label>
          <textarea
            value={form.deliveryAddress}
            onChange={(e) => setField("deliveryAddress", e.target.value)}
            className="w-full p-3.5 border border-gray-300 rounded-lg"
            rows={2}
            placeholder="اسم الشارع، رقم العمارة، الشقة..."
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ChineseStoresForm;
