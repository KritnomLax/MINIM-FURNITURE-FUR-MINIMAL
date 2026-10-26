import React from 'react';
import { Globe, MessageCircle, Share2, Mail, MapPin, Phone } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-grid">
          
          <div className="footer-section brand-section">
            <h2 className="footer-logo">MINI<span>M</span></h2>
            <p className="footer-desc">
              Premium minimalist furniture designed for modern living. We believe in simplicity, functionality, and uncompromising quality.
            </p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><Globe size={20} /></a>
              <a href="#" aria-label="Instagram"><MessageCircle size={20} /></a>
              <a href="#" aria-label="Twitter"><Share2 size={20} /></a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Shop Collection</a></li>
              <li><a href="#designer">3D Designer</a></li>
              <li><a href="#about">Our Story</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Customer Service</h3>
            <ul className="footer-links">
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Care Guide</a></li>
              <li><a href="#">Terms & Conditions</a></li>
            </ul>
          </div>

          <div className="footer-section contact-section">
            <h3 className="footer-heading">Contact Us</h3>
            <ul className="contact-info">
              <li>
                <MapPin size={18} />
                <span>123 Minimalist Ave, Design District, NY 10001</span>
              </li>
              <li>
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <Mail size={18} />
                <span>support@minim.com</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MINIM Furniture. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
