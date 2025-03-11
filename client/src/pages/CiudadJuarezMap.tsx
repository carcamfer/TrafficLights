import React from 'react';
import MapView from '@/components/MapView';

const CiudadJuarezMap = () => {
  // Coordenadas centradas en Ciudad Juárez
  const juarezCoordinates: [number, number] = [31.6904, -106.4245];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Mapa de Semáforos de Ciudad Juárez</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <MapView center={juarezCoordinates} zoom={12} />
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Información del Sistema</h2>
          <p className="mb-2">
            Este mapa muestra la ubicación de los semáforos inteligentes en Ciudad Juárez.
            Puedes acercar el mapa para ver detalles específicos de cada semáforo.
          </p>
          <p>
            Haz clic en cualquier semáforo para ver su estado actual y estadísticas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CiudadJuarezMap;