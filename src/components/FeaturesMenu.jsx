import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesMenu = ({ isActive }) => {
  return (
    <li className="scroll-to-section">
      <Link to="/#features" className={isActive('/') ? 'active' : ''}>
        Fitur
      </Link>
    </li>
  );
};

export default FeaturesMenu;