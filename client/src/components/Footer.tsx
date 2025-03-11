
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary py-4 px-4 text-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} Traffic Monitor. Todos los derechos reservados.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-gray-200 text-sm">Términos</a>
            <a href="#" className="text-white hover:text-gray-200 text-sm">Privacidad</a>
            <a href="#" className="text-white hover:text-gray-200 text-sm">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
