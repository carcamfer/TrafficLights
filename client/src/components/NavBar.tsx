import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-primary py-3 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-primary-foreground text-xl">
          Traffic Monitor
        </Link>
        <div className="flex gap-4">
          <Link 
            to="/" 
            className={`text-primary-foreground hover:text-gray-200 ${location.pathname === '/' ? 'font-semibold' : ''}`}
          >
            Inicio
          </Link>
          <Link 
            to="/dashboard" 
            className={`text-primary-foreground hover:text-gray-200 ${location.pathname === '/dashboard' ? 'font-semibold' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/mapa" 
            className={`text-primary-foreground hover:text-gray-200 ${location.pathname === '/mapa' ? 'font-semibold' : ''}`}
          >
            Mapa
          </Link>
          <Link 
            to="/devices" 
            className={`text-primary-foreground hover:text-gray-200 ${location.pathname === '/devices' ? 'font-semibold' : ''}`}
          >
            Dispositivos
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;