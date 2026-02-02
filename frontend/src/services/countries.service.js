import axios from 'axios';

const COUNTRIES_API = 'https://restcountries.com/v3.1/all';

class CountriesService {
  /**
   * Fetch all countries from REST Countries API
   * Returns sorted list with Arabic names and phone codes
   */
  async getAllCountries() {
    try {
      const response = await axios.get(COUNTRIES_API);
      
      const countries = response.data
        .map(country => {
          // Get phone code
          const phoneCode = country.idd?.root 
            ? country.idd.root + (country.idd.suffixes?.[0] || '')
            : '';

          // Get Arabic name from translations
          const nameAr = country.translations?.ara?.common 
            || country.name?.common 
            || country.cca2;

          return {
            code: country.cca2, // ISO 2-letter code
            nameEn: country.name?.common || country.cca2,
            nameAr: nameAr,
            phoneCode: phoneCode,
            flag: country.flags?.png || country.flags?.svg || ''
          };
        })
        .filter(country => country.phoneCode) // Only countries with phone codes
        .sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar')); // Sort by Arabic name

      return countries;
    } catch (error) {
      console.error('Error fetching countries from API:', error);
      // Return fallback data if API fails
      return this.getFallbackCountries();
    }
  }

  /**
   * Fallback countries data in case API is unavailable
   */
  getFallbackCountries() {
    return [
      { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', phoneCode: '+20', flag: '' },
      { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', phoneCode: '+966', flag: '' },
      { code: 'AE', nameEn: 'UAE', nameAr: 'الإمارات', phoneCode: '+971', flag: '' },
      { code: 'CN', nameEn: 'China', nameAr: 'الصين', phoneCode: '+86', flag: '' },
      { code: 'US', nameEn: 'USA', nameAr: 'أمريكا', phoneCode: '+1', flag: '' },
      { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', phoneCode: '+90', flag: '' },
      { code: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا', phoneCode: '+49', flag: '' },
      { code: 'FR', nameEn: 'France', nameAr: 'فرنسا', phoneCode: '+33', flag: '' },
      { code: 'GB', nameEn: 'United Kingdom', nameAr: 'بريطانيا', phoneCode: '+44', flag: '' },
      { code: 'IT', nameEn: 'Italy', nameAr: 'إيطاليا', phoneCode: '+39', flag: '' },
      { code: 'ES', nameEn: 'Spain', nameAr: 'إسبانيا', phoneCode: '+34', flag: '' },
      { code: 'NL', nameEn: 'Netherlands', nameAr: 'هولندا', phoneCode: '+31', flag: '' },
      { code: 'BE', nameEn: 'Belgium', nameAr: 'بلجيكا', phoneCode: '+32', flag: '' },
      { code: 'GR', nameEn: 'Greece', nameAr: 'اليونان', phoneCode: '+30', flag: '' },
      { code: 'IN', nameEn: 'India', nameAr: 'الهند', phoneCode: '+91', flag: '' },
      { code: 'SG', nameEn: 'Singapore', nameAr: 'سنغافورة', phoneCode: '+65', flag: '' },
      { code: 'MY', nameEn: 'Malaysia', nameAr: 'ماليزيا', phoneCode: '+60', flag: '' },
      { code: 'TH', nameEn: 'Thailand', nameAr: 'تايلاند', phoneCode: '+66', flag: '' },
      { code: 'VN', nameEn: 'Vietnam', nameAr: 'فيتنام', phoneCode: '+84', flag: '' },
      { code: 'KR', nameEn: 'South Korea', nameAr: 'كوريا الجنوبية', phoneCode: '+82', flag: '' },
      { code: 'JP', nameEn: 'Japan', nameAr: 'اليابان', phoneCode: '+81', flag: '' },
      { code: 'AU', nameEn: 'Australia', nameAr: 'أستراليا', phoneCode: '+61', flag: '' },
      { code: 'BR', nameEn: 'Brazil', nameAr: 'البرازيل', phoneCode: '+55', flag: '' },
      { code: 'CA', nameEn: 'Canada', nameAr: 'كندا', phoneCode: '+1', flag: '' },
      { code: 'MX', nameEn: 'Mexico', nameAr: 'المكسيك', phoneCode: '+52', flag: '' },
      { code: 'ZA', nameEn: 'South Africa', nameAr: 'جنوب أفريقيا', phoneCode: '+27', flag: '' },
      { code: 'RU', nameEn: 'Russia', nameAr: 'روسيا', phoneCode: '+7', flag: '' },
      { code: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', phoneCode: '+965', flag: '' },
      { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', phoneCode: '+974', flag: '' },
      { code: 'OM', nameEn: 'Oman', nameAr: 'عمان', phoneCode: '+968', flag: '' },
      { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', phoneCode: '+973', flag: '' },
      { code: 'JO', nameEn: 'Jordan', nameAr: 'الأردن', phoneCode: '+962', flag: '' },
      { code: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان', phoneCode: '+961', flag: '' },
      { code: 'MA', nameEn: 'Morocco', nameAr: 'المغرب', phoneCode: '+212', flag: '' },
      { code: 'DZ', nameEn: 'Algeria', nameAr: 'الجزائر', phoneCode: '+213', flag: '' },
      { code: 'TN', nameEn: 'Tunisia', nameAr: 'تونس', phoneCode: '+216', flag: '' },
      { code: 'LY', nameEn: 'Libya', nameAr: 'ليبيا', phoneCode: '+218', flag: '' },
      { code: 'SD', nameEn: 'Sudan', nameAr: 'السودان', phoneCode: '+249', flag: '' },
      { code: 'IQ', nameEn: 'Iraq', nameAr: 'العراق', phoneCode: '+964', flag: '' },
      { code: 'SY', nameEn: 'Syria', nameAr: 'سوريا', phoneCode: '+963', flag: '' },
      { code: 'YE', nameEn: 'Yemen', nameAr: 'اليمن', phoneCode: '+967', flag: '' },
      { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', phoneCode: '+92', flag: '' },
      { code: 'BD', nameEn: 'Bangladesh', nameAr: 'بنغلاديش', phoneCode: '+880', flag: '' },
      { code: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا', phoneCode: '+62', flag: '' },
      { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين', phoneCode: '+63', flag: '' },
      { code: 'IR', nameEn: 'Iran', nameAr: 'إيران', phoneCode: '+98', flag: '' }
    ].sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar'));
  }
}

export default new CountriesService();
