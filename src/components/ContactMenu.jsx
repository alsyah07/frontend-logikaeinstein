import React from 'react';
import { Link } from 'react-router-dom';

const ContactMenu = ({ isActive }) => {
  return (
    <li className="scroll-to-section">
      <Link to="/#contact" className={isActive('/') ? 'active' : ''}>
        <i className="fa fa-envelope"></i> Kontak
      </Link>
    </li>
  );
};

export default ContactMenu;