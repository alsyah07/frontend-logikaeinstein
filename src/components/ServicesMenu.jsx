import React from 'react';
import { Link } from 'react-router-dom';

const ServicesMenu = ({ isActive }) => {
  return (
    <li className="scroll-to-section">
      <Link to="/#services" className={isActive('/') ? 'active' : ''}>
        <i className="fa fa-book"></i> Pelajaran
      </Link>
    </li>
  );
};

export default ServicesMenu;