const { sendEmail } = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   */
  async sendEmail(to, subject, html) {
    try {
      const result = await sendEmail(to, subject, html);
      return result;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new customer
   */
  async sendWelcomeEmail(email, name) {
    const subject = 'مرحباً بك في مرحال جو - Welcome to MirhalGO';
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #5D5CDE 0%, #4845B8 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .content ul { text-align: right; padding-right: 20px; }
          .button { background-color: #5D5CDE; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 مرحال جو</h1>
            <p>شريكك الموثوق في خدمات الشحن</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name}!</h2>
            <p>شكراً لانضمامك إلى منصة مرحال جو للشحن والخدمات اللوجستية.</p>
            <p>يمكنك الآن:</p>
            <ul>
              <li>✅ طلب شحنات دولية ومحلية</li>
              <li>✅ الحصول على عروض أسعار من شركات الشحن</li>
              <li>✅ تتبع شحناتك في أي وقت</li>
              <li>✅ إدارة جميع طلباتك من مكان واحد</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/customer" class="button">ابدأ الآن</a>
            <p style="margin-top: 30px;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
            <p>هذا البريد الإلكتروني تم إرساله من منصة مرحال جو</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(email, name, orderNumber, orderType) {
    const subject = `تأكيد الطلب ${orderNumber} - MirhalGO Order Confirmation`;
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .content ul, .content ol { text-align: right; padding-right: 20px; }
          .order-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right; }
          .button { background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ تم استلام طلبك</h1>
          </div>
          <div class="content">
            <h2>عزيزي ${name}</h2>
            <p>شكراً لك! تم استلام طلبك بنجاح وجاري مراجعته من قبل شركات الشحن.</p>
            
            <div class="order-box">
              <h3>تفاصيل الطلب:</h3>
              <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
              <p><strong>نوع الشحنة:</strong> ${orderType}</p>
              <p><strong>الحالة:</strong> قيد المراجعة</p>
            </div>

            <p>سنقوم بإشعارك عبر البريد الإلكتروني فور استلام عروض الأسعار من شركات الشحن.</p>
            <p><strong>الخطوات القادمة:</strong></p>
            <ol>
              <li>شركات الشحن ستراجع طلبك</li>
              <li>سوف تستلم عروض الأسعار خلال 24 ساعة</li>
              <li>يمكنك اختيار أفضل عرض يناسبك</li>
            </ol>

            <a href="${process.env.FRONTEND_URL}/customer/orders" class="button">متابعة الطلب</a>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send notification when customer receives an offer
   */
  async sendOfferReceivedNotification(email, name, orderNumber, companyName, price, currency) {
    const subject = `عرض سعر جديد للطلب ${orderNumber} - New Offer`;
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .content ul { text-align: right; padding-right: 20px; }
          .offer-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3B82F6; text-align: right; }
          .button { background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 عرض سعر جديد!</h1>
          </div>
          <div class="content">
            <h2>عزيزي ${name}</h2>
            <p>تم استلام عرض سعر جديد للطلب رقم <strong>${orderNumber}</strong></p>
            
            <div class="offer-box">
              <h3>تفاصيل العرض:</h3>
              <p><strong>شركة الشحن:</strong> ${companyName}</p>
              <p><strong>السعر:</strong> ${price} ${currency}</p>
              <p style="color: #dc2626; margin-top: 15px;">⏰ العرض صالح لمدة 48 ساعة</p>
            </div>

            <p>قم بمراجعة العرض واتخاذ القرار المناسب:</p>
            <ul>
              <li>✅ قبول العرض والمتابعة</li>
              <li>⏳ انتظار عروض أخرى</li>
              <li>❌ رفض العرض</li>
            </ul>

            <a href="${process.env.FRONTEND_URL}/customer/orders" class="button">مراجعة العرض</a>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send company approval email
   */
  async sendCompanyApprovalEmail(email, companyName, password) {
    const subject = 'تم الموافقة على طلب التسجيل - Company Registration Approved';
    
    let passwordSection = '';
    if (password) {
      passwordSection = `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin-top: 0; color: #4b5563;">معلومات الدخول الجديدة:</h3>
          <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>كلمة المرور:</strong> ${password}</p>
        </div>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">
            ⚠️ تنبيه هام: يرجى تغيير كلمة المرور فور تسجيل الدخول من صفحة الإعدادات لضمان أمان حسابك.
          </p>
        </div>
      `;
    } else {
        passwordSection = `<p>قم بتسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور الحالية.</p>`;
    }

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .content ul { text-align: right; padding-right: 20px; }
          .button { background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 مبروك! تمت الموافقة</h1>
          </div>
          <div class="content">
            <h2>مرحباً بك في عائلة مرحال جو!</h2>
            <p>يسعدنا إبلاغك بأنه تمت الموافقة على طلب تسجيل شركة <strong>${companyName}</strong> في منصة مرحال جو.</p>
            
            <p><strong>يمكنك الآن:</strong></p>
            <ul>
              <li>✅ مشاهدة الطلبات المتاحة</li>
              <li>✅ تقديم عروض الأسعار</li>
              <li>✅ إدارة عملائك</li>
              <li>✅ تتبع الطلبات</li>
            </ul>

            ${passwordSection}

            <a href="${process.env.FRONTEND_URL}/company" class="button">تسجيل الدخول</a>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send company rejection email
   */
  async sendCompanyRejectionEmail(email, companyName, reason) {
    const subject = 'بخصوص طلب التسجيل - Company Registration Update';
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .reason-box { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #EF4444; text-align: right; }
          .button { background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>بخصوص طلب التسجيل</h1>
          </div>
          <div class="content">
            <h2>شكراً لاهتمامك بمنصة مرحال جو</h2>
            <p>نأسف لإبلاغك بأنه لم نتمكن من الموافقة على طلب تسجيل ${companyName} في الوقت الحالي.</p>
            
            <div class="reason-box">
              <h3>السبب:</h3>
              <p>${reason || 'لم يتم تحديد السبب'}</p>
            </div>

            <p>يمكنك التواصل معنا مباشرة لمعرفة المزيد من التفاصيل أو إعادة تقديم الطلب بعد استيفاء المتطلبات.</p>

            <a href="${process.env.FRONTEND_URL}/contact" class="button">تواصل معنا</a>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send new order notification to company
   */
  async sendNewOrderNotificationToCompany(email, companyName, orderNumber, orderType) {
    const subject = `طلب شحن جديد متاح ${orderNumber} - New Order Available`;
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl; text-align: right; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { padding: 30px; text-align: right; }
          .button { background-color: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 طلب جديد متاح!</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${companyName}</h2>
            <p>هناك طلب شحن جديد يمكنك تقديم عرض سعر له:</p>
            
            <p><strong>رقم الطلب:</strong> ${orderNumber}</p>
            <p><strong>نوع الشحنة:</strong> ${orderType}</p>

            <p>قم بمراجعة تفاصيل الطلب وتقديم أفضل عرض لديك!</p>

            <a href="${process.env.FRONTEND_URL}/company/offers" class="button">مشاهدة الطلب</a>
          </div>
          <div class="footer">
            <p>© 2024 MirhalGO. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  /**
   * Send email verification code to customer
   */
  async sendVerificationCode(email, name, code) {
    const subject = 'رمز التحقق - MirhalGO Email Verification';
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body { font-family: 'Cairo', Arial, sans-serif !important; background-color: #f7f7f7; padding: 20px; direction: rtl; text-align: right; margin: 0; }
          .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7f7; padding-bottom: 40px; }
          .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .content { padding: 40px 30px; text-align: right; color: #374151; font-size: 16px; line-height: 1.6; }
          .greeting { font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #111827; }
          .code-container { text-align: center; margin: 30px 0; background-color: #f3f4f6; border-radius: 12px; padding: 24px; border: 2px dashed #d1d5db; }
          .code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 4px; display: block; background: #fff; padding: 10px 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); width: fit-content; margin: 0 auto; }
          .expiry-text { font-size: 14px; color: #ef4444; margin-top: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; }
          .footer { background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
          .link { color: #4f46e5; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <table class="main-table" align="center" dir="rtl">
            <!-- Header -->
            <tr>
              <td class="header">
                <h1>🔐 كود التحقق</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td class="content">
                <div class="greeting">مرحباً {name} 👋</div>
                <p>شكراً لاختيارك منصة <strong>مرحال جو</strong>. لإكمال عملية التسجيل وتأمين حسابك، يرجى استخدام رمز التحقق التالي:</p>
                
                <div class="code-container">
                  <span class="code">{code}</span>
                  <div class="expiry-text">
                     ⚠️ هذا الرمز صالح لمدة 15 دقيقة فقط
                  </div>
                </div>

                <p>إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني بأمان.</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p>&copy; 2026 MirhalGO. جميع الحقوق محفوظة.</p>
                <p>تم الإرسال من منصة مرحال جو لخدمات الشحن واللوجستيات.</p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    // Replace placeholders manually to ensure no injection issues with styles
    const finalHtml = html.replace('{name}', name).replace('{code}', code);

    return this.sendEmail(email, subject, finalHtml);
  }
}

module.exports = new EmailService();

