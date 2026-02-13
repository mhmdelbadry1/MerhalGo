import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Globe, TrendingUp, Shield, Clock, Award, Users, Truck, Star, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * About/Company Page - SEO Optimized (Arabic Version)
 * 
 * Purpose: 
 * - Improve search engine rankings with content-rich about page
 * - Showcase company mission, services, and values in Arabic
 * - Build trust with Egyptian market through localized content
 * - Provide engaging animations for better user experience
 * 
 * Why we use Framer Motion:
 * - Creates smooth, professional animations that grab attention
 * - Improves user engagement and time-on-page (good for SEO)
 * - Makes the site feel modern and trustworthy
 * - Provides better mobile experience with touch-optimized animations
 * 
 * Usage:
 * 1. Accessible at: /about
 * 2. Link from footer/navbar: <Link to="/about">من نحن</Link>
 * 3. Already added to App.jsx routing
 */

const AboutPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <i className="fas fa-route text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">مرحال جو</h1>
              <p className="text-xs text-gray-500">MirhalGO</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              {isArabic ? 'الرئيسية' : 'Home'}
            </button>
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact-section');
                contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-20 pb-12 px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {isArabic ? 'من نحن' : 'About Us'}
              <span className="block text-3xl md:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-3">
                {isArabic ? 'مرحال جو - شريكك في الشحن' : 'MirhalGO - Your Shipping Partner'}
              </span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed"
          >
            {isArabic 
              ? 'منصة الشحن الرائدة في مصر التي تربط العملاء بأفضل شركات الشحن الموثوقة'
              : 'Egypt\'s leading shipping platform connecting customers with the best trusted freight companies'}
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto"
          >
            {isArabic
              ? 'نقدم خدمات شحن محلية ودولية بأسعار تنافسية وجودة عالية'
              : 'We offer local and international shipping services at competitive prices and high quality'}
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-16 px-4 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {isArabic ? 'رسالتنا' : 'Our Mission'}
              </h2>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {isArabic
                  ? 'نسعى في مرحال جو لإحداث ثورة في صناعة الشحن في مصر من خلال إنشاء سوق شفاف وفعال حيث يمكن للعملاء بسهولة مقارنة العروض من عدة شركات شحن موثوقة.'
                  : 'At MirhalGO, we strive to revolutionize the shipping industry in Egypt by creating a transparent and efficient marketplace where customers can easily compare offers from multiple trusted shipping companies.'}
              </p>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {isArabic
                  ? 'نتخصص في الشحن المحلي والدولي، مع خبرة واسعة في شحن المنتجات الصينية من منصات شي إن، علي إكسبريس، وتاوباو، ونقدم خدمات شحن متكاملة.'
                  : 'We specialize in local and international shipping, with extensive experience in Chinese product shipping from platforms like Shein, AliExpress, and Taobao, providing comprehensive shipping services.'}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {isArabic
                  ? 'منصتنا تضمن أسعاراً تنافسية، خدمة موثوقة، وشفافية كاملة طوال عملية الشحن.'
                  : 'Our platform ensures competitive pricing, reliable service, and complete transparency throughout the shipping process.'}
              </p>
              
              <motion.div 
                className="mt-8 flex flex-wrap gap-4"
                variants={itemVariants}
              >
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all font-bold text-lg"
                >
                  {isArabic ? 'ابدأ الآن' : 'Get Started'}
                </button>
                <a 
                  href="mailto:mirhal.egy@gmail.com"
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-bold text-lg flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {isArabic ? 'تواصل معنا' : 'Contact Us'}
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={containerVariants}
            >
              <StatCard icon={<Package className="w-8 h-8" />} number="+1000" label={isArabic ? 'شحنة تم توصيلها' : 'Delivered Shipments'} />
              <StatCard icon={<Globe className="w-8 h-8" />} number="+50" label={isArabic ? 'دولة' : 'Countries'} />
              <StatCard icon={<Users className="w-8 h-8" />} number="+100" label={isArabic ? 'شريك موثوق' : 'Trusted Partners'} />
              <StatCard icon={<Star className="w-8 h-8" />} number="4.8/5" label={isArabic ? 'تقييم العملاء' : 'Customer Rating'} />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        id="services-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center"
          >
            {isArabic ? 'خدماتنا' : 'Our Services'}
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            <ServiceCard
              icon={<Globe className="w-10 h-10" />}
              title={isArabic ? 'الشحن الدولي' : 'International Shipping'}
              description={isArabic 
                ? 'شحن من أي مكان في العالم إلى مصر بأسعار تنافسية وأوقات توصيل موثوقة.'
                : 'Ship from anywhere in the world to Egypt with competitive prices and reliable delivery times.'}
              features={isArabic 
                ? ['شحن من الصين', 'الطرق الأوروبية', 'أمريكا وكندا', 'التخليص الجمركي']
                : ['China Shipping', 'European Routes', 'USA & Canada', 'Customs Clearance']}
              onClick={() => navigate('/')}
            />
            <ServiceCard
              icon={<Truck className="w-10 h-10" />}
              title={isArabic ? 'التوصيل المحلي' : 'Local Delivery'}
              description={isArabic
                ? 'توصيل سريع وفعال عبر جميع المدن والمحافظات المصرية.'
                : 'Fast and efficient delivery across all Egyptian cities and governorates.'}
              features={isArabic
                ? ['توصيل في نفس اليوم', 'خدمة اليوم التالي', 'من الباب للباب', 'نظام التتبع']
                : ['Same-Day Delivery', 'Next-Day Service', 'Door-to-Door', 'Tracking System']}
              onClick={() => navigate('/')}
            />
            <ServiceCard
              icon={<Package className="w-10 h-10" />}
              title={isArabic ? 'شحن التجارة الإلكترونية' : 'E-commerce Shipping'}
              description={isArabic
                ? 'خدمات متخصصة لشي إن، علي إكسبريس، أمازون، وغيرها من المنصات.'
                : 'Specialized services for Shein, AliExpress, Amazon, and other platforms.'}
              features={isArabic
                ? ['طرود شي إن', 'طلبات علي إكسبريس', 'شحن أمازون', 'تجميع الطلبات']
                : ['Shein Packages', 'AliExpress Orders', 'Amazon Shipping', 'Bundle Delivery']}
              onClick={() => navigate('/')}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-12 text-center"
          >
            {isArabic ? 'لماذا تختار مرحال جو؟' : 'Why Choose MirhalGO?'}
          </motion.h2>
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title={isArabic ? 'شركاء موثوقون' : 'Trusted Partners'}
              description={isArabic ? 'جميع شركات الشحن معتمدة وموثوقة' : 'All shipping companies are verified and trusted'}
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12" />}
              title={isArabic ? 'أفضل الأسعار' : 'Best Prices'}
              description={isArabic ? 'قارن العروض واختر الأفضل' : 'Compare offers and choose the best'}
            />
            <FeatureCard
              icon={<Clock className="w-12 h-12" />}
              title={isArabic ? 'معالجة سريعة' : 'Fast Processing'}
              description={isArabic ? 'معالجة الطلبات والشحن بسرعة' : 'Quick order and shipment processing'}
            />
            <FeatureCard
              icon={<MapPin className="w-12 h-12" />}
              title={isArabic ? 'تتبع شامل' : 'Complete Tracking'}
              description={isArabic ? 'تتبع فوري لجميع الشحنات' : 'Real-time tracking for all shipments'}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* SEO Content Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-16 px-4 bg-white"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {isArabic ? 'الشحن من الصين إلى مصر بسهولة' : 'Easy Shipping from China to Egypt'}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {isArabic
                ? 'تتخصص مرحال جو في تسهيل الشحنات من الصين إلى مصر، بما في ذلك المنصات الشهيرة مثل شي إن، علي إكسبريس، وتاوباو. شراكاتنا مع شركات الشحن الرائدة تضمن وصول طرودك بأمان وفي الوقت المحدد.'
                : 'MirhalGO specializes in facilitating shipments from China to Egypt, including popular platforms like Shein, AliExpress, and Taobao. Our partnerships with leading freight companies ensure your packages arrive safely and on time.'}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-8">
              {isArabic ? 'حلول لوجستية شاملة' : 'Comprehensive Logistics Solutions'}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {isArabic
                ? 'سواء كنت بحاجة إلى شحن جوي للشحنات العاجلة أو شحن بحري للطلبات الكبيرة بأسعار اقتصادية، مرحال جو تربطك بشركة الشحن المناسبة. منصتنا تتعامل مع التخليص الجمركي، التوصيل للباب، وتوفر رؤية كاملة طوال عملية الشحن.'
                : 'Whether you need air freight for urgent shipments or sea freight for large orders at economical prices, MirhalGO connects you with the right shipping company. Our platform handles customs clearance, door-to-door delivery, and provides complete visibility throughout the shipping process.'}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 mt-8">
              {isArabic ? 'نخدم جميع أنحاء مصر' : 'Serving All of Egypt'}
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {isArabic
                ? 'من القاهرة والإسكندرية إلى الجيزة، أسوان، وكل مكان بينهما، شبكة مرحال جو تغطي جميع المحافظات المصرية. نقدم خدمات توصيل محلية موثوقة مع خيارات استلام وتسليم مرنة.'
                : 'From Cairo and Alexandria to Giza, Aswan, and everywhere in between, MirhalGO\'s network covers all Egyptian governorates. We provide reliable local delivery services with flexible pickup and delivery options.'}
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl mt-8 border-2 border-blue-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Award className="w-8 h-8 text-blue-600" />
              {isArabic ? 'التزامنا تجاهك' : 'Our Commitment to You'}
            </h3>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <span><strong>{isArabic ? 'الشفافية الكاملة:' : 'Complete Transparency:'}</strong> {isArabic ? 'لا رسوم خفية، أسعار واضحة' : 'No hidden fees, clear prices'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <span><strong>{isArabic ? 'دعم 24/7:' : '24/7 Support:'}</strong> {isArabic ? 'فريقنا جاهز لمساعدتك في أي وقت' : 'Our team is ready to help you anytime'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <span><strong>{isArabic ? 'أمان مضمون:' : 'Guaranteed Safety:'}</strong> {isArabic ? 'تأمين شامل على جميع الشحنات' : 'Comprehensive insurance on all shipments'}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <span><strong>{isArabic ? 'سرعة في التنفيذ:' : 'Fast Execution:'}</strong> {isArabic ? 'معالجة فورية لجميع الطلبات' : 'Immediate processing of all orders'}</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact CTA */}
      <motion.section 
        id="contact-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-16 px-4 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            {isArabic ? 'جاهز للشحن؟' : 'Ready to Ship?'}
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-700 mb-8"
          >
            {isArabic
              ? 'انضم إلى آلاف العملاء الراضين الذين يستخدمون مرحال جو لتلبية احتياجات الشحن الخاصة بهم'
              : 'Join thousands of satisfied customers using MirhalGO for their shipping needs'}
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex gap-4 justify-center flex-wrap"
          >
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg font-bold"
            >
              {isArabic ? 'ابدأ الآن' : 'Get Started'}
            </button>
            <a 
              href="mailto:mirhal.egy@gmail.com"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:scale-105 transition-all text-lg font-bold flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {isArabic ? 'راسلنا' : 'Email Us'}
            </a>
            <a 
              href="https://wa.me/201207240825"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg font-bold flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              {isArabic ? 'واتساب' : 'WhatsApp'}
            </a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

// Helper Components with Animation
const StatCard = ({ icon, number, label }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all"
  >
    <motion.div 
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="mb-3 opacity-90"
    >
      {icon}
    </motion.div>
    <div className="text-3xl font-bold mb-2">{number}</div>
    <div className="text-sm opacity-95">{label}</div>
  </motion.div>
);

const ServiceCard = ({ icon, title, description, features, onClick }) => (
  <motion.div 
    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 }
    }}
    onClick={onClick}
    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 transition-all cursor-pointer"
  >
    <motion.div 
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.6 }}
      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto"
    >
      {icon}
    </motion.div>
    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{title}</h3>
    <p className="text-gray-600 mb-6 leading-relaxed text-center">{description}</p>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <motion.li 
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center text-gray-700 gap-3"
        >
          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
          <span>{feature}</span>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    variants={{
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    }}
    className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all"
  >
    <motion.div 
      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
      transition={{ duration: 0.5 }}
      className="inline-block mb-4 opacity-90"
    >
      {icon}
    </motion.div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-sm opacity-95 leading-relaxed">{description}</p>
  </motion.div>
);

export default AboutPage;
