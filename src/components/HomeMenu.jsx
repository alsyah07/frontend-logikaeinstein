import React from 'react';
import { Link } from 'react-router-dom';

const HomeMenu = ({ isActive }) => {
  return (
    <li className="scroll-to-section">
      <Link to="/#top" className={isActive('/') ? 'active' : ''}>
        <i className="fa fa-home"></i> Beranda
      </Link>
    </li>
  );
};

export default HomeMenu;