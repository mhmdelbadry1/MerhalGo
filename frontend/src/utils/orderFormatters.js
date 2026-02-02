/**
 * Order Field Formatters
 * Translates and formats dynamic order fields for display
 */

export const fieldLabels = {
  // Client Data
  clientName: 'اسم العميل',
  clientType: 'نوع العميل',
  clientPhone: 'رقم الهاتف',
  clientWhatsapp: 'رقم الواتساب',
  phoneCountryCode: 'كود الدولة',
  whatsappCountryCode: 'كود الواتساب',
  
  // Cargo Data
  cargoType: 'نوع الشحنة',
  furniturePieces: 'عدد قطع الأثاث',
  furnitureType: 'نوع الأثاث',
  fruitsType: 'نوع الفاكهة/الخضار',
  needsCooling: 'يحتاج تبريد',
  coolingTemp: 'درجة التبريد',
  otherCargoType: 'نوع آخر',
  weight: 'الوزن (كجم)',
  volume: 'الحجم (م3)',
  
  // Pickup Data
  pickupGovernorate: 'محافظة التحميل',
  pickupArea: 'منطقة التحميل',
  pickupAddress: 'عنوان التحميل',
  pickupDate: 'تاريخ التحميل',
  pickupTime: 'وقت التحميل',
  pickupLocation: 'عنوان التحميل', // Test/Legacy support
  
  // Delivery Data
  deliveryGovernorate: 'محافظة التسليم',
  deliveryArea: 'منطقة التسليم',
  deliveryAddress: 'عنوان التسليم',
  deliveryDate: 'تاريخ التسليم',
  deliveryTime: 'وقت التسليم',
  deliveryPhone: 'هاتف المستلم',
  deliveryLocation: 'عنوان التسليم', // Test/Legacy support
  
  // Special Req
  needsSpecialPackaging: 'تغليف خاص',
  specialPackagingDetails: 'تفاصيل التغليف',
  hasFragileItems: 'قابل للكسر',
  needsInsurance: 'تأمين',
  insuranceValue: 'قيمة التأمين',
  needsAssembly: 'تركيب',
  needsDisassembly: 'فك',
  
  // Payment & Info
  paymentMethod: 'طريقة الدفع',
  howDidYouKnow: 'كيف عرفتنا',
  additionalNotes: 'ملاحظات إضافية',
  description: 'الوصف',

  // International/Freight
  shipmentType: 'نوع الشحن',
  originCountry: 'دولة الشحن',
  destinationCountry: 'دولة الوصول',
  items: 'الأصناف',
  storeLink: 'رابط المتجر',
  storeName: 'اسم المتجر',
  productLinks: 'روابط المنتجات',
  operationType: 'نوع العملية',
  cargoMode: 'نوع الشحنة',
  routeType: 'طريقة الشحن',
  pickupPort: 'ميناء/مطار التحميل',
  deliveryPort: 'ميناء/مطار التسليم',
  pickupFromAddress: 'عنوان التحميل',
  deliveryToAddress: 'عنوان التسليم',
  hasLiquids: 'يحتوي على سوائل',
  liquidType: 'نوع السائل',
  hasHazmat: 'مواد خطرة',
  hazmatType: 'نوع المادة الخطرة',
  hasBatteries: 'بطاريات',
  batteryType: 'نوع البطارية',
  isFragile: 'قابل للكسر',
  fragilePacking: 'تغليف خاص',
  hasDocuments: 'مستندات',
  docType: 'نوع المستند',
  clearanceLocation: 'مكان التخليص',
  shipmentPurpose: 'الغرض من الشحنة',
  hasImportCard: 'كارت استيرادي',
  invoiceValue: 'القيمة الجمركية',
  invoiceCurrency: 'عملة الفاتورة',
  hsCode: 'الكود الجمركي',
  howFound: 'كيف علمت بنا'
};

export const valueMap = {
  'individual': 'فرد',
  'company': 'شركة',
  'trader': 'تاجر',
  'factory': 'مصنع',
  'furniture': 'أثاث',
  'fruits_vegetables': 'فواكه وخضار',
  'chemicals': 'مواد كيميائية',
  'electronics': 'أجهزة كهربائية',
  'other': 'أخرى',
  'yes': 'نعم',
  'no': 'لا',
  'bank_transfer': 'تحويل بنكي',
  'vodafone_cash': 'فودافون كاش',
  'instapay': 'InstaPay',
  'cash': 'كاش',
  'package': 'طرود',
  'document': 'مستندات',
  'container': 'حاوية'
};

/**
 * Format a dynamic field key and value for display
 * @param {string} key 
 * @param {any} value 
 * @returns {{label: string, value: string}}
 */
export const formatOrderField = (key, value) => {
  const label = fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();
  
  let displayValue = value;
  if (valueMap[value]) {
    displayValue = valueMap[value];
  } else if (value && (key.toLowerCase().includes('date') || key.toLowerCase().endsWith('at'))) {
    // Attempt date formatting if it looks like a date
    const date = new Date(value);
    if (!isNaN(date.getTime()) && value.toString().length > 10) { // Simple check to avoid formatting short strings/numbers
       displayValue = date.toLocaleDateString('ar-EG');
    }
  }

  return { label, value: displayValue ? displayValue.toString() : '' };
};
