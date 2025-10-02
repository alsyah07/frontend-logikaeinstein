import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('CATEGORY');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const categories = {
    'FISIKA': [
      'Fisika Dasar',
      'Fisika Kelas 10',
      'Fisika Kelas 11',
      'Fisika Kelas 7',
      'Fisika Kelas 8',
      'Fisika Kelas 9',
      'Fisika UTBK'
    ],
    'MATEMATIKA': [
      'Matematika Dasar',
      'Matematika Kelas 10',
      'Matematika Kelas 11',
      'Matematika Kelas 12',
      'Matematika UTBK'
    ]
  };

  // Tutup menu jika klik item
  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
    // Implementasi search logic di sini
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryDropdownOpen(false);
  };

  // Tutup menu otomatis saat resize ke desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.category-dropdown')) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="modern-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section">
          <Link to="/" className="logo-link" onClick={handleMenuItemClick}>
            <div className="logo-content">
              <img src="/assets/images/logo-icon.png" alt="Logo" className="logo-icon" />
              <span className="logo-text">Logika Einstein</span>
            </div>
          </Link>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            {/* Category Dropdown */}
            <div className="category-dropdown">
              <button
                type="button"
                className="category-button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                {selectedCategory}
                <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="category-dropdown-menu">
                  {Object.entries(categories).map(([mainCategory, subCategories]) => (
                    <div key={mainCategory} className="category-group">
                      <div className="category-header">{mainCategory}</div>
                      {subCategories.map((subCategory) => (
                        <button
                          key={subCategory}
                          type="button"
                          className="category-option"
                          onClick={() => handleCategorySelect(subCategory)}
                        >
                          {subCategory}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search courses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Navigation Menu */}
        <div className="nav-section">
          <nav className="main-navigation">
            <NavigationMenu onMenuItemClick={handleMenuItemClick} />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className={`mobile-menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <form onSubmit={handleSearch}>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mobile-category-select"
              >
                <option value="CATEGORY">CATEGORY</option>
                {Object.entries(categories).map(([mainCategory, subCategories]) => (
                  <optgroup key={mainCategory} label={mainCategory}>
                    {subCategories.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>{subCategory}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="mobile-search-input">
                <input
                  type="text"
                  placeholder="Search courses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          <NavigationMenu onMenuItemClick={handleMenuItemClick} />
        </div>
      )}

      {/* Overlay Mobile */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Modern Header Styling */}
      <style>{`
        .modern-header {
          background: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 70px;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo Section */
        .logo-section {
          flex-shrink: 0;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          color: #2563eb;
        }

        /* Search Section */
        .search-section {
          flex: 1;
          max-width: 600px;
          margin: 0 40px;
        }

        .search-form {
          display: flex;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-dropdown {
          position: relative;
        }

        .category-button {
          background: none;
          border: none;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          border-right: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .dropdown-arrow {
          width: 16px;
          height: 16px;
        }

        .category-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 1001;
          min-width: 200px;
          max-height: 400px;
          overflow-y: auto;
        }

        .category-group {
          border-bottom: 1px solid #e2e8f0;
        }

        .category-group:last-child {
          border-bottom: none;
        }

        .category-header {
          padding: 12px 16px 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .category-option {
          display: block;
          width: 100%;
          padding: 10px 16px 10px 24px;
          text-align: left;
          background: none;
          border: none;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .category-option:hover {
          background: #f3f4f6;
        }

        .search-input-container {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-input {
          flex: 1;
          border: none;
          background: none;
          padding: 12px 16px;
          font-size: 14px;
          outline: none;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-button {
          background: #3b82f6;
          border: none;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .search-button:hover {
          background: #2563eb;
        }

        .search-icon {
          width: 20px;
          height: 20px;
          color: white;
        }

        /* Navigation Section */
        .nav-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .main-navigation {
          display: flex;
          align-items: center;
        }

        .nav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 32px;
          align-items: center;
        }

        .nav li {
          position: relative;
        }

        .nav a {
          text-decoration: none;
          color: #000000;
          font-weight: 500;
          font-size: 14px;
          transition: color 0.2s;
          display: block;
          padding: 8px 0;
        }

        .nav a:hover {
          color: #3b82f6;
        }

        .nav a.active {
          color: #3b82f6;
        }

        /* Dropdown Menu Styling */
        .submenu .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          min-width: 250px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 20px 0;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .submenu:hover .dropdown-menu,
        .submenu.active .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-menu li {
          padding: 0;
        }

        .dropdown-menu a {
          padding: 12px 25px;
          color: #000000;
          font-size: 14px;
          border-bottom: none;
        }

        .dropdown-menu a:hover {
          background: #f8fafc;
          color: #3b82f6;
        }

        .category-header {
          padding: 12px 25px;
          font-weight: 700;
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 5px;
        }

        /* Login Button Styling */
        .main-blue-button {
          margin-left: 20px;
        }

        .main-blue-button a {
          background: #3b82f6;
          color: white;
          font-weight: 600;
          font-size: 14px;
          padding: 10px 20px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .main-blue-button a:hover {
          background: #2563eb;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          gap: 4px;
        }

        .mobile-menu-toggle span {
          width: 24px;
          height: 2px;
          background: #374151;
          transition: all 0.3s;
        }

        .mobile-menu-toggle.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .mobile-menu-toggle.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          padding: 20px;
          z-index: 1000;
          max-height: calc(100vh - 70px);
          overflow-y: auto;
        }

        .mobile-search {
          margin-bottom: 20px;
        }

        .mobile-category-select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .mobile-search-input {
          display: flex;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .mobile-search-input input {
          flex: 1;
          padding: 12px;
          border: none;
          outline: none;
          font-size: 14px;
        }

        .mobile-search-input button {
          background: #3b82f6;
          border: none;
          padding: 12px 16px;
          cursor: pointer;
        }

        .mobile-search-input svg {
          width: 20px;
          height: 20px;
          color: white;
        }

        /* Mobile Navigation Menu */
        .mobile-menu .nav {
          flex-direction: column;
          gap: 0;
          width: 100%;
        }

        .mobile-menu .nav li {
          width: 100%;
          border-bottom: 1px solid #f1f5f9;
        }

        .mobile-menu .nav a {
          padding: 16px 0;
          color: #000000;
          font-weight: 500;
        }
        
        .mobile-menu .nav a:hover {
          color: #3b82f6;
        }
        
        .mobile-menu .main-white-button {
          margin-left: 0;
          margin-top: 16px;
          width: 100%;
          position: relative;
          z-index: 1001;
        }
        
        .mobile-menu .main-white-button button {
          display: block;
          text-align: center;
          width: 100%;
          padding: 14px 20px;
          font-size: 16px;
          border-radius: 8px;
          position: relative;
          z-index: 1001;
          pointer-events: auto;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mobile Dropdown Menu */
        .mobile-menu .submenu .dropdown-menu {
          position: static;
          opacity: 1;
          visibility: visible;
          transform: none;
          box-shadow: none;
          background: #f8fafc;
          margin-top: 8px;
          border-radius: 6px;
          padding: 10px 0;
        }
        
        .mobile-menu .submenu .dropdown-menu a {
          padding: 8px 20px;
          font-size: 13px;
        }
        
        .mobile-menu .category-header {
          padding: 8px 20px;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .search-section {
            margin: 0 20px;
            max-width: 400px;
          }
          
          .nav-menu {
            gap: 16px;
          }
          
          .auth-buttons {
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            padding: 0 16px;
          }
          
          .main-navigation {
            display: none;
          }
          
          .mobile-menu-toggle {
            display: flex;
          }
          
          .search-section {
            display: none;
          }
          
          .logo-text {
            font-size: 18px;
          }
          
          /* Hide desktop dropdown menus on mobile */
          .submenu .dropdown-menu {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .header-container {
            padding: 0 12px;
          }
          
          .logo-text {
            font-size: 16px;
          }
          
          .logo-icon {
            width: 28px;
            height: 28px;
          }
          
          .mobile-menu {
            padding: 16px;
          }
          
          .mobile-search {
            margin-bottom: 16px;
          }
        }
      `}</style>

    </header>
  );
};

export default Header;
