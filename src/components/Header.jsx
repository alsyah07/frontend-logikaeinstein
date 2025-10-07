import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import NavigationMenu from "./NavigationMenu";
import "./Header.css";

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
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

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
                <span>{selectedCategory}</span>
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
              <FaSearch />
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
                <FaSearch />
              </button>
            </div>
          </form>

          <div className="mt-3">
            <NavigationMenu />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;