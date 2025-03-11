import React from 'react';
import MapView from '../components/MapView';

const CiudadJuarezMap: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa de Ciudad Juárez</h1>
      <MapView />
    </div>
  );
};

export default CiudadJuarezMap;