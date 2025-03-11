import React from 'react';
import MapView from '../components/MapView';
import { useNavigate } from 'react-router-dom';

const CiudadJuarezMap: React.FC = () => {
  const navigate = useNavigate();

  const handleSaveView = (viewData: { center: [number, number], zoom: number }) => {
    // Guardar en localStorage para persistencia entre sesiones
    const savedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
    savedViews.push({
      id: Date.now(),
      name: `Vista ${savedViews.length + 1}`,
      ...viewData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('savedMapViews', JSON.stringify(savedViews));

    // Navegar al dashboard para mostrar la vista guardada
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mapa de Tráfico - Ciudad Juárez</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <MapView onSaveView={handleSaveView} />
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Leyenda</h2>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span>Tráfico Bajo</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span>Tráfico Moderado</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span>Tráfico Alto</span>
        </div>
      </div>
    </div>
  );
};

export default CiudadJuarezMap;