import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PortfolioMenu = ({ isActive, onMenuItemClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMouseEnter = () => {
    if (window.innerWidth > 991) {
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 991) {
      setIsDropdownOpen(false);
    }
  };

  const handleMainMenuClick = (e) => {
    if (window.innerWidth <= 991) {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleMenuClick = () => {
    setIsDropdownOpen(false);
    if (onMenuItemClick) onMenuItemClick();
  };

  return (
    <li 
      className={`scroll-to-section submenu ${isDropdownOpen ? 'active' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link 
        to="/#portfolio" 
        className={isActive('/') ? 'active' : ''}
        onClick={handleMainMenuClick}
      >
        <i className="fa fa-star"></i> Pelajaran Populer
      </Link>
      <ul className={`dropdown-menu ${isDropdownOpen ? 'active' : ''}`}>
        <li>
          <div className="category-header">FISIKA</div>
        </li>
        <li>
          <Link to="/fisika-dasar" onClick={handleMenuClick}>
            Fisika Dasar
          </Link>
        </li>
        <li>
          <Link to="/fisika-kelas-11" onClick={handleMenuClick}>
            Fisika Kelas 11
          </Link>
        </li>
        <li>
          <Link to="/fisika-kelas-8" onClick={handleMenuClick}>
            Fisika Kelas 8
          </Link>
        </li>
        <li>
          <Link to="/fisika-utbk" onClick={handleMenuClick}>
            Fisika UTBK
          </Link>
        </li>
        <li>
          <Link to="/fisika-kelas-10" onClick={handleMenuClick}>
            Fisika Kelas 10
          </Link>
        </li>
        <li>
          <Link to="/fisika-kelas-7" onClick={handleMenuClick}>
            Fisika Kelas 7
          </Link>
        </li>
        <li>
          <Link to="/fisika-kelas-9" onClick={handleMenuClick}>
            Fisika Kelas 9
          </Link>
        </li>
        <li>
          <div className="category-header">MATEMATIKA</div>
        </li>
        <li>
          <Link to="/matematika-dasar" onClick={handleMenuClick}>
            Matematika Dasar
          </Link>
        </li>
        <li>
          <Link to="/matematika-kelas-10" onClick={handleMenuClick}>
            Matematika Kelas 10
          </Link>
        </li>
        <li>
          <Link to="/matematika-kelas-11" onClick={handleMenuClick}>
            Matematika Kelas 11
          </Link>
        </li>
        <li>
          <Link to="/matematika-kelas-12" onClick={handleMenuClick}>
            Matematika Kelas 12
          </Link>
        </li>
        <li>
          <Link to="/matematika-utbk" onClick={handleMenuClick}>
            Matematika UTBK
          </Link>
        </li>
      </ul>
    </li>
  );
};

export default PortfolioMenu;