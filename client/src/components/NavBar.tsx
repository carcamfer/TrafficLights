
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <nav className="bg-primary py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-primary-foreground text-xl">
          Traffic Monitor
        </Link>
        <div className="flex gap-4">
          <Link to="/" className="text-primary-foreground hover:text-gray-200">
            Home
          </Link>
          <Link to="/mapa" className="text-primary-foreground hover:text-gray-200">
            Mapa
          </Link>
          <Link to="/devices" className="text-primary-foreground hover:text-gray-200">
            Devices
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
