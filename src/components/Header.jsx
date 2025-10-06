import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import NavigationMenu from "./NavigationMenu";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL CATEGORIES");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const categoryRef = useRef(null);

  // Base URL untuk API
  const API_BASE_URL = 'http://localhost:3100/api/v1';

  // Fetch categories (mapel) from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/mapel`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch sub categories (sub_mapel) from API
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/sub_mapel`);
        if (response.data.success) {
          setSubCategories(response.data.data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching sub categories:', error);
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  // Group sub categories by mapel
  const groupedCategories = categories.reduce((acc, mapel) => {
    acc[mapel.mapel] = subCategories.filter(
      sub => sub.id_mapel === mapel.id_mapel && sub.status === 1
    );
    return acc;
  }, {});

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching:", searchQuery, "in category:", selectedCategory, "ID:", selectedCategoryId);
  };

  const handleCategorySelect = (subMapel) => {
    setSelectedCategory(subMapel.sub_mapel);
    setSelectedCategoryId(subMapel.id_sub_mapel);
    setCategoryDropdownOpen(false);
    setExpandedCategory(null);
  };

  const handleResetCategory = () => {
    setSelectedCategory("ALL CATEGORIES");
    setSelectedCategoryId(null);
    setCategoryDropdownOpen(false);
    setExpandedCategory(null);
  };

  const toggleMainCategory = (mainCategory) => {
    setExpandedCategory(expandedCategory === mainCategory ? null : mainCategory);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        .header-wrapper {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .header-wrapper .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 0.65rem 1rem;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: transform 0.2s ease;
        }
        .logo-link:hover {
          transform: translateY(-2px);
        }

        .logo-icon {
          height: 44px;
          transition: transform 0.3s ease;
        }
        .logo-link:hover .logo-icon {
          transform: rotate(5deg);
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .search-form {
          flex-grow: 1;
          max-width: 720px;
          margin: 0 1.5rem;
        }
        .input-group {
          height: 44px;
        }
        .category-button {
          min-width: 160px;
          border: 1px solid #dee2e6;
          background: white;
          color: #495057;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.625rem 1rem;
          border-radius: 8px 0 0 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .category-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .category-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          max-height: 450px;
          overflow-y: auto;
          width: 280px;
          z-index: 1000;
          animation: dropdownSlide 0.2s ease;
        }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item-custom {
          padding: 0.625rem 1.25rem;
          color: #495057;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dropdown-item-custom:hover {
          background: #f1f3f5;
          color: #0d6efd;
          padding-left: 1.5rem;
        }
        .dropdown-item-custom.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          font-weight: 500;
        }

        .main-category-item {
          padding: 0.75rem 1.25rem;
          color: #212529;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .main-category-item:hover {
          background: #e9ecef;
          color: #0d6efd;
        }
        .main-category-item i {
          transition: transform 0.2s ease;
        }
        .main-category-item.expanded i {
          transform: rotate(180deg);
        }

        .submenu-container {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
          background: #f8f9fa;
        }
        .submenu-container.expanded {
          max-height: 500px;
        }

        .submenu-item {
          padding: 0.5rem 1.25rem 0.5rem 2.5rem;
          color: #495057;
          transition: all 0.15s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.875rem;
          cursor: pointer;
        }
        .submenu-item:hover {
          background: #e9ecef;
          color: #0d6efd;
          padding-left: 2.75rem;
        }
        .submenu-item.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          font-weight: 500;
        }

        .search-input {
          border: 1px solid #dee2e6;
          border-left: none;
          border-right: none;
          padding: 0.625rem 1rem;
          font-size: 0.95rem;
        }
        .search-input:focus {
          border-color: #0d6efd;
          box-shadow: none;
        }

        .search-button {
          border-radius: 0 8px 8px 0;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
          transition: all 0.2s ease;
        }
        .search-button:hover {
          background: linear-gradient(135deg, #0a58ca 0%, #084298 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        nav a, nav button {
          margin-left: 0.75rem;
        }

        .mobile-toggle {
          border: 1px solid #dee2e6;
          background: white;
          color: #495057;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }
        .mobile-toggle:hover {
          background: #f8f9fa;
          border-color: #0d6efd;
          color: #0d6efd;
        }
        .mobile-menu {
          background: white;
          border-top: 1px solid #dee2e6;
          padding: 1.5rem;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mobile-select {
          border-radius: 8px;
          border: 1px solid #dee2e6;
          padding: 0.625rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        .mobile-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
        }

        @media (max-width: 768px) {
          .search-form { display: none; }
        }
        @media (min-width: 769px) and (max-width: 992px) {
          .search-form { margin: 0 1rem; }
          .category-button {
            min-width: 140px;
            font-size: 0.8rem;
          }
        }
      `}</style>

      <header className="header-wrapper">
        <div className="container d-flex align-items-center justify-content-between py-3">
          <Link to="/" className="logo-link d-flex align-items-center">
            <img
              src="/assets/images/logo-icon.png"
              alt="Logo"
              className="logo-icon me-2"
            />
            <span className="logo-text">Logika Einstein</span>
          </Link>

          <form onSubmit={handleSearch} className="search-form d-none d-md-flex">
            <div className="input-group position-relative">
              <div className="position-relative" ref={categoryRef}>
                <button
                  type="button"
                  className="category-button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  {selectedCategory}
                  <i className={`bi bi-chevron-${categoryDropdownOpen ? "up" : "down"} ms-2`}></i>
                </button>

                {categoryDropdownOpen && (
                  <div className="category-dropdown">
                    <button
                      className={`dropdown-item-custom ${selectedCategory === "ALL CATEGORIES" ? "active" : ""}`}
                      onClick={handleResetCategory}
                    >
                      <span>
                        <i className="bi bi-grid-3x3-gap me-2"></i>
                        All Categories
                      </span>
                    </button>
                    <hr className="my-1" style={{ opacity: 0.1 }} />
                    
                    {loading ? (
                      <div style={{ padding: "1rem", textAlign: "center", color: "#6c757d" }}>
                        <i className="bi bi-hourglass-split me-2"></i>
                        Loading...
                      </div>
                    ) : (
                      Object.entries(groupedCategories).map(([mainCategory, subs]) => (
                        <div key={mainCategory}>
                          <button
                            className={`main-category-item ${expandedCategory === mainCategory ? "expanded" : ""}`}
                            onClick={() => toggleMainCategory(mainCategory)}
                          >
                            <span>
                              <i className="bi bi-folder me-2"></i>
                              {mainCategory}
                            </span>
                            <i className="bi bi-chevron-down"></i>
                          </button>
                          
                          <div className={`submenu-container ${expandedCategory === mainCategory ? "expanded" : ""}`}>
                            {subs.map((sub) => (
                              <button
                                key={sub.id_sub_mapel}
                                className={`submenu-item ${selectedCategoryId === sub.id_sub_mapel ? "active" : ""}`}
                                onClick={() => handleCategorySelect(sub)}
                              >
                                {selectedCategoryId === sub.id_sub_mapel && <i className="bi bi-check2 me-2"></i>}
                                {sub.sub_mapel}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <input
                type="text"
                className="search-input form-control"
                placeholder="Cari kursus, topik, atau materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button btn btn-primary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <nav className="d-none d-md-block">
            <NavigationMenu />
          </nav>

          <button
            className="mobile-toggle btn d-md-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-5`}></i>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu d-md-none">
            <form onSubmit={handleSearch}>
              <select
                className="mobile-select form-select"
                value={selectedCategoryId || "ALL"}
                onChange={(e) => {
                  if (e.target.value === "ALL") {
                    handleResetCategory();
                  } else {
                    const selected = subCategories.find(
                      sub => sub.id_sub_mapel === parseInt(e.target.value)
                    );
                    if (selected) handleCategorySelect(selected);
                  }
                }}
              >
                <option value="ALL">All Categories</option>
                {categories.map((mapel) => (
                  <optgroup key={mapel.id_mapel} label={mapel.mapel}>
                    {subCategories
                      .filter(sub => sub.id_mapel === mapel.id_mapel && sub.status === 1)
                      .map((sub) => (
                        <option key={sub.id_sub_mapel} value={sub.id_sub_mapel}>
                          {sub.sub_mapel}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>

              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari kursus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ borderRadius: "0 8px 8px 0" }}
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            <div className="mt-3">
              <NavigationMenu />
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;