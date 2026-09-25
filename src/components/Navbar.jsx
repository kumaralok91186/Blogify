import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleNav = () => setIsNavCollapsed(!isNavCollapsed);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary bg-dark" data-bs-theme="dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Blogify
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-controls="navbarNavDropdown"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${!isNavCollapsed ? 'show' : ''}`} id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                aria-current={location.pathname === '/' ? 'page' : undefined}
                to="/"
                onClick={() => setIsNavCollapsed(true)}
              >
                Home
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/blog/add-new' ? 'active' : ''}`}
                    to="/blog/add-new"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    Add Blog
                  </Link>
                </li>

                <li className={`nav-item dropdown ${isDropdownOpen ? 'show' : ''}`}>
                  <button
                    className="nav-link dropdown-toggle btn btn-link"
                    style={{ textDecoration: 'none', background: 'transparent', border: 'none' }}
                    onClick={toggleDropdown}
                    aria-expanded={isDropdownOpen}
                  >
                    {user.fullName}
                  </button>
                  <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                    <li>
                      <button
                        className="dropdown-item btn btn-link"
                        onClick={(e) => {
                          setIsDropdownOpen(false);
                          setIsNavCollapsed(true);
                          handleLogout(e);
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/user/signup' ? 'active' : ''}`}
                    to="/user/signup"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    Create Account
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/user/signin' ? 'active' : ''}`}
                    to="/user/signin"
                    onClick={() => setIsNavCollapsed(true)}
                  >
                    Signin
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
