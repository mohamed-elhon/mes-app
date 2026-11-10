import React from 'react';
import { Link } from 'react-router-dom';
import { SITE_NAME, FOOTER_LINKS, SOCIAL_LINKS } from '../../utils/constants';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

// Social icons mapping
const SOCIAL_ICONS = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: LinkedIn,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="footer-section">
            <h3 className="text-white text-2xl font-bold mb-4">{SITE_NAME}</h3>
            <p className="text-gray-400 mb-6">
              Your one-stop shop for quality products at affordable prices.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => {
                const Icon = SOCIAL_ICONS[link.icon] || Mail;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-colors duration-200"
                    aria-label={link.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div className="footer-section">
            <h4 className="footer-title">Shop</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="footer-section">
            <h4 className="footer-title">Account</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h5 className="text-white font-semibold mb-1">Email Us</h5>
              <p className="text-gray-400 text-sm">support@ecommerce.com</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h5 className="text-white font-semibold mb-1">Call Us</h5>
              <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h5 className="text-white font-semibold mb-1">Visit Us</h5>
              <p className="text-gray-400 text-sm">
                123 Main Street, City, Country
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex-between text-sm text-gray-400">
          <p>© {currentYear} {SITE_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
