import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3>📰 YouBlog</h3>
            <p>A premium blogging platform where writers share ideas, stories, and insights with a global audience.</p>
            <p>Crafted with passion and modern web technologies.</p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>🔗 Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              {user ? (
                <>
                  <li><Link to="/blog/add-new">Write Blog</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/user/signin">Sign In</Link></li>
                  <li><Link to="/user/signup">Join Us</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h3>📚 Resources</h3>
            <ul className="footer-links">
              <li><a href="#">Blog Guidelines</a></li>
              <li><a href="#">Writing Tips</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h3>⚖️ Legal</h3>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2025-2026 YouBlog. All rights reserved. | Designed with ❤️ by Your Team</p>
          </div>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" title="Facebook">f</a>
            <a href="#" className="footer-social-link" title="Twitter">𝕏</a>
            <a href="#" className="footer-social-link" title="Instagram">📷</a>
            <a href="#" className="footer-social-link" title="LinkedIn">in</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
