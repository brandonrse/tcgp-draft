import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <button className="navbar-home-button" onClick={() => navigate('/')}>
        Home
      </button>
      <button className="navbar-home-button" onClick={() => navigate('/host')}>
        Host
      </button>
      <button className="navbar-home-button" onClick={() => navigate('/join')}>
        Join
      </button>
    </nav>
  );
};

export default Navbar;
