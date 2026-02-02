import React from 'react';

const ContactIcons = ({ className = '' }) => {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'fa-facebook-f',
      url: 'https://www.facebook.com/share/1A8F2su9hz/?mibextid=wwXIfr',
      color: 'hover:bg-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Instagram',
      icon: 'fa-instagram',
      url: 'https://www.instagram.com/mirhalgo?igsh=aHRtb2QxZmFsYWRr&utm_source=qr',
      color: 'hover:bg-pink-600',
      bgColor: 'bg-pink-500'
    },
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      url: 'https://wa.me/201207240825',
      color: 'hover:bg-green-600',
      bgColor: 'bg-green-500'
    }
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 ${social.bgColor} ${social.color} rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all hover:scale-110`}
          aria-label={social.name}
        >
          <i className={`fab ${social.icon} text-lg`}></i>
        </a>
      ))}
    </div>
  );
};

export default ContactIcons;
