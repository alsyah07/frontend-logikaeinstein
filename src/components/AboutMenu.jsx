import React from 'react';
import { Link } from 'react-router-dom';

const AboutMenu = ({ isActive }) => {
  return (
    <li className="scroll-to-section">
      <Link to="/#about" className={isActive('/') ? 'active' : ''}>
        Tentang Kami
      </Link>
    </li>
  );
};

export default AboutMenu;